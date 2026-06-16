from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import WorkflowConfig
from .serializers import WorkflowConfigSerializer

class WorkflowConfigViewSet(viewsets.ModelViewSet):
    serializer_class = WorkflowConfigSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = WorkflowConfig.objects.filter(company=self.request.user.company)
        position_id = self.request.query_params.get('position')
        if position_id:
            qs = qs.filter(position_id=position_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)
