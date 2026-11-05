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

        if len(query) > 100:
            return Response(
                {"detail": "Search must be 100 characters or fewer."},
                status=400,
            )

        members = User.objects.select_related("member_profile")

        if query:
            members = members.filter(
                Q(username__icontains=query)
                | Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(member_profile__skills__icontains=query)
                | Q(member_profile__bio__icontains=query)
                | Q(member_profile__career_interests__icontains=query)
            )

        members = members.distinct().order_by("username")[:50]

        experiences = Experience.objects.filter(
            status=Experience.Status.APPROVED,
        )
        posts = CommunityPost.objects.all()

        if query:
            experiences = experiences.filter(
                Q(title__icontains=query) | Q(content__icontains=query)
            )
            posts = posts.filter(
                Q(content__icontains=query) | Q(category__icontains=query)
            )

        experiences = experiences.order_by("-created_at")[:10]
        posts = posts.order_by("-created_at")[:10]

        return Response({
            "members": [
                {
                    "id": member.id,
                    "username": member.username,
                    "name": member.get_full_name() or member.username,
                    "round": getattr(member.member_profile, "career_club_round", None) if hasattr(member, "member_profile") else None,
                    "skills": member.member_profile.skills if hasattr(member, "member_profile") else "",
                    "interests": member.member_profile.career_interests if hasattr(member, "member_profile") else "",
                    "is_demo": member.username.startswith("demo_"),
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
