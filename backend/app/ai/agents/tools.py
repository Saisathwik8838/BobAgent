"""Allow-listed tools for LangGraph Multi-Agent Studio."""

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.rag.embeddings import embedding_service
from app.repositories.job import JobRepository
from app.repositories.profile import CandidateProfileRepository
from app.repositories.rag import RAGRepository
from app.repositories.resume import ResumeRepository


class AgentTools:
    """Allow-listed parameterized tools with strict validation and user scoping."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.rag_repo = RAGRepository(db)
        self.job_repo = JobRepository(db)
        self.profile_repo = CandidateProfileRepository(db)
        self.resume_repo = ResumeRepository(db)

    async def retrieve_candidate_evidence(
        self, candidate_id: uuid.UUID, query: str, top_k: int = 4
    ) -> list[dict[str, Any]]:
        """Retrieve attributable candidate evidence chunks from pgvector."""
        query_vector = await embedding_service.get_embedding(query)
        matches_raw = await self.rag_repo.query_similar_chunks(
            candidate_id=candidate_id,
            query_vector=query_vector,
            top_k=top_k,
        )
        results = []
        for chunk, doc, sim in matches_raw:
            results.append({
                "chunk_id": str(chunk.id),
                "document_title": doc.title,
                "document_type": doc.document_type,
                "content": chunk.content,
                "similarity": round(float(sim), 4),
            })
        return results

    async def get_job(self, job_id: uuid.UUID, candidate_id: uuid.UUID) -> dict[str, Any] | None:
        """Fetch targeted job details and requirements."""
        job = await self.job_repo.get_job_by_id(job_id, candidate_id)
        if not job:
            return None
        return {
            "id": str(job.id),
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "mandatory_skills": job.mandatory_skills,
            "preferred_skills": job.preferred_skills,
            "responsibilities": job.responsibilities,
            "description": job.description[:1000] if job.description else "",
        }

    async def search_job_information(
        self, candidate_id: uuid.UUID, limit: int = 5
    ) -> list[dict[str, Any]]:
        """Retrieve target jobs from candidate's ingested pipeline."""
        jobs = await self.job_repo.list_jobs(candidate_id)
        if limit:
            jobs = jobs[:limit]
        return [
            {
                "id": str(j.id),
                "title": j.title,
                "company": j.company,
                "mandatory_skills": j.mandatory_skills,
                "preferred_skills": j.preferred_skills,
            }
            for j in jobs
        ]

    async def search_candidate_projects(self, candidate_id: uuid.UUID) -> list[dict[str, Any]]:
        """Retrieve candidate verified projects from profile and parsed resumes."""
        profile = await self.profile_repo.get_by_user_id(candidate_id)
        resumes = await self.resume_repo.list_resumes(candidate_id)

        projects = []
        if profile and profile.metadata_json:
            for p in profile.metadata_json.get("projects", []):
                projects.append({
                    "name": p.get("name", "Verified Project"),
                    "description": p.get("description", ""),
                    "technologies": p.get("technologies", []),
                    "source": "Candidate Profile",
                })

        for r in resumes:
            if r.parsed_json and "projects" in r.parsed_json:
                for p in r.parsed_json.get("projects", []):
                    if isinstance(p, dict):
                        projects.append({
                            "name": p.get("name", p.get("title", "Project")),
                            "description": p.get("description", p.get("summary", "")),
                            "technologies": p.get("technologies", []),
                            "source": f"Resume: {r.title}",
                        })
        return projects

    @staticmethod
    def calculate_skill_gap(
        candidate_skills: list[str],
        mandatory_skills: list[str],
        preferred_skills: list[str],
    ) -> dict[str, Any]:
        """Perform exact & partial matching to compute skill gaps."""
        cand_set = {s.lower().strip() for s in candidate_skills}
        matched = []
        missing = []

        for req in mandatory_skills:
            req_clean = req.lower().strip()
            if any(req_clean in c or c in req_clean for c in cand_set):
                matched.append({"skill": req, "type": "mandatory", "status": "matched"})
            else:
                missing.append({
                    "skill": req,
                    "type": "mandatory",
                    "status": "missing",
                    "recommendation": f"Acquire production project experience or coursework in {req}.",
                })

        for pref in preferred_skills:
            pref_clean = pref.lower().strip()
            if any(pref_clean in c or c in pref_clean for c in cand_set):
                matched.append({"skill": pref, "type": "preferred", "status": "matched"})
            else:
                missing.append({
                    "skill": pref,
                    "type": "preferred",
                    "status": "missing",
                    "recommendation": f"Familiarize with core concepts and tooling of {pref}.",
                })

        match_score = int((len(matched) / max(len(mandatory_skills) + len(preferred_skills), 1)) * 100)
        return {
            "match_score": match_score,
            "matched": matched,
            "missing": missing,
        }
