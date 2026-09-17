"""Candidate Profile endpoints."""

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.profile import CandidateProfileResponse, CandidateProfileUpdate
from app.services.profile import CandidateProfileService

router = APIRouter(prefix="/profile", tags=["Candidate Profile"])


@router.get("/", response_model=CandidateProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Fetch current user's candidate profile."""
    service = CandidateProfileService(db)
    return await service.get_by_user_id(current_user.id)


@router.put("/", response_model=CandidateProfileResponse)
async def update_profile(
    profile_in: CandidateProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update current user's candidate profile."""
    service = CandidateProfileService(db)
    return await service.update_profile(current_user.id, profile_in)
