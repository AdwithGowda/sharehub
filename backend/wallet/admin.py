from django.contrib import admin
from .models import Wallet, WalletTransaction

class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance')
    search_fields = ('user__email', 'user__username')

class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'amount', 'transaction_type', 'status', 'created_at')
    list_filter = ('transaction_type', 'status')
    search_fields = ('wallet__user__email',)

admin.site.register(Wallet, WalletAdmin)
admin.site.register(WalletTransaction, WalletTransactionAdmin)
