from rest_framework import serializers
from .models import Booking, QRCode, HandoverEvidence, ReturnEvidence
from items.serializers import ItemSerializer

class QRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QRCode
        fields = ['qr_image', 'qr_token', 'is_scanned']

class BookingSerializer(serializers.ModelSerializer):
    item_details = ItemSerializer(source='item', read_only=True)
    renter_username = serializers.CharField(source='renter.username', read_only=True)
    qr_code = QRCodeSerializer(read_only=True)
    is_paid = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'item', 'item_details', 'renter', 'renter_username', 
            'start_date', 'end_date', 'rental_fee', 'deposit_amount', 
            'platform_fee', 'status', 'created_at', 'qr_code', 'is_paid'
        ]
        read_only_fields = ['renter', 'rental_fee', 'deposit_amount', 'platform_fee', 'status', 'created_at', 'qr_code', 'is_paid']

    def get_is_paid(self, obj):
        from payments.models import Payment
        return Payment.objects.filter(booking=obj, status='SUCCESS').exists()


class HandoverEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HandoverEvidence
        fields = ['id', 'image', 'uploaded_by', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            name = instance.image.name
            if name.startswith('http://') or name.startswith('https://'):
                ret['image'] = name
            else:
                ret['image'] = request.build_absolute_uri(instance.image.url) if request else instance.image.url
        return ret


class ReturnEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnEvidence
        fields = ['id', 'image', 'uploaded_by', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            name = instance.image.name
            if name.startswith('http://') or name.startswith('https://'):
                ret['image'] = name
            else:
                ret['image'] = request.build_absolute_uri(instance.image.url) if request else instance.image.url
        return ret
