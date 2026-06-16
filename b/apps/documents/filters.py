import django_filters
from .models import Document

class DocumentFilter(django_filters.FilterSet):
    filename = django_filters.CharFilter(lookup_expr="icontains")
    mime_type = django_filters.CharFilter(lookup_expr="icontains")
    min_size = django_filters.NumberFilter(field_name="size", lookup_expr="gte")
    max_size = django_filters.NumberFilter(field_name="size", lookup_expr="lte")
    date_after = django_filters.DateTimeFilter(field_name="uploaded_at", lookup_expr="gte")
    date_before = django_filters.DateTimeFilter(field_name="uploaded_at", lookup_expr="lte")

    class Meta:
        model = Document
        fields = ["filename", "mime_type", "min_size", "max_size", "date_after", "date_before"]
