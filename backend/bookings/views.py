import uuid
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.conf import settings
import cloudinary
import cloudinary.uploader
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from datetime import datetime
from items.models import Item
from core.models import PlatformSettings
from .models import Booking, QRCode, HandoverEvidence, ReturnEvidence
from .serializers import BookingSerializer, HandoverEvidenceSerializer
from notifications.utils import create_notification

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

# --- Create & View Bookings (Module 6) ---
class BookingListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # View user's associated bookings (Renter history or Owner income streams)
    def get(self, request):
        if request.user.is_staff:
            bookings = Booking.objects.all().order_by('-created_at')
        else:
            # Users see rentals they booked OR reservations made on items they own
            bookings = Booking.objects.filter(renter=request.user) | Booking.objects.filter(item__owner=request.user)
            bookings = bookings.distinct().order_by('-created_at')
            
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    # File a loose reservation proposal
    def post(self, request):
        item_id = request.data.get('item')
        try:
            item = Item.objects.get(pk=item_id, availability_status=True)
        except Item.DoesNotExist:
            return Response({"error": "Target item is unavailable or invalid."}, status=status.HTTP_400_BAD_REQUEST)

        if item.owner == request.user:
            return Response({"error": "You cannot rent your own listed asset."}, status=status.HTTP_400_BAD_REQUEST)

        if not request.user.is_verified:
            return Response(
                {"error": "You must complete identity verification (KYC) before renting or booking assets."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser:
            return Response({"error": "Administrators cannot book items for rent."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for active/approved/confirmed/paid/disputed booking conflicts
        if Booking.objects.filter(item=item, status__in=['APPROVED', 'CONFIRMED', 'PAID', 'ACTIVE', 'DISPUTED']).exists():
            return Response({"error": "This item is currently rented or reserved."}, status=status.HTTP_400_BAD_REQUEST)

        start_date = datetime.strptime(request.data.get('start_date'), '%Y-%m-%d').date()
        end_date = datetime.strptime(request.data.get('end_date'), '%Y-%m-%d').date()
        days = (end_date - start_date).days

        settings = PlatformSettings.load()

        if days <= 0:
            return Response({"error": "End date must fall after your lease start date."}, status=status.HTTP_400_BAD_REQUEST)
        if days > settings.max_booking_days:
            return Response(
                {"error": f"Booking duration cannot exceed {settings.max_booking_days} days."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cost Calculations
        rental_fee = item.price_per_day * days
        deposit_amount = item.deposit_amount
        platform_fee = rental_fee * (settings.commission_rate / Decimal('100'))

        booking = Booking.objects.create(
            item=item,
            renter=request.user,
            start_date=start_date,
            end_date=end_date,
            rental_fee=rental_fee,
            deposit_amount=deposit_amount,
            platform_fee=platform_fee,
            status='APPROVED' if settings.auto_approve_bookings else 'PENDING'
        )

        if settings.auto_approve_bookings:
            booking.approved_at = timezone.now()
            booking.save(update_fields=['approved_at'])
            QRCode.objects.get_or_create(
                booking=booking,
                defaults={'qr_token': str(uuid.uuid4())}
            )
            create_notification(item.owner, "New Booking (Auto-Approved)", f"Your asset '{item.title}' has been booked by @{request.user.username}.")
            create_notification(request.user, "Booking Approved", f"Your booking for '{item.title}' has been automatically approved.")
        else:
            create_notification(item.owner, "New Booking Request", f"You have a new booking request from @{request.user.username} for your asset '{item.title}'.")

        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

# --- Booking Status Transitions & Approvals ---
class BookingActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            booking = Booking.objects.select_related('item', 'item__owner', 'renter').get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking reference not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # Expecting: 'APPROVE', 'REJECT', 'CANCEL', 'COMPLETE', 'HANDOVER'
        
        is_owner = (booking.item.owner == request.user)
        is_renter = (booking.renter == request.user)
        is_admin = request.user.is_staff

        if not (is_owner or is_renter or is_admin):
            return Response({"error": "Unauthorized access."}, status=status.HTTP_403_FORBIDDEN)

        # Owner/Admin actions
        if is_owner or is_admin:
            if action == 'APPROVE':
                if booking.status not in ['PENDING', 'APPROVED']:
                    return Response(
                        {"error": f"Only pending requests can be approved. Current status: {booking.status}."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                with transaction.atomic():
                    if booking.status == 'PENDING':
                        booking.status = 'APPROVED'
                        booking.approved_at = timezone.now()
                        booking.save(update_fields=['status', 'approved_at'])

                    QRCode.objects.get_or_create(
                        booking=booking,
                        defaults={'qr_token': str(uuid.uuid4())}
                    )

                booking.refresh_from_db()
                create_notification(booking.renter, "Booking Approved", f"Your booking request for '{booking.item.title}' has been approved by @{booking.item.owner.username}.")
                return Response(BookingSerializer(booking).data)
            elif action == 'REJECT' and booking.status == 'PENDING':
                booking.status = 'REJECTED'
                booking.save()
                create_notification(booking.renter, "Booking Rejected", f"Your booking request for '{booking.item.title}' has been rejected by @{booking.item.owner.username}.")
                return Response(BookingSerializer(booking).data)
            elif action == 'COMPLETE' and booking.status == 'ACTIVE':
                from wallet.models import Wallet, WalletTransaction
                owner_wallet, _ = Wallet.objects.get_or_create(user=booking.item.owner)
                renter_wallet, _ = Wallet.objects.get_or_create(user=booking.renter)
                
                # Release rental fee to owner
                owner_wallet.balance += booking.rental_fee
                owner_wallet.save()
                WalletTransaction.objects.create(wallet=owner_wallet, amount=booking.rental_fee, transaction_type='CREDIT', status='SUCCESS')
                
                # Refund security deposit to renter
                renter_wallet.balance += booking.deposit_amount
                renter_wallet.save()
                WalletTransaction.objects.create(wallet=renter_wallet, amount=booking.deposit_amount, transaction_type='CREDIT', status='SUCCESS')
                
                booking.status = 'COMPLETED'
                booking.save()
                create_notification(booking.renter, "Booking Completed", f"Your lease for '{booking.item.title}' has been completed. Your security deposit of {booking.deposit_amount} INR has been returned.")
                create_notification(booking.item.owner, "Booking Completed", f"The booking for '{booking.item.title}' is completed. The rental fee has been released to your wallet.")
                return Response(BookingSerializer(booking).data)
            elif action == 'HANDOVER' and booking.status == 'APPROVED':
                if not is_admin:
                    return Response({"error": "Only administrators can perform direct handover overrides."}, status=status.HTTP_403_FORBIDDEN)
                try:
                    qr_record = booking.qr_code
                    qr_record.is_scanned = True
                    qr_record.save()
                except QRCode.DoesNotExist:
                    pass
                booking.status = 'ACTIVE'
                booking.save()
                create_notification(booking.renter, "Lease Activated", f"Your lease for '{booking.item.title}' has been activated by the admin override.")
                create_notification(booking.item.owner, "Lease Activated", f"The lease for your asset '{booking.item.title}' has been activated by the admin override.")
                return Response(BookingSerializer(booking).data)

        # Renter/Admin actions
        if is_renter or is_admin:
            if action == 'CANCEL' and booking.status in ['PENDING', 'APPROVED', 'ACTIVE']:
                if is_renter and not is_admin and booking.status != 'PENDING':
                    return Response({"error": "Renter can only cancel pending requests."}, status=status.HTTP_400_BAD_REQUEST)
                
                from payments.models import Payment
                from wallet.models import Wallet, WalletTransaction
                
                has_paid = Payment.objects.filter(booking=booking, status='SUCCESS').exists()
                if has_paid:
                    renter_wallet, _ = Wallet.objects.get_or_create(user=booking.renter)
                    refund_amount = booking.rental_fee + booking.deposit_amount + booking.platform_fee
                    renter_wallet.balance += refund_amount
                    renter_wallet.save()
                    WalletTransaction.objects.create(
                        wallet=renter_wallet,
                        amount=refund_amount,
                        transaction_type='CREDIT',
                        status='SUCCESS'
                    )
                
                booking.status = 'CANCELLED'
                booking.save()
                if is_admin and not (is_renter or is_owner):
                    create_notification(booking.renter, "Booking Cancelled by Admin", f"Your booking for '{booking.item.title}' has been cancelled by the platform administrator.")
                    create_notification(booking.item.owner, "Booking Cancelled by Admin", f"The booking for your asset '{booking.item.title}' has been cancelled by the platform administrator.")
                elif is_renter:
                    create_notification(booking.item.owner, "Booking Cancelled", f"The booking for '{booking.item.title}' has been cancelled by @{booking.renter.username}.")
                elif is_owner:
                    create_notification(booking.renter, "Booking Cancelled", f"Your booking for '{booking.item.title}' has been cancelled by @{booking.item.owner.username}.")
                return Response(BookingSerializer(booking).data)

        return Response({"error": "Invalid action transition or unauthorized state."}, status=status.HTTP_400_BAD_REQUEST)

# --- QR Scanning & Handover Flow (Module 8 & 9) ---
class QRVerifyHandoverView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            if request.user.is_staff:
                booking = Booking.objects.get(pk=pk)
            else:
                booking = Booking.objects.get(pk=pk, item__owner=request.user)
            qr_record = booking.qr_code
        except (Booking.DoesNotExist, QRCode.DoesNotExist):
            return Response({"error": "Invalid verification target or unauthorized scanner access."}, status=status.HTTP_400_BAD_REQUEST)

        token = request.data.get('qr_token')
        if qr_record.qr_token != token:
            return Response({"error": "QR verification mismatch token validation failed."}, status=status.HTTP_400_BAD_REQUEST)

        if qr_record.is_scanned:
            return Response({"error": "This QR voucher has already been checked into service."}, status=status.HTTP_400_BAD_REQUEST)

        # Process condition verification images to Cloudinary
        images = request.FILES.getlist('handover_images')
        if not images:
            return Response({"error": "You must supply baseline snapshot evidence before item dispatch."}, status=status.HTTP_400_BAD_REQUEST)

        for img in images:
            try:
                upload_data = cloudinary.uploader.upload(img)
                cloudinary_url = upload_data.get('secure_url')
                HandoverEvidence.objects.create(booking=booking, image=cloudinary_url, uploaded_by=request.user)
            except Exception as e:
                # Fallback or error handling
                pass

        qr_record.is_scanned = True
        qr_record.save()
        
        booking.status = 'ACTIVE'
        booking.save()

        return Response({"message": "QR verification confirmed! Rental is officially active."})


class ActivateLeaseView(APIView):
    """
    Handles QR code verification and payment processing during physical handover.
    Renter shows QR → Owner scans → Backend validates → Payment processed → Status = ACTIVE
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking reference not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only owner can scan and activate
        if booking.item.owner != request.user and not request.user.is_staff:
            return Response({"error": "Only the owner can scan and activate the lease."}, status=status.HTTP_403_FORBIDDEN)

        # Booking must be in APPROVED state (payment pending)
        if booking.status not in ['APPROVED', 'CONFIRMED']:
            return Response({"error": f"Booking must be in APPROVED state, currently {booking.status}."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate QR code
        qr_data = request.data.get('qr_data')
        expected_qr = f'sharehub_verify_handover_{booking.id}'
        
        if qr_data != expected_qr:
            return Response({"error": "Invalid QR code. Ensure you are scanning the correct booking."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get or create QR record
            qr_record, created = QRCode.objects.get_or_create(
                booking=booking,
                defaults={'qr_token': expected_qr}
            )

            # Prevent double-scanning
            if qr_record.is_scanned:
                return Response({"error": "This QR code has already been scanned. Lease is already active."}, status=status.HTTP_400_BAD_REQUEST)

            # Process payment from escrow wallet
            from wallet.models import Wallet, WalletTransaction
            from payments.models import Payment

            renter_wallet, _ = Wallet.objects.get_or_create(user=booking.renter)
            owner_wallet, _ = Wallet.objects.get_or_create(user=booking.item.owner)
            platform_wallet, _ = Wallet.objects.get_or_create(user__username='platform_account')

            # Verify renter has sufficient balance
            total_amount = booking.rental_fee + booking.deposit_amount + booking.platform_fee
            if renter_wallet.balance < total_amount:
                return Response(
                    {"error": f"Insufficient wallet balance. Required: ₹{total_amount}, Available: ₹{renter_wallet.balance}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Debit from renter
            renter_wallet.balance -= total_amount
            renter_wallet.save()
            WalletTransaction.objects.create(
                wallet=renter_wallet,
                amount=total_amount,
                transaction_type='DEBIT',
                status='SUCCESS',
                description=f'Payment for booking #{booking.id}'
            )

            # Credit rental fee to owner
            owner_wallet.balance += booking.rental_fee
            owner_wallet.save()
            WalletTransaction.objects.create(
                wallet=owner_wallet,
                amount=booking.rental_fee,
                transaction_type='CREDIT',
                status='SUCCESS',
                description=f'Rental fee from booking #{booking.id}'
            )

            # Hold deposit in platform escrow (will be released on completion)
            WalletTransaction.objects.create(
                wallet=platform_wallet,
                amount=booking.deposit_amount,
                transaction_type='CREDIT',
                status='ESCROW',
                description=f'Deposit hold for booking #{booking.id}'
            )

            # Credit platform commission
            WalletTransaction.objects.create(
                wallet=platform_wallet,
                amount=booking.platform_fee,
                transaction_type='CREDIT',
                status='SUCCESS',
                description=f'Platform fee from booking #{booking.id}'
            )

            # Record payment
            Payment.objects.create(
                booking=booking,
                amount=total_amount,
                payment_id=f'HANDOVER_{booking.id}_{uuid.uuid4()}',
                payment_method='ESCROW_WALLET',
                status='SUCCESS'
            )

            # Mark QR as scanned and activate lease
            qr_record.is_scanned = True
            qr_record.save()

            booking.status = 'ACTIVE'
            booking.save()

            create_notification(booking.renter, "Lease Activated", f"Your lease for '{booking.item.title}' is now active! Happy renting.")

            return Response({
                "message": "Lease successfully activated! Physical handover verified.",
                "booking": BookingSerializer(booking).data,
                "payment": {
                    "rental_fee": str(booking.rental_fee),
                    "deposit_amount": str(booking.deposit_amount),
                    "platform_fee": str(booking.platform_fee),
                    "total": str(total_amount)
                }
            })

        except Exception as e:
            return Response({"error": f"Payment processing failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UploadReturnEvidenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking reference not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.renter != request.user and booking.item.owner != request.user:
            return Response({"error": "Unauthorized access."}, status=status.HTTP_403_FORBIDDEN)

        images = request.FILES.getlist('return_images')
        if not images:
            return Response({"error": "No return images supplied."}, status=status.HTTP_400_BAD_REQUEST)

        for img in images:
            try:
                upload_data = cloudinary.uploader.upload(img)
                cloudinary_url = upload_data.get('secure_url')
                ReturnEvidence.objects.create(booking=booking, image=cloudinary_url, uploaded_by=request.user)
            except Exception as e:
                # Fallback or error handling
                pass

        return Response({"message": "Return photos uploaded successfully!"})
