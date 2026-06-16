from django.contrib import admin
from .models import Candidate, Resume


class ResumeInline(admin.TabularInline):
    """
    Inline display of resumes directly on the candidate page.
    """
    model = Resume
    extra = 0
    fields = ("source", "company", "schema_version", "created_at")
    readonly_fields = ("created_at",)
    show_change_link = True


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email1", "phone1", "company", "created_at")
    list_filter = ("company", "created_at")
    search_fields = ("first_name", "last_name", "email1", "phone1")
    ordering = ("last_name", "first_name")
    inlines = [ResumeInline]
    date_hierarchy = "created_at"
    fieldsets = (
        (None, {
            "fields": (
                ("first_name", "last_name"),
                ("email1", "email2"),
                ("phone1", "phone2"),
                "company",
            )
        }),
        ("Metadata", {"fields": ("created_at", "updated_at")}),
    )
    readonly_fields = ("created_at", "updated_at")


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("candidate", "company", "source", "schema_version", "created_at")
    list_filter = ("source", "company", "schema_version", "created_at")
    search_fields = ("candidate__first_name", "candidate__last_name", "candidate__email1")
    autocomplete_fields = ("candidate", "company", "document")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    fieldsets = (
        (None, {
            "fields": (
                "candidate",
                "company",
                "source",
                "schema_version",
                "document",
                "json_data",
            )
        }),
        ("Timestamps", {"fields": ("created_at",)}),
    )
