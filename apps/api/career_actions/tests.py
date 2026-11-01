
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import CareerAction


class CareerActionAPITests(TestCase):
    def setUp(self):
        User = get_user_model()

        self.user = User.objects.create_user(
            username="member1",
            email="member1@example.com",
            password="TestPassword123!",
        )
        self.other_user = User.objects.create_user(
            username="member2",
            email="member2@example.com",
            password="TestPassword123!",
        )

        self.client = APIClient()
        self.list_url = reverse("career-action-list")

        self.action = CareerAction.objects.create(
            owner=self.user,
            title="Update my CV",
        )

    def test_anonymous_user_cannot_list_actions(self):
        response = self.client.get(self.list_url)
        self.assertIn(response.status_code, [401, 403])

    def test_member_can_list_own_actions(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Update my CV")

    def test_member_cannot_see_other_members_actions(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_member_can_create_action(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.list_url,
            {
                "title": "Apply for internship",
                "status": "todo",
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            CareerAction.objects.filter(
                owner=self.user,
                title="Apply for internship",
            ).exists()
        )

    def test_empty_title_is_rejected(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.list_url,
            {"title": "   "},
        )

        self.assertEqual(response.status_code, 400)

    def test_member_can_update_own_action(self):
        self.client.force_authenticate(user=self.user)

        url = reverse(
            "career-action-detail",
            args=[self.action.id],
        )

        response = self.client.patch(
            url,
            {"status": "completed"},
        )

        self.assertEqual(response.status_code, 200)

        self.action.refresh_from_db()
        self.assertEqual(self.action.status, "completed")

    def test_member_cannot_update_other_members_action(self):
        self.client.force_authenticate(user=self.other_user)

        url = reverse(
            "career-action-detail",
            args=[self.action.id],
        )

        response = self.client.patch(
            url,
            {"status": "completed"},
        )

        self.assertEqual(response.status_code, 404)

        self.action.refresh_from_db()
        self.assertEqual(self.action.status, "todo")

    def test_member_can_delete_own_action(self):
        self.client.force_authenticate(user=self.user)

        url = reverse(
            "career-action-detail",
            args=[self.action.id],
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            CareerAction.objects.filter(
                id=self.action.id,
            ).exists()
        )

    def test_member_cannot_delete_other_members_action(self):
        self.client.force_authenticate(user=self.other_user)

        url = reverse(
            "career-action-detail",
            args=[self.action.id],
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, 404)
        self.assertTrue(
            CareerAction.objects.filter(
                id=self.action.id,
            ).exists()
        )
