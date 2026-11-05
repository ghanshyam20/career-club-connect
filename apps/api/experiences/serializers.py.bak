
from rest_framework import serializers

from .models import Experience


class ExperienceSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = [
            "id",
            "title",
            "category",
            "content",
            "publish_anonymously",
            "author_name",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "author_name",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_author_name(self, obj):
        if obj.publish_anonymously:
            return "Anonymous"

        return obj.author.username
