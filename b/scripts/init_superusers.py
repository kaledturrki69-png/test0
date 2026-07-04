import os
from django.contrib.auth import get_user_model

User = get_user_model()


def ensure_superuser(email: str, password: str):
    if not email or not password:
        return
    if not User.objects.filter(email=email).exists():
        print(f"🧩 Creating superuser: {email}")
        User.objects.create_superuser(email=email, password=password)
    else:
        print(f"✅ Superuser already exists: {email}")


def run():
    """
    Create an initial superuser from environment variables.

    Set DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD in the environment
    (.env) to bootstrap one admin on first deploy. If they are not set, this is
    a no-op — create admins later with `python manage.py createsuperuser`.

    Credentials are intentionally NOT hardcoded here (this file is committed to
    git). Never commit real superuser passwords.
    """
    email = os.getenv("DJANGO_SUPERUSER_EMAIL", "").strip()
    password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "").strip()
    if email and password:
        ensure_superuser(email, password)
    else:
        print("ℹ️ DJANGO_SUPERUSER_EMAIL/PASSWORD not set — skipping superuser bootstrap.")


if __name__ == "__main__":
    run()
