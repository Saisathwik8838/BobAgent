"""Tests for candidate profile endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_profile_crud_flow(client: AsyncClient):
    # Register user
    register_payload = {
        "email": "bob@example.com",
        "password": "Password123!",
        "full_name": "Bob Builder",
    }
    reg_res = await client.post("/api/v1/auth/register", json=register_payload)
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch profile
    get_res = await client.get("/api/v1/profile/", headers=headers)
    assert get_res.status_code == 200
    profile_data = get_res.json()
    assert "headline" in profile_data

    # Update profile
    update_payload = {
        "headline": "Senior AI Systems Engineer",
        "summary": "Building production RAG and agent systems with pgvector.",
        "location": "San Francisco, CA",
        "linkedin_url": "https://linkedin.com/in/bobbuilder",
        "github_url": "https://github.com/bobbuilder",
    }
    put_res = await client.put("/api/v1/profile/", json=update_payload, headers=headers)
    assert put_res.status_code == 200
    updated_data = put_res.json()
    assert updated_data["headline"] == "Senior AI Systems Engineer"
    assert updated_data["location"] == "San Francisco, CA"
    assert updated_data["github_url"] == "https://github.com/bobbuilder"
