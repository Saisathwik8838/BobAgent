"""Application tracking models for Application Pipeline."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import GUID, BaseModel

if TYPE_CHECKING:
    from app.models.job import Job
    from app.models.resume import Resume


class ApplicationStatus(str, enum.Enum):
    SAVED = "saved"
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Application(BaseModel):
    __tablename__ = "applications"

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    resume_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("resumes.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default=ApplicationStatus.SAVED.value,
        nullable=False,
        index=True,
    )
    applied_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    salary_offered: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships eagerly loaded for greenlet/async safety
    job: Mapped["Job"] = relationship("Job", lazy="selectin")
    resume: Mapped["Resume | None"] = relationship("Resume", lazy="selectin")
    events: Mapped[list["ApplicationEvent"]] = relationship(
        "ApplicationEvent",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="ApplicationEvent.created_at.desc()",
        lazy="selectin",
    )


class ApplicationEvent(BaseModel):
    __tablename__ = "application_events"

    application_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    application: Mapped["Application"] = relationship("Application", back_populates="events")
