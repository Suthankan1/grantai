from __future__ import annotations

import json
from collections.abc import Generator
from typing import Any

from app.core.gemini import get_gemini_model


def build_cover_letter_prompt(profile: dict[str, Any], grant: dict[str, Any]) -> str:
    return f"""
Write a polished, detailed grant cover letter tailored to the applicant and the opportunity.
Use a professional but warm tone.
Keep the letter specific to the grant and the applicant's background.
Include a strong opening, two body paragraphs, and a concise closing.
Do not mention that you are an AI model.

Applicant profile:
{json.dumps(profile, ensure_ascii=False, indent=2)}

Grant details:
{json.dumps(grant, ensure_ascii=False, indent=2)}
""".strip()


def stream_cover_letter(profile: dict[str, Any], grant: dict[str, Any]) -> Generator[bytes, None, None]:
    prompt = build_cover_letter_prompt(profile, grant)
    response = get_gemini_model().generate_content(prompt, stream=True)

    for chunk in response:
        delta = getattr(chunk, "text", "") or ""
        if not delta:
            continue
        payload = json.dumps({"delta": delta}, ensure_ascii=False)
        yield f"data: {payload}\n\n".encode("utf-8")

    yield b"event: done\ndata: [DONE]\n\n"
