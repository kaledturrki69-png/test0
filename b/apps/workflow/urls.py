from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowConfigViewSet

router = DefaultRouter()
router.register(r'config', WorkflowConfigViewSet, basename='workflowconfig')

urlpatterns = [
    path('', include(router.urls)),
]
