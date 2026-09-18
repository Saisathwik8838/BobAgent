"""Agent run repository."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import AgentRun


class AgentRunRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_run(self, agent_run: AgentRun) -> AgentRun:
        self.db.add(agent_run)
        await self.db.commit()
        await self.db.refresh(agent_run)
        return agent_run

    async def list_runs(self, candidate_id: uuid.UUID, limit: int = 10) -> list[AgentRun]:
        stmt = (
            select(AgentRun)
            .where(AgentRun.candidate_id == candidate_id)
            .order_by(AgentRun.created_at.desc())
            .limit(limit)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_run(self, run_id: uuid.UUID, candidate_id: uuid.UUID) -> AgentRun | None:
        stmt = select(AgentRun).where(AgentRun.id == run_id, AgentRun.candidate_id == candidate_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()
