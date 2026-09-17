"""Job Intelligence endpoints."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.job import JobCreate, JobMatchResponse, JobResponse
from app.services.job import JobService

router = APIRouter(prefix="/jobs", tags=["Job Intelligence"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_in: JobCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Ingest and parse target job posting."""
    service = JobService(db)
    return await service.create_job(current_user.id, job_in)


@router.get("", response_model=list[JobResponse])
async def list_jobs(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all candidate ingested jobs."""
    service = JobService(db)
    return await service.list_jobs(current_user.id)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get single job detail with parsed requirements."""
    service = JobService(db)
    return await service.get_job(job_id, current_user.id)


@router.post("/{job_id}/match", response_model=JobMatchResponse)
async def match_job(
    job_id: uuid.UUID,
    resume_id: uuid.UUID | None = Query(None, description="Optional resume ID; defaults to primary resume"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Match job requirements against candidate verified resume evidence."""
    service = JobService(db)
    return await service.match_job_to_resume(job_id, current_user.id, resume_id)


@router.delete("/{job_id}")
async def delete_job(
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete job posting."""
    service = JobService(db)
    await service.delete_job(job_id, current_user.id)
    return {"status": "deleted", "id": str(job_id)}
