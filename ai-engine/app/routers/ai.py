from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse

from app.core.embeddings import embed_batch, embed_text
from app.core.gemini import generate_text
from app.core.settings import settings
from app.db import get_session
from app.models import GrantRecord
from app.schemas import (
    EmbedRequest,
    CompareRequest,
    InterviewFeedbackRequest,
    InterviewQuestionsRequest,
    LetterRequest,
    MatchRequest,
)
from app.services.interview import (
    build_fallback_interview_questions,
    generate_feedback,
    generate_interview_questions,
)
from app.services.letter_generator import stream_cover_letter
from app.services.matcher import match_grants


router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/embed")
async def embed(payload: EmbedRequest) -> JSONResponse:
    if payload.text is not None:
        return JSONResponse({"embedding": embed_text(payload.text)})
    if payload.texts:
        return JSONResponse({"embeddings": embed_batch(payload.texts)})
    return JSONResponse({"embedding": []})


@router.post("/match")
async def match(payload: MatchRequest) -> JSONResponse:
    matches = await match_grants(payload.profile, payload.n_results, payload.filters)
    return JSONResponse({"matches": matches})


def _normalize(value: object) -> str:
    return str(value or "").strip().lower()


def _parse_amount(value: object) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _profile_terms(profile: dict[str, object]) -> set[str]:
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


def _compare_score(profile: dict[str, object], grant: dict[str, object]) -> int:
    terms = _profile_terms(profile)
    haystack = _normalize(" ".join(str(grant.get(key) or "") for key in ("title", "provider", "description", "field", "country", "country_name", "type", "eligibility")))
    overlap = sum(1 for term in terms if term in haystack)
    amount = _parse_amount(grant.get("amount"))
    deadline_bonus = 1 if grant.get("deadline") else 0
    return max(0, min(100, 50 + overlap * 8 + (6 if amount else 0) + deadline_bonus))


def _load_grants_by_ids(grant_ids: list[str]) -> list[dict[str, object]]:
    if not grant_ids:
        return []

    with get_session() as session:
        records = session.query(GrantRecord).filter(GrantRecord.id.in_(grant_ids)).all()

    grants_by_id = {record.id: dict(record.raw_payload or {}) | {"id": record.id} for record in records}
    return [grants_by_id[grant_id] for grant_id in grant_ids if grant_id in grants_by_id]


def _fallback_recommendation(profile: dict[str, object], grants: list[dict[str, object]]) -> str:
    scored = sorted(((grant, _compare_score(profile, grant)) for grant in grants), key=lambda item: item[1], reverse=True)
    if not scored:
        return "No recommendation could be generated from the selected grants."

    best_grant, best_score = scored[0]
    title = best_grant.get("title") or "this grant"
    provider = best_grant.get("provider") or "the provider"
    reason_parts = []
    if best_grant.get("field"):
        reason_parts.append(str(best_grant.get("field")))
    if best_grant.get("country_name") or best_grant.get("country"):
        reason_parts.append(str(best_grant.get("country_name") or best_grant.get("country")))
    if best_grant.get("eligibility"):
        reason_parts.append("eligibility requirements")

    reason_text = ", ".join(reason_parts) if reason_parts else "overall profile fit"
    return f"{title} from {provider} is the strongest fit because it aligns best with your profile on {reason_text}. It has the clearest balance of relevance, practicality, and match strength among the selected grants, with an estimated fit score of {best_score}%."


@router.post("/compare")
async def compare(payload: CompareRequest) -> JSONResponse:
    grant_ids = [grant_id.strip() for grant_id in payload.grantIds if grant_id and grant_id.strip()]
    if len(grant_ids) < 2:
        return JSONResponse({"recommendation": "Select at least two grants to compare."}, status_code=400)

    grants = _load_grants_by_ids(grant_ids)
    if not grants:
        return JSONResponse({"recommendation": "No matching grants were found for the selected ids."}, status_code=404)

    scored_grants = sorted(
        ((grant, _compare_score(payload.profile, grant)) for grant in grants),
        key=lambda item: item[1],
        reverse=True,
    )
    best_grant, _ = scored_grants[0]

    prompt = f"""
You are helping an applicant choose the best grant among a small comparison set.
Write one concise recommendation paragraph only. Pick the best fit and explain why it is the strongest choice.
Do not use bullet points or headings.

Applicant profile:
{json.dumps(payload.profile, ensure_ascii=False, indent=2)}

Selected grants:
{json.dumps([{k: v for k, v in grant.items() if k in {"id", "title", "provider", "field", "country", "country_name", "amount", "deadline", "eligibility", "description"}} for grant in grants], ensure_ascii=False, indent=2)}

Local best-fit candidate:
{json.dumps({k: v for k, v in best_grant.items() if k in {"id", "title", "provider", "field", "country", "country_name", "amount", "deadline", "eligibility", "description"}}, ensure_ascii=False, indent=2)}
""".strip()

    try:
        recommendation = await asyncio.to_thread(generate_text, prompt)
        recommendation = recommendation.strip() or _fallback_recommendation(payload.profile, grants)
    except Exception:
        recommendation = _fallback_recommendation(payload.profile, grants)

    return JSONResponse({"recommendation": recommendation})


@router.post("/letter")
async def letter(payload: LetterRequest) -> StreamingResponse:
    return StreamingResponse(
        stream_cover_letter(payload.profile, payload.grant, payload.options),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/interview/questions")
async def interview_questions(payload: InterviewQuestionsRequest) -> JSONResponse:
    try:
        questions = await asyncio.wait_for(
            asyncio.to_thread(generate_interview_questions, payload.grant),
            timeout=settings.gemini_interview_timeout_seconds,
        )
    except asyncio.TimeoutError:
        questions = build_fallback_interview_questions(payload.grant)
    return JSONResponse(questions)


@router.post("/interview/feedback")
async def interview_feedback(payload: InterviewFeedbackRequest) -> JSONResponse:
    feedback = await asyncio.to_thread(generate_feedback, payload.question, payload.answer, payload.grant)
    return JSONResponse(feedback)
