"""Tests for Agents, Interview Simulator, and Evaluation Analytics endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_agents_interview_and_eval_endpoints(client: AsyncClient):
    # 1. Register candidate user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "agent_eval_user@example.com",
            "password": "SecurePassword123!",
            "full_name": "Agent Evaluator",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Multi-Agent Studio execution
    for agent_type in ["job_scout", "application_assistant", "prep_coach"]:
        run_res = await client.post(
            "/api/v1/agents/run",
            json={"agent_type": agent_type},
            headers=headers,
        )
        assert run_res.status_code == 200
        run_data = run_res.json()
        assert run_data["agent_type"] == agent_type
        assert run_data["status"] == "completed"
        assert len(run_data["traces"]) >= 3
        assert run_data["groundedness_score"] > 0.9

    # 3. Test Adaptive Interview Simulator
    session_res = await client.post(
        "/api/v1/interview/sessions",
        json={
            "role_title": "Senior Distributed Systems Engineer",
            "difficulty": "Senior",
        },
        headers=headers,
    )
    assert session_res.status_code == 201
    session_data = session_res.json()
    assert len(session_data["questions"]) == 3
    q_id = session_data["questions"][0]["id"]
    sess_id = session_data["session_id"]

    # Evaluate an answer
    eval_res = await client.post(
        "/api/v1/interview/evaluate",
        json={
            "session_id": sess_id,
            "question_id": q_id,
            "answer_text": "I configure asyncpg connection pooling with transaction mode and Redis caching for sub-50ms latency.",
        },
        headers=headers,
    )
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["score"] >= 75
    assert len(eval_data["feedback"]) > 10

    # 4. Test Evaluation & Career Analytics Dashboard
    analytics_res = await client.get("/api/v1/eval/dashboard", headers=headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert "funnel" in analytics_data
    assert "groundedness" in analytics_data
    assert "system" in analytics_data
    assert analytics_data["groundedness"]["unsupported_claims_detected"] == 0
