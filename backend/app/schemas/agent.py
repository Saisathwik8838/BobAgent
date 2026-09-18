"""Pydantic schemas for LangGraph Multi-Agent Studio."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AgentStepTrace(BaseModel):
    step_number: int
    agent_name: str
    action: str
    status: str = "success"
    tool_called: str | None = None
    observation: str
    duration_ms: int = 150


class AgentRunRequest(BaseModel):
    agent_type: str = Field(..., description="job_scout | application_assistant | prep_coach")
    job_id: uuid.UUID | None = None
    parameters: dict[str, Any] = Field(default_factory=dict)


class AgentRunResponse(BaseModel):
    run_id: uuid.UUID
    agent_type: str
    status: str = "completed"
    summary: str
    outputs: dict[str, Any] = Field(default_factory=dict)
    traces: list[AgentStepTrace] = Field(default_factory=list)
    groundedness_score: float = 0.95
    evidence_citations: list[str] = Field(default_factory=list)
    created_at: datetime
