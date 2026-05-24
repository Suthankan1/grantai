# GrantAI — AI Engine (FastAPI)

FastAPI · Python 3.12 · Poetry · ChromaDB · Google Gemini · sentence-transformers

## Overview

AI microservice responsible for:
- Grant ingestion and normalization
- Semantic retrieval with ChromaDB and sentence embeddings
- Grant matching and compatibility scoring
- Cover letter generation with Gemini streaming
- Interview question generation and feedback

## Setup

```bash
cd ai-engine
poetry install
export GEMINI_API_KEY=your_key_here
export AI_ENGINE_API_KEY=shared_service_secret
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API available at `http://localhost:8000`  
Health check: `GET /ai/health`  
Interactive docs at `http://localhost:8000/docs`

## Notes

- `/ai/match` returns ranked grants with Gemini compatibility scores.
- `/ai/letter` streams Server-Sent Events.
- `/ai/interview/questions` and `/ai/interview/feedback` return structured JSON.
- The service accepts `X-API-Key` or `Authorization: Bearer ...` when `AI_ENGINE_API_KEY` is set.

