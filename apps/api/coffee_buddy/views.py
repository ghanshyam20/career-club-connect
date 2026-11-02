from django.db import transaction
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import CoffeeInvitation
from .serializers import CoffeeInvitationSerializer


class CoffeeInvitationListCreateView(generics.ListCreateAPIView):
    serializer_class = CoffeeInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CoffeeInvitation.objects.select_related(
            "creator", "accepted_by"
        ).filter(
            Q(status="open")
            | Q(creator=self.request.user)
            | Q(accepted_by=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def accept_invitation(request, pk):
    with transaction.atomic():
        invitation = CoffeeInvitation.objects.select_for_update().filter(
            pk=pk
        ).first()

        if invitation is None:
            return Response({"detail": "Invitation not found."}, status=404)

        if invitation.creator_id == request.user.pk:
            return Response(
                {"detail": "You cannot accept your own invitation."},
                status=400,
            )

        if invitation.status != CoffeeInvitation.Status.OPEN:
            return Response(
                {"detail": "Invitation is no longer available."},
                status=400,
            )

        invitation.accepted_by = request.user
        invitation.status = CoffeeInvitation.Status.ACCEPTED
        invitation.save()

    return Response(CoffeeInvitationSerializer(invitation).data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def cancel_invitation(request, pk):
    with transaction.atomic():
        invitation = CoffeeInvitation.objects.select_for_update().filter(
            pk=pk, creator=request.user
        ).first()

        if invitation is None:
            return Response({"detail": "Invitation not found."}, status=404)

        if invitation.status == CoffeeInvitation.Status.CANCELLED:
            return Response(
                {"detail": "Invitation already cancelled."},
                status=400,
            )

        invitation.status = CoffeeInvitation.Status.CANCELLED
        invitation.save()

    return Response(CoffeeInvitationSerializer(invitation).data)
