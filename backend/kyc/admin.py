from django.contrib import admin
from .models import KYC

class KYCAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'verified_by', 'verified_at')
    list_filter = ('status',)
    search_fields = ('user__email', 'user__username')

admin.site.register(KYC, KYCAdmin)
