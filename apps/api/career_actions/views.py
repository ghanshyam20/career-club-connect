
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import CareerAction
from .serializers import CareerActionSerializer


class CareerActionListCreateView(generics.ListCreateAPIView):
    serializer_class = CareerActionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CareerAction.objects.filter(
            owner=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CareerActionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CareerActionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CareerAction.objects.filter(
            owner=self.request.user
        )
