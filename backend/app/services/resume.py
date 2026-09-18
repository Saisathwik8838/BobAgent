"""ResumeHub service orchestrating parsing, storage, tailoring, and vector indexing."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.parsers import parse_resume_text, tailor_resume_content
from app.models.resume import Resume, ResumeVersion
from app.repositories.job import JobRepository
from app.repositories.resume import ResumeRepository
from app.schemas.rag import RAGIngestRequest
from app.schemas.resume import (
    ResumeCreate,
    ResumeResponse,
    ResumeTailorRequest,
    ResumeTailorResponse,
    ResumeVersionResponse,
)
from app.services.rag import RAGService


class ResumeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.resume_repo = ResumeRepository(db)
        self.job_repo = JobRepository(db)
        self.rag_service = RAGService(db)

    async def create_resume(self, candidate_id: uuid.UUID, resume_in: ResumeCreate) -> ResumeResponse:
        parsed_data = parse_resume_text(resume_in.raw_text)

        resume = Resume(
            candidate_id=candidate_id,
            title=resume_in.title,
            file_name=resume_in.file_name or "uploaded_resume.txt",
            raw_text=resume_in.raw_text,
            parsed_json=parsed_data,
            is_primary=resume_in.is_primary,
        )
        created = await self.resume_repo.create_resume(resume)

        # Ingest into Vector RAG knowledge base for grounding
        try:
            await self.rag_service.ingest_document(
                candidate_id=candidate_id,
                request=RAGIngestRequest(
                    title=f"Resume: {created.title}",
                    document_type="resume",
                    content=created.raw_text,
                    metadata={"resume_id": str(created.id)},
                ),
            )
        except Exception as e:
            from app.core.logging import logger
            logger.warning("RAG vector ingestion failed", error=str(e))

        return ResumeResponse.model_validate(created)

    async def list_resumes(self, candidate_id: uuid.UUID) -> list[ResumeResponse]:
        resumes = await self.resume_repo.list_resumes(candidate_id)
        return [ResumeResponse.model_validate(r) for r in resumes]

    async def get_resume(self, resume_id: uuid.UUID, candidate_id: uuid.UUID) -> ResumeResponse:
        resume = await self.resume_repo.get_resume_by_id(resume_id, candidate_id)
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        return ResumeResponse.model_validate(resume)

    async def tailor_resume(
        self, resume_id: uuid.UUID, candidate_id: uuid.UUID, tailor_req: ResumeTailorRequest
    ) -> ResumeTailorResponse:
        resume = await self.resume_repo.get_resume_by_id(resume_id, candidate_id)
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

        job = await self.job_repo.get_job_by_id(tailor_req.job_id, candidate_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")

        # Tailor without fabrication
        skills_to_target = (job.mandatory_skills or []) + (job.preferred_skills or [])
        tailored_result = tailor_resume_content(
            resume_raw=resume.raw_text,
            resume_parsed=resume.parsed_json,
            job_title=job.title,
            job_skills=skills_to_target,
        )

        next_version_num = len(resume.versions) + 1
        new_version = ResumeVersion(
            resume_id=resume.id,
            job_id=job.id,
            version_number=next_version_num,
            target_role=f"{job.company} — {job.title}",
            tailored_content_json=tailored_result["tailored_sections"],
            diff_summary=tailored_result["diff_summary"],
        )
        saved_version = await self.resume_repo.add_version(new_version)

        return ResumeTailorResponse(
            version=ResumeVersionResponse.model_validate(saved_version),
            grounded_evidence_cited=resume.parsed_json.get("experience", [])[:3],
            diff_summary=tailored_result["diff_summary"],
        )

    async def delete_resume(self, resume_id: uuid.UUID, candidate_id: uuid.UUID) -> bool:
        deleted = await self.resume_repo.delete_resume(resume_id, candidate_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        return True
