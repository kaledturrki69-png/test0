# Ensure the Celery app is loaded when Django starts so that:
#   * @shared_task tasks bind to the configured app (correct broker in prod), and
#   * settings such as CELERY_TASK_ALWAYS_EAGER take effect (inline tasks in dev).
# This is the standard Django + Celery integration and is required for `.delay()`
# / `.apply_async()` calls made from the web process to use the right config.
from .celery import app as celery_app

__all__ = ("celery_app",)
