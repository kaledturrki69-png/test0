from django.conf import settings
from datetime import datetime

def deploy_metadata(request):
    raw_date = getattr(settings, "DEPLOY_DATE", "")
    formatted_date = ""

    # Try to parse known formats safely
    if raw_date:
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S"):
            try:
                dt = datetime.strptime(raw_date, fmt)
                formatted_date = dt.strftime("%a %d %B %Y %H:%M:%S")  # → Mon 12 October 2021 15:20:20
                break
            except ValueError:
                continue

    return {
        "DEPLOY_COMMIT": getattr(settings, "DEPLOY_COMMIT", ""),
        "DEPLOY_DATE": formatted_date or raw_date,
        "DEPLOY_AUTHOR": getattr(settings, "DEPLOY_AUTHOR", ""),
        "DEPLOY_BRANCH": getattr(settings, "DEPLOY_BRANCH", ""),
        "DEPLOY_MESSAGE": getattr(settings, "DEPLOY_MESSAGE", ""),
    }