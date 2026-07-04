from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from apps.positions.models import Position
from apps.positions.tasks import embed_position_task
import logging
import os

logger = logging.getLogger(__name__)

# Delay (seconds) between last update and embedding
EMBEDDING_DELAY = int(os.getenv("POSITION_EMBEDDING_DELAY", 60))


@receiver(post_save, sender=Position)
def trigger_delayed_embedding(sender, instance, created, **kwargs):
    """
    Debounce-style trigger for Position embedding.

    Embedding runs only if:
      - The position is newly created, OR
      - Its 'name' or 'description' field has changed.

    Skips:
      - Already embedded positions (embedding_status='done')
      - Pending embeddings
      - Positions with no meaningful text
    """

    # Skip when embeddings can't be produced or used: no OpenAI key, or a DB
    # without pgvector (e.g. SQLite dev). This also prevents a failing embed task
    # from re-saving + rescheduling under eager mode and stalling the request.
    from django.db import connection
    if not getattr(settings, "OPENAI_API_KEY", None) or connection.vendor != "postgresql":
        return

    # Skip if currently embedding
    if instance.embedding_status == "pending":
        logger.debug(f"⏳ Position {instance.id} already pending embedding, skip scheduling.")
        return

    # Skip if already embedded and nothing changed
    if not created and instance.embedding_status == "done" and instance.embedding is not None:
        # Fetch the version in DB before save to compare
        try:
            old = Position.objects.get(pk=instance.pk)
        except Position.DoesNotExist:
            old = None

        if old:
            # Only trigger if name or description changed
            same_name = old.name == instance.name
            same_description = old.description == instance.description
            if same_name and same_description:
                logger.debug(f"🟢 Position {instance.id}: unchanged fields, skip embedding.")
                return

    # Skip if no text to embed
    if not instance.name and not instance.description:
        logger.debug(f"⚠️ Position {instance.id} missing name/description, skip embedding.")
        return

    # Mark as pending and schedule delayed embedding
    instance.embedding_status = "pending"
    instance.save(update_fields=["embedding_status"])

    logger.info(f"🕒 Scheduling embedding for Position {instance.id} in {EMBEDDING_DELAY}s...")
    embed_position_task.apply_async((instance.id,), countdown=EMBEDDING_DELAY)
