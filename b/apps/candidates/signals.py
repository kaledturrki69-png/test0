# apps/candidates/signals.py
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.candidates.models import Resume
from apps.candidates.tasks import embed_resume_task
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Resume)
def trigger_resume_embedding(sender, instance, created, **kwargs):
    """
    Automatically queue an embedding task when a Resume is created.
    Re-queues if json_data is present but embedding is empty.
    """
    # Skip when embeddings can't be produced or used: no OpenAI key, or a DB
    # without pgvector (e.g. SQLite dev).
    from django.db import connection
    if not getattr(settings, "OPENAI_API_KEY", None) or connection.vendor != "postgresql":
        return

    if created or (not instance.embedding and instance.json_data):
        logger.info(f"📥 Queueing embedding for Resume {instance.id}")
        embed_resume_task.delay(instance.id)
