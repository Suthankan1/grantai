from __future__ import annotations

import asyncio
import json
from datetime import date, datetime
from typing import Any

from app.core.chroma import search_grants
from app.core.embeddings import embed_text
from app.core.gemini import extract_json_payload, generate_text
from app.core.settings import settings
from app.db import get_session
from app.models import GrantRecord


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


def _normalize(value: Any) -> str:
    return str(value or "").strip().lower()


def _split_filter_values(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, (list, tuple, set)):
        return [_normalize(item) for item in value if _normalize(item)]
    return [item.strip().lower() for item in str(value).split(",") if item.strip()]


def _parse_date(value: Any) -> date | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value)).date()
    except ValueError:
        return None


def _parse_amount(value: Any) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _record_to_grant(record: GrantRecord) -> dict[str, Any]:
    payload = dict(record.raw_payload or {})
    payload.setdefault("id", record.id)
    payload.setdefault("title", record.title)
    payload.setdefault("provider", record.provider)
    payload.setdefault("description", record.description)
    payload.setdefault("amount", record.amount)
    payload.setdefault("deadline", record.deadline)
    payload.setdefault("country", record.country)
    payload.setdefault("field", record.field)
    payload.setdefault("type", record.type)
    payload.setdefault("source_url", record.source_url)
    return payload


def _matches_filters(grant: dict[str, Any], filters: dict[str, Any]) -> bool:
    field_values = _split_filter_values(filters.get("field"))
    country_values = _split_filter_values(filters.get("country"))
    type_values = _split_filter_values(filters.get("type"))
    query = _normalize(filters.get("q"))
    min_amount = _parse_amount(filters.get("minAmount"))
    max_deadline = _parse_date(filters.get("maxDeadline"))

    field = _normalize(grant.get("field"))
    country = _normalize(grant.get("country") or grant.get("country_name"))
    grant_type = _normalize(grant.get("type") or grant.get("grant_type"))
    title = _normalize(grant.get("title"))
    description = _normalize(grant.get("description"))

    if field_values and not any(value in field or field in value for value in field_values):
        return False
    if country_values and not any(value in country or country in value for value in country_values):
        return False
    if type_values and not any(value in grant_type or grant_type in value for value in type_values):
        return False
    if query and query not in f"{title} {description} {field} {country} {grant_type}":
        return False

    grant_amount = _parse_amount(grant.get("amount"))
    if min_amount is not None and grant_amount is not None and grant_amount < min_amount:
        return False

    grant_deadline = _parse_date(grant.get("deadline"))
    if max_deadline is not None and grant_deadline is not None and grant_deadline > max_deadline:
        return False

    return True


def _profile_terms(profile: dict[str, Any]) -> set[str]:
    terms: set[str] = set()
    for key in ("fieldOfStudy", "degreeLevel", "country"):
        value = _normalize(profile.get(key))
        if value:
            terms.update(value.split())
    for key in ("researchInterests", "grantTypes", "preferredCountries"):
        value = profile.get(key)
        if isinstance(value, list):
            for item in value:
                terms.update(_normalize(item).split())
        elif value:
            terms.update(_normalize(value).split())
    return {term for term in terms if len(term) > 2}


def _lexical_score(profile: dict[str, Any], grant: dict[str, Any]) -> dict[str, Any]:
    terms = _profile_terms(profile)
    haystack = _normalize(
        " ".join(
            str(grant.get(key) or "")
            for key in ("title", "description", "field", "country", "country_name", "type", "grant_type")
        )
    )
    overlap = sum(1 for term in terms if term in haystack)
    score = max(35, min(95, 52 + overlap * 8))
    reasoning = "Compatibility was estimated from local grant metadata because semantic AI scoring was unavailable. The score reflects overlap between the applicant profile, filters, and grant details."
    return {"score": score, "reasoning": reasoning}


def _fallback_candidates_from_db(
    profile: dict[str, Any],
    filters: dict[str, Any],
    n_results: int,
) -> list[dict[str, Any]]:
    with get_session() as session:
        records = session.query(GrantRecord).all()

    candidates = [
        grant
        for grant in (_record_to_grant(record) for record in records)
        if _matches_filters(grant, filters)
    ]
    candidates.sort(key=lambda grant: _lexical_score(profile, grant)["score"], reverse=True)
    return candidates[: max(1, n_results)]


def _fallback_candidates_from_chroma(
    profile: dict[str, Any],
    filters: dict[str, Any],
    n_results: int,
) -> list[dict[str, Any]]:
    from app.core.chroma import get_grants_collection
    collection = get_grants_collection()
    try:
        results = collection.get(include=['documents', 'metadatas'])
    except Exception:
        return []
    grants = []
    for meta, doc in zip(results.get('metadatas') or [], results.get('documents') or []):
        if not meta:
            continue
        grant = dict(meta)
        if doc:
            grant.setdefault('description', doc)
        if _matches_filters(grant, filters):
            grants.append(grant)
    grants.sort(key=lambda g: _lexical_score(profile, g)['score'], reverse=True)
    return grants[:max(1, n_results)]


def _fallback_candidates(
    profile: dict[str, Any],
    filters: dict[str, Any],
    n_results: int,
) -> list[dict[str, Any]]:
    candidates = _fallback_candidates_from_db(profile, filters, n_results)
    if candidates:
        return candidates
    return _fallback_candidates_from_chroma(profile, filters, n_results)


def _semantic_candidates(profile: dict[str, Any], n_results: int, filters: dict[str, Any]) -> list[dict[str, Any]]:
    query = build_semantic_query(profile)
    query_embedding = embed_text(query)
    candidates = search_grants(query_embedding, n_results=max(n_results * 3, n_results), filters={})
    filtered = [grant for grant in candidates if _matches_filters(grant, filters)]
    return (filtered or candidates)[: max(1, n_results)]


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
    filters = filters or {}
    semantic_available = True
    try:
        candidates = await asyncio.wait_for(
            asyncio.to_thread(_semantic_candidates, profile, n_results, filters),
            timeout=settings.semantic_match_timeout_seconds,
        )
    except Exception as exc:
        semantic_available = False
        logger.warning("Semantic grant search unavailable, using local fallback: %s", exc)
        candidates = _fallback_candidates(profile, filters, n_results)

    score_limit = max(0, min(settings.gemini_match_candidate_limit, len(candidates))) if semantic_available else 0
    scored_candidates = [
        _fallback_score(grant) if "distance" in grant else _lexical_score(profile, grant)
        for grant in candidates
    ]

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
