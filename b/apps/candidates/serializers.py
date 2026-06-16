from rest_framework import serializers
from .models import Candidate, Resume

class CandidateSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Candidate
        fields = [
            "id", "first_name", "last_name", "full_name", 
            "email1", "email2", "phone1", "phone2", 
            "company", "created_at", "updated_at"
        ]
        read_only_fields = ["company", "created_at", "updated_at"]

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            "id", "candidate", "company", "document", 
            "json_data", "source", "schema_version", "created_at"
        ]
        read_only_fields = ["company", "created_at"]
