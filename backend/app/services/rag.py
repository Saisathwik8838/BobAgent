"""Vector RAG service orchestrating chunking, embedding, storage, and retrieval."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.rag.chunker import chunker
from app.ai.rag.embeddings import embedding_service
from app.repositories.rag import RAGRepository
from app.schemas.rag import (
    RAGDocumentResponse,
    RAGIngestRequest,
    RAGQueryMatch,
    RAGQueryRequest,
    RAGQueryResponse,
)


class RAGService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rag_repo = RAGRepository(db)

    async def ingest_document(
        self, candidate_id: uuid.UUID, request: RAGIngestRequest
    ) -> RAGDocumentResponse:
        """Ingest raw document content: chunk -> embed -> save to pgvector."""
        # 1. Chunk document according to document type
        chunks_data = chunker.chunk_document(
            content=request.content,
            document_type=request.document_type,
        )

        if not chunks_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document content is empty or could not be chunked.",
            )

        # Merge request metadata into chunk metadata
        for ch in chunks_data:
            ch["metadata"].update(request.metadata)

        # 2. Generate embedding vectors
        texts_to_embed = [ch["content"] for ch in chunks_data]
        embeddings = await embedding_service.get_embeddings(texts_to_embed)

        # 3. Save to database
        doc = await self.rag_repo.create_document(
            candidate_id=candidate_id,
            title=request.title,
            document_type=request.document_type,
            raw_content=request.content,
            chunks_data=chunks_data,
            embeddings=embeddings,
        )

        return RAGDocumentResponse(
            id=doc.id,
            candidate_id=doc.candidate_id,
            title=doc.title,
            document_type=doc.document_type,
            chunk_count=len(chunks_data),
            created_at=doc.created_at,
            updated_at=doc.updated_at,
        )

    async def list_documents(
        self, candidate_id: uuid.UUID
    ) -> list[RAGDocumentResponse]:
        """List all candidate documents with chunk totals."""
        docs_with_counts = await self.rag_repo.get_documents_by_candidate(candidate_id)
        return [
            RAGDocumentResponse(
                id=doc.id,
                candidate_id=doc.candidate_id,
                title=doc.title,
                document_type=doc.document_type,
                chunk_count=chunk_count,
                created_at=doc.created_at,
                updated_at=doc.updated_at,
            )
            for doc, chunk_count in docs_with_counts
        ]

    async def query_knowledge_base(
        self, candidate_id: uuid.UUID, query_req: RAGQueryRequest
    ) -> RAGQueryResponse:
        """Perform semantic similarity query against candidate knowledge base."""
        # 1. Embed query
        query_vector = await embedding_service.get_embedding(query_req.query)

        # 2. Retrieve top-k nearest chunks
        matches_raw = await self.rag_repo.query_similar_chunks(
            candidate_id=candidate_id,
            query_vector=query_vector,
            top_k=query_req.top_k,
            document_type=query_req.document_type,
        )

        # 3. Format response with explicit source attribution
        matches = [
            RAGQueryMatch(
                chunk_id=chunk.id,
                document_id=doc.id,
                document_title=doc.title,
                document_type=doc.document_type,
                content=chunk.content,
                similarity_score=sim,
                metadata=chunk.metadata_json,
            )
            for chunk, doc, sim in matches_raw
        ]

        return RAGQueryResponse(
            query=query_req.query,
            total_matches=len(matches),
            matches=matches,
        )

    async def delete_document(
        self, document_id: uuid.UUID, candidate_id: uuid.UUID
    ) -> bool:
        """Delete document by ID."""
        success = await self.rag_repo.delete_document(document_id, candidate_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or unauthorized.",
            )
        return True
