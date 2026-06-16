from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """
    Admin interface for company-scoped documents with file storage info.
    """
    list_display = (
        "filename",
        "company",
        "uploaded_by",
        "candidate",
        "doc_type",
        "source",
        "processing_status",
        "uploaded_at",
    )
    list_filter = (
        "company",
        "doc_type",
        "source",
        "processing_status",
        "uploaded_at",
    )
    search_fields = (
        "filename",
        "mime_type",
        "uploaded_by__email",
        "company__name",
        "candidate__first_name",
        "candidate__last_name",
    )
    ordering = ("-uploaded_at",)
    readonly_fields = ("uploaded_at",)
    date_hierarchy = "uploaded_at"
    autocomplete_fields = ("uploaded_by", "company", "candidate")

    fieldsets = (
        ("Ownership", {
            "fields": (
                "uploaded_by",
                "company",
                "candidate",
            ),
        }),
        ("Files", {
            "fields": (
                "file",
                "pdf_preview",
                "filename",
                "size",
                "mime_type",
                "doc_type",
                "source",
            ),
        }),
        ("Processing", {
            "fields": (
                "processing_progress",
                "processing_status",
                "processing_result",
            ),
        }),
        ("Timestamps", {"fields": ("uploaded_at",)}),
    )

    def get_queryset(self, request):
        """
        Optionally restrict to user's company if you add multi-tenant filtering.
        """
        qs = super().get_queryset(request)
        return qs.select_related("company", "uploaded_by", "candidate")
