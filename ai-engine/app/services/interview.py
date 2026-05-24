from __future__ import annotations

import json
from typing import Any

from app.core.gemini import extract_json_payload, generate_text


def build_fallback_interview_questions(grant: dict[str, Any] | None = None) -> dict[str, Any]:
    grant = grant or {}
    title = str(grant.get("title") or "this grant").strip()
    provider = str(grant.get("provider") or "the funder").strip()
    field = str(grant.get("field") or "your field").strip()

    questions = [
        {
            "question": f"What motivated you to apply for {title}, and why is {provider} the right fit?",
            "context": "Connect your personal motivation to the grant's stated priorities.",
            "category": "Motivation",
        },
        {
            "question": f"How does your academic or professional background prepare you for work in {field}?",
            "context": "Highlight evidence from coursework, research, projects, or prior roles.",
            "category": "Research Background",
        },
        {
            "question": "What is the core problem your proposed work addresses, and why does it matter now?",
            "context": "Frame the problem clearly and explain its urgency.",
            "category": "Impact",
        },
        {
            "question": "Which methods, tools, or technical skills will you use to deliver the project successfully?",
            "context": "Show that your plan is practical and technically grounded.",
            "category": "Technical",
        },
        {
            "question": "What measurable outcomes would indicate that your project has succeeded?",
            "context": "Name concrete outputs, beneficiaries, or evaluation measures.",
            "category": "Impact",
        },
        {
            "question": "Tell us about a challenge you faced in prior work and how you adapted.",
            "context": "Use a concise example that demonstrates resilience and judgment.",
            "category": "Research Background",
        },
        {
            "question": "How will this grant change your next academic or professional step?",
            "context": "Tie the award to a believable future trajectory.",
            "category": "Future Plans",
        },
        {
            "question": "How would you explain your project to someone outside your discipline?",
            "context": "Practice a plain-language version of your proposal.",
            "category": "Technical",
        },
        {
            "question": "Who benefits from your work, and how will you reach or involve them?",
            "context": "Discuss stakeholders, communities, collaborators, or end users.",
            "category": "Impact",
        },
        {
            "question": "If selected, what would your first 90 days of work look like?",
            "context": "Give a specific and realistic startup plan.",
            "category": "Future Plans",
        },
    ]

    return {"questions": questions}


def generate_interview_questions(grant: dict[str, Any]) -> dict[str, Any]:
    prompt = f"""
Generate exactly 10 likely interview questions for this grant application.
For each question, assign a category representing the type of question. The category MUST be one of these exact values: "Research Background", "Motivation", "Technical", "Impact", or "Future Plans".
Return only JSON with this shape:
{{"questions":[{{"question":"...","context":"...","category":"..."}}]}}

Grant details:
{json.dumps(grant, ensure_ascii=False, indent=2)}
""".strip()

    try:
        text = generate_text(prompt)
        payload = extract_json_payload(text)
    except Exception:
        return build_fallback_interview_questions(grant)

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

    questions = [q for q in questions if isinstance(q, dict) and q.get("question")]
    return {"questions": questions[:10]} if questions else build_fallback_interview_questions(grant)


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
