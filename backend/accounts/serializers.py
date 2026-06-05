from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from .models import WithdrawalRequest

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'profile_image', 'is_verified', 'role', 'is_staff', 'is_active', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        user.is_active = True
        user.save(update_fields=['is_active'])
        return user

class WithdrawalRequestSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    wallet_balance = serializers.SerializerMethodField()

    class Meta:
        model = WithdrawalRequest
        fields = ['id', 'user_id', 'amount', 'bank_account', 'status', 'requested_at', 'username', 'email', 'wallet_balance']
        read_only_fields = ['status', 'username', 'email', 'wallet_balance']

    def get_wallet_balance(self, obj):
        wallet = getattr(obj.user, 'wallet', None)
        return wallet.balance if wallet else 0

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get('password')
        
        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = None

        if user is not None:
            if not user.check_password(password):
                raise AuthenticationFailed(
                    'No active account found with the given credentials',
                    code='no_active_account'
                )
            if not user.is_active:
                raise AuthenticationFailed(
                    'This account has been suspended by the platform administrator.',
                    code='user_suspended'
                )
                
        return super().validate(attrs)
