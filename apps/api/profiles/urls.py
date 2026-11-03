
from django.urls import path

from .views import MyProfileView, MemberDetailView

urlpatterns = [
    path("members/<int:pk>/", MemberDetailView.as_view(), name="member-detail"),
    path("me/", MyProfileView.as_view(), name="my-profile"),
]
