from django.db import models
from django.conf import settings

class KYC(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='kyc')
    id_proof = models.ImageField(upload_to='kyc/ids/')
    selfie = models.ImageField(upload_to='kyc/selfies/')
    address_proof = models.ImageField(upload_to='kyc/address/')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='verified_kycs'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"KYC for {self.user.email}"

    def save(self, *args, **kwargs):
        if self.status == 'APPROVED':
            self.user.is_verified = True
            self.user.save()
        elif self.status == 'REJECTED' or self.status == 'PENDING':
            self.user.is_verified = False
            self.user.save()
        super().save(*args, **kwargs)
