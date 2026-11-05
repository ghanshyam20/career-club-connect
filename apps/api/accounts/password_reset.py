from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        User = get_user_model()

        users = User.objects.filter(
            email__iexact=email,
            is_active=True,
        )

        # Never reveal whether an email address exists.
        response_message = {
            "detail": "If an eligible account exists, a reset link has been sent."
        }

        if users.count() != 1:
            return Response(response_message)

        user = users.first()

        if not user.has_usable_password():
            return Response(response_message)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_url = (
            f"{settings.FRONTEND_URL}/reset-password/"
            f"{uid}/{token}"
        )

        send_mail(
            subject="Reset your Career Club Connect password",
            message=(
                "We received a request to reset your password.\n\n"
                f"Reset your password here:\n{reset_url}\n\n"
                "This link expires after 30 minutes.\n\n"
                "If you did not request this, you can ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(response_message)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        try:
            user_id = force_str(urlsafe_base64_decode(data["uid"]))
            user = get_user_model().objects.get(pk=user_id)
        except (ValueError, TypeError, OverflowError, UnicodeDecodeError,
                get_user_model().DoesNotExist):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active or not default_token_generator.check_token(
            user, data["token"]
        ):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(data["password"], user=user)
        except ValidationError as exc:
            return Response(
                {"password": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(data["password"])
        user.save(update_fields=["password"])

        return Response({
            "detail": "Password reset successfully. You can now log in."
        })
