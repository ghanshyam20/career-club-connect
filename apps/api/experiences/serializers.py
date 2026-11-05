
from rest_framework import serializers

from .models import Experience


class ExperienceSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_id = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = [
            "id",
            "title",
            "category",
            "content",
            "publish_anonymously",
            "author_name",
            "author_id",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "author_name",
            "author_id",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_author_name(self, obj):
        if obj.publish_anonymously:
            return "Anonymous"

        return obj.author.get_full_name().strip() or obj.author.email or "Career Club member"


    def get_author_id(self, obj):
        if obj.publish_anonymously:
            return None
        return obj.author_id
