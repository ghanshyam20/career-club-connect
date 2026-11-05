import logging
from django.conf import settings
from django.core.mail import send_mail
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


@admin.action(description="Approve selected member registrations")
def approve_members(modeladmin, request, queryset):
    members = list(queryset.filter(is_active=False))
    count = User.objects.filter(
        pk__in=[member.pk for member in members],
        is_active=False,
    ).update(is_active=True)

    for member in members:
        if not member.email:
            continue
        try:
            send_mail(
                "Your Career Club Connect account is approved",
                (
                    f"Hello {member.first_name or 'there'},\
\
"
                    "Your Career Club Connect account has been approved.\
"
                    f"Log in here: {settings.FRONTEND_URL.rstrip('/')}/login\
\
"
                    "Welcome to Career Club Connect!"
                ),
                settings.DEFAULT_FROM_EMAIL,
                [member.email],
                fail_silently=False,
            )
        except Exception:
            logger.exception("Could not send approval email for user %s", member.pk)

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
