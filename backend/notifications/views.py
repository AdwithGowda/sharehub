from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Fetch user notifications
    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

import threading
from django.db import close_old_connections
from django.conf import settings

def delete_notifications_if_all_read(title, message):
    """
    Background worker thread function to delete all notifications with the
    given title and message if (and only if) all of them have been read.
    """
    close_old_connections()
    try:
        qs = Notification.objects.filter(title=title, message=message)
        if qs.exists() and not qs.filter(is_read=False).exists():
            qs.delete()
    finally:
        close_old_connections()

class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Flag a specific notification row as read
    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()

            # Check if all notifications with the same title/message are read
            title = notification.title
            message = notification.message
            
            matching_notifications = Notification.objects.filter(title=title, message=message)
            if not matching_notifications.filter(is_read=False).exists():
                delay = getattr(settings, 'NOTIFICATION_DELETE_DELAY', 300.0)
                threading.Timer(
                    delay,
                    delete_notifications_if_all_read,
                    args=[title, message]
                ).start()

            return Response({"message": "Notification updated successfully."})
        except Notification.DoesNotExist:
            return Response({"error": "Notification record not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminBroadcastNotificationView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        notifications = Notification.objects.select_related('user').order_by('-created_at')[:100]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def post(self, request):
        from core.models import PlatformSettings
        settings = PlatformSettings.load()
        if not settings.notifications_enabled:
            return Response({"error": "Platform notifications are currently disabled."}, status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title')
        message = request.data.get('message')

        if not title or not message:
            return Response({"error": "Title and message are required."}, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Broadcast to all customer accounts
        customers = User.objects.filter(role='CUSTOMER')
        notifications = []
        for customer in customers:
            notifications.append(
                Notification(user=customer, title=title, message=message)
            )
        Notification.objects.bulk_create(notifications)

        return Response({"message": f"Broadcast successfully sent to {customers.count()} users!"}, status=status.HTTP_201_CREATED)


class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Flag all unread notifications for current user as read
    def patch(self, request):
        unread_notifications = Notification.objects.filter(user=request.user, is_read=False)
        
        # Get distinct title and message pairs before marking as read for deletion logic
        pairs = list(unread_notifications.values('title', 'message').distinct())
        
        # Mark all as read
        unread_count = unread_notifications.update(is_read=True)
        
        # Start background deletion timer for each pair if eligible
        delay = getattr(settings, 'NOTIFICATION_DELETE_DELAY', 300.0)
        for pair in pairs:
            title = pair['title']
            message = pair['message']
            matching = Notification.objects.filter(title=title, message=message)
            if not matching.filter(is_read=False).exists():
                threading.Timer(
                    delay,
                    delete_notifications_if_all_read,
                    args=[title, message]
                ).start()

        return Response({"message": f"Successfully marked {unread_count} notifications as read."})

