from __future__ import annotations

import asyncio

from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse

from app.core.embeddings import embed_batch, embed_text
from app.schemas import (
    EmbedRequest,
    InterviewFeedbackRequest,
    InterviewQuestionsRequest,
    LetterRequest,
    MatchRequest,
)
from app.services.interview import generate_feedback, generate_interview_questions
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


@router.post("/letter")
async def letter(payload: LetterRequest) -> StreamingResponse:
    return StreamingResponse(
        stream_cover_letter(payload.profile, payload.grant, payload.options),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/interview/questions")
async def interview_questions(payload: InterviewQuestionsRequest) -> JSONResponse:
    questions = await asyncio.to_thread(generate_interview_questions, payload.grant)
    return JSONResponse(questions)


@router.post("/interview/feedback")
async def interview_feedback(payload: InterviewFeedbackRequest) -> JSONResponse:
    feedback = await asyncio.to_thread(generate_feedback, payload.question, payload.answer, payload.grant)
    return JSONResponse(feedback)
