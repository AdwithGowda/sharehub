from rest_framework import serializers
from .models import KYC

class KYCSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = KYC
        fields = ['id', 'username', 'id_proof', 'selfie', 'address_proof', 'status', 'verified_at']
        read_only_fields = ['status', 'verified_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        for field_name in ['id_proof', 'selfie', 'address_proof']:
            field_val = getattr(instance, field_name)
            if field_val:
                name = field_val.name
                if name.startswith('http://') or name.startswith('https://'):
                    ret[field_name] = name
                else:
                    ret[field_name] = request.build_absolute_uri(field_val.url) if request else field_val.url
        return ret
