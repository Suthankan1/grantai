from __future__ import annotations

import json
import logging
import queue
import threading
from collections.abc import Generator
from typing import Any

from app.core.gemini import stream_text
from app.core.settings import settings


logger = logging.getLogger(__name__)


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


def build_fallback_cover_letter(profile: dict[str, Any], grant: dict[str, Any], options: dict[str, Any]) -> str:
    applicant_name = str(profile.get("fullName") or "Applicant").strip()
    grant_title = str(grant.get("title") or "this funding opportunity").strip()
    provider = str(grant.get("provider") or "the selection committee").strip()
    field = str(grant.get("field") or profile.get("fieldOfStudy") or "my field").strip()
    description = str(grant.get("description") or "").strip()
    tone = str(options.get("tone") or "professional").strip().lower()
    emphasis = options.get("emphasis") or ["achievements"]
    if not isinstance(emphasis, list):
        emphasis = ["achievements"]
    emphasis_text = ", ".join(str(item) for item in emphasis if item) or "achievements"

    return f"""
Dear {provider} Team,

I am writing to express my strong interest in {grant_title}. My background in {field} and my commitment to meaningful research impact make this opportunity a compelling fit, especially because it aligns with {emphasis_text}.

The opportunity stands out because {description if description else "it supports focused work with clear academic and social value"}. I would approach the grant with a {tone} voice, a clear plan, and careful attention to the outcomes expected by the funder. My experience has prepared me to translate research goals into practical milestones and communicate progress responsibly.

Thank you for considering my application. I would be grateful for the opportunity to contribute work that reflects the purpose of {grant_title} and the mission of {provider}.

Sincerely,
{applicant_name}
""".strip()


def _chunk_text(text: str, chunk_size: int = 80) -> Generator[str, None, None]:
    for index in range(0, len(text), chunk_size):
        yield text[index:index + chunk_size]


def _stream_gemini_with_timeout(prompt: str) -> Generator[str, None, None]:
    chunks: queue.Queue[str | BaseException | None] = queue.Queue()

    def produce() -> None:
        try:
            for delta in stream_text(prompt):
                if delta:
                    chunks.put(delta)
        except BaseException as exc:
            chunks.put(exc)
        finally:
            chunks.put(None)

    threading.Thread(target=produce, daemon=True).start()

    while True:
        try:
            item = chunks.get(timeout=settings.gemini_letter_timeout_seconds)
        except queue.Empty as exc:
            raise TimeoutError("Gemini letter stream timed out.") from exc

        if item is None:
            return
        if isinstance(item, BaseException):
            raise item
        yield item


def stream_cover_letter(profile: dict[str, Any], grant: dict[str, Any], options: dict[str, Any]) -> Generator[bytes, None, None]:
    prompt = build_cover_letter_prompt(profile, grant, options)
    try:
        deltas = _stream_gemini_with_timeout(prompt)
        for delta in deltas:
            payload = json.dumps({"delta": delta}, ensure_ascii=False)
            yield f"data: {payload}\n\n".encode("utf-8")
    except Exception as exc:
        logger.warning("Gemini letter stream unavailable, using local fallback: %s", exc)
        for delta in _chunk_text(build_fallback_cover_letter(profile, grant, options)):
            payload = json.dumps({"delta": delta}, ensure_ascii=False)
            yield f"data: {payload}\n\n".encode("utf-8")

    yield b"event: done\ndata: [DONE]\n\n"
