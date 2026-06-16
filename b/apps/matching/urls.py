from django.urls import path
from .views import PositionMatchingView

urlpatterns = [
    path('position/<int:position_id>/', PositionMatchingView.as_view(), name='position-matching'),
]
