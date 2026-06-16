import openai
import json
from django.conf import settings
from .services.resume_parser import parse_resume_text, DEFAULT_SCHEMA_VERSION


openai.api_key = getattr(settings, "OPENAI_API_KEY", None)


# def extract_resume_json(resume_text: str) -> dict:
#     """
#     Simple wrapper used by Celery tasks or API endpoints.
#     """
#     return parse_resume_text(resume_text)

def extract_resume_json(resume_text: str, schema_version: str = DEFAULT_SCHEMA_VERSION) -> dict:
    """Wrapper for Celery tasks or API use."""
    return parse_resume_text(resume_text, schema_version)

def resume_to_json_prompt_template() -> str:
    """
    Returns the fixed instruction prompt for parsing resumes.
    The model will always respond with a JSON in this structure.
    """
    return """
You are a resume parser. 
Extract key fields from the text below and return a clean JSON matching exactly this structure:

{
  "first_name": "",
  "last_name": "",
  "email1": "",
  "email2": "",
  "phone1": "",
  "phone2": "",
  "skills": [],
  "education": [],
  "experience": [],
  "summary": ""
}

Rules:
- Return ONLY valid JSON.
- Do not include any text outside the JSON.
- If a field is missing, leave it empty ("" or []).
Resume text:
"""


# def extract_resume_json(resume_text: str) -> dict:
#     """
#     Send the resume text to OpenAI and parse the JSON response.
#     """
#     try:
#         prompt = resume_to_json_prompt_template() + "\n" + resume_text[:12000]  # limit length
#         response = openai.ChatCompletion.create(
#             model="gpt-4o-mini",  # or gpt-4-turbo / gpt-3.5-turbo depending on cost/perf
#             messages=[
#                 {"role": "system", "content": "You are a professional resume parser."},
#                 {"role": "user", "content": prompt},
#             ],
#             temperature=0.2,
#             max_tokens=1200,
#         )
#         content = response.choices[0].message["content"].strip()
#         data = json.loads(content)
#         return data
#     except Exception as e:
#         return {"error": str(e)}
