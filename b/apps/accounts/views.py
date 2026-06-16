from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer, ForgotPasswordSerializer, VerifyCodeSerializer,  \
CustomTokenObtainPairSerializer, ChangePasswordSerializer, LogoutSerializer, ResetPasswordSerializer
from django.contrib.auth import get_user_model
from .email_utils import send_localized_email
from django.utils.translation import get_language
from django.conf import settings
from drf_spectacular.utils import extend_schema


User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ForgotPasswordView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Code sent by email."})


class VerifyCodeView(generics.GenericAPIView):
    serializer_class = VerifyCodeSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated successfully."})


# class LoginView(generics.GenericAPIView):
#     permission_classes = [AllowAny]
#     serializer_class = LoginSerializer
#     def post(self, request):
#         email = request.data.get("email")
#         password = request.data.get("password")
#         user = User.objects.filter(email=email).first()
#         if not user or not user.check_password(password):
#             return Response({"detail": "Invalid credentials."}, status=400)
#         refresh = RefreshToken.for_user(user)
#         return Response({"refresh": str(refresh), "access": str(refresh.access_token)})


class LoginView(TokenObtainPairView):
    """
    Authenticates user and returns access + refresh tokens
    enriched with user data (id, email, role, company).
    """
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

# class ResetPasswordView(APIView):
#     permission_classes = [AllowAny]
    

#     def post(self, request):
#         email = request.data.get("email")
#         code = request.data.get("code")
#         new_password = request.data.get("new_password")

#         user = User.objects.filter(email=email).first()
#         if not user or user.profile.reset_code != code:
#             return Response({"detail": "Invalid email or code."}, status=400)

#         user.set_password(new_password)
#         user.profile.reset_code = None
#         user.save()
#         user.profile.save()

#         send_localized_email(
#             user,
#             "password_changed_info",
#             {"user": user, "FRONTEND_URL": settings.FRONTEND_URL},
#             language=get_language(),
#         )
#         return Response({"detail": "Password reset successful."})


@extend_schema(
    request=None,
    responses={200: LogoutSerializer},
    description="Logs out the current user."
)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Blacklist the refresh token sent by the client.
        Client should send both access and refresh tokens in request body.
        """
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token required."}, status=400)

            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response({"detail": "Invalid or expired token."}, status=400)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)
        

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        new_password = request.data.get("new_password")

        user = User.objects.filter(email=email).first()
        if not user or user.profile.reset_code != code:
            return Response({"detail": "Invalid email or code."}, status=400)

        user.set_password(new_password)
        user.profile.reset_code = None
        user.save()
        user.profile.save()

        send_localized_email(
            user,
            "password_changed_info",
            {"user": user, "FRONTEND_URL": settings.FRONTEND_URL},
            language=get_language(),
        )
        return Response({"detail": "Password reset successful."})
    

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        new_password = serializer.validated_data["new_password"]

        user.set_password(new_password)
        user.save()

        send_localized_email(
            user,
            "password_changed_info",
            {"user": user, "FRONTEND_URL": settings.FRONTEND_URL},
            language=get_language(),
        )

        return Response({"detail": "Password changed successfully."})
from rest_framework import viewsets
from .models import Workplace
from .workplace_serializers import WorkplaceSerializer
class WorkplaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkplaceSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Workplace.objects.filter(company=self.request.user.company)
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

