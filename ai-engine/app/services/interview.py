from __future__ import annotations

import json
import re
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

    try:
        text = generate_text(prompt)
        payload = extract_json_payload(text)

        score = _extract_score(payload)
        strengths = _extract_string_list(payload, "strengths")
        areas_to_improve = _extract_string_list(payload, "areas_to_improve")
        suggested_improvements = _extract_string_list(payload, "suggested_improvements")
        suggested_answer = str(
            payload.get("suggested_answer")
            or payload.get("suggestedResponse")
            or payload.get("answer")
            or (suggested_improvements[0] if suggested_improvements else "")
        ).strip()

        return {
            "score": score,
            "strengths": strengths,
            "areas_to_improve": areas_to_improve,
            "suggested_improvements": suggested_improvements,
            "suggested_answer": suggested_answer,
        }
    except Exception:
        # Graceful fallback — never let the endpoint 500
        heuristic_score = _fallback_score(question, answer, grant)
        return {
            "score": heuristic_score,
            "strengths": ["Your answer addresses the question directly."] if heuristic_score >= 5 else ["You made a start on the answer."],
            "areas_to_improve": ["AI feedback is temporarily unavailable. Please try again shortly."],
            "suggested_improvements": ["Add one concrete example, a result, and a plain-language impact statement."],
            "suggested_answer": _build_fallback_suggested_answer(question, answer, grant),
        }


def _extract_score(payload: dict[str, Any]) -> int:
    raw_score = payload.get("score")
    if raw_score is None:
        raw_score = payload.get("compatibility_score")

    if isinstance(raw_score, bool):
        raw_score = None

    if isinstance(raw_score, (int, float)):
        return max(1, min(10, int(round(raw_score))))

    if isinstance(raw_score, str):
        match = re.search(r"\d+(?:\.\d+)?", raw_score)
        if match:
            return max(1, min(10, int(round(float(match.group(0))))))

    raw_text = str(payload.get("raw") or "")
    match = re.search(r'"score"\s*:\s*(\d+(?:\.\d+)?)', raw_text)
    if match:
        return max(1, min(10, int(round(float(match.group(1))))))

    return 5


def _extract_string_list(payload: dict[str, Any], key: str) -> list[str]:
    value = payload.get(key)
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _fallback_score(question: str, answer: str, grant: dict[str, Any] | None) -> int:
    answer_text = answer.strip()
    if not answer_text:
        return 1

    score = 3
    if len(answer_text) > 120:
        score += 2
    if len(answer_text) > 220:
        score += 1

    lower_answer = answer_text.lower()
    if any(token in lower_answer for token in ("because", "example", "impact", "project", "research", "result")):
        score += 2

    lower_question = question.lower().strip()
    if lower_question and any(token in lower_answer for token in _question_keywords(lower_question)):
        score += 1

    if grant:
        grant_text = " ".join(str(grant.get(key) or "") for key in ("title", "provider", "field", "description")).lower()
        if grant_text and any(token in lower_answer for token in _question_keywords(grant_text)):
            score += 1

    return max(1, min(10, score))


def _question_keywords(text: str) -> list[str]:
    keywords = []
    for token in re.findall(r"[a-z]{4,}", text.lower()):
        if token not in {"this", "that", "with", "your", "from", "have", "what", "would", "could", "should"}:
            keywords.append(token)
    return keywords[:8]


def _build_fallback_suggested_answer(question: str, answer: str, grant: dict[str, Any] | None) -> str:
    grant = grant or {}
    title = str(grant.get("title") or "the opportunity").strip()
    provider = str(grant.get("provider") or "the funder").strip()
    field = str(grant.get("field") or "your field").strip()

    if answer.strip():
        return (
            f"I would explain that {title} from {provider} supports work in {field}, and that my project focuses on a clear problem, a practical method, and measurable impact. "
            f"In plain language, I would say the project helps turn a complex idea into something useful for real people."
        )

    return (
        f"I am applying for {title} because it supports work in {field} and aligns with my goals. "
        f"In simple terms, my project aims to solve a real problem by combining clear methods with measurable outcomes, so the work can make a practical difference."
    )
