from rest_framework import serializers
from .models import Document
from apps.candidates.models import Candidate
from drf_spectacular.utils import extend_schema_field

class UploadedBySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()

class CandidateMiniSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    
    class Meta:
        model = Candidate
        fields = ["id", "first_name", "last_name"]

class DocumentSerializer(serializers.ModelSerializer):
    candidate = CandidateMiniSerializer(read_only=True)
    uploaded_by = serializers.SerializerMethodField()
    company = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "filename",
            "size",
            "mime_type",
            "doc_type",
            "source",
            "uploaded_at",
            "processing_progress",
            "processing_status",
            "processing_result",
            "candidate",
            "uploaded_by",
            "company",
        ]

    @extend_schema_field(UploadedBySerializer)
    def get_uploaded_by(self, obj):
        return {
            "id": obj.uploaded_by.id,
            "name": f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}".strip() or obj.uploaded_by.email,
        }
