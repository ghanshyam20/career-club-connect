
from rest_framework import serializers

from .models import MemberProfile


class MemberProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = MemberProfile
        fields = [
            "username",
            "career_club_round",
            "bio",
            "skills",
            "career_interests",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "username",
            "created_at",
            "updated_at",
        ]

    def validate_career_club_round(self, value):
        if value is not None and value < 1:
            raise serializers.ValidationError(
                "Career Club round must be at least 1."
            )
        return value
