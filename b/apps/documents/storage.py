from django.core.files.storage import FileSystemStorage
from django.conf import settings
from pathlib import Path

class CompanyStorage(FileSystemStorage):
    """
    Custom storage backend that stores files under STORAGE_ROOT.
    """
    def __init__(self, *args, **kwargs):
        location = Path(settings.STORAGE_ROOT)
        super().__init__(location=location, base_url=None, *args, **kwargs)