from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from io import BytesIO
from PIL import Image
from bookings.models import Booking, QRCode, HandoverEvidence, ReturnEvidence
from bookings.serializers import HandoverEvidenceSerializer, ReturnEvidenceSerializer
from items.models import Item, Category

User = get_user_model()

class BookingHandoverTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(username='owner', email='owner@example.com', password='password', is_verified=True)
        self.renter = User.objects.create_user(username='renter', email='renter@example.com', password='password', is_verified=True)
        
        self.category = Category.objects.create(name='Electronics', description='Gadgets')
        self.item = Item.objects.create(
            owner=self.owner,
            category=self.category,
            title='Camera',
            description='DSLR Camera',
            price_per_day=50.0,
            deposit_amount=100.0,
            location='Noida',
            availability_status=True
        )
        self.booking = Booking.objects.create(
            item=self.item,
            renter=self.renter,
            start_date='2026-06-05',
            end_date='2026-06-10',
            rental_fee=250.0,
            deposit_amount=100.0,
            platform_fee=10.0,
            status='APPROVED'
        )
        self.qr_code = QRCode.objects.create(
            booking=self.booking,
            qr_token='test_token',
            is_scanned=False
        )

    def generate_dummy_image(self):
        file = BytesIO()
        image = Image.new('RGBA', size=(100, 100), color=(0, 0, 155))
        image.save(file, 'png')
        file.name = 'evidence.png'
        file.seek(0)
        return file

    @patch('cloudinary.uploader.upload')
    def test_qr_verify_handover_cloudinary(self, mock_upload):
        self.client.force_authenticate(user=self.owner)
        mock_upload.return_value = {'secure_url': 'https://res.cloudinary.com/fake/handover.jpg'}
        
        img = self.generate_dummy_image()
        url = reverse('qr_verify_pickup', kwargs={'pk': self.booking.id})
        response = self.client.post(url, {
            'qr_token': 'test_token',
            'handover_images': [img]
        }, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_upload.call_count, 1)
        
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, 'ACTIVE')
        
        evidence = HandoverEvidence.objects.get(booking=self.booking)
        self.assertEqual(evidence.image, 'https://res.cloudinary.com/fake/handover.jpg')
        
        # Test serializer
        serializer = HandoverEvidenceSerializer(evidence)
        self.assertEqual(serializer.data['image'], 'https://res.cloudinary.com/fake/handover.jpg')

    @patch('cloudinary.uploader.upload')
    def test_upload_return_evidence_cloudinary(self, mock_upload):
        self.client.force_authenticate(user=self.renter)
        mock_upload.return_value = {'secure_url': 'https://res.cloudinary.com/fake/return.jpg'}
        
        img = self.generate_dummy_image()
        url = reverse('booking_return_photos', kwargs={'pk': self.booking.id})
        response = self.client.post(url, {
            'return_images': [img]
        }, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_upload.call_count, 1)
        
        evidence = ReturnEvidence.objects.get(booking=self.booking)
        self.assertEqual(evidence.image, 'https://res.cloudinary.com/fake/return.jpg')
        
        # Test serializer
        serializer = ReturnEvidenceSerializer(evidence)
        self.assertEqual(serializer.data['image'], 'https://res.cloudinary.com/fake/return.jpg')

    def test_booking_creation_fails_if_renter_not_verified(self):
        non_verified_renter = User.objects.create_user(username='non_verified', email='non_verified@example.com', password='password', is_verified=False)
        self.client.force_authenticate(user=non_verified_renter)
        
        url = reverse('booking_list_create')
        response = self.client.post(url, {
            'item': self.item.id,
            'start_date': '2026-06-05',
            'end_date': '2026-06-10'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("You must complete identity verification (KYC)", response.data['error'])
