from __future__ import annotations

from functools import lru_cache
from threading import Lock

from sentence_transformers import SentenceTransformer

from app.core.settings import settings


_model_lock = Lock()


@lru_cache(maxsize=1)
def _load_model() -> SentenceTransformer:
    with _model_lock:
        return SentenceTransformer(settings.embedding_model)


def embed_text(text: str) -> list[float]:
    vector = _load_model().encode(text or "", normalize_embeddings=True, convert_to_numpy=True)
    return vector.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    vectors = _load_model().encode(texts, normalize_embeddings=True, convert_to_numpy=True)
    return [vector.tolist() for vector in vectors]
