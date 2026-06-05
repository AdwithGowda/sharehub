from django.contrib import admin

from .models import PlatformSettings


@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'payment_gateway_mode',
        'commission_rate',
        'min_deposit_percent',
        'max_booking_days',
        'maintenance_mode',
        'updated_at',
    )
    readonly_fields = ('updated_at',)
    fieldsets = (
        ('Payments', {
            'fields': (
                'payment_gateway_mode',
                'commission_rate',
                'min_deposit_percent',
            )
        }),
        ('Bookings', {
            'fields': (
                'max_booking_days',
                'auto_approve_bookings',
            )
        }),
        ('Platform', {
            'fields': (
                'notifications_enabled',
                'maintenance_mode',
                'support_email',
                'updated_at',
            )
        }),
    )

    def has_add_permission(self, request):
        return not PlatformSettings.objects.exists()
