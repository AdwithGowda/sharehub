from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import WithdrawalRequest
from .serializers import RegisterSerializer, UserSerializer, WithdrawalRequestSerializer, CustomTokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# --- Public Registration API ---
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Authenticated User Profile API ---
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Withdrawal Management API ---
class WithdrawalRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Customers see their own requests, Admins see all pending requests
        if request.user.is_staff:
            requests = WithdrawalRequest.objects.all().order_by('-requested_at')
        else:
            requests = WithdrawalRequest.objects.filter(user=request.user).order_by('-requested_at')
        serializer = WithdrawalRequestSerializer(requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.is_staff:
            return Response({"error": "Admins cannot request monetary withdrawals."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = WithdrawalRequestSerializer(data=request.data)
        if serializer.is_valid():
            from wallet.models import Wallet
            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            if wallet.balance < serializer.validated_data['amount']:
                return Response({"error": "Insufficient wallet balance for this withdrawal request."}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class AdminUserToggleActiveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user:
            return Response({"error": "You cannot modify your own active status."}, status=status.HTTP_400_BAD_REQUEST)

        if user.role == 'ADMIN':
            return Response({"error": "Admin login access must always remain active."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = not user.is_active
        user.save()
        
        status_str = "activated" if user.is_active else "suspended"
        return Response({"message": f"User account has been successfully {status_str}.", "is_active": user.is_active})


class AdminAnalyticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from items.models import Item
        from bookings.models import Booking
        from disputes.models import DamageClaim
        from kyc.models import KYC
        from django.db.models import Sum
        
        total_users = User.objects.filter(role='CUSTOMER').count()
        total_kyc_requests = KYC.objects.count()
        pending_kyc_requests = KYC.objects.filter(status='PENDING').count()
        total_items = Item.objects.count()
        active_listings = Item.objects.filter(availability_status=True).count()
        
        active_rentals = Booking.objects.filter(status='ACTIVE').count()
        completed_rentals = Booking.objects.filter(status='COMPLETED').count()
        pending_disputes = DamageClaim.objects.filter(status='PENDING').count()
        
        # Calculate revenue aggregates safely
        completed_bookings = Booking.objects.filter(status='COMPLETED')
        completed_aggregates = completed_bookings.aggregate(
            total_rental=Sum('rental_fee'),
            total_platform=Sum('platform_fee')
        )
        owner_payouts = completed_aggregates['total_rental'] or 0.00
        platform_earnings = completed_aggregates['total_platform'] or 0.00
        gross_revenue = owner_payouts + platform_earnings

        # Get list of pending KYC requests for dashboard view
        pending_kyc_list = KYC.objects.filter(status='PENDING').select_related('user').order_by('-id')
        pending_kycs = []
        for pk in pending_kyc_list:
            pending_kycs.append({
                "id": pk.id,
                "username": pk.user.username,
                "email": pk.user.email,
            })

        # Get list of pending disputes for dashboard view
        pending_disputes_query = DamageClaim.objects.filter(status='PENDING').select_related('owner', 'booking__item').order_by('-id')
        pending_disputes_list = []
        for claim in pending_disputes_query:
            pending_disputes_list.append({
                "id": claim.id,
                "owner_username": claim.owner.username,
                "asset_title": claim.booking.item.title,
                "repair_cost": float(claim.repair_cost),
            })

        # Generate live recent activities timeline feed
        recent_activities = []
        
        # 1. Recent Bookings
        for b in Booking.objects.select_related('renter', 'item').order_by('-id')[:15]:
            recent_activities.append({
                "id": f"booking-{b.id}",
                "title": "New Booking Placed",
                "description": f"@{b.renter.username} booked '{b.item.title}' for {b.rental_fee} INR.",
                "time": b.created_at.strftime("%b %d, %I:%M %p"),
                "timestamp": b.created_at
            })
            
        # 2. Recent Items
        for item in Item.objects.select_related('owner').order_by('-id')[:15]:
            recent_activities.append({
                "id": f"item-{item.id}",
                "title": "New Asset Listed",
                "description": f"@{item.owner.username} listed '{item.title}' in {item.location}.",
                "time": item.created_at.strftime("%b %d, %I:%M %p"),
                "timestamp": item.created_at
            })

        # 3. Recent KYC requests
        for k in KYC.objects.select_related('user').order_by('-id')[:15]:
            recent_activities.append({
                "id": f"kyc-{k.id}",
                "title": "KYC Request Received",
                "description": f"New KYC documents uploaded by @{k.user.username}.",
                "time": k.user.created_at.strftime("%b %d, %I:%M %p"),
                "timestamp": k.user.created_at
            })

        # 4. Recent Disputes
        for c in DamageClaim.objects.select_related('owner', 'booking__item').order_by('-id')[:15]:
            recent_activities.append({
                "id": f"claim-{c.id}",
                "title": "Damage Dispute Raised",
                "description": f"@{c.owner.username} filed dispute for '{c.booking.item.title}'.",
                "time": c.created_at.strftime("%b %d, %I:%M %p"),
                "timestamp": c.created_at
            })

        # Sort all combined activities by timestamp descending
        recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activities = recent_activities[:5]
        
        # Remove timestamp before serialization
        for act in recent_activities:
            act.pop('timestamp', None)
        
        return Response({
            "total_users": total_users,
            "total_kyc_requests": total_kyc_requests,
            "pending_kyc_requests": pending_kyc_requests,
            "total_items": total_items,
            "active_listings": active_listings,
            "active_rentals": active_rentals,
            "completed_rentals": completed_rentals,
            "pending_disputes": pending_disputes,
            "platform_earnings": float(platform_earnings),
            "gross_revenue": float(gross_revenue),
            "owner_payouts": float(owner_payouts),
            "recent_activities": recent_activities,
            "pending_kycs": pending_kycs,
            "pending_disputes_list": pending_disputes_list
        })


class WithdrawalRequestDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            req = WithdrawalRequest.objects.get(pk=pk, status='PENDING')
        except WithdrawalRequest.DoesNotExist:
            return Response({"error": "Pending withdrawal request not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # Expecting 'APPROVE' or 'REJECT'
        if action == 'APPROVE':
            from wallet.models import Wallet, WalletTransaction

            with transaction.atomic():
                wallet, _ = Wallet.objects.select_for_update().get_or_create(user=req.user)
                if wallet.balance < req.amount:
                    return Response({"error": "User has insufficient wallet balance for this withdrawal."}, status=status.HTTP_400_BAD_REQUEST)

                wallet.balance -= req.amount
                wallet.save(update_fields=['balance'])

                WalletTransaction.objects.create(
                    wallet=wallet,
                    amount=req.amount,
                    transaction_type='DEBIT',
                    status='WITHDRAWAL_APPROVED'
                )

                req.status = 'APPROVED'
                req.save(update_fields=['status'])
                return Response(WithdrawalRequestSerializer(req).data)
        elif action == 'REJECT':
            req.status = 'REJECTED'
        else:
            return Response({"error": "Invalid action parameter specified."}, status=status.HTTP_400_BAD_REQUEST)
            
        req.save()
        return Response(WithdrawalRequestSerializer(req).data)
