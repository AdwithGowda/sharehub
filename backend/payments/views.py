import uuid
import razorpay
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from bookings.models import Booking, QRCode
from wallet.models import Wallet, WalletTransaction
from core.models import PlatformSettings
from .models import Payment
from .serializers import PaymentSerializer

class CreateRazorpayOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking')
        try:
            booking = Booking.objects.get(pk=booking_id, renter=request.user, status='APPROVED')
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found or not approved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        total_required = booking.rental_fee + booking.deposit_amount + booking.platform_fee
        amount_in_paise = int(total_required * 100)

        platform_settings = PlatformSettings.load()
        gateway_mode = platform_settings.payment_gateway_mode

        if gateway_mode == 'LIVE':
            # Check if Razorpay keys are configured
            if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
                try:
                    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                    order_data = {
                        'amount': amount_in_paise,
                        'currency': 'INR',
                        'payment_capture': 1
                    }
                    razorpay_order = client.order.create(data=order_data)
                    return Response({
                        "id": razorpay_order['id'],
                        "amount": amount_in_paise,
                        "currency": "INR",
                        "key_id": settings.RAZORPAY_KEY_ID,
                        "is_mock": False
                    }, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response(
                        {"error": f"Failed to create Razorpay Order: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            else:
                return Response(
                    {"error": "Razorpay API credentials are not configured on the server, but Payment Gateway mode is set to LIVE in admin settings."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif gateway_mode == 'DISABLED':
            return Response(
                {"error": "Platform payments are currently disabled by the administrator."},
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # SANDBOX mode - Fallback mock mode
            mock_order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
            return Response({
                "id": mock_order_id,
                "amount": amount_in_paise,
                "currency": "INR",
                "key_id": "rzp_test_mockkey",
                "is_mock": True
            }, status=status.HTTP_200_OK)


class ProcessPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')
        payment_method = request.data.get('payment_method', 'CARD/UPI')

        try:
            booking = Booking.objects.select_related('renter').get(pk=booking_id, renter=request.user, status='APPROVED')
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking is either not found, not approved yet, or already paid for."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        existing_payment = Payment.objects.filter(booking=booking, status='SUCCESS').first()
        if existing_payment:
            QRCode.objects.get_or_create(
                booking=booking,
                defaults={'qr_token': str(uuid.uuid4())}
            )
            return Response({
                "message": "Payment was already verified. Escrow funds are locked.",
                "payment": PaymentSerializer(existing_payment).data
            }, status=status.HTTP_200_OK)

        platform_settings = PlatformSettings.load()
        gateway_mode = platform_settings.payment_gateway_mode

        # Check signature if not a mock payment
        is_mock_payment = (razorpay_order_id and razorpay_order_id.startswith('order_mock_')) or (razorpay_payment_id and razorpay_payment_id.startswith('pay_rzp_mock_'))

        if gateway_mode == 'LIVE':
            if is_mock_payment:
                return Response(
                    {"error": "Mock payments are not allowed when the Payment Gateway is set to LIVE mode."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
                return Response(
                    {"error": "Razorpay API credentials are not configured on the server, but Payment Gateway mode is set to LIVE."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Real Razorpay signature validation
            try:
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                params_dict = {
                    'razorpay_order_id': razorpay_order_id,
                    'razorpay_payment_id': razorpay_payment_id,
                    'razorpay_signature': razorpay_signature
                }
                client.utility.verify_payment_signature(params_dict)
            except Exception as e:
                return Response(
                    {"error": "Secure Razorpay payment verification failed: signature is invalid."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif gateway_mode == 'DISABLED':
            return Response(
                {"error": "Platform payments are currently disabled by the administrator."},
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # Mode is SANDBOX
            # Verify that we received a payment token for mock checkout
            if not razorpay_payment_id:
                return Response(
                    {"error": "Payment verification failed: no payment/token ID provided."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        total_required = booking.rental_fee + booking.deposit_amount + booking.platform_fee

        with transaction.atomic():
            payment_record = Payment.objects.create(
                booking=booking,
                amount=total_required,
                payment_id=razorpay_payment_id,
                payment_method=payment_method,
                status='SUCCESS'
            )

            QRCode.objects.get_or_create(
                booking=booking,
                defaults={'qr_token': str(uuid.uuid4())}
            )

            booking.paid_at = timezone.now()
            booking.save(update_fields=['paid_at'])

        return Response({
            "message": "Payment verified successfully! Escrow funds locked.",
            "payment": PaymentSerializer(payment_record).data
        }, status=status.HTTP_201_CREATED)


class AdminPaymentListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        payments = Payment.objects.select_related('booking__renter', 'booking__item').all().order_by('-paid_at')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

