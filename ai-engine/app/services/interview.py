from __future__ import annotations

import json
from typing import Any

from app.core.gemini import extract_json_payload, generate_text


def generate_interview_questions(grant: dict[str, Any]) -> dict[str, Any]:
    prompt = f"""
Generate exactly 10 likely interview questions for this grant application.
For each question, assign a category representing the type of question. The category MUST be one of these exact values: "Research Background", "Motivation", "Technical", "Impact", or "Future Plans".
Return only JSON with this shape:
{{"questions":[{{"question":"...","context":"...","category":"..."}}]}}

Grant details:
{json.dumps(grant, ensure_ascii=False, indent=2)}
""".strip()

    text = generate_text(prompt)
    payload = extract_json_payload(text)
    questions = payload.get("questions")
    if not isinstance(questions, list):
        questions = [{"question": str(item), "context": "", "category": "Motivation"} for item in payload.get("items", [])]
    
    # Ensure category is set
    categories_allowed = {"Research Background", "Motivation", "Technical", "Impact", "Future Plans"}
    for q in questions:
        if not isinstance(q, dict):
            continue
        if "category" not in q or q["category"] not in categories_allowed:
            q["category"] = "Motivation"  # Fallback

    return {"questions": questions[:10]}


def generate_feedback(question: str, answer: str, grant: dict[str, Any] | None = None) -> dict[str, Any]:
    prompt = f"""
Evaluate the answer to a grant interview question.
Return only JSON with keys: score, strengths, areas_to_improve, suggested_improvements, and suggested_answer.
- score must be an integer from 1 to 10.
- strengths, areas_to_improve, and suggested_improvements must each be arrays of strings.
- suggested_answer must be a single paragraph (string) of the ideal suggested answer.

Grant details:
{json.dumps(grant or {}, ensure_ascii=False, indent=2)}

Question:
{question}

Answer:
{answer}
""".strip()

    text = generate_text(prompt)
    payload = extract_json_payload(text)

    return {
        "score": max(1, min(10, int(payload.get("score", 0) or 0))),
        "strengths": payload.get("strengths", []),
        "areas_to_improve": payload.get("areas_to_improve", []),
        "suggested_improvements": payload.get("suggested_improvements", []),
        "suggested_answer": payload.get("suggested_answer", "") or (payload.get("suggested_improvements", [""])[0] if payload.get("suggested_improvements") else ""),
    }

