
from django.urls import path

from .views import (
    CareerActionListCreateView,
    CareerActionDetailView,
)

urlpatterns = [
    path(
        "",
        CareerActionListCreateView.as_view(),
        name="career-action-list",
    ),
    path(
        "<int:pk>/",
        CareerActionDetailView.as_view(),
        name="career-action-detail",
    ),
]
