# BobAgent - AI Career Intelligence & Job Application Agent

Production-grade AI Career Intelligence Agent that guarantees zero candidate fabrication through verified evidence-first RAG, pgvector retrieval, LangGraph multi-agent workflows, and rigorous evaluation guardrails.

---

## Architecture & Frontend Standardization

The frontend is consolidated on **React 18 + TypeScript + Vite + Tailwind CSS** with **React Router v6** powering client-side section routing inside a shared layout shell (`Navbar`, `Sidebar`, and `<Outlet />`).

### Canonical Routes
- `/dashboard` — System readiness overview and operational status
- `/profile` — Candidate Profile reference implementation (ground-truth career attributes)
- `/rag` — Vector RAG Knowledge Base (Section 3.4)
- `/resume-hub` — Resume Hub (upload, parse, version, tailor) (Section 3.1)
- `/jobs` — Job Intelligence (ingestion, requirement parsing, match scoring) (Section 3.2)
- `/applications` — Applications Pipeline (Kanban tracking) (Section 3.3)
- `/agents` — LangGraph Multi-Agent Studio (Scout, Assistant, Prep Coach) (Section 3.5)
- `/interview` — Adaptive Interview Simulator (role-tailored practice) (Section 3.6)
- `/eval` — Evaluation & Analytics (funnel, agent stats, groundedness metrics) (Section 3.7)

---

## Implemented Modules

### 1. Vector RAG Knowledge Base (Section 3.4)
- **Pipeline**: Ingest text/markdown → Source-specific chunker (`resume`, `job`, `custom_doc`) → 1536-dimensional L2-normalized embeddings → PostgreSQL `pgvector` HNSW cosine indexing.
- **Attribution & Anti-Fabrication**: Every retrieved chunk returns its exact `chunk_id`, parent `document_id`, `document_title`, and cosine similarity percentage.
- **REST Endpoints**:
  - `POST /api/v1/rag/ingest` — Chunk and store document in vector DB
  - `GET /api/v1/rag/documents` — List candidate documents and chunk totals
  - `POST /api/v1/rag/query` — Semantic search with top-k and type filter
  - `DELETE /api/v1/rag/documents/{id}` — Cascading removal of document & chunks
- **Interactive UI**: Located at `/rag` with document ingestion form, live document counter, top-k slider, and search results inspector.

### 2. ResumeHub (Section 3.1)
- **Pipeline**: Ingest raw text or PDF content → Parse structured resume sections (contact, summary, experience, skills, education) → Vector indexing → Role-targeted tailoring engine with strict factual grounding against candidate evidence.
- **Version Control**: Git-like parent-child resume lineage tracking (`base_resume_id`, `version_number`, `change_summary`).
- **REST Endpoints**:
  - `POST /api/v1/resumes` — Ingest, parse, and store candidate resume
  - `GET /api/v1/resumes` — List all candidate resumes and version trees
  - `GET /api/v1/resumes/{id}` — Get single resume with version history
  - `POST /api/v1/resumes/{id}/tailor` — Generate grounded tailored resume targeting a specific job
  - `DELETE /api/v1/resumes/{id}` — Remove resume and associated versions
- **Interactive UI**: Located at `/resume-hub` with version switcher, structured section inspector, role tailoring modal, and side-by-side diff.

### 3. Job Intelligence (Section 3.2)
- **Pipeline**: Ingest raw job descriptions or URLs → Parse structured role attributes (seniority, salary range, location, mandatory vs preferred skills, core responsibilities) → Semantic candidate fit scoring against verified resume evidence.
- **Attribution & Gap Analysis**: Match calculation outputs clear percentage, matched requirements with checkmarks, gap requirements with warnings, fit rationale, and grounding evidence citations.
- **REST Endpoints**:
  - `POST /api/v1/jobs` — Ingest and parse target job posting
  - `GET /api/v1/jobs` — List all candidate ingested jobs
  - `GET /api/v1/jobs/{id}` — Get single job detail with parsed requirements
  - `POST /api/v1/jobs/{id}/match` — Match job requirements against candidate verified resume evidence
  - `DELETE /api/v1/jobs/{id}` — Delete job posting
- **Interactive UI**: Located at `/jobs` with search/filter, structured requirements breakdown, one-click sample role filler, and interactive semantic fit evaluator.

### 4. Applications Pipeline (Section 3.3)
- **Pipeline**: Kanban-style state machine tracking candidate opportunities across stages (`saved` → `applied` → `interviewing` → `offer` → `rejected`), linking target jobs with tailored resumes.
- **Audit Logging & Event Sourcing**: Every stage movement or strategy update creates an immutable `ApplicationEvent` audit record with timestamps and metadata.
- **REST Endpoints**:
  - `POST /api/v1/applications` — Track new job opportunity
  - `GET /api/v1/applications` — List applications with stage filtering
  - `GET /api/v1/applications/{id}` — Get application details with chronological audit event timeline
  - `PATCH /api/v1/applications/{id}` — Update stage, notes, or recruiter contact details
  - `DELETE /api/v1/applications/{id}` — Remove application from pipeline
- **Interactive UI**: Located at `/applications` with live Kanban board, quick stage progression buttons, stats bar, and audit timeline drawer.

---

## Quickstart / Running Locally

### 1. Start Infrastructure (Postgres with pgvector & Redis)
```bash
docker compose up -d postgres redis
```

### 2. Backend (FastAPI)
```bash
cd backend
uv venv --python 3.12 .venv
.venv\Scripts\activate
uv pip install -e ".[dev]"
python -m alembic upgrade head
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

