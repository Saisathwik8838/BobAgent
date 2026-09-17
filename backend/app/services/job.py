"""Job Intelligence service."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.parsers import match_resume_to_job, parse_job_description
from app.models.job import Job
from app.repositories.job import JobRepository
from app.repositories.resume import ResumeRepository
from app.schemas.job import JobCreate, JobMatchResponse, JobResponse


class JobService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.job_repo = JobRepository(db)
        self.resume_repo = ResumeRepository(db)

    async def create_job(self, candidate_id: uuid.UUID, job_in: JobCreate) -> JobResponse:
        parsed_data = parse_job_description(job_in.raw_description)

        job = Job(
            candidate_id=candidate_id,
            title=job_in.title,
            company=job_in.company,
            url=job_in.url,
            raw_description=job_in.raw_description,
            seniority=job_in.seniority or parsed_data["seniority"],
            location=job_in.location,
            salary_range=job_in.salary_range or parsed_data["salary_range"],
            mandatory_skills=parsed_data["mandatory_skills"],
            preferred_skills=parsed_data["preferred_skills"],
            responsibilities=parsed_data["responsibilities"],
            parsed_requirements_json=parsed_data,
        )
        created = await self.job_repo.create_job(job)
        return JobResponse.model_validate(created)

    async def list_jobs(self, candidate_id: uuid.UUID) -> list[JobResponse]:
        jobs = await self.job_repo.list_jobs(candidate_id)
        return [JobResponse.model_validate(j) for j in jobs]

    async def get_job(self, job_id: uuid.UUID, candidate_id: uuid.UUID) -> JobResponse:
        job = await self.job_repo.get_job_by_id(job_id, candidate_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        return JobResponse.model_validate(job)

    async def match_job_to_resume(
        self, job_id: uuid.UUID, candidate_id: uuid.UUID, resume_id: uuid.UUID | None = None
    ) -> JobMatchResponse:
        job = await self.job_repo.get_job_by_id(job_id, candidate_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

        # Pick resume
        resumes = await self.resume_repo.list_resumes(candidate_id)
        if not resumes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No resumes uploaded. Please upload a resume in Resume Hub first.",
            )

        if resume_id:
            target_resume = next((r for r in resumes if r.id == resume_id), None)
            if not target_resume:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified resume not found")
        else:
            target_resume = next((r for r in resumes if r.is_primary), resumes[0])

        match_result = match_resume_to_job(
            resume_data=target_resume.parsed_json,
            job_data=job.parsed_requirements_json,
        )

        return JobMatchResponse(
            job_id=job.id,
            resume_id=target_resume.id,
            match_percentage=match_result["match_percentage"],
            matched_skills=match_result["matched_skills"],
            missing_skills=match_result["missing_skills"],
            match_rationale=match_result["match_rationale"],
            evidence_citations=match_result["evidence_citations"],
        )

    async def delete_job(self, job_id: uuid.UUID, candidate_id: uuid.UUID) -> bool:
        deleted = await self.job_repo.delete_job(job_id, candidate_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        return True
