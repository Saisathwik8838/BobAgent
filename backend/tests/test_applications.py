"""Integration tests for Applications Pipeline."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_application_pipeline_lifecycle(client: AsyncClient):
    # 1. Register candidate user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "pipeline_user@example.com",
            "password": "SecurePassword123!",
            "full_name": "Pipeline Tracker",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Ingest Job
    job_create = await client.post(
        "/api/v1/jobs",
        json={
            "title": "Senior Distributed Systems Engineer",
            "company": "DataStream Networks",
            "seniority": "Senior",
            "location": "San Francisco, CA",
            "salary_range": "$175,000 - $210,000",
            "raw_description": "We are seeking a Senior Distributed Systems Engineer skilled in Python, FastAPI, and PostgreSQL.",
        },
        headers=headers,
    )
    assert job_create.status_code == 201
    job_id = job_create.json()["id"]

    # 3. Ingest Resume
    resume_create = await client.post(
        "/api/v1/resumes",
        json={
            "title": "Senior Systems Engineer",
            "raw_text": "Experience at FastScale: Led microservices using Python and PostgreSQL.",
            "is_primary": True,
        },
        headers=headers,
    )
    assert resume_create.status_code == 201
    resume_id = resume_create.json()["id"]

    # 4. Create Application (saved)
    app_create = await client.post(
        "/api/v1/applications",
        json={
            "job_id": job_id,
            "resume_id": resume_id,
            "status": "saved",
            "notes": "Spotted through referral on LinkedIn.",
        },
        headers=headers,
    )
    assert app_create.status_code == 201
    app_data = app_create.json()
    app_id = app_data["id"]
    assert app_data["status"] == "saved"
    assert app_data["job"]["company"] == "DataStream Networks"
    assert len(app_data["events"]) >= 1
    assert app_data["events"][0]["event_type"] == "application_created"

    # 5. Transition status to 'applied'
    app_patch_1 = await client.patch(
        f"/api/v1/applications/{app_id}",
        json={"status": "applied"},
        headers=headers,
    )
    assert app_patch_1.status_code == 200
    app_applied = app_patch_1.json()
    assert app_applied["status"] == "applied"
    assert app_applied["applied_date"] is not None
    assert len(app_applied["events"]) >= 2
    assert app_applied["events"][0]["event_type"] == "status_changed"

    # 6. Transition status to 'interviewing' with notes & recruiter details
    app_patch_2 = await client.patch(
        f"/api/v1/applications/{app_id}",
        json={
            "status": "interviewing",
            "notes": "Technical screen scheduled for Thursday 2 PM PST.",
            "contact_name": "Sarah Connor (Recruiter)",
            "contact_email": "sarah@datastream.io",
            "salary_offered": "$190,000",
        },
        headers=headers,
    )
    assert app_patch_2.status_code == 200
    app_interview = app_patch_2.json()
    assert app_interview["status"] == "interviewing"
    assert app_interview["contact_name"] == "Sarah Connor (Recruiter)"
    assert app_interview["salary_offered"] == "$190,000"
    assert len(app_interview["events"]) >= 3

    # 7. List applications with filter
    filter_res = await client.get("/api/v1/applications?status=interviewing", headers=headers)
    assert filter_res.status_code == 200
    assert len(filter_res.json()) == 1

    saved_filter = await client.get("/api/v1/applications?status=saved", headers=headers)
    assert saved_filter.status_code == 200
    assert len(saved_filter.json()) == 0

    # 8. Get Application detail
    get_res = await client.get(f"/api/v1/applications/{app_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == app_id

    # 9. Delete application
    del_res = await client.delete(f"/api/v1/applications/{app_id}", headers=headers)
    assert del_res.status_code == 200

    # 10. Confirm deleted
    not_found = await client.get(f"/api/v1/applications/{app_id}", headers=headers)
    assert not_found.status_code == 404
