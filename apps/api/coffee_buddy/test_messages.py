from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import CoffeeInvitation, CoffeeMessage
from notifications.models import Notification

User = get_user_model()


class CoffeeMessageTests(APITestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            username="coffee_creator",
            password="StrongPassword!2026",
        )
        self.acceptor = User.objects.create_user(
            username="coffee_acceptor",
            password="StrongPassword!2026",
        )
        self.stranger = User.objects.create_user(
            username="coffee_stranger",
            password="StrongPassword!2026",
        )
        self.invitation = CoffeeInvitation.objects.create(
            creator=self.creator,
            accepted_by=self.acceptor,
            topic="Career discussion",
            status=CoffeeInvitation.Status.ACCEPTED,
        )
        self.url = reverse(
            "coffee-conversation",
            args=[self.invitation.pk],
        )

    def test_participants_can_send_and_read_messages(self):
        self.client.force_authenticate(self.creator)
        response = self.client.post(
            self.url,
            {"content": "Hello!"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(CoffeeMessage.objects.count(), 1)

        self.client.force_authenticate(self.acceptor)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["content"], "Hello!")

    def test_stranger_cannot_read_or_send_messages(self):
        self.client.force_authenticate(self.stranger)

        self.assertEqual(self.client.get(self.url).status_code, 404)
        self.assertEqual(
            self.client.post(
                self.url,
                {"content": "Hello"},
                format="json",
            ).status_code,
            404,
        )
        self.assertEqual(CoffeeMessage.objects.count(), 0)

    def test_open_invitation_has_no_conversation(self):
        self.invitation.status = CoffeeInvitation.Status.OPEN
        self.invitation.save()

        self.client.force_authenticate(self.creator)

        self.assertEqual(self.client.get(self.url).status_code, 404)
        self.assertEqual(
            self.client.post(
                self.url,
                {"content": "Hello"},
                format="json",
            ).status_code,
            404,
        )

    def test_empty_message_is_rejected(self):
        self.client.force_authenticate(self.creator)

        response = self.client.post(
            self.url,
            {"content": "   "},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(CoffeeMessage.objects.count(), 0)

    def test_message_notifies_other_participant(self):
        self.client.force_authenticate(self.creator)

        self.client.post(
            self.url,
            {"content": "Let's meet tomorrow."},
            format="json",
        )

        self.assertTrue(
            Notification.objects.filter(
                recipient=self.acceptor,
                link=f"/coffee-buddy/{self.invitation.pk}",
            ).exists()
        )
