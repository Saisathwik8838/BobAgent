"""Pydantic schemas for Adaptive Interview Simulator."""

import uuid
from typing import Any

from pydantic import BaseModel, Field


class InterviewStartRequest(BaseModel):
    job_id: uuid.UUID | None = None
    role_title: str = "Senior Distributed Systems Engineer"
    difficulty: str = "Senior"


class InterviewQuestion(BaseModel):
    id: str
    question_text: str
    category: str
    expected_points: list[str]


class InterviewSessionResponse(BaseModel):
    session_id: uuid.UUID
    role_title: str
    difficulty: str
    questions: list[InterviewQuestion]


class InterviewAnswerRequest(BaseModel):
    session_id: uuid.UUID
    question_id: str
    answer_text: str = Field(..., min_length=5)


class AnswerEvaluationResponse(BaseModel):
    question_id: str
    score: int
    correctness: int
    clarity: int
    depth: int
    feedback: str
    missing_concepts: list[str]
    grounded_suggestion: str
