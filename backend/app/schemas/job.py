"""Pydantic schemas for Job Intelligence."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class JobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    company: str = Field(..., min_length=1, max_length=255)
    url: str | None = None
    raw_description: str = Field(..., min_length=10)
    seniority: str | None = "Mid-Senior"
    location: str | None = None
    salary_range: str | None = None


class JobResponse(BaseModel):
    id: uuid.UUID
    candidate_id: uuid.UUID
    title: str
    company: str
    url: str | None
    raw_description: str
    seniority: str
    location: str | None
    salary_range: str | None
    mandatory_skills: list[str]
    preferred_skills: list[str]
    responsibilities: list[str]
    parsed_requirements_json: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobMatchResponse(BaseModel):
    job_id: uuid.UUID
    resume_id: uuid.UUID
    match_percentage: int
    matched_skills: list[str]
    missing_skills: list[str]
    match_rationale: str
    evidence_citations: list[str]
