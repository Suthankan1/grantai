from __future__ import annotations

import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.chroma import get_grants_collection
from app.core.security import enforce_api_key
from app.core.settings import settings
from app.db import init_database
from app.routers.ai import router as ai_router


class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            enforce_api_key(request)
        except HTTPException as exc:
            return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
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


async def _auto_seed_if_empty() -> None:
    import asyncio
    from app.core.chroma import get_grants_collection
    from app.services.scraper import scrape_all_sources
    try:
        collection = get_grants_collection()
        count = collection.count()
        if count < 10:
            import inspect
            if inspect.iscoroutinefunction(scrape_all_sources):
                await scrape_all_sources()
            else:
                await asyncio.to_thread(scrape_all_sources)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning('Auto-seed failed: %s', exc)


@app.on_event('startup')
async def startup() -> None:
    init_database()
    get_grants_collection()
    asyncio.create_task(_auto_seed_if_empty())


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": settings.app_name, "status": "ready"}
