from django.apps import AppConfig
from django.db.models.signals import post_migrate


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"

    def ready(self):
        from django.contrib.auth.models import Group
        from django.conf import settings
        from .models import Company

        def init_defaults(sender, **kwargs):
            # Default companies
            for name in settings.DEFAULT_COMPANIES.values():
                Company.objects.get_or_create(name=name)

            # Default groups
            for g in ["employer", "candidate", "superadmin"]:
                Group.objects.get_or_create(name=g)

        post_migrate.connect(init_defaults, sender=self)
