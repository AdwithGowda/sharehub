from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from io import BytesIO
from PIL import Image
from bookings.models import Booking
from items.models import Item, Category
from disputes.models import DamageClaim, DamageEvidence

User = get_user_model()

class DisputeTestCase(TestCase):
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
            status='ACTIVE'
        )
        self.client.force_authenticate(user=self.owner)

    def generate_dummy_image(self):
        file = BytesIO()
        image = Image.new('RGBA', size=(100, 100), color=(0, 155, 0))
        image.save(file, 'png')
        file.name = 'evidence.png'
        file.seek(0)
        return file

    @patch('cloudinary.uploader.upload')
    def test_raise_claim_cloudinary(self, mock_upload):
        mock_upload.return_value = {'secure_url': 'https://res.cloudinary.com/fake/dispute.jpg'}
        
        img1 = self.generate_dummy_image()
        img2 = self.generate_dummy_image()
        
        url = reverse('dispute_raise')
        response = self.client.post(url, {
            'booking': self.booking.id,
            'description': 'Camera lens scratched',
            'repair_cost': '75.00',
            'damage_photos': [img1, img2]
        }, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(mock_upload.call_count, 2)
        
        claim = DamageClaim.objects.get(booking=self.booking)
        self.assertEqual(claim.status, 'PENDING')
        self.assertEqual(claim.repair_cost, 75.00)
        
        evidences = claim.evidences.all()
        self.assertEqual(evidences.count(), 2)
        for ev in evidences:
            self.assertEqual(ev.image, 'https://res.cloudinary.com/fake/dispute.jpg')
            
        # Verify serialized response contains the clean Cloudinary URL
        self.assertEqual(response.data['evidences'][0]['image'], 'https://res.cloudinary.com/fake/dispute.jpg')
        self.assertEqual(response.data['evidences'][1]['image'], 'https://res.cloudinary.com/fake/dispute.jpg')
