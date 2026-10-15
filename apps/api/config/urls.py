
from django.contrib import admin
from django.urls import include, path

from health.views import live, ready

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/live", live),
    path("api/v1/health/ready", ready),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/profiles/", include("profiles.urls")),
    path("api/v1/experiences/", include("experiences.urls")),
]
