# GrantAI — AI Engine (FastAPI)

FastAPI · Python 3.12 · LangChain · OpenAI · pgvector

## Overview

AI microservice responsible for:
- Grant semantic search (pgvector embeddings)
- LLM-powered application writing (GPT-4)
- Grant–organization matching scoring
- Document ingestion & chunking

## Setup

```bash
pip install uv
uv venv && source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn app.main:app --reload
```

API available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

> **Note:** FastAPI project will be initialized in the next prompt.
