from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CommunityPost, PostComment, PostLike

class CommunityPostAPITests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="forum_test_member",
            password="TestPassword123!",
        )
        self.url = reverse("community-post-list-create")

    def test_visitor_cannot_read_posts(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_logged_in_member_can_create_post(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {
                "content": "Hello Career Club members!",
                "category": "general",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertEqual(CommunityPost.objects.count(), 1)
        self.assertEqual(
            CommunityPost.objects.first().author,
            self.user,
        )

    def test_logged_in_member_can_read_posts(self):
        CommunityPost.objects.create(
            author=self.user,
            content="Welcome to our community!",
            category="general",
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(len(response.data), 1)

class CommunityPostLikeTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="like_test_member",
            password="TestPassword123!",
        )
        self.post = CommunityPost.objects.create(
            author=self.user,
            content="Welcome to Career Club Connect!",
            category="general",
        )
        self.url = reverse(
            "community-post-like",
            kwargs={"post_id": self.post.id},
        )

    def test_member_can_like_post(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PostLike.objects.count(), 1)
        self.assertTrue(response.data["liked"])

    def test_member_cannot_like_twice(self):
        self.client.force_authenticate(user=self.user)

        self.client.post(self.url)
        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(PostLike.objects.count(), 1)
        self.assertEqual(response.data["likes_count"], 1)

    def test_member_can_unlike_post(self):
        PostLike.objects.create(post=self.post, user=self.user)
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(PostLike.objects.count(), 0)
        self.assertFalse(response.data["liked"])

    def test_visitor_cannot_like_post(self):
        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(PostLike.objects.count(), 0)

class PostCommentAPITests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="comment_test_member",
            password="TestPassword123!",
        )
        self.post = CommunityPost.objects.create(
            author=self.user,
            content="How is everyone's job search going?",
            category="question",
        )
        self.url = reverse(
            "community-post-comments",
            kwargs={"post_id": self.post.id},
        )

    def test_member_can_create_comment(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {"content": "I have an interview next week!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PostComment.objects.count(), 1)
        self.assertEqual(PostComment.objects.first().author, self.user)
        self.assertEqual(PostComment.objects.first().post, self.post)

    def test_member_can_read_comments(self):
        PostComment.objects.create(
            post=self.post,
            author=self.user,
            content="Good luck everyone!",
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_visitor_cannot_read_comments(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_visitor_cannot_create_comment(self):
        response = self.client.post(
            self.url,
            {"content": "Hello!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(PostComment.objects.count(), 0)