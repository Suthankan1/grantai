from __future__ import annotations

from fastapi import Request, HTTPException, status

from app.core.settings import settings


PUBLIC_PATHS = {"/", "/favicon.ico", "/ai/health", "/docs", "/openapi.json", "/redoc"}


def enforce_api_key(request: Request) -> None:
    if request.url.path in PUBLIC_PATHS:
        return

    expected_key = settings.api_key.strip()
    if not expected_key:
        return

    provided_key = request.headers.get("X-API-Key", "").strip()
    if not provided_key:
        authorization = request.headers.get("Authorization", "")
        if authorization.lower().startswith("bearer "):
            provided_key = authorization.split(" ", 1)[1].strip()

    if provided_key != expected_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key.")
