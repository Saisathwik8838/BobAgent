"""Adaptive Interview question generation logic."""

from typing import Any

from pydantic import BaseModel, Field

from app.ai.llm.client import llm_client


class GeneratedQuestion(BaseModel):
    question_text: str = Field(description="Scenario or technical interview question")
    category: str = Field(description="Category e.g. System Design, Technical Deep-Dive, Behavioral")
    expected_points: list[str] = Field(description="Key concepts a strong candidate should mention")


class GeneratedQuestionsBatch(BaseModel):
    questions: list[GeneratedQuestion] = Field(description="List of 3 interview questions")


class InterviewGenerator:
    @staticmethod
    async def generate_questions(
        role_title: str,
        difficulty: str,
        skills: list[str],
        job_description: str | None = None,
    ) -> list[dict[str, Any]]:
        """Generate role-targeted interview questions via LLM with fallback."""
        prompt = (
            f"You are a Principal Engineering Interviewer conducting a {difficulty}-level interview for '{role_title}'.\n"
            f"Target Skills: {', '.join(skills[:6]) if skills else 'Software Engineering, System Design'}.\n"
            f"Context: {job_description[:400] if job_description else 'Modern distributed cloud applications'}.\n\n"
            f"Generate exactly 3 scenario-based questions:\n"
            f"1. System Architecture & Scalability\n"
            f"2. Deep Technical Implementation / Framework Internals\n"
            f"3. Behavioral / Production Incident Resolution (STAR framework)\n"
            f"Include 3-4 specific expected points for each."
        )

        try:
            batch = await llm_client.chat_structured(
                messages=[
                    {"role": "system", "content": "You are BobAgent's Principal Interviewer AI. Output structured questions."},
                    {"role": "user", "content": prompt},
                ],
                response_model=GeneratedQuestionsBatch,
            )
            if batch.questions and len(batch.questions) >= 3:
                return [q.model_dump() for q in batch.questions[:3]]
        except Exception:
            pass

        # Robust domain fallback
        primary_skill = skills[0] if skills else "Python"
        second_skill = skills[1] if len(skills) > 1 else "PostgreSQL"
        return [
            {
                "question_text": f"How would you design a high-throughput, low-latency API in {primary_skill} and {second_skill} that guarantees zero connection exhaustion under 10,000 RPS?",
                "category": "System Architecture & Scalability",
                "expected_points": [
                    "Connection pooling via asyncpg (min_size, max_size) and PgBouncer",
                    "Redis caching layer for read-heavy query paths",
                    "Asynchronous non-blocking I/O execution",
                    "Health monitoring probes and circuit breakers",
                ],
            },
            {
                "question_text": "Explain how you implement cosine similarity search with pgvector and HNSW indexing, and how you evaluate retrieval groundedness against candidate ground-truth.",
                "category": "AI / Vector Retrieval",
                "expected_points": [
                    "HNSW index parameters (m, ef_construction)",
                    "L2 normalization of embedding vectors for cosine similarity",
                    "Cosine distance (<=> operator) in SQL queries",
                    "Attribution back to exact chunk and parent document IDs",
                ],
            },
            {
                "question_text": f"Tell me about a time you resolved a critical production issue in a distributed {primary_skill} application. How did you diagnose it and what safeguard did you implement?",
                "category": "Behavioral & Problem Solving",
                "expected_points": [
                    "Clear STAR framework (Situation, Task, Action, Result)",
                    "Root cause analysis using structured logs and APM tracing",
                    "Implementing automated regression tests in CI",
                    "Post-mortem documentation and prevention safeguards",
                ],
            },
        ]
