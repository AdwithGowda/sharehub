from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at', 'username', 'email']
