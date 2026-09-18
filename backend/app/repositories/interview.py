"""Interview repository."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.interview import InterviewAnswer, InterviewQuestion, InterviewSession


class InterviewRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_session(self, session: InterviewSession) -> InterviewSession:
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def get_session(self, session_id: uuid.UUID, candidate_id: uuid.UUID) -> InterviewSession | None:
        stmt = (
            select(InterviewSession)
            .where(InterviewSession.id == session_id, InterviewSession.candidate_id == candidate_id)
            .options(
                selectinload(InterviewSession.questions),
                selectinload(InterviewSession.answers),
            )
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_sessions(self, candidate_id: uuid.UUID) -> list[InterviewSession]:
        stmt = (
            select(InterviewSession)
            .where(InterviewSession.candidate_id == candidate_id)
            .order_by(InterviewSession.created_at.desc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def add_questions(self, questions: list[InterviewQuestion]) -> list[InterviewQuestion]:
        for q in questions:
            self.db.add(q)
        await self.db.commit()
        for q in questions:
            await self.db.refresh(q)
        return questions

    async def get_question(self, question_id: uuid.UUID) -> InterviewQuestion | None:
        stmt = select(InterviewQuestion).where(InterviewQuestion.id == question_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def add_answer(self, answer: InterviewAnswer) -> InterviewAnswer:
        self.db.add(answer)
        await self.db.commit()
        await self.db.refresh(answer)
        return answer
