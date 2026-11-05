
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer
from .approval_tokens import create_approval_token, read_approval_token
from django.core.signing import BadSignature, SignatureExpired


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = get_user_model().objects.get(pk=response.data["id"])
        response.data["approval_token"] = create_approval_token(user)
        return response


class ApprovalStatusView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = []

    def post(self, request):
        token = request.data.get("token")
        if not isinstance(token, str) or len(token) > 2048:
            return Response({"detail": "Invalid token."}, status=400)

        try:
            payload = read_approval_token(token)
        except (BadSignature, SignatureExpired):
            return Response({"detail": "Expired or invalid token."}, status=400)

        user = get_user_model().objects.filter(
            pk=payload["user_id"]
        ).first()

        if user is None:
            return Response({"detail": "Invalid token."}, status=400)

        return Response({"approved": user.is_active})


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = None

        if "@" in identifier:
            User = get_user_model()
            matching_users = list(
                User.objects.filter(email__iexact=identifier)[:2]
            )
            if len(matching_users) == 1:
                user = authenticate(
                    request,
                    username=matching_users[0].username,
                    password=password,
                )

        if user is None:
            user = authenticate(
                request,
                username=identifier,
                password=password,
            )

        if user is None:
            User = get_user_model()

            if "@" in identifier:
                candidates = list(
                    User.objects.filter(email__iexact=identifier)[:2]
                )
            else:
                candidates = list(
                    User.objects.filter(username=identifier)[:2]
                )

            if len(candidates) == 1:
                candidate = candidates[0]

                if (
                    not candidate.is_active
                    and candidate.check_password(password)
                ):
                    return Response(
                        {
                            "code": "approval_pending",
                            "approval_token": create_approval_token(candidate),
                            "detail": "Your account is awaiting administrator approval.",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            return Response(
                {"detail": "Invalid email, username, or password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
        })


@method_decorator(csrf_protect, name="dispatch")
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out successfully."})




class CSRFTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = get_token(request)
        return Response({"csrfToken": token})


from django.db import transaction


@method_decorator(csrf_protect, name="dispatch")
class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.is_staff or user.is_superuser:
            return Response(
                {"detail": "Administrator accounts cannot be deleted here."},
                status=status.HTTP_403_FORBIDDEN,
            )

        password = request.data.get("password", "")

        if not isinstance(password, str) or not password:
            return Response(
                {"detail": "Please enter your current password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(password):
            return Response(
                {"detail": "Incorrect password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            logout(request)
            user.delete()

        return Response(
            {"detail": "Your account has been permanently deleted."},
            status=status.HTTP_200_OK,
        )
