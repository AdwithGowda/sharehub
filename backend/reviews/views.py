from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from bookings.models import Booking
from .models import Review
from .serializers import ReviewSerializer

class LeaveReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking')
        try:
            # Enforce that reviews can only be written for completed rentals
            booking = Booking.objects.get(pk=booking_id, status='COMPLETED')
        except Booking.DoesNotExist:
            return Response({"error": "Booking reference not found or rental is not fully completed yet."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if this user already reviewed this transaction
        if Review.objects.filter(booking=booking, reviewer=request.user).exists():
            return Response({"error": "You have already left feedback for this booking transaction."}, status=status.HTTP_400_BAD_REQUEST)

        # Identify target reviewee party dynamically
        if booking.renter == request.user:
            reviewed_user = booking.item.owner  # Renter rating the owner
        elif booking.item.owner == request.user:
            reviewed_user = booking.renter      # Owner rating the renter
        else:
            return Response({"error": "Unauthorized view access parameters."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(reviewer=request.user, reviewed_user=reviewed_user, booking=booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminReviewListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        reviews = Review.objects.select_related('reviewer', 'reviewed_user', 'booking__item').all().order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class AdminReviewDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
            review.delete()
            return Response({"message": "Review removed successfully by administrator."}, status=status.HTTP_204_NO_CONTENT)
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)
