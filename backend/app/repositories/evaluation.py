"""Evaluation repository."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evaluation import EvaluationResult


class EvaluationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_result(self, result: EvaluationResult) -> EvaluationResult:
        self.db.add(result)
        await self.db.commit()
        await self.db.refresh(result)
        return result

    async def list_results(
        self, candidate_id: uuid.UUID, target_type: str | None = None, limit: int = 50
    ) -> list[EvaluationResult]:
        stmt = select(EvaluationResult).where(EvaluationResult.candidate_id == candidate_id)
        if target_type:
            stmt = stmt.where(EvaluationResult.target_type == target_type)
        stmt = stmt.order_by(EvaluationResult.created_at.desc()).limit(limit)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())
