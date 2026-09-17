"""Job Intelligence repository."""

import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job


class JobRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_job(self, job: Job) -> Job:
        self.db.add(job)
        await self.db.commit()
        await self.db.refresh(job)
        return job

    async def list_jobs(self, candidate_id: uuid.UUID) -> list[Job]:
        stmt = select(Job).where(Job.candidate_id == candidate_id).order_by(Job.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_job_by_id(self, job_id: uuid.UUID, candidate_id: uuid.UUID) -> Job | None:
        stmt = select(Job).where(Job.id == job_id, Job.candidate_id == candidate_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_job(self, job_id: uuid.UUID, candidate_id: uuid.UUID) -> bool:
        stmt = delete(Job).where(Job.id == job_id, Job.candidate_id == candidate_id)
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.rowcount > 0
