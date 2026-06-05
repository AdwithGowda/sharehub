from django.contrib import admin
from .models import Booking, QRCode, HandoverEvidence, ReturnEvidence

class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'item', 'renter', 'start_date', 'end_date', 'status', 'rental_fee')
    list_filter = ('status', 'start_date')
    search_fields = ('item__title', 'renter__email')

admin.site.register(Booking, BookingAdmin)
admin.site.register(QRCode)
admin.site.register(HandoverEvidence)
admin.site.register(ReturnEvidence)
