from rest_framework import serializers
from .models import Category, Item, ItemImage

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image']
        read_only_fields = ['image']

class ItemImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ItemImage
        fields = ['id', 'image', 'uploaded_at']

    def get_image(self, obj):
        if obj.image:
            name = obj.image.name
            if name.startswith('http://') or name.startswith('https://'):
                return name
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

class ItemSerializer(serializers.ModelSerializer):
    images = ItemImageSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    availability_status = serializers.BooleanField(default=True, required=False)

    class Meta:
        model = Item
        fields = [
            'id', 'owner', 'owner_username', 'category', 'category_name', 
            'title', 'description', 'price_per_day', 'deposit_amount', 
            'location', 'availability_status', 'rating', 'images', 'created_at'
        ]
        read_only_fields = ['owner', 'rating', 'created_at']
