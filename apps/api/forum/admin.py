from django.contrib import admin

from .models import CommunityPost


@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "author",
        "category",
        "created_at",
    )
    list_filter = ("category", "created_at")
    search_fields = ("content", "author__username")
    readonly_fields = ("created_at", "updated_at")