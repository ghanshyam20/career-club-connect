
from django.contrib import admin
from django.urls import include, path

from health.views import live, ready

urlpatterns = [
    path("api/v1/notifications/", include("notifications.urls")),
    path("api/v1/search/", include("search.urls")),
    path("api/v1/coffee-buddy/", include("coffee_buddy.urls")),
    path("admin/", admin.site.urls),
    path("api/v1/health/live", live),
    path("api/v1/health/ready", ready),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/profiles/", include("profiles.urls")),
    path("api/v1/experiences/", include("experiences.urls")),
    path("api/v1/forum/", include("forum.urls")),
    path("api/v1/career-actions/", include("career_actions.urls")),
]
