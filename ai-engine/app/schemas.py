from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class MatchRequest(BaseModel):
    profile: dict[str, Any] = Field(default_factory=dict)
    n_results: int = 10
    filters: dict[str, Any] = Field(default_factory=dict)


class LetterRequest(BaseModel):
    profile: dict[str, Any] = Field(default_factory=dict)
    grant: dict[str, Any] = Field(default_factory=dict)


class InterviewQuestionsRequest(BaseModel):
    grant: dict[str, Any] = Field(default_factory=dict)


class InterviewFeedbackRequest(BaseModel):
    question: str
    answer: str
    grant: dict[str, Any] = Field(default_factory=dict)


class EmbedRequest(BaseModel):
    text: str | None = None
    texts: list[str] | None = None
