from django.urls import path
from .views import (
    PendingExperienceListView,
    approve_experience,
    reject_experience,
)

urlpatterns = [
    path(
        "experiences/",
        PendingExperienceListView.as_view(),
        name="moderation-experiences",
    ),
    path(
        "experiences/<int:pk>/approve/",
        approve_experience,
        name="moderation-approve",
    ),
    path(
        "experiences/<int:pk>/reject/",
        reject_experience,
        name="moderation-reject",
    ),
]
