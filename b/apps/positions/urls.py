from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SkillViewSet, ConditionViewSet, PositionViewSet,
    PositionLibraryView, PositionCategoryViewSet
)

router = DefaultRouter()
router.register(r"categories", PositionCategoryViewSet, basename="position-category")
router.register(r"skills", SkillViewSet, basename="skill")
router.register(r"conditions", ConditionViewSet, basename="condition")
router.register(r"positions", PositionViewSet, basename="position")

urlpatterns = [
    path("", include(router.urls)),
    path("libraries/", PositionLibraryView.as_view(), name="position-library"),
]
