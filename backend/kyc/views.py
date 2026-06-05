from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from django.conf import settings
import cloudinary
import cloudinary.uploader
from .models import KYC
from .serializers import KYCSerializer
from notifications.utils import create_notification

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

class KYCSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Check current KYC status
    def get(self, request):
        try:
            kyc = KYC.objects.get(user=request.user)
            serializer = KYCSerializer(kyc)
            return Response(serializer.data)
        except KYC.DoesNotExist:
            return Response({"status": "NOT_SUBMITTED"})

    # Submit KYC documents
    def post(self, request):
        try:
            kyc = KYC.objects.get(user=request.user)
            if kyc.status == 'REJECTED':
                kyc.delete()
            else:
                return Response({"error": "KYC details already submitted."}, status=status.HTTP_400_BAD_REQUEST)
        except KYC.DoesNotExist:
            pass
        
        serializer = KYCSerializer(data=request.data)
        if serializer.is_valid():
            id_proof_file = serializer.validated_data.get('id_proof')
            selfie_file = serializer.validated_data.get('selfie')
            address_proof_file = serializer.validated_data.get('address_proof')
            
            try:
                # Upload files to Cloudinary
                id_proof_upload = cloudinary.uploader.upload(id_proof_file)
                selfie_upload = cloudinary.uploader.upload(selfie_file)
                address_proof_upload = cloudinary.uploader.upload(address_proof_file)
                
                # Retrieve secure URLs
                id_proof_url = id_proof_upload.get('secure_url')
                selfie_url = selfie_upload.get('secure_url')
                address_proof_url = address_proof_upload.get('secure_url')
                
                # Save KYC record with secure URLs
                kyc = KYC.objects.create(
                    user=request.user,
                    id_proof=id_proof_url,
                    selfie=selfie_url,
                    address_proof=address_proof_url,
                    status='PENDING'
                )
                return Response({"message": "KYC files uploaded successfully for review!"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": f"Failed to upload documents to Cloudinary: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Admin Verification Operations ---
class AdminKYCReviewView(APIView):
    permission_classes = [permissions.IsAdminUser] # Strictly matches is_staff/is_superuser

    # View all pending or processed applications
    def get(self, request):
        kyc_queue = KYC.objects.all().order_by('-id')
        serializer = KYCSerializer(kyc_queue, many=True)
        return Response(serializer.data)

    # Approve or Reject a specific application
    def patch(self, request, pk):
        try:
            kyc_record = KYC.objects.get(pk=pk)
        except KYC.DoesNotExist:
            return Response({"error": "KYC record not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # Expecting 'APPROVE' or 'REJECT'
        if action == 'APPROVE':
            kyc_record.status = 'APPROVED'
            kyc_record.user.is_verified = True
            kyc_record.user.save()
            create_notification(kyc_record.user, "Identity Verification Approved", "Your identity verification request has been successfully approved.")
        elif action == 'REJECT':
            user = kyc_record.user
            user.is_verified = False
            user.save()
            create_notification(user, "Identity Verification Rejected", "Your identity verification request has been rejected. Please check your uploaded files and re-submit.")
            kyc_record.delete()
            return Response({"message": "Application status updated to REJECTED successfully. Record deleted to allow re-submission."})
        else:
            return Response({"error": "Invalid action parameter specified."}, status=status.HTTP_400_BAD_REQUEST)

        kyc_record.verified_by = request.user
        kyc_record.verified_at = timezone.now()
        kyc_record.save()
        
        return Response({"message": f"Application status updated to {kyc_record.status} successfully."})
