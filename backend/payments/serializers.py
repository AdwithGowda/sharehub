from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    renter_username = serializers.CharField(source='booking.renter.username', read_only=True)
    renter_email = serializers.CharField(source='booking.renter.email', read_only=True)
    item_title = serializers.CharField(source='booking.item.title', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'amount', 'payment_id', 'payment_method', 
            'status', 'paid_at', 'renter_username', 'renter_email', 'item_title'
        ]
        read_only_fields = ['paid_at']
