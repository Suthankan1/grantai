from __future__ import annotations

import json
import re
from collections.abc import Generator
from functools import lru_cache

from google import genai

from app.core.settings import settings


@lru_cache(maxsize=1)
def get_gemini_client() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)


def generate_text(prompt: str) -> str:
    """Generate text using Gemini. Raises immediately on error (no auto-retry)."""
    client = get_gemini_client()
    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
    )
    return response.text or ""


def stream_text(prompt: str) -> Generator[str, None, None]:
    """Stream generated text using Gemini."""
    client = get_gemini_client()
    for chunk in client.models.generate_content_stream(
        model=settings.gemini_model,
        contents=prompt,
    ):
        yield chunk.text or ""


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
            try:
                parsed = json.loads(match.group(0))
                return parsed if isinstance(parsed, dict) else {"items": parsed}
            except json.JSONDecodeError:
                pass

    return {"raw": text.strip()}
