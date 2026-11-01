
from rest_framework import serializers

from .models import CareerAction


class CareerActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerAction
        fields = [
            "id",
            "title",
            "description",
            "deadline",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value):
        title = value.strip()

        if not title:
            raise serializers.ValidationError(
                "Action title cannot be empty."
            )

        return title
