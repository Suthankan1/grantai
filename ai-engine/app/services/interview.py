from __future__ import annotations

import json
from typing import Any

from app.core.gemini import extract_json_payload, get_gemini_model


def generate_interview_questions(grant: dict[str, Any]) -> dict[str, Any]:
    prompt = f"""
Generate 10 likely interview questions for a grant application.
Return only JSON with this shape:
{{"questions":[{{"question":"...","context":"..."}}]}}

Grant details:
{json.dumps(grant, ensure_ascii=False, indent=2)}
""".strip()

    response = get_gemini_model().generate_content(prompt)
    payload = extract_json_payload(getattr(response, "text", "") or "")
    questions = payload.get("questions")
    if not isinstance(questions, list):
        questions = [{"question": str(item), "context": ""} for item in payload.get("items", [])]
    return {"questions": questions[:10]}


def generate_feedback(question: str, answer: str, grant: dict[str, Any] | None = None) -> dict[str, Any]:
    prompt = f"""
Evaluate the answer to a grant interview question.
Return only JSON with keys score, strengths, areas_to_improve, suggested_improvements.
score must be an integer from 1 to 10.
strengths, areas_to_improve, and suggested_improvements must each be arrays of strings.

Grant details:
{json.dumps(grant or {}, ensure_ascii=False, indent=2)}

Question:
{question}

Answer:
{answer}
""".strip()

    response = get_gemini_model().generate_content(prompt)
    payload = extract_json_payload(getattr(response, "text", "") or "")

    return {
        "score": max(1, min(10, int(payload.get("score", 0) or 0))),
        "strengths": payload.get("strengths", []),
        "areas_to_improve": payload.get("areas_to_improve", []),
        "suggested_improvements": payload.get("suggested_improvements", []),
    }
