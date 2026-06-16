from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class TopMatchesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([
            {"position_id": 1, "position_name": "Senior Dev", "candidate_id": 5, "candidate_name": "John Doe", "score": 0.92}
        ])

class PositionsMatchingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([
            {"position_id": 1, "position_name": "Senior Dev", "total_candidates": 50, "matched_candidates": 12, "avg_score": 0.75}
        ])

class CandidatesTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([
            {"date": "2025-01-01", "count": 5},
            {"date": "2025-01-08", "count": 12}
        ])

class JekjobCandidatesTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([
            {"date": "2025-01-01", "count": 15},
            {"date": "2025-01-08", "count": 22}
        ])
