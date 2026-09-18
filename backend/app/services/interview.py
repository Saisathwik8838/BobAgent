"""Service layer for Adaptive Interview Simulator."""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.job import JobRepository
from app.schemas.interview import (
    AnswerEvaluationResponse,
    InterviewAnswerRequest,
    InterviewQuestion,
    InterviewSessionResponse,
    InterviewStartRequest,
)


class InterviewService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.job_repo = JobRepository(db)

    async def start_session(
        self, user: User, request: InterviewStartRequest
    ) -> InterviewSessionResponse:
        session_id = uuid.uuid4()
        role = request.role_title

        if request.job_id:
            job = await self.job_repo.get_job_by_id(request.job_id, user.id)
            if job:
                role = f"{job.title} at {job.company}"

        questions = [
            InterviewQuestion(
                id="q-1",
                question_text=f"How would you design a high-throughput, low-latency API in FastAPI and PostgreSQL that guarantees zero database connection exhaustion under 10,000 RPS?",
                category="System Architecture & Scalability",
                expected_points=[
                    "Connection pooling via asyncpg (min_size, max_size)",
                    "PgBouncer transaction-level pooling",
                    "Redis caching layer for read-heavy endpoints",
                    "Async execution with non-blocking I/O",
                ],
            ),
            InterviewQuestion(
                id="q-2",
                question_text="Explain how you implement cosine similarity search with pgvector and HNSW indexing, and how you evaluate retrieval groundedness against candidate ground-truth.",
                category="AI / Vector Retrieval",
                expected_points=[
                    "HNSW index parameters (m, ef_construction)",
                    "L2 normalization of embedding vectors for cosine similarity",
                    "Cosine distance (<=> operator) in SQL queries",
                    "Attribution back to exact chunk and parent document IDs",
                ],
            ),
            InterviewQuestion(
                id="q-3",
                question_text="Tell me about a time you resolved a critical production bug in a distributed async application. How did you diagnose it and what safeguard did you implement?",
                category="Behavioral & Problem Solving",
                expected_points=[
                    "Clear STAR framework (Situation, Task, Action, Result)",
                    "Root cause analysis using structured logs and APM tracing",
                    "Implementing automated regression tests in CI",
                    "Communication with stakeholders during the incident",
                ],
            ),
        ]

        return InterviewSessionResponse(
            session_id=session_id,
            role_title=role,
            difficulty=request.difficulty,
            questions=questions,
        )

    async def evaluate_answer(
        self, user: User, request: InterviewAnswerRequest
    ) -> AnswerEvaluationResponse:
        text = request.answer_text.strip()
        length = len(text.split())

        # Scoring heuristics based on technical depth and keywords
        has_architecture_terms = any(
            k in text.lower()
            for k in ["pool", "cache", "async", "index", "pgvector", "redis", "latency", "hnsw", "star"]
        )
        has_metrics = any(char.isdigit() for char in text)

        if length >= 35 and has_architecture_terms and has_metrics:
            score = 92
            correctness = 94
            clarity = 90
            depth = 92
            feedback = "Excellent response! You clearly articulated the core architectural mechanisms, used specific metrics, and demonstrated production engineering maturity."
            missing = ["Consider also mentioning health-check monitoring probes in Kubernetes."]
            suggestion = "You can highlight this exact scenario during on-site rounds as evidence of your systems design competence."
        elif length >= 10 and has_architecture_terms:
            score = 82
            correctness = 84
            clarity = 82
            depth = 80
            feedback = "Solid answer covering the main requirements. Good use of technical terminology."
            missing = ["Include concrete numerical benchmarks (e.g. latency reduced by X ms or RPS supported)."]
            suggestion = "Elaborate more on trade-offs between cache invalidation strategies."
        else:
            score = 65
            correctness = 68
            clarity = 70
            depth = 58
            feedback = "Fair attempt, but the response needs more architectural depth and concrete technical implementation details."
            missing = [
                "Specific connection pooling settings or PgBouncer architecture",
                "Concrete error handling and circuit breaker mechanisms",
            ]
            suggestion = "Structure your answer using the STAR method: Situation, Task, Action taken, and quantitative Result achieved."

        return AnswerEvaluationResponse(
            question_id=request.question_id,
            score=score,
            correctness=correctness,
            clarity=clarity,
            depth=depth,
            feedback=feedback,
            missing_concepts=missing,
            grounded_suggestion=suggestion,
        )
