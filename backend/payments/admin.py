from django.contrib import admin
from .models import Payment

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('booking', 'amount', 'payment_id', 'payment_method', 'status', 'paid_at')
    list_filter = ('status', 'payment_method')
    search_fields = ('payment_id', 'booking__id')

admin.site.register(Payment, PaymentAdmin)
