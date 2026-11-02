from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from experiences.models import Experience
from forum.models import CommunityPost


class SearchTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="testmember", password="TestPass123!"
        )
        self.url = reverse("search")

    def test_requires_login(self):
        response = self.client.get(self.url, {"q": "python"})
        self.assertIn(response.status_code, [401, 403])

    def test_empty_query(self):
        self.client.force_login(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["members"], [])

    def test_member_search(self):
        self.client.force_login(self.user)
        response = self.client.get(self.url, {"q": "testmember"})
        self.assertEqual(len(response.json()["members"]), 1)

    def test_approved_experiences_only(self):
        Experience.objects.create(
            author=self.user,
            title="Python interview",
            content="My interview experience",
            category="interview",
            status=Experience.Status.APPROVED,
        )
        Experience.objects.create(
            author=self.user,
            title="Python pending",
            content="Pending story",
            category="interview",
            status=Experience.Status.PENDING,
        )
        self.client.force_login(self.user)
        response = self.client.get(self.url, {"q": "Python"})
        self.assertEqual(len(response.json()["experiences"]), 1)

    def test_community_search(self):
        CommunityPost.objects.create(
            author=self.user,
            content="Learning Django and Python",
        )
        self.client.force_login(self.user)
        response = self.client.get(self.url, {"q": "Django"})
        self.assertEqual(len(response.json()["posts"]), 1)

    def test_query_too_long(self):
        self.client.force_login(self.user)
        response = self.client.get(self.url, {"q": "x" * 101})
        self.assertEqual(response.status_code, 400)
