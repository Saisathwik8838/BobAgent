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

### 5. LangGraph Multi-Agent Studio (Section 3.5)
- **Pipeline**: Autonomous multi-agent orchestration for Job Scouting, Application Assistant, and Interview Prep Coach with strict tool allow-lists and step-by-step execution traces.
- **Anti-Hallucination Guardrails**: Output evaluation judge validates 100% groundedness against pgvector candidate evidence before presenting pitches or cover letters.
- **REST Endpoints**:
  - `POST /api/v1/agents/run` — Run specialized agent workflow with step-by-step trace auditing
- **Interactive UI**: Located at `/agents` with agent action cards, target job selector, live execution trace timeline, copy-to-clipboard pitch deliverables, and citation breakdown.

### 6. Adaptive Interview Simulator (Section 3.6)
- **Pipeline**: Interactive practice sessions formulated from target job posting requirements and candidate project background.
- **Scoring Rubric**: Multi-criteria evaluation judging candidate answers on Correctness, Clarity, and Architectural Depth, identifying missing concepts with actionable advice.
- **REST Endpoints**:
  - `POST /api/v1/interview/sessions` — Initialize scenario-based interview session
  - `POST /api/v1/interview/evaluate` — Submit answer for real-time criteria assessment and scoring
- **Interactive UI**: Located at `/interview` with role/difficulty configuration, real-time question prompt cards, sample high-signal answer helper, criteria score meters, and prior question history.

### 7. Evaluation & Career Analytics (Section 3.7)
- **Pipeline**: Real-time aggregation of candidate application pipeline conversion funnels, pgvector retrieval latencies, Redis cache hit ratios, and zero-fabrication metrics.
- **REST Endpoints**:
  - `GET /api/v1/eval/dashboard` — Complete career intelligence and groundedness telemetry
- **Interactive UI**: Located at `/eval` with funnel progress bars, groundedness integrity badge, telemetry counters, and market skill demand matrix.

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

---

## Production Deployment to Azure Container Apps

BobAgent includes an automated **Infrastructure as Code (Bicep)** setup and **GitHub Actions CI/CD pipeline** targeting **Azure Container Apps** with containerized **PostgreSQL + pgvector**, **Redis**, and **Ollama (`llama3:latest`)**.

### Automated CI/CD (GitHub Actions)
1. Generate an Azure Service Principal with Contributor access:
   ```bash
   az ad sp create-for-rbac --name "sp-bobagent-github" --role "Contributor" --scopes "/subscriptions/<SUBSCRIPTION_ID>" --sdk-auth
   ```
2. Add GitHub Repository Secrets under **Settings -> Secrets and variables -> Actions**:
   - `AZURE_CREDENTIALS`: Entire JSON output from above command
   - `AZURE_SUBSCRIPTION_ID`: Your Azure Subscription ID GUID
3. Push to `main` or manually trigger the **Deploy BobAgent to Azure Container Apps** workflow.

### Local One-Click Deployment (PowerShell)
```powershell
az login
.\infra\azure\deploy.ps1 -ResourceGroup "rg-bobagent-prod" -Location "eastus"
```

For full architecture diagrams and operational telemetry, see [docs/deployment.md](docs/deployment.md).

