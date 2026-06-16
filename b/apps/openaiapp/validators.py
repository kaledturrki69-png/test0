import json
from pathlib import Path
from jsonschema import validate, ValidationError


def get_schema(version: str = "1") -> dict:
    """
    Load the JSON schema corresponding to a specific version.
    """
    schema_path = Path(__file__).resolve().parent / "schemas" / f"schema{version}.json"
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema version {version} not found at {schema_path}")
    return json.loads(schema_path.read_text(encoding="utf-8"))


def validate_resume_json(data: dict, version: str = "1") -> None:
    """
    Validate résumé JSON against the specified schema version.
    Raises ValidationError if invalid.
    """
    schema = get_schema(version)
    validate(instance=data, schema=schema)
