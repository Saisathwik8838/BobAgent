"""Resume and version database repository."""

import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.resume import Resume, ResumeVersion


class ResumeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_resume(self, resume: Resume) -> Resume:
        self.db.add(resume)
        await self.db.commit()
        fetched = await self.get_resume_by_id(resume.id, resume.candidate_id)
        return fetched or resume

    async def list_resumes(self, candidate_id: uuid.UUID) -> list[Resume]:
        stmt = (
            select(Resume)
            .where(Resume.candidate_id == candidate_id)
            .options(selectinload(Resume.versions))
            .order_by(Resume.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_resume_by_id(self, resume_id: uuid.UUID, candidate_id: uuid.UUID) -> Resume | None:
        stmt = (
            select(Resume)
            .where(Resume.id == resume_id, Resume.candidate_id == candidate_id)
            .options(selectinload(Resume.versions))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_resume(self, resume_id: uuid.UUID, candidate_id: uuid.UUID) -> bool:
        stmt = delete(Resume).where(Resume.id == resume_id, Resume.candidate_id == candidate_id)
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.rowcount > 0

    async def add_version(self, version: ResumeVersion) -> ResumeVersion:
        self.db.add(version)
        await self.db.commit()
        await self.db.refresh(version)
        return version
