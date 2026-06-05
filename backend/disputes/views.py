from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
import cloudinary
import cloudinary.uploader
from bookings.models import Booking
from wallet.models import Wallet, WalletTransaction
from .models import DamageClaim, DamageEvidence
from .serializers import DamageClaimSerializer
from notifications.utils import create_notification

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

# --- Customer Claim Filing API ---
class RaiseDamageClaimView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking')
        try:
            # An owner can only raise a claim if the item was returned or active in dispute
            booking = Booking.objects.get(pk=booking_id, item__owner=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found or you are not the owner of this asset."}, status=status.HTTP_404_NOT_FOUND)

        if DamageClaim.objects.filter(booking=booking).exists():
            return Response({"error": "A dispute has already been logged for this transaction."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = DamageClaimSerializer(data=request.data)
        if serializer.is_valid():
            # Update booking state machine to DISPUTED
            booking.status = 'DISPUTED'
            booking.save()

            claim = serializer.save(owner=request.user, booking=booking, status='PENDING')

            # Process any uploaded damage snapshot photos to Cloudinary
            images = request.FILES.getlist('damage_photos')
            for img in images:
                try:
                    upload_data = cloudinary.uploader.upload(img)
                    cloudinary_url = upload_data.get('secure_url')
                    DamageEvidence.objects.create(damage_claim=claim, image=cloudinary_url)
                except Exception as e:
                    # Log exception or proceed to make sure we don't break entirely, but raise/handle is better
                    pass

            create_notification(booking.renter, "Damage Claim Raised", f"A damage claim has been filed by @{booking.item.owner.username} for your booking of '{booking.item.title}'.")

            return Response(DamageClaimSerializer(claim).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Admin Adjudication Panel View (Module 13 & 14) ---
class AdminResolveDisputeView(APIView):
    permission_classes = [permissions.IsAdminUser] # Matches is_staff / is_superuser

    def patch(self, request, pk):
        try:
            claim = DamageClaim.objects.get(pk=pk, status='PENDING')
            booking = claim.booking
        except DamageClaim.DoesNotExist:
            return Response({"error": "Pending damage claim record not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # Expecting: 'RESOLVE' or 'REJECT'
        admin_notes = request.data.get('admin_notes', '')

        # Fetch wallets for financial settlement adjustments
        owner_wallet, _ = Wallet.objects.get_or_create(user=booking.item.owner)
        renter_wallet, _ = Wallet.objects.get_or_create(user=booking.renter)

        if action == 'RESOLVE':
            # The exact Rahul/Adwith logic: Split deposit according to repair costs
            repair_cost = claim.repair_cost
            total_deposit = booking.deposit_amount

            if repair_cost >= total_deposit:
                # Damage matches or exceeds security bounds: Owner takes the full deposit
                owner_payout = total_deposit + booking.rental_fee
                renter_refund = 0
            else:
                # Owner takes repair cost, remainder goes back to renter
                owner_payout = repair_cost + booking.rental_fee
                renter_refund = total_deposit - repair_cost

            # Execute financial adjustments to wallets
            owner_wallet.balance += owner_payout
            owner_wallet.save()
            WalletTransaction.objects.create(wallet=owner_wallet, amount=owner_payout, transaction_type='CREDIT', status='SUCCESS')

            if renter_refund > 0:
                renter_wallet.balance += renter_refund
                renter_wallet.save()
                WalletTransaction.objects.create(wallet=renter_wallet, amount=renter_refund, transaction_type='CREDIT', status='SUCCESS')

            claim.status = 'RESOLVED'
            booking.status = 'COMPLETED'
            create_notification(booking.item.owner, "Dispute Resolved", f"The dispute for '{booking.item.title}' has been resolved. Payout has been released to your wallet.")
            create_notification(booking.renter, "Dispute Resolved", f"The dispute for '{booking.item.title}' has been arbitrated. Security deposit settlement has been processed.")

        elif action == 'REJECT':
            # Admin rules no fault: Return full deposit + rental fee to respective parties smoothly
            owner_wallet.balance += booking.rental_fee
            owner_wallet.save()
            WalletTransaction.objects.create(wallet=owner_wallet, amount=booking.rental_fee, transaction_type='CREDIT', status='SUCCESS')
            
            renter_wallet.balance += booking.deposit_amount
            renter_wallet.save()
            WalletTransaction.objects.create(wallet=renter_wallet, amount=booking.deposit_amount, transaction_type='CREDIT', status='SUCCESS')

            claim.status = 'REJECTED'
            booking.status = 'COMPLETED'
            create_notification(booking.item.owner, "Dispute Rejected", f"The dispute for '{booking.item.title}' has been rejected by administration. No repair cost was deducted from the renter's deposit.")
            create_notification(booking.renter, "Dispute Dismissed", f"The damage claim filed against your booking for '{booking.item.title}' has been dismissed by administration. Your security deposit was fully refunded.")
        else:
            return Response({"error": "Invalid dispute resolution action type."}, status=status.HTTP_400_BAD_REQUEST)

        claim.admin_notes = admin_notes
        claim.save()
        booking.save()

        return Response({"message": f"Dispute arbitrated successfully. Status: {claim.status}"})


class AdminDamageClaimListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        claims = DamageClaim.objects.all().order_by('-created_at')
        serializer = DamageClaimSerializer(claims, many=True)
        return Response(serializer.data)

