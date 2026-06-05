from django.contrib import admin
from .models import Review

class ReviewAdmin(admin.ModelAdmin):
    list_display = ('booking', 'reviewer', 'reviewed_user', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('reviewer__email', 'reviewed_user__email')

admin.site.register(Review, ReviewAdmin)
