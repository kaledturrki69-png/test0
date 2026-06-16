from django.urls import path
from .views import (
    TopMatchesView, PositionsMatchingView, 
    CandidatesTrendView, JekjobCandidatesTrendView
)

urlpatterns = [
    path('top-matches/', TopMatchesView.as_view(), name='dashboard-top-matches'),
    path('positions-matching/', PositionsMatchingView.as_view(), name='dashboard-positions-matching'),
    path('candidates-trend/', CandidatesTrendView.as_view(), name='dashboard-candidates-trend'),
    path('jekjob-candidates-trend/', JekjobCandidatesTrendView.as_view(), name='dashboard-jekjob-candidates-trend'),
]
