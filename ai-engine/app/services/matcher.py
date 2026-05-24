from __future__ import annotations

import asyncio
import json
from typing import Any

from app.core.chroma import search_grants
from app.core.embeddings import embed_text
from app.core.gemini import extract_json_payload, get_gemini_model


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
        response = get_gemini_model().generate_content(prompt)
        payload = extract_json_payload(getattr(response, "text", "") or "")
        score = int(payload.get("score", 0) or 0)
        score = max(0, min(100, score))
        reasoning = str(payload.get("reasoning", "Compatibility was estimated from the applicant profile and grant metadata.")).strip()
        if reasoning.count(".") < 2:
            base_reasoning = reasoning.rstrip(".")
            reasoning = f"{base_reasoning}. {base_reasoning}."
    except Exception as e:
        logger.error(f"Error scoring grant {grant.get('id')} with Gemini: {e}")
        score = 0
        reasoning = "Compatibility was estimated from the applicant profile and grant metadata."

    return {"score": score, "reasoning": reasoning}


async def match_grants(profile: dict[str, Any], n_results: int = 10, filters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    query = build_semantic_query(profile)
    query_embedding = embed_text(query)
    candidates = search_grants(query_embedding, n_results=n_results, filters=filters or {})

    scored_candidates = await asyncio.gather(
        *(
            asyncio.to_thread(_score_grant_with_gemini, profile, grant)
            for grant in candidates
        )
    )

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
