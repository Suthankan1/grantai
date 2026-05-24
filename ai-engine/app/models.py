from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class GrantRecord(Base):
    __tablename__ = "grant_records"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    provider: Mapped[str] = mapped_column(String(256), nullable=False, default="")
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    amount: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    deadline: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    country: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    field: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    type: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False, default="")
    raw_payload: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    embedding: Mapped[list[float]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)


def make_grant_id(grant: dict[str, Any]) -> str:
    raw_id = str(grant.get("id") or "").strip()
    if raw_id:
        return raw_id

    seed = "|".join(
        [
            str(grant.get("title") or ""),
            str(grant.get("provider") or ""),
            str(grant.get("source_url") or ""),
        ]
    )
    if seed.strip("|"):
        digest = hashlib.sha1(seed.encode("utf-8")).hexdigest()[:20]
        return f"grant-{digest}"

    return str(uuid4())
