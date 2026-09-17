"""Unit and integration tests for Vector RAG ingestion, search, and documents."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_rag_ingest_and_query_flow(client: AsyncClient):
    # 1. Register candidate user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "rag_tester@example.com",
            "password": "Password123!",
            "full_name": "RAG Tester",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Ingest document
    sample_content = """EXPERIENCE
Senior Cloud Engineer at Tech Corp:
- Architected Kubernetes microservices on AWS and Google Cloud.
- Designed distributed streaming pipelines using Kafka, Redis, and Python.
- Reduced database latency by 45% using pgvector caching and indexing.

EDUCATION
B.S. in Computer Science, Stanford University."""

    ingest_payload = {
        "title": "Cloud Engineer Experience Summary",
        "document_type": "resume",
        "content": sample_content,
        "metadata": {"source": "manual_upload", "verified": True},
    }

    ingest_res = await client.post("/api/v1/rag/ingest", json=ingest_payload, headers=headers)
    assert ingest_res.status_code == 201
    doc_data = ingest_res.json()
    assert doc_data["title"] == "Cloud Engineer Experience Summary"
    assert doc_data["chunk_count"] >= 1
    doc_id = doc_data["id"]

    # 3. List documents
    list_res = await client.get("/api/v1/rag/documents", headers=headers)
    assert list_res.status_code == 200
    docs = list_res.json()
    assert len(docs) == 1
    assert docs[0]["id"] == doc_id
    assert docs[0]["chunk_count"] >= 1

    # 4. Perform semantic query
    query_payload = {
        "query": "Kubernetes cluster orchestration on AWS",
        "top_k": 3,
    }
    query_res = await client.post("/api/v1/rag/query", json=query_payload, headers=headers)
    assert query_res.status_code == 200
    search_data = query_res.json()
    assert search_data["total_matches"] >= 1
    top_match = search_data["matches"][0]
    assert "content" in top_match
    assert top_match["document_title"] == "Cloud Engineer Experience Summary"
    assert top_match["similarity_score"] > 0.0

    # 5. Delete document
    del_res = await client.delete(f"/api/v1/rag/documents/{doc_id}", headers=headers)
    assert del_res.status_code == 200

    # 6. Verify document list is empty after deletion
    list_after = await client.get("/api/v1/rag/documents", headers=headers)
    assert list_after.status_code == 200
    assert len(list_after.json()) == 0
