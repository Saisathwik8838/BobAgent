"""Applications Pipeline endpoints."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.services.application import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications Pipeline"])


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Track a new job application in the pipeline."""
    service = ApplicationService(db)
    return await service.create_application(current_user.id, app_in)


@router.get("", response_model=list[ApplicationResponse])
async def list_applications(
    status_filter: str | None = Query(None, alias="status", description="Filter by status (saved, applied, interviewing, offer, rejected, withdrawn)"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all candidate applications, optionally filtered by pipeline stage."""
    service = ApplicationService(db)
    return await service.list_applications(current_user.id, status_filter)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get single application details with audit event timeline."""
    service = ApplicationService(db)
    return await service.get_application(application_id, current_user.id)


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: uuid.UUID,
    update_in: ApplicationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update application stage, notes, or contact info, recording stage transition events."""
    service = ApplicationService(db)
    return await service.update_application(application_id, current_user.id, update_in)


@router.delete("/{application_id}")
async def delete_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete an application from the pipeline."""
    service = ApplicationService(db)
    await service.delete_application(application_id, current_user.id)
    return {"status": "deleted", "id": str(application_id)}
