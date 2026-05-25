from __future__ import annotations

from dataclasses import dataclass, field
import os
from dotenv import load_dotenv

# Load environment variables from .env files
load_dotenv()
load_dotenv("../.env")



def _split_csv(value: str | None, default: list[str]) -> list[str]:
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


def _get_database_url() -> str:
    url = os.getenv("DATABASE_URL", "sqlite:///./data/grants.db")
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


@dataclass(slots=True)
class Settings:
    app_name: str = "GrantAI AI Engine"
    environment: str = field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    api_key: str = field(default_factory=lambda: os.getenv("AI_ENGINE_API_KEY", ""))
    gemini_api_key: str = field(default_factory=lambda: os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "")))
    gemini_model: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite"))
    gemini_match_candidate_limit: int = field(default_factory=lambda: int(os.getenv("GEMINI_MATCH_CANDIDATE_LIMIT", "4")))
    gemini_match_timeout_seconds: float = field(default_factory=lambda: float(os.getenv("GEMINI_MATCH_TIMEOUT_SECONDS", "12")))
    gemini_letter_timeout_seconds: float = field(default_factory=lambda: float(os.getenv("GEMINI_LETTER_TIMEOUT_SECONDS", "8")))
    gemini_interview_timeout_seconds: float = field(default_factory=lambda: float(os.getenv("GEMINI_INTERVIEW_TIMEOUT_SECONDS", "20")))
    semantic_match_timeout_seconds: float = field(default_factory=lambda: float(os.getenv("SEMANTIC_MATCH_TIMEOUT_SECONDS", "5")))
    embedding_model: str = field(default_factory=lambda: os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2"))
    chroma_path: str = field(default_factory=lambda: os.getenv("CHROMA_PERSIST_DIRECTORY", "./data/chroma"))
    database_url: str = field(default_factory=_get_database_url)
    cors_allowed_origins: list[str] = field(
        default_factory=lambda: _split_csv(
            os.getenv("CORS_ALLOWED_ORIGINS"),
            ["http://localhost:3000", "http://localhost:3001"],
        )
    )


settings = Settings()
