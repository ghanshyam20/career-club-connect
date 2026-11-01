from django.urls import path

from .views import (
    CommunityPostLikeView,
    CommunityPostListCreateView,
    PostCommentListCreateView,
)

urlpatterns = [
    path(
        "posts/",
        CommunityPostListCreateView.as_view(),
        name="community-post-list-create",
    ),
    path(
        "posts/<int:post_id>/like/",
        CommunityPostLikeView.as_view(),
        name="community-post-like",
    ),
    path(
        "posts/<int:post_id>/comments/",
        PostCommentListCreateView.as_view(),
        name="community-post-comments",
    ),
]