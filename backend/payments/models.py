from django.db import models
from bookings.models import Booking

class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_id = models.CharField(max_length=255, unique=True)
    payment_method = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    paid_at = models.DateTimeField(auto_now_add=True)
