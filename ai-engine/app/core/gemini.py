from __future__ import annotations

import json
import re
from functools import lru_cache

import google.generativeai as genai

from app.core.settings import settings


def _configure_gemini() -> None:
    if settings.gemini_api_key:
        genai.configure(api_key=settings.gemini_api_key)


@lru_cache(maxsize=1)
def get_gemini_model() -> genai.GenerativeModel:
    _configure_gemini()
    return genai.GenerativeModel(settings.gemini_model)


def extract_json_payload(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
        return parsed if isinstance(parsed, dict) else {"items": parsed}
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            parsed = json.loads(match.group(0))
            return parsed if isinstance(parsed, dict) else {"items": parsed}

    return {"raw": text.strip()}
