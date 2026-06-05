from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'booking', 'sender', 'sender_username', 'receiver', 'receiver_username', 'message', 'created_at']
        read_only_fields = ['booking', 'sender', 'receiver', 'created_at']
