from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegistrationTests(APITestCase):

    def test_registration_creates_user_with_hashed_password(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "demo_member",
                "email": "demo@example.com",
                "first_name": "Demo",
                "last_name": "Member",
                "password": "StrongDemoPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="demo_member")
        self.assertEqual(user.email, "demo@example.com")
        self.assertTrue(user.check_password("StrongDemoPassword!2026"))
        self.assertNotEqual(user.password, "StrongDemoPassword!2026")
        self.assertNotIn("password", response.data)

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(
            username="existing_member",
            email="demo@example.com",
            password="StrongDemoPassword!2026",
        )

        response = self.client.post(
            reverse("register"),
            {
                "username": "another_member",
                "email": "DEMO@example.com",
                "password": "AnotherStrongPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 1)

    def test_weak_password_is_rejected(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "weak_member",
                "email": "weak@example.com",
                "password": "123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)


class LoginTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="login_demo",
            email="login@example.com",
            password="StrongLoginPassword!2026",
        )

    def test_login_with_correct_credentials(self):
        response = self.client.post(
            reverse("login"),
            {
                "username": "login_demo",
                "password": "StrongLoginPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "login_demo")
        self.assertNotIn("password", response.data)

    def test_login_with_wrong_password(self):
        response = self.client.post(
            reverse("login"),
            {
                "username": "login_demo",
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_unknown_username(self):
        response = self.client.post(
            reverse("login"),
            {
                "username": "unknown_user",
                "password": "StrongLoginPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_creates_authenticated_session(self):
        response = self.client.post(
            reverse("login"),
            {
                "username": "login_demo",
                "password": "StrongLoginPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            self.client.session.get("_auth_user_id"),
            str(self.user.pk),
        )


from django.test import Client
from django.middleware.csrf import get_token


class LoginCSRFTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="csrf_demo",
            email="csrf@example.com",
            password="StrongCSRFPassword!2026",
        )
        self.csrf_client = Client(enforce_csrf_checks=True)

    def test_login_without_csrf_token_is_rejected(self):
        response = self.csrf_client.post(
            reverse("login"),
            data='{"username":"csrf_demo","password":"StrongCSRFPassword!2026"}',
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 403)

    
    def test_login_with_valid_csrf_token_succeeds(self):
        from django.conf import settings
        from django.middleware.csrf import _get_new_csrf_string, _mask_cipher_secret

        csrf_secret = _get_new_csrf_string()
        csrf_token = _mask_cipher_secret(csrf_secret)

        self.csrf_client.cookies[settings.CSRF_COOKIE_NAME] = csrf_secret

        response = self.csrf_client.post(
            reverse("login"),
            data='{"username":"csrf_demo","password":"StrongCSRFPassword!2026"}',
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)



class MeEndpointTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="profile_demo",
            email="profile@example.com",
            first_name="Demo",
            last_name="Member",
            password="StrongProfilePassword!2026",
        )

    def test_logged_in_user_can_view_profile(self):
        self.client.force_login(self.user)

        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "profile_demo")
        self.assertEqual(response.data["email"], "profile@example.com")
        self.assertNotIn("password", response.data)

    def test_anonymous_user_cannot_view_profile(self):
        response = self.client.get(reverse("me"))

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )



class LogoutTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="logout_demo",
            email="logout@example.com",
            password="StrongLogoutPassword!2026",
        )

    def test_logout_ends_session(self):
        self.client.force_login(self.user)

        response = self.client.post(reverse("logout"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_user_cannot_access_me_after_logout(self):
        self.client.force_login(self.user)

        logout_response = self.client.post(reverse("logout"))
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        response = self.client.get(reverse("me"))

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_logout_without_csrf_token_is_rejected(self):
        csrf_client = Client(enforce_csrf_checks=True)
        csrf_client.force_login(self.user)

        response = csrf_client.post(reverse("logout"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)




class CSRFTokenTests(APITestCase):

    def test_csrf_endpoint_returns_token_and_cookie(self):
        response = self.client.get(reverse("csrf"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("csrfToken", response.data)
        self.assertTrue(response.data["csrfToken"])
        self.assertIn("csrftoken", response.cookies)

    def test_csrf_endpoint_allows_anonymous_users(self):
        response = self.client.get(reverse("csrf"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
