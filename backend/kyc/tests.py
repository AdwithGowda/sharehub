from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from io import BytesIO
from PIL import Image
from .models import KYC

User = get_user_model()

class KYCTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password')
        self.client.force_authenticate(user=self.user)

    def generate_dummy_image(self):
        file = BytesIO()
        image = Image.new('RGBA', size=(100, 100), color=(155, 0, 0))
        image.save(file, 'png')
        file.name = 'test.png'
        file.seek(0)
        return file

    @patch('cloudinary.uploader.upload')
    def test_submit_kyc_cloudinary(self, mock_upload):
        mock_upload.return_value = {'secure_url': 'https://res.cloudinary.com/fake/image.jpg'}
        
        id_proof = self.generate_dummy_image()
        selfie = self.generate_dummy_image()
        address_proof = self.generate_dummy_image()
        
        url = reverse('kyc_submit')
        response = self.client.post(url, {
            'id_proof': id_proof,
            'selfie': selfie,
            'address_proof': address_proof
        }, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(mock_upload.call_count, 3)
        
        kyc = KYC.objects.get(user=self.user)
        self.assertEqual(kyc.id_proof, 'https://res.cloudinary.com/fake/image.jpg')
        self.assertEqual(kyc.selfie, 'https://res.cloudinary.com/fake/image.jpg')
        self.assertEqual(kyc.address_proof, 'https://res.cloudinary.com/fake/image.jpg')
        
        # Test serialization on GET
        response_get = self.client.get(url)
        self.assertEqual(response_get.status_code, status.HTTP_200_OK)
        self.assertEqual(response_get.data['id_proof'], 'https://res.cloudinary.com/fake/image.jpg')
        self.assertEqual(response_get.data['selfie'], 'https://res.cloudinary.com/fake/image.jpg')
        self.assertEqual(response_get.data['address_proof'], 'https://res.cloudinary.com/fake/image.jpg')

    @patch('cloudinary.uploader.upload')
    def test_reject_kyc_deletes_record_and_allows_resubmit(self, mock_upload):
        mock_upload.return_value = {'secure_url': 'https://res.cloudinary.com/fake/image.jpg'}
        
        # 1. Submit KYC
        id_proof = self.generate_dummy_image()
        selfie = self.generate_dummy_image()
        address_proof = self.generate_dummy_image()
        
        submit_url = reverse('kyc_submit')
        response = self.client.post(submit_url, {
            'id_proof': id_proof,
            'selfie': selfie,
            'address_proof': address_proof
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        kyc = KYC.objects.get(user=self.user)
        self.assertEqual(kyc.status, 'PENDING')
        
        # 2. Reject as Admin
        admin_user = User.objects.create_superuser(username='admin', email='admin@example.com', password='password')
        self.client.force_authenticate(user=admin_user)
        
        action_url = reverse('admin_kyc_action', kwargs={'pk': kyc.id})
        response_reject = self.client.patch(action_url, {'action': 'REJECT'})
        self.assertEqual(response_reject.status_code, status.HTTP_200_OK)
        
        # Verify kyc record is deleted
        self.assertFalse(KYC.objects.filter(user=self.user).exists())
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_verified)
        
        # 3. Log back as user and re-submit
        self.client.force_authenticate(user=self.user)
        id_proof2 = self.generate_dummy_image()
        selfie2 = self.generate_dummy_image()
        address_proof2 = self.generate_dummy_image()
        
        response_resubmit = self.client.post(submit_url, {
            'id_proof': id_proof2,
            'selfie': selfie2,
            'address_proof': address_proof2
        }, format='multipart')
        
        # Verify it succeeds because the old record was deleted
        self.assertEqual(response_resubmit.status_code, status.HTTP_201_CREATED)
        self.assertTrue(KYC.objects.filter(user=self.user).exists())

    @patch('cloudinary.uploader.upload')
    def test_post_kyc_with_existing_rejected_record_deletes_it_and_succeeds(self, mock_upload):
        mock_upload.return_value = {'secure_url': 'https://res.cloudinary.com/fake/image.jpg'}
        
        # Manually create a REJECTED KYC record
        KYC.objects.create(
            user=self.user,
            id_proof='https://res.cloudinary.com/fake/old.jpg',
            selfie='https://res.cloudinary.com/fake/old.jpg',
            address_proof='https://res.cloudinary.com/fake/old.jpg',
            status='REJECTED'
        )
        
        id_proof = self.generate_dummy_image()
        selfie = self.generate_dummy_image()
        address_proof = self.generate_dummy_image()
        
        submit_url = reverse('kyc_submit')
        response = self.client.post(submit_url, {
            'id_proof': id_proof,
            'selfie': selfie,
            'address_proof': address_proof
        }, format='multipart')
        
        # It should succeed because the post method deletes the existing REJECTED record
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        kyc = KYC.objects.get(user=self.user)
        self.assertEqual(kyc.status, 'PENDING')
        self.assertEqual(kyc.id_proof, 'https://res.cloudinary.com/fake/image.jpg')
