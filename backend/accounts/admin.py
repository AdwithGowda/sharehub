from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, WithdrawalRequest

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'role', 'is_verified', 'is_staff', 'is_active')
    list_filter = ('role', 'is_verified', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Marketplace Extra', {'fields': ('role', 'is_verified', 'profile_image')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Marketplace Extra', {'fields': ('role', 'is_verified', 'profile_image')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(WithdrawalRequest)
