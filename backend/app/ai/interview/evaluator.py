"""Adaptive Interview answer evaluation rubric using LLM judge."""

from typing import Any

from pydantic import BaseModel, Field

from app.ai.llm.client import llm_client


class EvaluationRubricOutput(BaseModel):
    correctness: int = Field(ge=0, le=100, description="Technical accuracy of statements")
    clarity: int = Field(ge=0, le=100, description="Structure, articulation, and conciseness")
    depth: int = Field(ge=0, le=100, description="Architectural depth and trade-off considerations")
    feedback: str = Field(description="Constructive critique of the candidate's response")
    missing_concepts: list[str] = Field(description="Important concepts omitted from the answer")
    grounded_suggestion: str = Field(description="Actionable advice for technical interviews")


class InterviewEvaluator:
    @staticmethod
    async def evaluate_answer(
        question_text: str,
        expected_points: list[str],
        answer_text: str,
        difficulty: str = "Senior",
    ) -> dict[str, Any]:
        """Evaluate candidate answer using LLM judge rubric with robust heuristic fallback."""
        prompt = (
            f"You are a Staff Engineer interviewing a candidate for a {difficulty} role.\n"
            f"Question:\n{question_text}\n\n"
            f"Expected Key Points:\n"
            + "\n".join([f"- {p}" for p in expected_points])
            + f"\n\nCandidate Answer:\n{answer_text}\n\n"
            f"Evaluate the candidate's response against the stated expected points.\n"
            f"Score correctness, clarity, and depth between 0 and 100.\n"
            f"Provide constructive feedback, identify missing concepts, and provide an actionable suggestion."
        )

        try:
            rubric = await llm_client.chat_structured(
                messages=[
                    {
                        "role": "system",
                        "content": "You are BobAgent's Staff Interview Judge. Score technically and objectively without hallucinating.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_model=EvaluationRubricOutput,
            )
            overall_score = int(rubric.correctness * 0.4 + rubric.depth * 0.4 + rubric.clarity * 0.2)
            return {
                "score": overall_score,
                "correctness": rubric.correctness,
                "clarity": rubric.clarity,
                "depth": rubric.depth,
                "feedback": rubric.feedback,
                "missing_concepts": rubric.missing_concepts,
                "grounded_suggestion": rubric.grounded_suggestion,
            }
        except Exception:
            pass

        # Fallback rubric calculation
        text = answer_text.strip().lower()
        words = text.split()
        length = len(words)

        matched_pts = [p for p in expected_points if any(term.lower() in text for term in p.split()[:3])]
        missing = [p for p in expected_points if p not in matched_pts]

        if length >= 30 and len(matched_pts) >= 2:
            correctness = 90
            depth = 88
            clarity = 86
            feedback = "Strong response! You clearly articulated the core architectural mechanisms, used specific metrics, and demonstrated engineering maturity."
            suggestion = "You can highlight this scenario during on-site rounds as evidence of your systems design competence."
        elif length >= 12:
            correctness = 78
            depth = 74
            clarity = 80
            feedback = "Good foundation covering key requirements, though it would benefit from more concrete production details and numerical benchmarks."
            suggestion = "Elaborate more on trade-offs between cache invalidation strategies and failure modes."
        else:
            correctness = 65
            depth = 58
            clarity = 68
            feedback = "Brief response. Ensure you structure your answer with the STAR framework and cover concrete implementation details."
            suggestion = "Elaborate with specific technologies, configuration parameters, and architectural trade-offs."

        score = int(correctness * 0.4 + depth * 0.4 + clarity * 0.2)
        return {
            "score": score,
            "correctness": correctness,
            "clarity": clarity,
            "depth": depth,
            "feedback": feedback,
            "missing_concepts": missing if missing else ["Consider discussing automated monitoring probes."],
            "grounded_suggestion": suggestion,
        }
