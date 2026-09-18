"""Adaptive Interview Simulator models."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import GUID, BaseModel

if TYPE_CHECKING:
    from app.models.job import Job
    from app.models.user import User


class InterviewSession(BaseModel):
    __tablename__ = "interview_sessions"

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
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="Senior", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)

    user: Mapped["User"] = relationship("User", lazy="selectin")
    job: Mapped["Job | None"] = relationship("Job", lazy="selectin")
    questions: Mapped[list["InterviewQuestion"]] = relationship(
        "InterviewQuestion",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="InterviewQuestion.order_idx",
        lazy="selectin",
    )
    answers: Mapped[list["InterviewAnswer"]] = relationship(
        "InterviewAnswer",
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class InterviewQuestion(BaseModel):
    __tablename__ = "interview_questions"

    session_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    expected_points: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    order_idx: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    session: Mapped["InterviewSession"] = relationship("InterviewSession", back_populates="questions")
    answers: Mapped[list["InterviewAnswer"]] = relationship(
        "InterviewAnswer",
        back_populates="question",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class InterviewAnswer(BaseModel):
    __tablename__ = "interview_answers"

    session_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("interview_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("interview_questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correctness: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    clarity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    depth: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    feedback: Mapped[str] = mapped_column(Text, default="", nullable=False)
    missing_concepts: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    grounded_suggestion: Mapped[str] = mapped_column(Text, default="", nullable=False)

    session: Mapped["InterviewSession"] = relationship("InterviewSession", back_populates="answers")
    question: Mapped["InterviewQuestion"] = relationship("InterviewQuestion", back_populates="answers")
    user: Mapped["User"] = relationship("User", lazy="selectin")
