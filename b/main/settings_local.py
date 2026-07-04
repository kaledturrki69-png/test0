"""
Local development settings — run WITHOUT Docker / Postgres / Redis.

Usage:
    python manage.py <command> --settings=main.settings_local
(or set DJANGO_SETTINGS_MODULE=main.settings_local)

This inherits everything from main.settings and only overrides the pieces
that would otherwise require external services:
  * Database  -> SQLite file (no Postgres). pgvector columns are created but
                 left NULL; semantic search falls back to the plain listing.
  * Celery    -> tasks run inline (eager), so no Redis broker is needed and
                 no worker process has to be running.
  * Channels  -> ASGI_APPLICATION set so `runserver` boots with channels
                 installed but no channel layer (Redis) required.
  * Email     -> printed to the console instead of sent via SMTP.
"""
from main.settings import *  # noqa: F401,F403
from main.settings import BASE_DIR

# --- Database: SQLite (no Postgres needed) -------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# --- Celery: run tasks synchronously, no broker required -----------------
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = False  # a failing AI task must not break the request
CELERY_BROKER_URL = "memory://"
CELERY_RESULT_BACKEND = "cache+memory://"

# --- Channels: allow runserver to boot without a Redis channel layer -----
ASGI_APPLICATION = "main.asgi.application"

# --- Email: print to console instead of SMTP -----------------------------
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# --- Convenience for local dev -------------------------------------------
DEBUG = True
ALLOWED_HOSTS = ["*"]
