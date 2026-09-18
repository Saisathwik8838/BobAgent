"""Adaptive Interview Simulator endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.interview import (
    AnswerEvaluationResponse,
    InterviewAnswerRequest,
    InterviewSessionResponse,
    InterviewStartRequest,
)
from app.services.interview import InterviewService

router = APIRouter(prefix="/interview", tags=["Interview Simulator"])


@router.post("/sessions", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_interview_session(
    request: InterviewStartRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Initialize a realistic practice interview session tailored to target job requirements."""
    service = InterviewService(db)
    return await service.start_session(current_user, request)


@router.post("/evaluate", response_model=AnswerEvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_answer(
    request: InterviewAnswerRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Evaluate candidate answer against rigorous criteria (correctness, clarity, depth)."""
    service = InterviewService(db)
    return await service.evaluate_answer(current_user, request)
