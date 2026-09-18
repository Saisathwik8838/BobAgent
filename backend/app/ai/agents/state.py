"""Typed state definitions for LangGraph Multi-Agent Workflows."""

from typing import Any, TypedDict


class Requirement(TypedDict, total=False):
    skill: str
    category: str
    is_mandatory: bool
    experience_years: int | None


class EvidenceChunk(TypedDict, total=False):
    chunk_id: str
    document_title: str
    content: str
    similarity: float
    skills: list[str]


class SkillMatch(TypedDict, total=False):
    skill: str
    status: str  # "matched" | "partial" | "missing"
    evidence_chunk_id: str | None
    citation: str | None


class SkillGap(TypedDict, total=False):
    skill: str
    gap_type: str
    recommendation: str


class WorkflowState(TypedDict, total=False):
    candidate_id: str
    job_id: str | None
    agent_type: str  # "job_scout" | "application_assistant" | "prep_coach"
    job_title: str
    job_company: str
    job_requirements: list[dict[str, Any]]
    candidate_skills: list[str]
    candidate_evidence: list[dict[str, Any]]
    matched_requirements: list[dict[str, Any]]
    skill_gaps: list[dict[str, Any]]
    research: dict[str, Any] | None
    generated_outputs: dict[str, Any]
    evaluation: dict[str, Any] | None
    errors: list[str]
    iteration_count: int
    max_iterations: int
    traces: list[dict[str, Any]]
    groundedness_score: float
    citations: list[str]
    summary: str
    status: str
