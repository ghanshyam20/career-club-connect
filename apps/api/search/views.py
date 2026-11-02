from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from experiences.models import Experience
from forum.models import CommunityPost


class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response({
                "members": [],
                "experiences": [],
                "posts": [],
            })

        if len(query) > 100:
            return Response(
                {"detail": "Search must be 100 characters or fewer."},
                status=400,
            )

        members = User.objects.filter(
            Q(username__icontains=query)
            | Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
            | Q(member_profile__skills__icontains=query)
            | Q(member_profile__bio__icontains=query)
            | Q(member_profile__career_interests__icontains=query)
        ).distinct().order_by("username")[:10]

        experiences = Experience.objects.filter(
            Q(title__icontains=query) | Q(content__icontains=query),
            status=Experience.Status.APPROVED,
        ).order_by("-created_at")[:10]

        posts = CommunityPost.objects.filter(
            Q(content__icontains=query) | Q(category__icontains=query)
        ).order_by("-created_at")[:10]

        return Response({
            "members": [
                {
                    "id": member.id,
                    "username": member.username,
                    "name": member.get_full_name() or member.username,
                }
                for member in members
            ],
            "experiences": [
                {
                    "id": experience.id,
                    "title": experience.title,
                    "category": experience.category,
                    "excerpt": experience.content[:180],
                }
                for experience in experiences
            ],
            "posts": [
                {
                    "id": post.id,
                    "category": post.category,
                    "excerpt": post.content[:180],
                }
                for post in posts
            ],
        })
