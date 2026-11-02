from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from coffee_buddy.models import CoffeeInvitation
from .models import Notification


User = get_user_model()


class NotificationTests(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            username="creator_test", password="TestPass123!"
        )
        self.member = User.objects.create_user(
            username="member_test", password="TestPass123!"
        )
        self.other = User.objects.create_user(
            username="other_test", password="TestPass123!"
        )
        self.notification = Notification.objects.create(
            recipient=self.creator,
            message="Test notification",
            link="/coffee-buddy",
        )

    def test_authentication_required(self):
        response = self.client.get("/api/v1/notifications/")
        self.assertIn(response.status_code, [401, 403])

    def test_user_only_sees_own_notifications(self):
        Notification.objects.create(
            recipient=self.other,
            message="Private notification",
        )
        self.client.force_authenticate(user=self.creator)
        response = self.client.get("/api/v1/notifications/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["message"], "Test notification")

    def test_mark_own_notification_read(self):
        self.client.force_authenticate(user=self.creator)
        response = self.client.post(
            f"/api/v1/notifications/{self.notification.id}/read/"
        )
        self.assertEqual(response.status_code, 200)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)

    def test_cannot_mark_other_users_notification_read(self):
        self.client.force_authenticate(user=self.other)
        response = self.client.post(
            f"/api/v1/notifications/{self.notification.id}/read/"
        )
        self.assertEqual(response.status_code, 404)
        self.notification.refresh_from_db()
        self.assertFalse(self.notification.is_read)

    def test_accepting_coffee_invitation_creates_notification(self):
        invitation = CoffeeInvitation.objects.create(
            creator=self.creator,
            topic="Career advice",
        )
        self.client.force_authenticate(user=self.member)
        response = self.client.post(
            f"/api/v1/coffee-buddy/{invitation.id}/accept/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            Notification.objects.filter(
                recipient=self.creator,
                link="/coffee-buddy",
                is_read=False,
            ).exists()
        )

        # Accepting again must not create another notification.
        response = self.client.post(
            f"/api/v1/coffee-buddy/{invitation.id}/accept/"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            Notification.objects.filter(
                recipient=self.creator,
                message__contains="accepted your coffee invitation",
            ).count(),
            1,
        )
