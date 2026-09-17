"""Tests for authentication and health endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "BobAgent"


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient):
    # 1. Register new user
    register_payload = {
        "email": "candidate@example.com",
        "password": "SecurePassword123!",
        "full_name": "Alice Candidate",
    }
    res_reg = await client.post("/api/v1/auth/register", json=register_payload)
    assert res_reg.status_code == 201
    data_reg = res_reg.json()
    assert "access_token" in data_reg
    assert data_reg["token_type"] == "bearer"
    assert data_reg["user"]["email"] == "candidate@example.com"
    assert data_reg["user"]["full_name"] == "Alice Candidate"
    token = data_reg["access_token"]

    # 2. Reject duplicate email registration
    res_dup = await client.post("/api/v1/auth/register", json=register_payload)
    assert res_dup.status_code == 400

    # 3. Login with correct credentials
    login_payload = {
        "email": "candidate@example.com",
        "password": "SecurePassword123!",
    }
    res_login = await client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    data_login = res_login.json()
    assert "access_token" in data_login

    # 4. Reject invalid password
    res_bad_pw = await client.post(
        "/api/v1/auth/login",
        json={"email": "candidate@example.com", "password": "WrongPassword!"},
    )
    assert res_bad_pw.status_code == 401

    # 5. Access /auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    res_me = await client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    data_me = res_me.json()
    assert data_me["email"] == "candidate@example.com"

    # 6. Reject /auth/me without token
    res_unauth = await client.get("/api/v1/auth/me")
    assert res_unauth.status_code == 401
