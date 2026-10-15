
from django.contrib import admin

from .models import Experience


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "author",
        "category",
        "status",
        "publish_anonymously",
        "created_at",
    ]

    list_filter = [
        "status",
        "category",
        "publish_anonymously",
    ]

    search_fields = [
        "title",
        "content",
        "author__username",
    ]

    readonly_fields = [
        "author",
        "title",
        "category",
        "content",
        "publish_anonymously",
        "created_at",
        "updated_at",
    ]

    fields = [
        "title",
        "author",
        "category",
        "content",
        "publish_anonymously",
        "status",
        "created_at",
        "updated_at",
    ]

    def has_add_permission(self, request):
        return False
