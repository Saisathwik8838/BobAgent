"""Vector RAG API endpoints."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.rag import (
    RAGDocumentResponse,
    RAGIngestRequest,
    RAGQueryRequest,
    RAGQueryResponse,
)
from app.services.rag import RAGService

router = APIRouter(prefix="/rag", tags=["Vector RAG"])


@router.post("/ingest", response_model=RAGDocumentResponse, status_code=status.HTTP_201_CREATED)
async def ingest_document(
    request: RAGIngestRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Chunk, embed, and store document in vector database."""
    service = RAGService(db)
    return await service.ingest_document(current_user.id, request)


@router.get("/documents", response_model=list[RAGDocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all ingested documents and their chunk counts."""
    service = RAGService(db)
    return await service.list_documents(current_user.id)


@router.post("/query", response_model=RAGQueryResponse)
async def query_knowledge_base(
    query_req: RAGQueryRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Perform semantic search against candidate vector knowledge store."""
    service = RAGService(db)
    return await service.query_knowledge_base(current_user.id, query_req)


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete document and its vector chunks."""
    service = RAGService(db)
    await service.delete_document(document_id, current_user.id)
    return {"status": "deleted", "id": str(document_id)}
