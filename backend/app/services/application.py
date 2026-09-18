"""Service layer for Applications Pipeline."""

import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationEvent
from app.repositories.application import ApplicationRepository
from app.repositories.job import JobRepository
from app.schemas.application import ApplicationCreate, ApplicationUpdate


class ApplicationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ApplicationRepository(db)
        self.job_repo = JobRepository(db)

    async def create_application(
        self, candidate_id: uuid.UUID, app_in: ApplicationCreate
    ) -> Application:
        # Verify job exists
        job = await self.job_repo.get_job_by_id(app_in.job_id, candidate_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job posting {app_in.job_id} not found.",
            )

        applied_date = app_in.applied_date
        if app_in.status == "applied" and not applied_date:
            applied_date = datetime.now(UTC)

        app_obj = Application(
            candidate_id=candidate_id,
            job_id=app_in.job_id,
            resume_id=app_in.resume_id,
            status=app_in.status.lower(),
            applied_date=applied_date,
            notes=app_in.notes,
            salary_offered=app_in.salary_offered,
            contact_name=app_in.contact_name,
            contact_email=app_in.contact_email,
        )
        saved_app = await self.repo.create_application(app_obj)

        # Log creation event
        event = ApplicationEvent(
            application_id=saved_app.id,
            event_type="application_created",
            description=f"Application created for {job.company} ({job.title}) in stage '{app_obj.status.upper()}'.",
            metadata_json={"initial_status": app_obj.status},
        )
        await self.repo.add_event(event)

        # Return fresh application with event
        refreshed = await self.repo.get_application_by_id(saved_app.id, candidate_id)
        return refreshed or saved_app

    async def list_applications(
        self, candidate_id: uuid.UUID, status_filter: str | None = None
    ) -> list[Application]:
        return await self.repo.list_applications(candidate_id, status_filter)

    async def get_application(
        self, app_id: uuid.UUID, candidate_id: uuid.UUID
    ) -> Application:
        app_obj = await self.repo.get_application_by_id(app_id, candidate_id)
        if not app_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found.",
            )
        return app_obj

    async def update_application(
        self, app_id: uuid.UUID, candidate_id: uuid.UUID, update_in: ApplicationUpdate
    ) -> Application:
        app_obj = await self.repo.get_application_by_id(app_id, candidate_id)
        if not app_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found.",
            )

        events_to_add: list[ApplicationEvent] = []

        if update_in.status and update_in.status.lower() != app_obj.status.lower():
            old_status = app_obj.status
            new_status = update_in.status.lower()
            app_obj.status = new_status
            if new_status == "applied" and not app_obj.applied_date:
                app_obj.applied_date = datetime.now(UTC)
            events_to_add.append(
                ApplicationEvent(
                    application_id=app_obj.id,
                    event_type="status_changed",
                    description=f"Application moved from '{old_status.upper()}' to '{new_status.upper()}'.",
                    metadata_json={"old_status": old_status, "new_status": new_status},
                )
            )

        if update_in.notes is not None and update_in.notes != app_obj.notes:
            app_obj.notes = update_in.notes
            events_to_add.append(
                ApplicationEvent(
                    application_id=app_obj.id,
                    event_type="notes_updated",
                    description="Application notes updated.",
                    metadata_json={},
                )
            )

        if update_in.resume_id is not None:
            app_obj.resume_id = update_in.resume_id

        if update_in.applied_date is not None:
            app_obj.applied_date = update_in.applied_date

        if update_in.salary_offered is not None:
            app_obj.salary_offered = update_in.salary_offered

        if update_in.contact_name is not None:
            app_obj.contact_name = update_in.contact_name

        if update_in.contact_email is not None:
            app_obj.contact_email = update_in.contact_email

        updated = await self.repo.update_application(app_obj)

        for ev in events_to_add:
            await self.repo.add_event(ev)

        refreshed = await self.repo.get_application_by_id(app_id, candidate_id)
        return refreshed or updated

    async def delete_application(self, app_id: uuid.UUID, candidate_id: uuid.UUID) -> None:
        deleted = await self.repo.delete_application(app_id, candidate_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found.",
            )
