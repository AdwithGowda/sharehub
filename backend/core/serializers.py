from rest_framework import serializers

from .models import PlatformSettings


class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        fields = [
            'commission_rate',
            'min_deposit_percent',
            'max_booking_days',
            'auto_approve_bookings',
            'notifications_enabled',
            'payment_gateway_mode',
            'maintenance_mode',
            'support_email',
            'updated_at',
        ]
        read_only_fields = ['updated_at']

    def validate_commission_rate(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('Commission rate must be between 0 and 100.')
        return value

    def validate_min_deposit_percent(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('Minimum deposit percent must be between 0 and 100.')
        return value

    def validate_max_booking_days(self, value):
        if value < 1:
            raise serializers.ValidationError('Maximum booking days must be at least 1.')
        return value

    def validate_payment_gateway_mode(self, value):
        normalized = value.upper()
        if normalized not in ('SANDBOX', 'LIVE', 'DISABLED'):
            raise serializers.ValidationError('Payment gateway mode must be SANDBOX, LIVE, or DISABLED.')
        return normalized
