from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        )[:50]


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_read(request, pk):
    notification = Notification.objects.filter(
        pk=pk,
        recipient=request.user,
    ).first()

    if notification is None:
        return Response({"detail": "Notification not found."}, status=404)

    notification.is_read = True
    notification.save(update_fields=["is_read"])

    return Response(NotificationSerializer(notification).data)
