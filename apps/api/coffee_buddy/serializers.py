from rest_framework import serializers
from .models import CoffeeInvitation


class CoffeeInvitationSerializer(serializers.ModelSerializer):
    creator_name = serializers.SerializerMethodField()
    accepted_by_name = serializers.SerializerMethodField()
    is_creator = serializers.SerializerMethodField()

    class Meta:
        model = CoffeeInvitation
        fields = [
            "id",
            "creator",
            "creator_name",
            "is_creator",
            "accepted_by",
            "accepted_by_name",
            "topic",
            "description",
            "meeting_format",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "creator",
            "accepted_by",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_is_creator(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.is_authenticated and request.user.pk == obj.creator_id)

    def get_creator_name(self, obj):
        return obj.creator.get_full_name().strip() or obj.creator.get_username()

    def get_accepted_by_name(self, obj):
        if obj.accepted_by:
            return obj.accepted_by.get_full_name().strip() or obj.accepted_by.get_username()
        return None

    def validate_topic(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Topic cannot be empty.")
        return value


from .models import CoffeeMessage


class CoffeeMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = CoffeeMessage
        fields = [
            "id",
            "invitation",
            "sender",
            "sender_name",
            "content",
            "created_at",
        ]
        read_only_fields = fields

    def get_sender_name(self, obj):
        return obj.sender.get_full_name().strip() or obj.sender.get_username()
