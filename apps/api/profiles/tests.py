
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import MemberProfile

User = get_user_model()


class MemberProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="member_one",
            password="TestPassword123!",
        )
        self.other_user = User.objects.create_user(
            username="member_two",
            password="TestPassword123!",
        )
        self.url = reverse("my-profile")

    def test_anonymous_user_cannot_view_profile(self):
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_logged_in_user_can_view_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "member_one")
        self.assertTrue(
            MemberProfile.objects.filter(user=self.user).exists()
        )

    def test_member_can_update_own_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            self.url,
            {
                "career_club_round": 12,
                "bio": "IT student looking for an internship.",
                "skills": "Python, SQL",
                "career_interests": "Data Analytics",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        profile = MemberProfile.objects.get(user=self.user)
        self.assertEqual(profile.career_club_round, 12)
        self.assertEqual(profile.skills, "Python, SQL")

    def test_member_cannot_change_username_through_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            self.url,
            {"username": "changed_name"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "member_one")

    def test_member_cannot_update_another_members_profile(self):
        other_profile = MemberProfile.objects.create(
            user=self.other_user,
            bio="Original bio",
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            self.url,
            {"bio": "My own updated bio"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        other_profile.refresh_from_db()
        self.assertEqual(other_profile.bio, "Original bio")

    def test_round_cannot_be_zero(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            self.url,
            {"career_club_round": 0},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


class MemberDetailTests(APITestCase):
    def setUp(self):
        from experiences.models import Experience
        from forum.models import CommunityPost

        self.Experience = Experience

        self.viewer = User.objects.create_user(
            username="current_member",
            password="TestPassword123!",
        )

        self.alumni = User.objects.create_user(
            username="previous_member",
            first_name="Aino",
            last_name="Korhonen",
            password="TestPassword123!",
        )

        MemberProfile.objects.create(
            user=self.alumni,
            career_club_round=8,
            bio="Data analyst interested in career development.",
            skills="Python, SQL, Power BI",
            career_interests="Data analytics",
        )

        self.approved = Experience.objects.create(
            author=self.alumni,
            title="My Python portfolio",
            category=Experience.Category.INTERVIEW,
            content="I built a portfolio with Python and SQL.",
            status=Experience.Status.APPROVED,
        )

        Experience.objects.create(
            author=self.alumni,
            title="Private anonymous experience",
            category=Experience.Category.OTHER,
            content="Anonymous career advice.",
            status=Experience.Status.APPROVED,
            publish_anonymously=True,
        )

        Experience.objects.create(
            author=self.alumni,
            title="Pending experience",
            category=Experience.Category.OTHER,
            content="Waiting for moderation.",
            status=Experience.Status.PENDING,
        )

        Experience.objects.create(
            author=self.alumni,
            title="Rejected experience",
            category=Experience.Category.OTHER,
            content="Rejected by moderator.",
            status=Experience.Status.REJECTED,
        )

        CommunityPost.objects.create(
            author=self.alumni,
            category="career_advice",
            content="Build small practical projects.",
        )

        self.url = reverse(
            "member-detail",
            kwargs={"pk": self.alumni.pk},
        )

    def test_anonymous_user_cannot_view_member(self):
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [401, 403])

    def test_previous_round_profile_is_visible(self):
        self.client.force_authenticate(user=self.viewer)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Aino Korhonen")
        self.assertEqual(response.data["career_club_round"], 8)
        self.assertIn("Python", response.data["skills"])

    def test_only_public_approved_experiences_appear(self):
        self.client.force_authenticate(user=self.viewer)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)

        titles = [
            item["title"]
            for item in response.data["experiences"]
        ]

        self.assertEqual(titles, ["My Python portfolio"])

    def test_community_contributions_appear(self):
        self.client.force_authenticate(user=self.viewer)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["posts"]), 1)
        self.assertEqual(
            response.data["posts"][0]["content"],
            "Build small practical projects.",
        )

    def test_unknown_member_returns_404(self):
        self.client.force_authenticate(user=self.viewer)

        response = self.client.get(
            reverse("member-detail", kwargs={"pk": 999999})
        )

        self.assertEqual(response.status_code, 404)
