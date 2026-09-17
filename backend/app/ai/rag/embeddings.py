"""Embedding provider abstraction supporting mock, openai, and ollama."""

import hashlib
import math

import httpx
import numpy as np

from app.core.config import settings


class EmbeddingService:
    def __init__(self):
        self.provider = settings.EMBEDDING_PROVIDER.lower()
        self.dimensions = settings.EMBEDDING_DIMENSIONS

    async def get_embedding(self, text: str) -> list[float]:
        """Generate embedding vector for input text."""
        embeddings = await self.get_embeddings([text])
        return embeddings[0]

    async def get_embeddings(self, texts: list[str]) -> list[list[float]]:
        """Generate normalized embedding vectors for a batch of texts."""
        if self.provider == "openai" and settings.OPENAI_API_KEY:
            return await self._get_openai_embeddings(texts)
        elif self.provider == "ollama":
            return await self._get_ollama_embeddings(texts)
        else:
            return self._get_mock_embeddings(texts)

    def _get_mock_embeddings(self, texts: list[str]) -> list[list[float]]:
        """Deterministic, normalized pseudo-semantic embeddings based on token n-grams and hashing."""
        results = []
        dim = self.dimensions

        for text in texts:
            clean = text.lower().strip()
            words = clean.split()
            vec = np.zeros(dim, dtype=np.float32)

            # Project words into vector coordinates deterministically
            for word in words:
                h = int(hashlib.sha256(word.encode("utf-8")).hexdigest()[:8], 16)
                idx = h % dim
                sign = 1.0 if (h % 2 == 0) else -1.0
                vec[idx] += sign * 1.5

                # Add bigram / subword energy
                if len(word) > 3:
                    sub_h = int(hashlib.md5(word[:4].encode("utf-8")).hexdigest()[:6], 16)
                    vec[sub_h % dim] += 0.8

            # Add general text hash bias
            full_h = int(hashlib.sha256(clean.encode("utf-8")).hexdigest()[:8], 16)
            for step in range(16):
                idx = (full_h + step * 97) % dim
                vec[idx] += math.sin(step)

            # L2 normalize
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            else:
                vec[0] = 1.0

            results.append(vec.tolist())

        return results

    async def _get_openai_embeddings(self, texts: list[str]) -> list[list[float]]:
        url = (
            f"{settings.OPENAI_BASE_URL.rstrip('/')}/embeddings"
            if settings.OPENAI_BASE_URL
            else "https://api.openai.com/v1/embeddings"
        )
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.EMBEDDING_MODEL,
            "input": texts,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            return [item["embedding"] for item in data["data"]]

    async def _get_ollama_embeddings(self, texts: list[str]) -> list[list[float]]:
        results = []
        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/embeddings"
        async with httpx.AsyncClient(timeout=30.0) as client:
            for text in texts:
                res = await client.post(
                    url,
                    json={"model": settings.OLLAMA_MODEL, "prompt": text},
                )
                res.raise_for_status()
                data = res.json()
                results.append(data["embedding"])
        return results


embedding_service = EmbeddingService()
