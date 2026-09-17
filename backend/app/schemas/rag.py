"""Pydantic schemas for Vector RAG ingestion, retrieval, and document management."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class RAGIngestRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    document_type: str = Field(
        default="custom_doc",
        description="Type of document: resume, job, application_note, custom_doc",
    )
    content: str = Field(..., min_length=5)
    metadata: dict[str, Any] = Field(default_factory=dict)


class DocumentChunkResponse(BaseModel):
    id: uuid.UUID
    chunk_index: int
    chunk_type: str
    content: str
    token_count: int
    metadata_json: dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


class RAGDocumentResponse(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    title: str
    document_type: str
    chunk_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RAGQueryRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)
    document_type: str | None = None


class RAGQueryMatch(BaseModel):
    chunk_id: uuid.UUID
    document_id: uuid.UUID
    document_title: str
    document_type: str
    content: str
    similarity_score: float
    metadata: dict[str, Any]


class RAGQueryResponse(BaseModel):
    query: str
    total_matches: int
    matches: list[RAGQueryMatch]
