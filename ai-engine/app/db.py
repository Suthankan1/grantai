from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Iterable

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.settings import settings
from app.models import Base, GrantRecord, make_grant_id


engine = create_engine(settings.database_url, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def init_database() -> None:
    Base.metadata.create_all(bind=engine)


@contextmanager
def get_session() -> Iterable[Session]:
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def save_grants(grants: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not grants:
        return []

    with get_session() as session:
        for grant in grants:
            grant_id = make_grant_id(grant)
            record = session.get(GrantRecord, grant_id)
            payload = {**grant, "id": grant_id}
            embedding = list(payload.get("embedding") or [])

            if record is None:
                record = GrantRecord(
                    id=grant_id,
                    title=payload.get("title", ""),
                    provider=payload.get("provider", ""),
                    description=payload.get("description", ""),
                    amount=str(payload.get("amount", "") or ""),
                    deadline=str(payload.get("deadline", "") or ""),
                    country=payload.get("country", ""),
                    field=payload.get("field", ""),
                    type=payload.get("type", ""),
                    source_url=payload.get("source_url", ""),
                    raw_payload=payload,
                    embedding=embedding,
                )
                session.add(record)
            else:
                record.title = payload.get("title", record.title)
                record.provider = payload.get("provider", record.provider)
                record.description = payload.get("description", record.description)
                record.amount = str(payload.get("amount", record.amount) or "")
                record.deadline = str(payload.get("deadline", record.deadline) or "")
                record.country = payload.get("country", record.country)
                record.field = payload.get("field", record.field)
                record.type = payload.get("type", record.type)
                record.source_url = payload.get("source_url", record.source_url)
                record.raw_payload = payload
                if embedding:
                    record.embedding = embedding

    return grants
