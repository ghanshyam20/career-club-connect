from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

User = get_user_model()


class DeleteAccountTests(APITestCase):
    def setUp(self):
        self.url = reverse("delete-account")
        self.password = "StrongTestPassword!2026"
        self.user = User.objects.create_user(
            username="deletion_test_member",
            email="delete-test@example.com",
            password=self.password,
        )

    def test_login_required(self):
        response = self.client.post(
            self.url, {"password": self.password}
        )
        self.assertIn(response.status_code, (401, 403))
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

    def test_wrong_password_does_not_delete(self):
        self.client.force_login(self.user)
        response = self.client.post(
            self.url, {"password": "IncorrectPassword"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

    def test_correct_password_deletes_account(self):
        self.client.force_login(self.user)
        response = self.client.post(
            self.url, {"password": self.password}
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())

        me_response = self.client.get(reverse("me"))
        self.assertIn(me_response.status_code, (401, 403))

    def test_staff_account_cannot_delete(self):
        self.user.is_staff = True
        self.user.save(update_fields=["is_staff"])
        self.client.force_login(self.user)

        response = self.client.post(
            self.url, {"password": self.password}
        )
        self.assertEqual(response.status_code, 403)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

    def test_superuser_cannot_delete(self):
        self.user.is_superuser = True
        self.user.save(update_fields=["is_superuser"])
        self.client.force_login(self.user)

        response = self.client.post(
            self.url, {"password": self.password}
        )
        self.assertEqual(response.status_code, 403)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())
