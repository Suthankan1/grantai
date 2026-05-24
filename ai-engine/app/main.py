from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.chroma import get_grants_collection
from app.core.security import enforce_api_key
from app.core.settings import settings
from app.db import init_database
from app.routers.ai import router as ai_router


class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        enforce_api_key(request)
        return await call_next(request)


app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(APIKeyMiddleware)

app.include_router(ai_router)


@app.on_event("startup")
def startup() -> None:
    init_database()
    get_grants_collection()


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": settings.app_name, "status": "ready"}
