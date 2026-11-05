from django.db import transaction
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from notifications.models import Notification
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

        Notification.objects.create(
            recipient=invitation.creator,
            message=(
                f"{request.user.get_full_name().strip() or request.user.get_username()} "
                f"accepted your coffee invitation: {invitation.topic}"
            ),
            link="/coffee-buddy",
        )

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


from rest_framework.views import APIView
from .models import CoffeeMessage
from .serializers import CoffeeMessageSerializer


class CoffeeConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_invitation(self, request, pk):
        return CoffeeInvitation.objects.select_related(
            "creator", "accepted_by"
        ).filter(
            pk=pk,
            status=CoffeeInvitation.Status.ACCEPTED,
        ).filter(
            Q(creator=request.user) | Q(accepted_by=request.user)
        ).first()

    def get(self, request, pk):
        invitation = self.get_invitation(request, pk)

        if invitation is None:
            return Response(
                {"detail": "Conversation not available."},
                status=404,
            )

        messages = CoffeeMessage.objects.filter(
            invitation=invitation
        ).select_related("sender").order_by("created_at", "id")[:100]

        return Response(
            CoffeeMessageSerializer(messages, many=True).data
        )

    def post(self, request, pk):
        content = request.data.get("content")

        if not isinstance(content, str):
            return Response(
                {"content": ["A message is required."]},
                status=400,
            )

        content = content.strip()

        if not content or len(content) > 2000:
            return Response(
                {"content": ["Message must contain 1–2000 characters."]},
                status=400,
            )

        with transaction.atomic():
            invitation = CoffeeInvitation.objects.select_for_update().filter(
                pk=pk,
                status=CoffeeInvitation.Status.ACCEPTED,
            ).filter(
                Q(creator=request.user) | Q(accepted_by=request.user)
            ).first()

            if invitation is None:
                return Response(
                    {"detail": "Conversation not available."},
                    status=404,
                )

            message = CoffeeMessage.objects.create(
                invitation=invitation,
                sender=request.user,
                content=content,
            )

            recipient = (
                invitation.accepted_by
                if invitation.creator_id == request.user.pk
                else invitation.creator
            )

            display_name = (
                request.user.get_full_name().strip()
                or request.user.get_username()
            )

            Notification.objects.create(
                recipient=recipient,
                message=f"New Coffee Buddy message from {display_name}",
                link=f"/coffee-buddy/{invitation.pk}",
            )

        return Response(
            CoffeeMessageSerializer(message).data,
            status=201,
        )
