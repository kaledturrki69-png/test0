# apps/openaiapp/embedding_utils.py
from openai import OpenAI
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def get_openai_client():
    return OpenAI(
        api_key=getattr(settings, "OPENAI_API_KEY", None),
        base_url=getattr(settings, "OPENAI_BASE_URL", None) or None,
    )

def get_embedding(text: str, model: str = None) -> list[float]:
    """
    Create a multilingual embedding vector for a given text.
    Supports Arabic, French, English, etc.

    Returns an empty list on any failure (including a missing OPENAI_API_KEY,
    which makes the OpenAI client raise at construction time). Callers treat an
    empty result as "no embedding available" and degrade gracefully.
    """
    text = (text or "").strip()
    if not text:
        return []

    if not getattr(settings, "OPENAI_API_KEY", None):
        logger.warning("⚠️ OPENAI_API_KEY not set — skipping embedding.")
        return []

    model = model or getattr(settings, "OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    try:
        client = get_openai_client()
        response = client.embeddings.create(model=model, input=text)
        return response.data[0].embedding
    except Exception as e:
        logger.exception(f"⚠️ Failed to embed text ({len(text)} chars): {e}")
        return []
