import time
from django.test import TransactionTestCase, override_settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Notification

User = get_user_model()

@override_settings(NOTIFICATION_DELETE_DELAY=0.05)
class NotificationDeletionTests(TransactionTestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', email='user1@example.com', password='password')
        self.user2 = User.objects.create_user(username='user2', email='user2@example.com', password='password')
        
    def test_single_notification_deleted_after_delay(self):
        notification = Notification.objects.create(
            user=self.user1,
            title="Single Notification",
            message="Please read this message"
        )
        self.client.force_authenticate(user=self.user1)
        
        # Mark as read
        url = reverse('notification_mark_read', kwargs={'pk': notification.id})
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check immediately
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
        
        # Wait for the delay
        time.sleep(0.15)
        
        # Verify it has been deleted
        self.assertFalse(Notification.objects.filter(pk=notification.id).exists())

    def test_multiple_notifications_not_deleted_until_all_read(self):
        notif1 = Notification.objects.create(
            user=self.user1,
            title="Broadcast Alert",
            message="System update notification"
        )
        notif2 = Notification.objects.create(
            user=self.user2,
            title="Broadcast Alert",
            message="System update notification"
        )
        
        # User 1 marks theirs as read
        self.client.force_authenticate(user=self.user1)
        url1 = reverse('notification_mark_read', kwargs={'pk': notif1.id})
        response = self.client.patch(url1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Wait and verify neither are deleted (since notif2 is still unread)
        time.sleep(0.15)
        self.assertTrue(Notification.objects.filter(pk=notif1.id).exists())
        self.assertTrue(Notification.objects.filter(pk=notif2.id).exists())
        
        # User 2 marks theirs as read
        self.client.force_authenticate(user=self.user2)
        url2 = reverse('notification_mark_read', kwargs={'pk': notif2.id})
        response = self.client.patch(url2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Wait and verify both are now deleted
        time.sleep(0.15)
        self.assertFalse(Notification.objects.filter(pk=notif1.id).exists())
        self.assertFalse(Notification.objects.filter(pk=notif2.id).exists())

    def test_notifications_with_different_messages_not_grouped(self):
        # Two notifications with same title but different messages
        notif1 = Notification.objects.create(
            user=self.user1,
            title="Alert",
            message="Message A"
        )
        notif2 = Notification.objects.create(
            user=self.user1,
            title="Alert",
            message="Message B"
        )
        
        self.client.force_authenticate(user=self.user1)
        
        # Mark notif1 as read
        url1 = reverse('notification_mark_read', kwargs={'pk': notif1.id})
        response = self.client.patch(url1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Wait and verify notif1 is deleted (since it's the only one with "Message A")
        time.sleep(0.15)
        self.assertFalse(Notification.objects.filter(pk=notif1.id).exists())
        self.assertTrue(Notification.objects.filter(pk=notif2.id).exists())
