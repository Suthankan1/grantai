from __future__ import annotations

from functools import lru_cache
from typing import Any

import chromadb

from app.core.embeddings import embed_batch
from app.core.settings import settings
from app.models import make_grant_id


COLLECTION_NAME = "grants"


@lru_cache(maxsize=1)
def get_chroma_client() -> chromadb.PersistentClient:
    return chromadb.PersistentClient(path=settings.chroma_path)


@lru_cache(maxsize=1)
def get_grants_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(name=COLLECTION_NAME, metadata={"hnsw:space": "cosine"})


def _grant_metadata(grant: dict[str, Any]) -> dict[str, Any]:
    metadata: dict[str, Any] = {}
    for key, value in grant.items():
        if key in {"embedding", "raw_payload"} or value is None:
            continue
        if isinstance(value, (str, int, float, bool)):
            metadata[key] = value
        elif isinstance(value, (list, tuple)):
            metadata[key] = ", ".join(str(item) for item in value)
        else:
            metadata[key] = str(value)
    return metadata


def add_grants(grants: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not grants:
        return []

    collection = get_grants_collection()
    ids = [make_grant_id(grant) for grant in grants]
    documents = [f"{grant.get('title', '')}\n\n{grant.get('description', '')}".strip() for grant in grants]
    metadatas = [_grant_metadata({**grant, "id": grant_id}) for grant, grant_id in zip(grants, ids, strict=False)]
    embeddings = embed_batch(documents)

    collection.upsert(ids=ids, documents=documents, metadatas=metadatas, embeddings=embeddings)
    return grants


def search_grants(query_embedding: list[float], n_results: int, filters: dict[str, Any] | None) -> list[dict[str, Any]]:
    collection = get_grants_collection()
    query = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where=filters or None,
        include=["documents", "metadatas", "distances"],
    )

    results: list[dict[str, Any]] = []
    ids = query.get("ids", [[]])[0]
    documents = query.get("documents", [[]])[0]
    metadatas = query.get("metadatas", [[]])[0]
    distances = query.get("distances", [[]])[0]

    for grant_id, document, metadata, distance in zip(ids, documents, metadatas, distances, strict=False):
        result = dict(metadata or {})
        result.setdefault("id", grant_id)
        result.setdefault("description", document or result.get("description", ""))
        result["distance"] = distance
        results.append(result)

    return results
