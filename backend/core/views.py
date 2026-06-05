from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PlatformSettings
from .serializers import PlatformSettingsSerializer


class PlatformSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get(self, request):
        settings = PlatformSettings.load()
        return Response(PlatformSettingsSerializer(settings).data)

    def patch(self, request):
        settings = PlatformSettings.load()
        serializer = PlatformSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
