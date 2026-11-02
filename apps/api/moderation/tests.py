from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from experiences.models import Experience


User = get_user_model()


class ModerationTests(APITestCase):
    def setUp(self):
        self.member = User.objects.create_user(
            username="regular_member",
            password="TestPass123!",
        )
        self.moderator = User.objects.create_user(
            username="moderator_test",
            password="TestPass123!",
            is_staff=True,
        )
        self.experience = Experience.objects.create(
            author=self.member,
            title="My first internship interview",
            category=Experience.Category.INTERVIEW,
            content="I prepared by practising interview questions.",
            status=Experience.Status.PENDING,
        )
        self.list_url = "/api/v1/moderation/experiences/"
        self.approve_url = (
            f"/api/v1/moderation/experiences/{self.experience.id}/approve/"
        )
        self.reject_url = (
            f"/api/v1/moderation/experiences/{self.experience.id}/reject/"
        )

    def test_anonymous_user_cannot_access_queue(self):
        response = self.client.get(self.list_url)
        self.assertIn(response.status_code, [401, 403])

    def test_regular_member_cannot_access_queue(self):
        self.client.force_authenticate(user=self.member)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 403)

    def test_regular_member_cannot_approve(self):
        self.client.force_authenticate(user=self.member)
        response = self.client.post(self.approve_url)
        self.assertEqual(response.status_code, 403)
        self.experience.refresh_from_db()
        self.assertEqual(self.experience.status, Experience.Status.PENDING)

    def test_regular_member_cannot_reject(self):
        self.client.force_authenticate(user=self.member)
        response = self.client.post(self.reject_url)
        self.assertEqual(response.status_code, 403)
        self.experience.refresh_from_db()
        self.assertEqual(self.experience.status, Experience.Status.PENDING)

    def test_moderator_can_see_pending_experiences(self):
        self.client.force_authenticate(user=self.moderator)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_moderator_can_approve(self):
        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(self.approve_url)
        self.assertEqual(response.status_code, 200)
        self.experience.refresh_from_db()
        self.assertEqual(self.experience.status, Experience.Status.APPROVED)

    def test_moderator_can_reject(self):
        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(self.reject_url)
        self.assertEqual(response.status_code, 200)
        self.experience.refresh_from_db()
        self.assertEqual(self.experience.status, Experience.Status.REJECTED)

    def test_cannot_review_same_experience_twice(self):
        self.client.force_authenticate(user=self.moderator)
        first = self.client.post(self.approve_url)
        second = self.client.post(self.reject_url)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 404)
