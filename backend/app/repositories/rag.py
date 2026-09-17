"""RAG and Vector repository for document storage and similarity retrieval."""

import uuid

import numpy as np
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.document import Document, DocumentChunk


class RAGRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_document(
        self,
        candidate_id: uuid.UUID,
        title: str,
        document_type: str,
        raw_content: str,
        chunks_data: list[dict],
        embeddings: list[list[float]],
    ) -> Document:
        """Create document and associated chunks with embeddings."""
        doc = Document(
            candidate_id=candidate_id,
            title=title,
            document_type=document_type,
            raw_content=raw_content,
        )
        self.db.add(doc)
        await self.db.flush()

        for idx, (chunk_info, emb) in enumerate(zip(chunks_data, embeddings)):
            chunk = DocumentChunk(
                document_id=doc.id,
                candidate_id=candidate_id,
                chunk_index=idx,
                chunk_type=chunk_info.get("chunk_type", "text"),
                content=chunk_info["content"],
                embedding=emb,
                token_count=chunk_info.get("token_count", 0),
                metadata_json=chunk_info.get("metadata", {}),
            )
            self.db.add(chunk)

        await self.db.commit()
        await self.db.refresh(doc)
        return doc

    async def get_documents_by_candidate(
        self, candidate_id: uuid.UUID
    ) -> list[tuple[Document, int]]:
        """List all documents for candidate along with chunk counts."""
        stmt = (
            select(Document, func.count(DocumentChunk.id).label("chunk_count"))
            .outerjoin(DocumentChunk, Document.id == DocumentChunk.document_id)
            .where(Document.candidate_id == candidate_id)
            .group_by(Document.id)
            .order_by(Document.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return [(row[0], row[1]) for row in result.all()]

    async def get_document_by_id(
        self, document_id: uuid.UUID, candidate_id: uuid.UUID
    ) -> Document | None:
        """Fetch document with its chunks."""
        stmt = (
            select(Document)
            .where(Document.id == document_id, Document.candidate_id == candidate_id)
            .options(selectinload(Document.chunks))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_document(
        self, document_id: uuid.UUID, candidate_id: uuid.UUID
    ) -> bool:
        """Delete document and all associated chunks."""
        stmt = delete(Document).where(
            Document.id == document_id, Document.candidate_id == candidate_id
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0

    async def query_similar_chunks(
        self,
        candidate_id: uuid.UUID,
        query_vector: list[float],
        top_k: int = 5,
        document_type: str | None = None,
    ) -> list[tuple[DocumentChunk, Document, float]]:
        """Perform cosine similarity vector search over candidate-isolated chunks."""
        # Detect whether dialect supports pgvector cosine distance directly
        bind = self.db.bind
        dialect_name = bind.dialect.name if bind else "postgresql"

        if dialect_name == "postgresql":
            # Native pgvector cosine distance
            distance_expr = DocumentChunk.embedding.cosine_distance(query_vector)
            stmt = (
                select(DocumentChunk, Document, distance_expr.label("distance"))
                .join(Document, DocumentChunk.document_id == Document.id)
                .where(DocumentChunk.candidate_id == candidate_id)
            )
            if document_type:
                stmt = stmt.where(Document.document_type == document_type)

            stmt = stmt.order_by("distance").limit(top_k)
            result = await self.db.execute(stmt)
            rows = result.all()

            matches = []
            for chunk, doc, dist in rows:
                similarity = max(0.0, min(1.0, 1.0 - float(dist or 0.0)))
                matches.append((chunk, doc, round(similarity, 4)))
            return matches
        else:
            # In-memory / SQLite fallback for local test suite
            stmt = (
                select(DocumentChunk, Document)
                .join(Document, DocumentChunk.document_id == Document.id)
                .where(DocumentChunk.candidate_id == candidate_id)
            )
            if document_type:
                stmt = stmt.where(Document.document_type == document_type)

            result = await self.db.execute(stmt)
            rows = result.all()

            q_vec = np.array(query_vector, dtype=np.float32)
            q_norm = np.linalg.norm(q_vec) or 1.0

            scored = []
            for chunk, doc in rows:
                if chunk.embedding is not None:
                    c_vec = np.array(chunk.embedding, dtype=np.float32)
                    c_norm = np.linalg.norm(c_vec) or 1.0
                    sim = float(np.dot(q_vec, c_vec) / (q_norm * c_norm))
                else:
                    sim = 0.0
                scored.append((chunk, doc, max(0.0, min(1.0, round(sim, 4)))))

            scored.sort(key=lambda x: x[2], reverse=True)
            return scored[:top_k]
