"""LangGraph Multi-Agent Studio execution service."""


from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agents.state import WorkflowState
from app.ai.agents.tools import AgentTools
from app.ai.agents.workflow import create_agent_workflow
from app.models.agent import AgentRun
from app.models.evaluation import EvaluationResult
from app.models.user import User
from app.repositories.agent import AgentRunRepository
from app.repositories.evaluation import EvaluationRepository
from app.repositories.job import JobRepository
from app.repositories.profile import CandidateProfileRepository
from app.repositories.resume import ResumeRepository
from app.schemas.agent import AgentRunRequest, AgentRunResponse, AgentStepTrace


class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.job_repo = JobRepository(db)
        self.profile_repo = CandidateProfileRepository(db)
        self.resume_repo = ResumeRepository(db)
        self.agent_run_repo = AgentRunRepository(db)
        self.eval_repo = EvaluationRepository(db)
        self.tools = AgentTools(db)

    async def execute_agent(self, user: User, request: AgentRunRequest) -> AgentRunResponse:
        agent_type = request.agent_type.lower()

        # Retrieve candidate background
        profile = await self.profile_repo.get_by_user_id(user.id)
        resumes = await self.resume_repo.list_resumes(user.id)
        primary_resume = next((r for r in resumes if r.is_primary), resumes[0] if resumes else None)

        candidate_skills = ["Python", "FastAPI", "React", "PostgreSQL", "Docker"]
        if profile and profile.metadata_json and profile.metadata_json.get("skills"):
            candidate_skills = profile.metadata_json["skills"]
        elif primary_resume and primary_resume.parsed_json and primary_resume.parsed_json.get("skills"):
            candidate_skills = primary_resume.parsed_json["skills"]

        job = None
        if request.job_id:
            job = await self.job_repo.get_job_by_id(request.job_id, user.id)

        # Initial LangGraph workflow state
        initial_state: WorkflowState = {
            "candidate_id": str(user.id),
            "job_id": str(request.job_id) if request.job_id else None,
            "agent_type": agent_type,
            "job_title": job.title if job else "Senior Systems Engineer",
            "job_company": job.company if job else "Target Technology",
            "candidate_skills": candidate_skills,
            "job_requirements": [],
            "candidate_evidence": [],
            "matched_requirements": [],
            "skill_gaps": [],
            "generated_outputs": {},
            "traces": [],
            "iteration_count": 0,
            "max_iterations": 3,
            "groundedness_score": 1.0,
            "citations": [],
            "summary": "",
            "status": "running",
            "errors": [],
        }

        # Build and execute LangGraph StateGraph
        workflow = create_agent_workflow(self.tools)
        final_state: WorkflowState = await workflow.ainvoke(initial_state)

        # Format traces
        traces = [
            AgentStepTrace(
                step_number=t.get("step_number", idx + 1),
                agent_name=t.get("agent_name", "Agent"),
                action=t.get("action", "Execution"),
                status=t.get("status", "success"),
                tool_called=t.get("tool_called"),
                observation=t.get("observation", ""),
                duration_ms=t.get("duration_ms", 120),
            )
            for idx, t in enumerate(final_state.get("traces", []))
        ]

        groundedness = final_state.get("groundedness_score", 0.95)
        citations = final_state.get("citations", [])
        outputs = final_state.get("generated_outputs", {})
        summary = final_state.get("summary", f"{agent_type.replace('_', ' ').title()} completed successfully.")

        # Persist to database (agent_runs table)
        run_record = AgentRun(
            candidate_id=user.id,
            job_id=request.job_id,
            agent_type=agent_type,
            status="completed",
            summary=summary,
            inputs_json={"job_id": str(request.job_id) if request.job_id else None, "agent_type": agent_type},
            outputs_json=outputs,
            traces_json=[t.model_dump() for t in traces],
            groundedness_score=groundedness,
            citations_json=citations,
        )
        saved_run = await self.agent_run_repo.create_run(run_record)

        # Persist evaluation result to evaluation_results table
        eval_record = EvaluationResult(
            candidate_id=user.id,
            target_type="agent",
            target_id=str(saved_run.id),
            metric_name="groundedness",
            score=groundedness,
            details_json={
                "agent_type": agent_type,
                "traces_count": len(traces),
                "citations_count": len(citations),
            },
            passed=groundedness >= 0.75,
        )
        await self.eval_repo.create_result(eval_record)

        return AgentRunResponse(
            run_id=saved_run.id,
            agent_type=agent_type,
            status="completed",
            summary=summary,
            outputs=outputs,
            traces=traces,
            groundedness_score=groundedness,
            evidence_citations=citations,
            created_at=saved_run.created_at,
        )
