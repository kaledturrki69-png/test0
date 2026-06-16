from rest_framework.routers import DefaultRouter
from .views import CandidateViewSet, ResumeViewSet

router = DefaultRouter()
router.register(r"candidates", CandidateViewSet, basename="candidate")
router.register(r"resumes", ResumeViewSet, basename="resume")

urlpatterns = router.urls
