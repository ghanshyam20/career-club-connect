from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.action(description="Approve selected member registrations")
def approve_members(modeladmin, request, queryset):
    count = queryset.filter(is_active=False).update(is_active=True)
    modeladmin.message_user(
        request,
        f"{count} member registration(s) approved.",
    )


@admin.register(User)
class CareerClubUserAdmin(UserAdmin):
    actions = [approve_members]

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_active",
        "is_staff",
        "date_joined",
    )

    list_filter = (
        "is_active",
        "is_staff",
        "is_superuser",
    )

    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
    )

    ordering = ("-date_joined",)
