# Architecture Overview: BobAgent

BobAgent is an evidence-grounded AI career intelligence system that eliminates candidate experience fabrication by design.

---

## 1. System Topology

```
Frontend (React + TypeScript + Vite + Tailwind)
       │ (REST / JSON + Bearer JWT)
       ▼
Backend API (FastAPI + Pydantic v2 + SQLAlchemy 2.0 Async)
       │
       ├──► Authentication & Candidate Scoping (Tenant Isolation)
       ├──► Domain Services (Profile, Resumes, Jobs, Tracking, Evaluations)
       │
       ├──► Redis (Cache / Rate Limiting / RQ Job Queue)
       │       └──► RQ Workers (Document Parsing & Vector Embedding)
       │
       ├──► LangGraph Orchestrator (Branching Workflows & Checkpointing)
       │       ├── Supervisor Agent
       │       ├── Specialized Allow-Listed Agents (Job, Evidence, Gap, Tailor, Eval)
       │       └── Anti-Hallucination Groundedness Judge
       │
       └──► PostgreSQL 16 + pgvector (HNSW Cosine Vector Index)
```

---

## 2. Key Architectural Decisions & Tradeoffs

### A. FastAPI + Pydantic v2 vs Django / Flask
- **Problem it solves**: Structured output handling, async I/O concurrency, and automatic OpenAPI contract documentation.
- **Why this approach**: Pydantic v2 provides high-performance schema serialization and validation for all LLM responses, ensuring malformed model output is intercepted and repaired before reaching storage.
- **Tradeoffs & Alternatives considered**: Django REST Framework (DRF) has higher monolithic overhead and heavier ORM models. FastAPI is lightweight, async-first, and fits AI streaming and micro-agent workflows cleanly.

### B. PostgreSQL + pgvector vs Dedicated Vector Databases (Pinecone / Milvus / Qdrant)
- **Problem it solves**: Co-locating relational candidate profiles, application tracking states, and embedding chunks in a single authoritative database.
- **Why this approach**: Prevents cross-database distributed transaction and consistency issues. When a user updates or deletes a project or resume, all relational references and vector chunks are updated or deleted atomically via standard foreign keys with `ON DELETE CASCADE`.
- **Tradeoffs & Alternatives considered**: While Pinecone or Qdrant scale to billions of vectors, a career intelligence platform per candidate involves hundreds to thousands of chunks. PostgreSQL with an HNSW cosine index delivers sub-millisecond retrieval with zero additional infrastructure costs.

### C. Redis + RQ (Redis Queue) vs Celery
- **Problem it solves**: Offloading heavy document parsing, chunking, and embedding generation without blocking HTTP requests.
- **Why this approach**: RQ has zero complex broker configurations (no AMQP/RabbitMQ required), lightweight dependencies, and clean Python job semantics.
- **Tradeoffs & Alternatives considered**: Celery supports complex canvas workflows, but LangGraph handles workflow orchestration directly, making RQ ideal for pure background job execution.

### D. Zero-Fabrication Contract & Evidence Attribution
- **Problem it solves**: Traditional LLM career tools hallucinate accomplishments, exaggerated metrics, or non-existent employers.
- **Why this approach**: Generations are constrained to retrieved candidate evidence (`document_chunks`) and verified through an automated dual check (cosine similarity + LLM-as-judge). Claims without matched evidence IDs are rejected and regenerated.
