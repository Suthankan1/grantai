from __future__ import annotations

import json
from collections.abc import Generator
from typing import Any

from app.core.gemini import get_gemini_model


def _length_directive(length: str | None) -> str:
    normalized = (length or "").strip().lower()
    if "300" in normalized or "short" in normalized:
        return "Target approximately 300 words."
    if "800" in normalized or "detailed" in normalized:
        return "Target approximately 800 words."
    return "Target approximately 500 words."


def build_cover_letter_prompt(profile: dict[str, Any], grant: dict[str, Any], options: dict[str, Any]) -> str:
    tone = (options.get("tone") or "Professional").strip()
    emphasis = options.get("emphasis") or []
    if not isinstance(emphasis, list):
        emphasis = []
    regeneration_style = (options.get("regeneration_style") or "default").strip()
    custom_prompt = (options.get("custom_prompt") or "").strip()

    style_directive = {
        "more formal": "Use formal vocabulary and a conservative professional register.",
        "more personal": "Use a personal, narrative style with a warm voice.",
        "shorter": "Tighten every section and remove repetition.",
        "longer": "Expand examples and add richer details where useful.",
    }.get(regeneration_style.lower(), "")

    return f"""
Write a polished, detailed grant cover letter tailored to the applicant and the opportunity.
Use a {tone.lower()} tone.
{_length_directive(options.get("length"))}
Keep the letter specific to the grant and the applicant's background, with explicit emphasis on: {", ".join(emphasis) if emphasis else "major achievements"}.
Include a strong opening, two body paragraphs, and a concise closing.
Do not mention that you are an AI model.
{style_directive}
Additional instructions from user: {custom_prompt if custom_prompt else "None"}

Applicant profile:
{json.dumps(profile, ensure_ascii=False, indent=2)}

Grant details:
{json.dumps(grant, ensure_ascii=False, indent=2)}
""".strip()


def stream_cover_letter(profile: dict[str, Any], grant: dict[str, Any], options: dict[str, Any]) -> Generator[bytes, None, None]:
    prompt = build_cover_letter_prompt(profile, grant, options)
    response = get_gemini_model().generate_content(prompt, stream=True)

    for chunk in response:
        delta = getattr(chunk, "text", "") or ""
        if not delta:
            continue
        payload = json.dumps({"delta": delta}, ensure_ascii=False)
        yield f"data: {payload}\n\n".encode("utf-8")

    yield b"event: done\ndata: [DONE]\n\n"
