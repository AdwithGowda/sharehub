from django.db import models
from django.conf import settings
from items.models import Item

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('CONFIRMED', 'Confirmed'),
        ('PAID', 'Payment Completed'),
        ('ACTIVE', 'Rental Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('DISPUTED', 'Disputed'),
        ('REJECTED', 'Rejected'),
    ]
    item = models.ForeignKey(Item, on_delete=models.PROTECT, related_name='bookings')
    renter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    start_date = models.DateField()
    end_date = models.DateField()
    rental_fee = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    activated_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Booking #{self.id} for {self.item.title}"


class QRCode(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='qr_code')
    qr_image = models.ImageField(upload_to='qrcodes/', null=True, blank=True)
    qr_token = models.CharField(max_length=255, unique=True)
    is_scanned = models.BooleanField(default=False)
    scanned_at = models.DateTimeField(null=True, blank=True)


class HandoverEvidence(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='handover_evidences')
    image = models.ImageField(upload_to='handovers/pickup/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class ReturnEvidence(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='return_evidences')
    image = models.ImageField(upload_to='handovers/return/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
