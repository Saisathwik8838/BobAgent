"""Pydantic schemas for Applications Pipeline."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.job import JobResponse


class ApplicationEventResponse(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    event_type: str
    description: str
    metadata_json: dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    job_id: uuid.UUID
    resume_id: uuid.UUID | None = None
    status: str = Field("saved", description="Application status (saved, applied, interviewing, offer, rejected, withdrawn)")
    notes: str = ""
    applied_date: datetime | None = None
    salary_offered: str | None = None
    contact_name: str | None = None
    contact_email: str | None = None


class ApplicationUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None
    resume_id: uuid.UUID | None = None
    applied_date: datetime | None = None
    salary_offered: str | None = None
    contact_name: str | None = None
    contact_email: str | None = None


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    job_id: uuid.UUID
    resume_id: uuid.UUID | None
    status: str
    applied_date: datetime | None
    notes: str
    salary_offered: str | None
    contact_name: str | None
    contact_email: str | None
    created_at: datetime
    updated_at: datetime
    job: JobResponse | None = None
    events: list[ApplicationEventResponse] = []

    model_config = ConfigDict(from_attributes=True)
