from django.db import models
from django.conf import settings
from bookings.models import Booking

class DamageClaim(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('RESOLVED', 'Resolved'),
        ('REJECTED', 'Rejected'),
    ]
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='damage_claim')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='claims_raised')
    description = models.TextField()
    repair_cost = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class DamageEvidence(models.Model):
    damage_claim = models.ForeignKey(DamageClaim, on_delete=models.CASCADE, related_name='evidences')
    image = models.ImageField(upload_to='disputes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
