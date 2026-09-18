"""Evaluation results model for RAG, generation, and agent metrics."""

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, Boolean, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import GUID, BaseModel

if TYPE_CHECKING:
    from app.models.user import User


class EvaluationResult(BaseModel):
    __tablename__ = "evaluation_results"

    candidate_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    target_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # rag, generation, agent, interview
    target_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # groundedness, faithfulness, latency
    score: Mapped[float] = mapped_column(Float, nullable=False)
    details_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped["User"] = relationship("User", lazy="selectin")
