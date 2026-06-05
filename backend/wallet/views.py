from decimal import Decimal, InvalidOperation
import uuid
import razorpay
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Wallet, WalletTransaction
from .serializers import AdminWalletSerializer, WalletSerializer
from core.models import PlatformSettings


class WalletDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)


class CreateWalletTopupOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            amount = Decimal(str(request.data.get('amount', 0)))
        except (InvalidOperation, TypeError):
            return Response({"error": "Amount must be a valid number."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"error": "Amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)

        amount_in_paise = int(amount * 100)
        platform_settings = PlatformSettings.load()
        gateway_mode = platform_settings.payment_gateway_mode

        if gateway_mode == 'LIVE':
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
                        {"error": f"Failed to create Razorpay Topup Order: {str(e)}"},
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
            mock_order_id = f"order_mock_topup_{uuid.uuid4().hex[:12]}"
            return Response({
                "id": mock_order_id,
                "amount": amount_in_paise,
                "currency": "INR",
                "key_id": "rzp_test_mockkey",
                "is_mock": True
            }, status=status.HTTP_200_OK)


class AddTestFundsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            amount = Decimal(str(request.data.get('amount', 0)))
        except (InvalidOperation, TypeError):
            return Response({"error": "Amount must be a valid number."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"error": "Amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)

        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')

        platform_settings = PlatformSettings.load()
        gateway_mode = platform_settings.payment_gateway_mode

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
            # Verify signature
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

        # Apply credit to wallet
        with transaction.atomic():
            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            wallet.balance += amount
            wallet.save(update_fields=['balance'])

            WalletTransaction.objects.create(
                wallet=wallet,
                amount=amount,
                transaction_type='CREDIT',
                status='SUCCESS'
            )

        return Response({"message": f"Successfully credited INR {amount} to your wallet."})


class AdminWalletListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        User = get_user_model()
        for user in User.objects.all():
            Wallet.objects.get_or_create(user=user)

        wallets = Wallet.objects.select_related('user').prefetch_related('transactions').order_by('user__username')
        serializer = AdminWalletSerializer(wallets, many=True)
        return Response(serializer.data)


class AdminWalletAdjustmentView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        action = str(request.data.get('action', '')).upper()
        try:
            amount = Decimal(str(request.data.get('amount', 0)))
        except (InvalidOperation, TypeError):
            return Response({"error": "Amount must be a valid number."}, status=status.HTTP_400_BAD_REQUEST)

        if action not in ('CREDIT', 'DEBIT'):
            return Response({"error": "Action must be CREDIT or DEBIT."}, status=status.HTTP_400_BAD_REQUEST)
        if amount <= 0:
            return Response({"error": "Amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            try:
                wallet = Wallet.objects.select_for_update().select_related('user').get(pk=pk)
            except Wallet.DoesNotExist:
                return Response({"error": "Wallet not found."}, status=status.HTTP_404_NOT_FOUND)

            if action == 'DEBIT' and wallet.balance < amount:
                return Response({"error": "Wallet balance is too low for this debit."}, status=status.HTTP_400_BAD_REQUEST)

            wallet.balance = wallet.balance + amount if action == 'CREDIT' else wallet.balance - amount
            wallet.save(update_fields=['balance'])
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=amount,
                transaction_type=action,
                status='ADMIN_ADJUSTMENT'
            )

        return Response(AdminWalletSerializer(wallet).data)
