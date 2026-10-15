
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
