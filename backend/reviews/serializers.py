from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    reviewed_user_username = serializers.CharField(source='reviewed_user.username', read_only=True)
    item_title = serializers.CharField(source='booking.item.title', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'reviewer', 'reviewer_username', 
            'reviewed_user', 'reviewed_user_username', 'item_title', 
            'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['booking', 'reviewer', 'reviewed_user', 'created_at']
