"""Pydantic schemas for ResumeHub."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ResumeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    file_name: str | None = None
    raw_text: str = Field(..., min_length=10)
    is_primary: bool = True


class ResumeCreate(ResumeBase):
    pass


class ResumeVersionResponse(BaseModel):
    id: uuid.UUID
    resume_id: uuid.UUID
    job_id: uuid.UUID | None
    version_number: int
    target_role: str
    tailored_content_json: dict[str, Any]
    diff_summary: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeResponse(ResumeBase):
    id: uuid.UUID
    candidate_id: uuid.UUID
    parsed_json: dict[str, Any]
    versions: list[ResumeVersionResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeTailorRequest(BaseModel):
    job_id: uuid.UUID
    target_role: str | None = None
    focus_areas: list[str] | None = None


class ResumeTailorResponse(BaseModel):
    version: ResumeVersionResponse
    grounded_evidence_cited: list[str]
    diff_summary: str
