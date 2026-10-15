
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import MemberProfile
from .serializers import MemberProfileSerializer


class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = MemberProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        profile, created = MemberProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile
