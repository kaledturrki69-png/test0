from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class PositionMatchingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, position_id):
        # Dummy response matching the structure requested by the frontend
        return Response([
            {
                "candidate": { "id": 1, "first_name": "John", "last_name": "Doe" },
                "score": 0.87,
                "matched_hard_skills": ["Python", "Django"],
                "matched_soft_skills": ["Communication"],
                "resume_id": 5
            }
        ])
