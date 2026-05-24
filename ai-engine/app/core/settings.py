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


@dataclass(slots=True)
class Settings:
    app_name: str = "GrantAI AI Engine"
    environment: str = field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    api_key: str = field(default_factory=lambda: os.getenv("AI_ENGINE_API_KEY", ""))
    gemini_api_key: str = field(default_factory=lambda: os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "")))
    gemini_model: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite"))
    embedding_model: str = field(default_factory=lambda: os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2"))
    chroma_path: str = field(default_factory=lambda: os.getenv("CHROMA_PERSIST_DIRECTORY", "./data/chroma"))
    database_url: str = field(default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./data/grants.db"))
    cors_allowed_origins: list[str] = field(
        default_factory=lambda: _split_csv(
            os.getenv("CORS_ALLOWED_ORIGINS"),
            ["http://localhost:3000", "http://localhost:3001"],
        )
    )


settings = Settings()
