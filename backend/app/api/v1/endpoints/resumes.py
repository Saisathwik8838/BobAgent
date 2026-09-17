"""ResumeHub endpoints."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.resume import (
    ResumeCreate,
    ResumeResponse,
    ResumeTailorRequest,
    ResumeTailorResponse,
)
from app.services.resume import ResumeService

router = APIRouter(prefix="/resumes", tags=["Resume Hub"])


@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    resume_in: ResumeCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Upload and parse candidate resume."""
    service = ResumeService(db)
    return await service.create_resume(current_user.id, resume_in)


@router.get("", response_model=list[ResumeResponse])
async def list_resumes(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all candidate resumes with version history."""
    service = ResumeService(db)
    return await service.list_resumes(current_user.id)


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get single resume with parsed fields and versions."""
    service = ResumeService(db)
    return await service.get_resume(resume_id, current_user.id)


@router.post("/{resume_id}/tailor", response_model=ResumeTailorResponse)
async def tailor_resume(
    resume_id: uuid.UUID,
    tailor_req: ResumeTailorRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Produce tailored resume draft against target job without experience fabrication."""
    service = ResumeService(db)
    return await service.tailor_resume(resume_id, current_user.id, tailor_req)


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete resume."""
    service = ResumeService(db)
    await service.delete_resume(resume_id, current_user.id)
    return {"status": "deleted", "id": str(resume_id)}
