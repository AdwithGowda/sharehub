import uuid
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from bookings.models import Booking, QRCode
from wallet.models import Wallet, WalletTransaction
from .models import Payment
from .serializers import PaymentSerializer

class ProcessPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking')
        payment_id = request.data.get('payment_id') # Received from Razorpay Frontend SDK
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

        # Calculate the exact total incoming amount required
        total_required = booking.rental_fee + booking.deposit_amount + booking.platform_fee

        with transaction.atomic():
            payment_record = Payment.objects.create(
                booking=booking,
                amount=total_required,
                payment_id=payment_id,
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
