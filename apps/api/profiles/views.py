
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import MemberProfile
from .serializers import MemberProfileSerializer


class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = MemberProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        profile, created = MemberProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile


class MemberDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from django.contrib.auth import get_user_model
        from django.shortcuts import get_object_or_404
        from rest_framework.response import Response
        from experiences.models import Experience
        from forum.models import CommunityPost

        User = get_user_model()
        user = get_object_or_404(User, pk=pk)
        profile = MemberProfile.objects.filter(user=user).first()

        experiences = Experience.objects.filter(
            author=user,
            status=Experience.Status.APPROVED,
            publish_anonymously=False,
        ).order_by("-created_at")

        posts = CommunityPost.objects.filter(
            author=user,
        ).order_by("-created_at")

        return Response({
            "id": user.id,
            "username": user.username,
            "name": user.get_full_name() or user.username,
            "career_club_round": (
                profile.career_club_round if profile else None
            ),
            "bio": profile.bio if profile else "",
            "skills": profile.skills if profile else "",
            "career_interests": (
                profile.career_interests if profile else ""
            ),
            "experiences": [
                {
                    "id": item.id,
                    "title": item.title,
                    "category": item.category,
                    "content": item.content,
                    "created_at": item.created_at,
                }
                for item in experiences
            ],
            "posts": [
                {
                    "id": item.id,
                    "category": item.category,
                    "content": item.content,
                    "created_at": item.created_at,
                }
                for item in posts
            ],
        })
