"""Candidate Profile service."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import CandidateProfile
from app.repositories.profile import CandidateProfileRepository
from app.schemas.profile import CandidateProfileResponse, CandidateProfileUpdate


class CandidateProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.profile_repo = CandidateProfileRepository(db)

    async def get_by_user_id(self, user_id: uuid.UUID) -> CandidateProfileResponse:
        profile = await self.profile_repo.get_by_user_id(user_id)
        if not profile:
            # Auto-create if not present
            profile = CandidateProfile(
                user_id=user_id,
                headline="AI Candidate Profile",
                summary="",
                metadata_json={},
            )
            profile = await self.profile_repo.create(profile)
        return CandidateProfileResponse.model_validate(profile)

    async def update_profile(
        self, user_id: uuid.UUID, update_data: CandidateProfileUpdate
    ) -> CandidateProfileResponse:
        profile = await self.profile_repo.get_by_user_id(user_id)
        if not profile:
            profile = CandidateProfile(user_id=user_id)
            self.db.add(profile)

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(profile, key, val)

        updated_profile = await self.profile_repo.update(profile)
        return CandidateProfileResponse.model_validate(updated_profile)
