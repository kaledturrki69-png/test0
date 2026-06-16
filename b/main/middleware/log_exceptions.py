# core/middleware/log_exceptions.py
import logging

logger = logging.getLogger("django.request")


class LogBadRequestMiddleware:
    """
    Logs all HTTP responses with status >= 400.
    Avoids accessing request.body for multipart or already-consumed streams
    to prevent RawPostDataException during file uploads.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if response.status_code >= 400:
            # Try to log a safe preview of the body
            body_preview = b""
            if request.content_type and "multipart" in request.content_type:
                # Skip binary form-data uploads
                body_preview = b"[multipart/form-data omitted]"
            else:
                try:
                    body_preview = request.body[:500]
                except Exception:
                    body_preview = b"[body unavailable or already read]"

            logger.warning(
                "Request error: %s %s | status=%s | data=%s",
                request.method,
                request.path,
                response.status_code,
                body_preview,
            )

        return response
