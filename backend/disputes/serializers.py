from rest_framework import serializers
from .models import DamageClaim, DamageEvidence

class DamageEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DamageEvidence
        fields = ['id', 'image', 'uploaded_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            name = instance.image.name
            if name.startswith('http://') or name.startswith('https://'):
                ret['image'] = name
            else:
                ret['image'] = request.build_absolute_uri(instance.image.url) if request else instance.image.url
        return ret

class DamageClaimSerializer(serializers.ModelSerializer):
    evidences = DamageEvidenceSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = DamageClaim
        fields = [
            'id', 'booking', 'owner', 'owner_username', 
            'description', 'repair_cost', 'status', 
            'admin_notes', 'evidences', 'created_at'
        ]
        read_only_fields = ['owner', 'status', 'admin_notes', 'created_at']
