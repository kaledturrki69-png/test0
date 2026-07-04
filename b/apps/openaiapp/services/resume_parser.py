import json
import logging
from pathlib import Path
from json import JSONDecodeError
from django.conf import settings
from openai import OpenAI
from .CandidateProfile import CandidateProfile
DEFAULT_SCHEMA_VERSION = "1"

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a professional multilingual résumé and curriculum vitae parser. "
    "Extract structured candidate profile information."
)


def load_resume_schema(version: str = DEFAULT_SCHEMA_VERSION) -> dict:
    """
    Load the JSON schema definition for the resume parser.
    """
    schema_path = Path(__file__).resolve().parent.parent / "schemas" / f"schema{version}.json"
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema version {version} not found at {schema_path}")
    try:
        return json.loads(schema_path.read_text(encoding="utf-8"))
    except JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in schema file: {e.msg}")


def _client() -> OpenAI:
    return OpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=getattr(settings, "OPENAI_BASE_URL", None) or None,
    )


def parse_resume_text(resume_text: str, schema_version: str = DEFAULT_SCHEMA_VERSION):
    """
    Parse resume text into a structured CandidateProfile.

    Works with OpenAI and any OpenAI-compatible provider (e.g. Google Gemini's
    OpenAI-compatible endpoint) via `OPENAI_BASE_URL` / `OPENAI_CHAT_MODEL`.

    Strategy:
      1. Native structured parsing (`chat.completions.parse` with the Pydantic
         schema) — best fidelity, used by OpenAI.
      2. Fallback to JSON mode + manual validation — for providers that reject
         the strict `$ref` JSON schema the parse helper generates.

    Returns a validated `CandidateProfile` on success, or `{"error": ...}`.
    """
    if not getattr(settings, "OPENAI_API_KEY", None):
        return {"error": "OPENAI_API_KEY not configured"}

    model = getattr(settings, "OPENAI_CHAT_MODEL", "gpt-4o-2024-08-06")
    client = _client()
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": resume_text[:15000]},
    ]

    # 1) Preferred: native structured output.
    try:
        completion = client.chat.completions.parse(
            model=model, messages=messages, response_format=CandidateProfile
        )
        parsed = completion.choices[0].message.parsed
        if parsed is not None:
            return parsed
        logger.warning("Structured parse returned no object; falling back to JSON mode.")
    except Exception as e:
        logger.warning(f"Structured parse unavailable ({e}); falling back to JSON mode.")

    # 2) Fallback: JSON mode + manual validation.
    try:
        schema = json.dumps(CandidateProfile.model_json_schema(), ensure_ascii=False)
        json_prompt = (
            "Extract the candidate profile from the résumé and return ONLY a JSON object "
            "conforming to this JSON Schema. Use \"\" for unknown strings and [] for unknown "
            f"lists; never omit required fields.\n\nSchema:\n{schema}\n\nRésumé:\n{resume_text[:15000]}"
        )
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": json_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )
        data = json.loads(completion.choices[0].message.content)
        return CandidateProfile.model_validate(data)
    except Exception as e:
        logger.exception("Resume parsing failed.")
        return {"error": str(e)}
