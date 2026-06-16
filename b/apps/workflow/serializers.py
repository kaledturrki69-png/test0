from rest_framework import serializers
from .models import WorkflowConfig

class WorkflowConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowConfig
        fields = ['id', 'company', 'position', 'stages', 'settings', 'created_at', 'updated_at']
        read_only_fields = ['company', 'created_at', 'updated_at']
