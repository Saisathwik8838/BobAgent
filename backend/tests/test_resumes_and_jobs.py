"""Unit and integration tests for ResumeHub and Job Intelligence."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_resume_and_job_lifecycle(client: AsyncClient):
    # 1. Register candidate user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "career_builder@example.com",
            "password": "SecurePassword123!",
            "full_name": "Carol Builder",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload/Create Resume
    resume_raw = """Carol Builder
carol.builder@example.com | (555) 234-5678

EXPERIENCE
Senior Python & Distributed Systems Engineer at CloudScale:
- Built high-concurrency microservices in Python with FastAPI and PostgreSQL.
- Implemented Docker containerization and Kubernetes cluster deployments on AWS.
- Managed Redis pub/sub messaging pipelines for real-time telemetry.

EDUCATION
B.S. in Computer Engineering, MIT"""

    res_create = await client.post(
        "/api/v1/resumes",
        json={
            "title": "Principal Systems Resume",
            "raw_text": resume_raw,
            "is_primary": True,
        },
        headers=headers,
    )
    assert res_create.status_code == 201
    resume = res_create.json()
    assert resume["title"] == "Principal Systems Resume"
    assert "Python" in resume["parsed_json"]["skills"]
    assert "Fastapi" in resume["parsed_json"]["skills"]
    assert len(resume["parsed_json"]["experience"]) >= 1
    resume_id = resume["id"]

    # 3. List resumes
    res_list = await client.get("/api/v1/resumes", headers=headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1

    # 4. Ingest Job Posting
    job_raw = """Title: Lead Backend Engineer
Company: AnthroCloud
Location: Remote (US)
Salary: $170k - $210k

About the Role:
We are seeking a Lead Backend Engineer to design scalable cloud services.
Mandatory Requirements:
- Deep expertise in Python, FastAPI, and PostgreSQL.
- Strong hands-on experience with Docker and Kubernetes on AWS.
- Background in system design and microservices architecture."""

    job_create = await client.post(
        "/api/v1/jobs",
        json={
            "title": "Lead Backend Engineer",
            "company": "AnthroCloud",
            "raw_description": job_raw,
            "location": "Remote (US)",
        },
        headers=headers,
    )
    assert job_create.status_code == 201
    job = job_create.json()
    assert job["company"] == "AnthroCloud"
    assert "Python" in job["mandatory_skills"]
    assert "Fastapi" in job["mandatory_skills"]
    job_id = job["id"]

    # 5. Match Job to Resume
    match_res = await client.post(f"/api/v1/jobs/{job_id}/match", headers=headers)
    assert match_res.status_code == 200
    match_data = match_res.json()
    assert match_data["match_percentage"] >= 50
    assert "Python" in match_data["matched_skills"]
    assert len(match_data["evidence_citations"]) >= 1

    # 6. Tailor Resume for Job
    tailor_res = await client.post(
        f"/api/v1/resumes/{resume_id}/tailor",
        json={"job_id": job_id},
        headers=headers,
    )
    assert tailor_res.status_code == 200
    tailor_data = tailor_res.json()
    assert tailor_data["version"]["version_number"] == 1
    assert "AnthroCloud" in tailor_data["version"]["target_role"]
    assert len(tailor_data["diff_summary"]) > 0

    # 7. Check Resume now has version history
    resume_detail = await client.get(f"/api/v1/resumes/{resume_id}", headers=headers)
    assert resume_detail.status_code == 200
    versions = resume_detail.json()["versions"]
    assert len(versions) == 1
    assert versions[0]["version_number"] == 1
