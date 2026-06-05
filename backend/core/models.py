from django.db import models


class PlatformSettings(models.Model):
    PAYMENT_GATEWAY_MODE_CHOICES = (
        ('SANDBOX', 'Sandbox'),
        ('LIVE', 'Live'),
        ('DISABLED', 'Disabled'),
    )

    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    min_deposit_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    max_booking_days = models.PositiveIntegerField(default=30)
    auto_approve_bookings = models.BooleanField(default=False)
    notifications_enabled = models.BooleanField(default=True)
    payment_gateway_mode = models.CharField(
        max_length=20,
        choices=PAYMENT_GATEWAY_MODE_CHOICES,
        default='SANDBOX',
    )
    maintenance_mode = models.BooleanField(default=False)
    support_email = models.EmailField(default='support@sharehub.local')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Platform settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings

    def __str__(self):
        return 'Platform Settings'
