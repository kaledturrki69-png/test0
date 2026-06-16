import os
from pathlib import Path
from django.db import models
from django.conf import settings
from django.utils import timezone
from .storage import CompanyStorage

storage = CompanyStorage()


def company_storage_path(instance, filename):
    """
    Return a relative path like: <company_slug>/<filename>
    Django will prepend STORAGE_ROOT automatically.
    """
    company = instance.company or instance.uploaded_by.company
    company_slug = getattr(company, "slug", None) or company.name.lower().replace(" ", "_")
    folder_path = Path(settings.STORAGE_ROOT) / company_slug
    folder_path.mkdir(parents=True, exist_ok=True)
    return os.path.join(company_slug, filename)


class Document(models.Model):
    SOURCE_CHOICES = [
        ("upload", "Upload"),
        ("email", "Email"),
        ("app", "App"),
        ("other", "Other"),
    ]

    TYPE_CHOICES = [
        ("pdf", "PDF"),
        ("doc", "Word / Docx"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("success", "Success"),
        ("error", "Error"),
    ]

    # --- Ownership ---
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="uploaded_documents",
        help_text="User who uploaded or created this document."
    )
    company = models.ForeignKey(
        "accounts.Company",
        on_delete=models.CASCADE,
        related_name="documents",
        help_text="Company that owns this document."
    )
    candidate = models.ForeignKey(
        "candidates.Candidate",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
        help_text="Candidate this document belongs to (if applicable)."
    )

    # --- Files ---
    file = models.FileField(upload_to=company_storage_path, storage=storage)
    pdf_preview = models.FileField(
        upload_to=company_storage_path,
        storage=storage,
        null=True,
        blank=True,
        help_text="Generated PDF preview for visualization."
    )

    # --- Metadata ---
    filename = models.CharField(max_length=255)
    size = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=100)
    doc_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="other")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="upload")
    uploaded_at = models.DateTimeField(default=timezone.now)

    # --- Processing ---
    processing_progress = models.PositiveSmallIntegerField(default=0)
    processing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    processing_result = models.CharField(
        max_length=500, null=True, blank=True, help_text="Empty if success, or error message if failed."
    )

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.filename} ({self.company.name})"

    def save(self, *args, **kwargs):
        if not self.company and self.uploaded_by:
            self.company = self.uploaded_by.company
        super().save(*args, **kwargs)
