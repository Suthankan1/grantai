from __future__ import annotations

import asyncio
import json
from typing import Any

from app.core.chroma import search_grants
from app.core.embeddings import embed_text
from app.core.gemini import extract_json_payload, generate_text


def build_semantic_query(profile: dict[str, Any]) -> str:
    parts: list[str] = []
    for key in (
        "fullName",
        "country",
        "university",
        "degreeLevel",
        "fieldOfStudy",
        "researchInterests",
        "grantTypes",
        "preferredCountries",
        "deadlinePreference",
    ):
        value = profile.get(key)
        if isinstance(value, list):
            value = ", ".join(str(item) for item in value if item)
        if value:
            parts.append(f"{key}: {value}")

    if profile.get("gpa"):
        parts.append(f"gpa: {profile['gpa']}")
    if profile.get("minGrantAmount"):
        parts.append(f"minimum grant amount: {profile['minGrantAmount']}")

    if not parts:
        parts.append("Looking for grants, scholarships, and fellowships that align with a student profile.")

    return "\n".join(parts)


import logging

logger = logging.getLogger(__name__)


def _fallback_score(grant: dict[str, Any]) -> dict[str, Any]:
    distance = grant.get("distance", 1.0)
    score = max(0, min(100, round((1 - distance) * 100)))
    reasoning = "Compatibility was estimated from semantic similarity between the applicant profile and grant metadata. The score reflects how closely this grant matches the applicant's stated interests."
    return {"score": score, "reasoning": reasoning}


def _score_grant_with_gemini(profile: dict[str, Any], grant: dict[str, Any]) -> dict[str, Any]:
    prompt = f"""
You are ranking grant compatibility for an applicant.
Return only JSON with keys score and reasoning.
score must be an integer from 0 to 100.
reasoning must be exactly two sentences and refer to the applicant and the grant.

Applicant profile:
{json.dumps(profile, ensure_ascii=False, indent=2)}

Grant:
{json.dumps(grant, ensure_ascii=False, indent=2)}
""".strip()

    try:
        text = generate_text(prompt)
        payload = extract_json_payload(text)
        score = int(payload.get("score", 0) or 0)
        score = max(0, min(100, score))
        reasoning = str(payload.get("reasoning", "")).strip()
        if not reasoning or reasoning.count(".") < 2:
            base = reasoning.rstrip(".")
            reasoning = f"{base}. {base}." if base else "Compatibility was estimated from the applicant profile and grant metadata. The grant aligns with the applicant's background."
    except Exception as e:
        logger.warning(f"Gemini scoring skipped for grant {grant.get('id')}: {e}")
        return _fallback_score(grant)

    return {"score": score, "reasoning": reasoning}


async def match_grants(profile: dict[str, Any], n_results: int = 10, filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    from app.core.settings import settings

    query = build_semantic_query(profile)
    query_embedding = embed_text(query)
    candidates = search_grants(query_embedding, n_results=n_results, filters=filters or {})

    score_limit = max(0, min(settings.gemini_match_candidate_limit, len(candidates)))
    scored_candidates = [_fallback_score(grant) for grant in candidates]

    if score_limit:
        tasks = [
            asyncio.create_task(asyncio.to_thread(_score_grant_with_gemini, profile, grant))
            for grant in candidates[:score_limit]
        ]
        done, pending = await asyncio.wait(tasks, timeout=settings.gemini_match_timeout_seconds)

        for task in pending:
            task.cancel()

        for index, task in enumerate(tasks):
            if task in done and not task.cancelled():
                try:
                    scored_candidates[index] = task.result()
                except Exception as exc:
                    logger.warning("Gemini scoring failed for candidate %s: %s", candidates[index].get("id"), exc)

    ranked: list[dict[str, Any]] = []
    for grant, scoring in zip(candidates, scored_candidates, strict=False):
        ranked.append(
            {
                **grant,
                "compatibility_score": scoring["score"],
                "reasoning": scoring["reasoning"],
            }
        )

    ranked.sort(key=lambda item: item["compatibility_score"], reverse=True)
    return ranked
