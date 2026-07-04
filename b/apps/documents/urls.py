from rest_framework.routers import SimpleRouter
from .views import DocumentViewSet

# Registered at the empty prefix so the endpoints resolve directly under the
# `/api/v1/documents/` include (list at `/api/v1/documents/`, detail at
# `/api/v1/documents/{id}/`, download at `/api/v1/documents/{id}/download/`),
# matching the frontend's API_ENDPOINTS.DOCUMENTS and the API plan.
# SimpleRouter (not DefaultRouter) avoids adding an API-root view that would
# otherwise shadow the list route at the same path.
router = SimpleRouter()
router.register(r"", DocumentViewSet, basename="document")
urlpatterns = router.urls
