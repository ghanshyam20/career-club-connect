
from django.conf import settings
from django.db import models


class MemberProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="member_profile",
    )

    career_club_round = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    bio = models.TextField(
        max_length=500,
        blank=True,
    )

    skills = models.TextField(
        max_length=500,
        blank=True,
    )

    career_interests = models.TextField(
        max_length=500,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"
