from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import CoffeeInvitation


class CoffeeBuddyTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.alice = User.objects.create_user(
            username="coffee_alice", password="TestPass123!"
        )
        self.bob = User.objects.create_user(
            username="coffee_bob", password="TestPass123!"
        )
        self.charlie = User.objects.create_user(
            username="coffee_charlie", password="TestPass123!"
        )
        self.client = APIClient()
        self.url = "/api/v1/coffee-buddy/"

    def login_as(self, user):
        self.client.force_authenticate(user=user)

    def create_invitation(self):
        return CoffeeInvitation.objects.create(
            creator=self.alice,
            topic="Career networking",
            description="Discuss software careers",
        )

    def test_authentication_required(self):
        response = self.client.get(self.url)
        self.assertIn(response.status_code, [401, 403])

    def test_create_invitation(self):
        self.login_as(self.alice)
        response = self.client.post(
            self.url,
            {"topic": "Python careers", "meeting_format": "online"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(CoffeeInvitation.objects.count(), 1)

    def test_cannot_accept_own_invitation(self):
        invitation = self.create_invitation()
        self.login_as(self.alice)
        response = self.client.post(
            f"{self.url}{invitation.id}/accept/"
        )
        self.assertEqual(response.status_code, 400)

    def test_another_member_can_accept(self):
        invitation = self.create_invitation()
        self.login_as(self.bob)
        response = self.client.post(
            f"{self.url}{invitation.id}/accept/"
        )
        self.assertEqual(response.status_code, 200)
        invitation.refresh_from_db()
        self.assertEqual(invitation.accepted_by, self.bob)
        self.assertEqual(invitation.status, "accepted")

    def test_cannot_accept_twice(self):
        invitation = self.create_invitation()
        self.login_as(self.bob)
        self.client.post(f"{self.url}{invitation.id}/accept/")

        self.login_as(self.charlie)
        response = self.client.post(
            f"{self.url}{invitation.id}/accept/"
        )
        self.assertEqual(response.status_code, 400)

    def test_creator_can_cancel(self):
        invitation = self.create_invitation()
        self.login_as(self.alice)
        response = self.client.post(
            f"{self.url}{invitation.id}/cancel/"
        )
        self.assertEqual(response.status_code, 200)
        invitation.refresh_from_db()
        self.assertEqual(invitation.status, "cancelled")

    def test_other_member_cannot_cancel(self):
        invitation = self.create_invitation()
        self.login_as(self.bob)
        response = self.client.post(
            f"{self.url}{invitation.id}/cancel/"
        )
        self.assertEqual(response.status_code, 404)

    def test_empty_topic_rejected(self):
        self.login_as(self.alice)
        response = self.client.post(
            self.url, {"topic": "   "}
        )
        self.assertEqual(response.status_code, 400)
