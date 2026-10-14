from django.contrib import admin
from django.urls import path
from health.views import live, ready

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/live', live),
    path('api/v1/health/ready', ready),
]
