from django.conf import settings
from django.db import models
from django.db.models import Q, F


class CoffeeInvitation(models.Model):
    class Format(models.TextChoices):
        ONLINE = "online", "Online"
        IN_PERSON = "in_person", "In person"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        ACCEPTED = "accepted", "Accepted"
        CANCELLED = "cancelled", "Cancelled"

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coffee_invitations",
    )
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accepted_coffee_invitations",
    )
    topic = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    meeting_format = models.CharField(
        max_length=20,
        choices=Format.choices,
        default=Format.ONLINE,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=~Q(creator=F("accepted_by")),
                name="coffee_no_self_accept",
            ),
        ]

    def __str__(self):
        return self.topic


class CoffeeMessage(models.Model):
    invitation = models.ForeignKey(
        CoffeeInvitation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_coffee_messages",
    )
    content = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"Message {self.pk} in invitation {self.invitation_id}"
