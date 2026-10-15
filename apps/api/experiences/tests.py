
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Experience

User = get_user_model()


class ExperienceAPITests(APITestCase):
    def setUp(self):
        self.member = User.objects.create_user(
            username="member_one",
            password="TestPassword123!",
        )
        self.other_member = User.objects.create_user(
            username="member_two",
            password="TestPassword123!",
        )

        self.list_url = reverse("experience-list")
        self.mine_url = reverse("my-experiences")

    def create_experience(self, author, status_value, anonymous=False):
        return Experience.objects.create(
            author=author,
            title="My interview experience",
            category=Experience.Category.INTERVIEW,
            content="I attended an interview in Helsinki.",
            publish_anonymously=anonymous,
            status=status_value,
        )

    def test_anonymous_visitors_cannot_access_library(self):
        response = self.client.get(self.list_url)
        self.assertIn(response.status_code, [401, 403])

    def test_member_can_submit_experience(self):
        self.client.force_authenticate(user=self.member)

        response = self.client.post(
            self.list_url,
            {
                "title": "My first interview",
                "category": "interview",
                "content": "I learned how to prepare.",
                "publish_anonymously": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        experience = Experience.objects.get(
            title="My first interview"
        )
        self.assertEqual(experience.author, self.member)
        self.assertEqual(experience.status, Experience.Status.PENDING)

    def test_member_cannot_approve_own_submission(self):
        self.client.force_authenticate(user=self.member)

        response = self.client.post(
            self.list_url,
            {
                "title": "Trying to approve my post",
                "category": "interview",
                "content": "This must remain pending.",
                "status": "approved",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        experience = Experience.objects.get(
            title="Trying to approve my post"
        )
        self.assertEqual(experience.status, Experience.Status.PENDING)

    def test_only_approved_experiences_are_visible(self):
        self.create_experience(
            self.other_member, Experience.Status.APPROVED
        )
        self.create_experience(
            self.other_member, Experience.Status.PENDING
        )
        self.create_experience(
            self.other_member, Experience.Status.REJECTED
        )

        self.client.force_authenticate(user=self.member)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["status"],
            Experience.Status.APPROVED,
        )

    def test_anonymous_publication_hides_author(self):
        self.create_experience(
            self.other_member,
            Experience.Status.APPROVED,
            anonymous=True,
        )

        self.client.force_authenticate(user=self.member)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[0]["author_name"], "Anonymous"
        )
        self.assertNotIn("author", response.data[0])

    def test_member_only_sees_own_submissions_in_mine(self):
        self.create_experience(
            self.member, Experience.Status.PENDING
        )
        self.create_experience(
            self.other_member, Experience.Status.PENDING
        )

        self.client.force_authenticate(user=self.member)

        response = self.client.get(self.mine_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_member_cannot_choose_another_author(self):
        self.client.force_authenticate(user=self.member)

        response = self.client.post(
            self.list_url,
            {
                "title": "Author protection test",
                "category": "networking",
                "content": "I met people at an event.",
                "author": self.other_member.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        experience = Experience.objects.get(
            title="Author protection test"
        )
        self.assertEqual(experience.author, self.member)

    def test_invalid_category_is_rejected(self):
        self.client.force_authenticate(user=self.member)

        response = self.client.post(
            self.list_url,
            {
                "title": "Invalid category",
                "category": "unknown_category",
                "content": "Testing validation.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
