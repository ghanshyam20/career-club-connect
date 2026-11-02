from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from experiences.models import Experience
from experiences.serializers import ExperienceSerializer


class IsModerator(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class PendingExperienceListView(generics.ListAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsModerator]
    pagination_class = None

    def get_queryset(self):
        return Experience.objects.filter(
            status=Experience.Status.PENDING
        ).select_related("author")


@api_view(["POST"])
@permission_classes([IsModerator])
def approve_experience(request, pk):
    experience = get_object_or_404(
        Experience,
        pk=pk,
        status=Experience.Status.PENDING,
    )

    experience.status = Experience.Status.APPROVED
    experience.save(update_fields=["status", "updated_at"])

    return Response(ExperienceSerializer(experience).data)


@api_view(["POST"])
@permission_classes([IsModerator])
def reject_experience(request, pk):
    experience = get_object_or_404(
        Experience,
        pk=pk,
        status=Experience.Status.PENDING,
    )

    experience.status = Experience.Status.REJECTED
    experience.save(update_fields=["status", "updated_at"])

    return Response(ExperienceSerializer(experience).data)
