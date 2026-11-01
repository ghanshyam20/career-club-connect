from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import CommunityPostSerializer, PostCommentSerializer
from .models import CommunityPost, PostComment, PostLike

class CommunityPostListCreateView(generics.ListCreateAPIView):
    serializer_class = CommunityPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CommunityPost.objects.select_related("author").all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CommunityPostLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(CommunityPost, pk=post_id)

        like, created = PostLike.objects.get_or_create(
            post=post,
            user=request.user,
        )

        return Response(
            {
                "liked": True,
                "likes_count": post.likes.count(),
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, post_id):
        post = get_object_or_404(CommunityPost, pk=post_id)

        PostLike.objects.filter(
            post=post,
            user=request.user,
        ).delete()

        return Response(
            {
                "liked": False,
                "likes_count": post.likes.count(),
            },
            status=status.HTTP_200_OK,
        )

class PostCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = PostCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_post(self):
        return get_object_or_404(
            CommunityPost,
            pk=self.kwargs["post_id"],
        )

    def get_queryset(self):
        post = self.get_post()
        return PostComment.objects.filter(
            post=post,
        ).select_related("author")

    def perform_create(self, serializer):
        serializer.save(
            post=self.get_post(),
            author=self.request.user,
        )