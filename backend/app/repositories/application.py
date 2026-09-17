"""Applications Pipeline repository."""

import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.application import Application, ApplicationEvent


class ApplicationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_application(self, application: Application) -> Application:
        self.db.add(application)
        await self.db.commit()
        await self.db.refresh(application)
        return application

    async def list_applications(
        self, candidate_id: uuid.UUID, status: str | None = None
    ) -> list[Application]:
        stmt = (
            select(Application)
            .options(
                selectinload(Application.job),
                selectinload(Application.resume),
                selectinload(Application.events),
            )
            .where(Application.candidate_id == candidate_id)
        )
        if status:
            stmt = stmt.where(Application.status == status)
        stmt = stmt.order_by(Application.updated_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_application_by_id(
        self, app_id: uuid.UUID, candidate_id: uuid.UUID
    ) -> Application | None:
        stmt = (
            select(Application)
            .options(
                selectinload(Application.job),
                selectinload(Application.resume),
                selectinload(Application.events),
            )
            .where(Application.id == app_id, Application.candidate_id == candidate_id)
            .execution_options(populate_existing=True)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_application(self, application: Application) -> Application:
        await self.db.commit()
        await self.db.refresh(application)
        return await self.get_application_by_id(application.id, application.candidate_id)  # type: ignore

    async def add_event(self, event: ApplicationEvent) -> ApplicationEvent:
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        return event

    async def delete_application(self, app_id: uuid.UUID, candidate_id: uuid.UUID) -> bool:
        stmt = delete(Application).where(
            Application.id == app_id, Application.candidate_id == candidate_id
        )
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.rowcount > 0
