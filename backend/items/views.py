from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
import cloudinary
import cloudinary.uploader
from django.db.models import ProtectedError
from .models import Category, Item, ItemImage
from .serializers import CategorySerializer, ItemSerializer

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

# --- Public Category List API ---
class CategoryListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get(self, request):
        categories = Category.objects.all().order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save()
            
            image = request.FILES.get('image')
            if image:
                try:
                    upload_data = cloudinary.uploader.upload(image)
                    category.image = upload_data.get('secure_url')
                    category.save()
                except Exception as e:
                    pass # Keep the category, but image upload failed

            return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Marketplace Search & Owner Listing API ---
class ItemListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    # Global search and filtering mechanism
    def get(self, request):
        queryset = Item.objects.filter(availability_status=True).exclude(
            bookings__status__in=['APPROVED', 'CONFIRMED', 'PAID', 'ACTIVE', 'DISPUTED']
        )
        
        category_id = request.query_params.get('category')
        max_price = request.query_params.get('max_price')
        location = request.query_params.get('location')

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if max_price:
            queryset = queryset.filter(price_per_day__lte=max_price)
        if location:
            queryset = queryset.filter(location__icontains=location)

        serializer = ItemSerializer(queryset, many=True)
        return Response(serializer.data)

    # Owner creates a new listing
    def post(self, request):
        # Enforce KYC policy before listing
        if not request.user.is_verified:
            return Response(
                {"error": "You must complete your KYC verification before listing items for rent."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            item = serializer.save(owner=request.user)
            
            # Process multiple incoming image uploads to Cloudinary
            images = request.FILES.getlist('uploaded_images')
            for img in images:
                upload_data = cloudinary.uploader.upload(img)
                cloudinary_url = upload_data.get('secure_url')
                ItemImage.objects.create(item=item, image=cloudinary_url)
                
            return Response(ItemSerializer(item).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Detailed View / Update / Delete API ---
class ItemDetailView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, pk):
        try:
            item = Item.objects.get(pk=pk)
            return Response(ItemSerializer(item).data)
        except Item.DoesNotExist:
            return Response({"error": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            item = Item.objects.get(pk=pk, owner=request.user)
        except Item.DoesNotExist:
            return Response({"error": "Listing not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = ItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            item = Item.objects.get(pk=pk, owner=request.user)
            item.delete()
            return Response({"message": "Listing removed successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Item.DoesNotExist:
            return Response({"error": "Listing not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)


class AdminItemListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        items = Item.objects.all().order_by('-created_at')
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)


class AdminItemRemoveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            item = Item.objects.get(pk=pk)
            item.delete()
            return Response({"message": "Listing removed successfully by administrator."}, status=status.HTTP_204_NO_CONTENT)
        except Item.DoesNotExist:
            return Response({"error": "Listing not found."}, status=status.HTTP_404_NOT_FOUND)

class AdminCategoryRemoveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
            category.delete()
            return Response({"message": "Category removed successfully by administrator."}, status=status.HTTP_204_NO_CONTENT)
        except Category.DoesNotExist:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
        except ProtectedError:
            return Response({"error": "Cannot delete category because there are items associated with it."}, status=status.HTTP_400_BAD_REQUEST)

