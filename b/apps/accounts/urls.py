from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, ForgotPasswordView, VerifyCodeView, LoginView, LogoutView,ResetPasswordView, ChangePasswordView, WorkplaceViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'workplaces', WorkplaceViewSet, basename='workplace')

urlpatterns = [
    path('', include(router.urls)),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="rest-password"),
    path("change-password/", ChangePasswordView.as_view(), name="rest-password"),
    path("verify-code/", VerifyCodeView.as_view(), name="verify-code"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
]