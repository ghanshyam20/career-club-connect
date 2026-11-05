
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Experience
from .serializers import ExperienceSerializer


class ExperienceListCreateView(generics.ListCreateAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Experience.objects.filter(
                status=Experience.Status.APPROVED
            )
            .select_related("author")
        )

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            status=Experience.Status.PENDING,
        )


class MyExperiencesView(generics.ListAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Experience.objects.filter(
                author=self.request.user
            )
            .select_related("author")
        )
