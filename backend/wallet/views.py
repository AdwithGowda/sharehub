from decimal import Decimal, InvalidOperation

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Wallet, WalletTransaction
from .serializers import AdminWalletSerializer, WalletSerializer


class WalletDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)


class AddTestFundsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            amount = Decimal(str(request.data.get('amount', 0)))
        except (InvalidOperation, TypeError):
            return Response({"error": "Amount must be a valid number."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"error": "Amount must be positive."}, status=status.HTTP_400_BAD_REQUEST)

        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        wallet.balance += amount
        wallet.save(update_fields=['balance'])

        WalletTransaction.objects.create(
            wallet=wallet,
            amount=amount,
            transaction_type='CREDIT',
            status='SUCCESS'
        )

        return Response({"message": f"Successfully credited INR {amount} to your wallet test engine."})


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
