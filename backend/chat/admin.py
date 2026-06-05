from django.contrib import admin
from .models import Message

class MessageAdmin(admin.ModelAdmin):
    list_display = ('booking', 'sender', 'receiver', 'created_at')
    search_fields = ('sender__email', 'receiver__email', 'message')

admin.site.register(Message, MessageAdmin)
