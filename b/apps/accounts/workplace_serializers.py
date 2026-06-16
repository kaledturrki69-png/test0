from rest_framework import serializers
from .models import Workplace

class WorkplaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workplace
        fields = ['id', 'company', 'name', 'address_line1', 'address_line2', 'city', 'country', 'created_at', 'updated_at']
        read_only_fields = ['company', 'created_at', 'updated_at']
