from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from bookings.models import Booking
from .models import Message
from .serializers import MessageSerializer

class BookingChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Retrieve message log history for a specific booking
    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id)
        except Booking.DoesNotExist:
            return Response({"error": "Booking thread not found."}, status=status.HTTP_404_NOT_FOUND)

        # Security check: Only the involved renter, owner, or platform admin can view this chat
        if not (booking.renter == request.user or booking.item.owner == request.user or request.user.is_staff):
            return Response({"error": "Access denied to private conversation thread."}, status=status.HTTP_403_FORBIDDEN)

        messages = Message.objects.filter(booking=booking).order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    # Send a new message inside the booking channel
    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id)
        except Booking.DoesNotExist:
            return Response({"error": "Booking thread not found."}, status=status.HTTP_404_NOT_FOUND)

        # Identify sender/receiver dynamically
        if booking.renter == request.user:
            receiver = booking.item.owner
        elif booking.item.owner == request.user:
            receiver = booking.renter
        else:
            return Response({"error": "You are not authorized to post in this chat thread."}, status=status.HTTP_403_FORBIDDEN)

        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user, receiver=receiver, booking=booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminChatListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.db.models import OuterRef, Subquery, Q
        
        search_query = request.query_params.get('search', '')
        dispute_only = request.query_params.get('dispute_only', 'false') == 'true'
        
        # Subquery to retrieve the last message content and timestamp for each booking
        last_msg_qs = Message.objects.filter(booking=OuterRef('pk')).order_by('-created_at')
        
        bookings = Booking.objects.annotate(
            last_message_text=Subquery(last_msg_qs.values('message')[:1]),
            last_message_time=Subquery(last_msg_qs.values('created_at')[:1]),
            last_message_sender=Subquery(last_msg_qs.values('sender__username')[:1]),
        ).filter(messages__isnull=False).distinct()
        
        if dispute_only:
            bookings = bookings.filter(status='DISPUTED')
            
        if search_query:
            bookings = bookings.filter(
                Q(item__title__icontains=search_query) |
                Q(renter__username__icontains=search_query) |
                Q(item__owner__username__icontains=search_query) |
                Q(messages__message__icontains=search_query)
            ).distinct()
            
        bookings = bookings.order_by('-last_message_time')
        
        data = []
        for b in bookings:
            data.append({
                "booking_id": b.id,
                "item_title": b.item.title,
                "renter_username": b.renter.username,
                "owner_username": b.item.owner.username,
                "status": b.status,
                "last_message": b.last_message_text,
                "last_message_time": b.last_message_time,
                "last_message_sender": b.last_message_sender,
            })
            
        return Response(data)
