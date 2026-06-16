from django.apps import AppConfig


class PositionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.positions'

    def ready(self):
        import apps.positions.signals  # noqas
