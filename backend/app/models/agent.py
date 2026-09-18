"""Agent run models for LangGraph Multi-Agent Studio."""

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import GUID, BaseModel

if TYPE_CHECKING:
    from app.models.job import Job
    from app.models.user import User


class AgentRun(BaseModel):
    __tablename__ = "agent_runs"

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    agent_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="completed", nullable=False)
    summary: Mapped[str] = mapped_column(Text, default="", nullable=False)
    inputs_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    outputs_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    traces_json: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    groundedness_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    citations_json: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    user: Mapped["User"] = relationship("User", lazy="selectin")
    job: Mapped["Job | None"] = relationship("Job", lazy="selectin")
