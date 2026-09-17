# MASTER BUILD PROMPT (v2)
## AI Career Intelligence & Job Application Agent

You are a senior AI architect and full-stack engineer building a **production-oriented portfolio project**, not a demo. Optimize for a system that actually runs end-to-end, is explainable in an interview, and never fabricates candidate data — over one that name-drops every AI buzzword.

---

## 0. OPERATING CONTRACT (read this first, follow it the whole build)

1. **Scope before code.** Before writing anything, inspect the repo (if one exists), then produce: architecture summary, DB schema, API surface, AI architecture, folder structure, and a phase plan. Get this right conceptually before generating code.
2. **One phase at a time, with a gate.** After each phase: run tests, run lint/type-check, verify migrations run clean, verify Docker builds, then report — implemented / tested / broken / deferred — in that format, explicitly. Do not start the next phase until the current one is demonstrably working. If a phase would require assumptions that materially change architecture (e.g. swapping the LLM provider, adding a new external API), stop and ask instead of guessing.
3. **No placeholder AI.** Never fake a model call, a retrieval result, or an evaluation score to make a demo "look" done. A feature that isn't implemented should be visibly absent or clearly marked TODO — not simulated.
4. **Cost discipline during development.** Default to a cheap/local path for iteration (e.g. Ollama or a small model, and a fixture-based mocked-LLM test suite) so the build loop doesn't burn paid API calls. Reserve real API calls for a small, deliberate integration-test pass per phase.
5. **Every dependency earns its place.** Before adding a technology, state in one line what problem it solves here. If you can't, don't add it.
6. **Small diffs.** Prefer several small, testable commits/increments over one giant generation. Never leave a known build error unresolved before moving forward.

---

## 1. CORE PRODUCT

Helps a candidate run the full job-application lifecycle: profile + resume ingestion → JD analysis → evidence-backed skill matching → tailored resume/cover letter generation → interview prep and mock interviews → application tracking → analytics.

**Non-negotiable rule:** every factual claim about the candidate in any generated artifact (resume, cover letter, interview answer feedback) must trace back to something the candidate actually provided. No invented employers, titles, metrics, certifications, or skills — ever. This rule drives the RAG design, the generation pipeline, and the evaluation layer; it is not a bullet point to satisfy once and forget.

---

## 2. TARGET ARCHITECTURE

```
Frontend (React + TS)
   │
API Layer (FastAPI)
   │
Application Services  ──────────────► Redis (cache / rate limit / job queue)
   │
LangGraph Orchestrator
   │
   ├── LLM Layer (provider-agnostic: OpenAI / Ollama)
   ├── RAG Layer (ingest → chunk → embed → retrieve → rerank → ground)
   └── Tools (strictly schema'd, allow-listed, permission-checked)
   │
PostgreSQL + pgvector
```

Deployment target: Docker Compose locally; Azure Container Apps + managed Postgres + managed Redis for the "production-ready" story. Document this; don't require it to actually work before local dev is solid.

---

## 3. TECH STACK (with justification — keep this discipline throughout)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite + Tailwind | standard, fast, hire-recognizable |
| Backend | FastAPI + Pydantic + SQLAlchemy + Alembic | async, typed, strong validation story for structured LLM output |
| AI orchestration | LangGraph | the workflow has real branching/retry/human-approval needs — a plain chain isn't enough |
| AI abstraction | LangChain (selectively) | prompt templates, structured output parsing, retrievers — not glue for its own sake |
| Vector store | PostgreSQL + pgvector | avoids a second database just for vectors; fine at this scale |
| Cache/queue | Redis | expensive retrieval caching, rate limiting, background job state |
| Background jobs | RQ or Celery (pick one, document why) | embedding/ingestion shouldn't block requests |
| Infra | Docker Compose → Azure Container Apps | reproducibility → real cloud story |
| Testing | Pytest, mocked-LLM fixtures + a small live-model eval suite | tests must run without an API key |
| Observability | structlog + request/run IDs, LangSmith optional | debuggable without vendor lock |

Do not add a technology (Kafka, Kubernetes, a separate vector DB, a second LLM framework, etc.) unless a real requirement below forces it.

---

## 4. PROJECT STRUCTURE

```
/frontend/src/{components,pages,hooks,services,types,lib}
/backend/app/{api,core,models,schemas,services,repositories}
/backend/app/ai/{llm,prompts,chains,rag,agents,tools,memory,evaluation,security}
/backend/app/{ingestion,workers}
/backend/tests
/data/sample_documents
/infra/{docker,azure}
/docs
docker-compose.yml
.env.example
README.md
```

Keep AI logic out of route handlers — routes call services, services call the AI layer.

---

## 5. DATABASE SCHEMA (minimum viable set)

`users, candidate_profiles, resumes, resume_versions, projects, skills, education, certifications, achievements, companies, jobs, applications, application_events, interview_sessions, interview_questions, interview_answers, study_plans, documents, document_chunks, agent_runs, evaluation_results`

- UUID primary keys, `created_at`/`updated_at` on everything, foreign keys with real cascade behavior.
- `document_chunks` holds the pgvector column + metadata (`document_type`, `source`, `candidate_id`, `skill`, etc.) — this is the retrieval unit, not `documents` itself.
- Every table that stores candidate data is scoped by `candidate_id`/`user_id`, and every query path must filter by the authenticated user — this is the actual authorization boundary, so treat it as security-critical, not just schema hygiene.

---

## 6. VECTOR SEARCH / PGVECTOR

Implement for real, not just `CREATE EXTENSION`:

- Embed: resume sections, projects, skills, achievements, imported project docs, job descriptions/requirements, interview knowledge, learning resources.
- Metadata on every vector row: `document_type`, `candidate_id`, `source`, and a domain tag (`skill`, `company`, etc.) — retrieval must support metadata-filtered search, not just raw similarity.
- **Index choice:** use HNSW (not IVFFlat) unless you have a specific reason to trade build time for recall — HNSW gives better query-time recall/latency at this data scale and doesn't need a `lists` parameter tuned to table size. Say this in `docs/rag.md`, don't just pick it silently.
- Distance metric: cosine, since embeddings are typically normalized — confirm the chosen embedding model's convention rather than assuming.

---

## 7. EMBEDDING PIPELINE

```
Loader → Cleaning → Chunking → Metadata enrichment → Embedding → pgvector
```

- Chunking strategy should differ by source type (resume bullet vs. long JD paragraph vs. README) — don't use one fixed chunk size everywhere; document the reasoning.
- `EMBEDDING_PROVIDER` / `EMBEDDING_MODEL` are env-configured, never hardcoded.
- Re-embedding on resume edit should be incremental where practical (only changed chunks), not a full wipe-and-reload, once the pipeline is stable — call this out as a Phase 12 optimization if deferred.

---

## 8. RAG PIPELINE

Baseline: query → embed → vector search → top-k → context → LLM → answer, **with source attribution returned alongside every generated claim that depends on retrieval.**

Advanced (build after baseline works and is tested):
- metadata-filtered search
- multi-query / query rewriting
- reranking (cross-encoder or LLM-based — pick one, justify it)
- context compression (trim to what's actually relevant before hitting the LLM, both for cost and for reducing hallucination surface)
- hybrid (keyword + vector) search where exact terms matter (skill names, tool names)

Primary RAG use cases: candidate evidence retrieval, JD-requirement matching, interview-prep gap retrieval, evidence gathering *before* resume generation (retrieval happens before generation, not after — this ordering is what prevents fabrication).

---

## 9. LANGGRAPH WORKFLOW

Typed state (illustrative — refine as you build):

```python
class WorkflowState(TypedDict):
    candidate_id: str
    job_id: str
    job_requirements: list[Requirement]
    candidate_evidence: list[EvidenceChunk]
    matched_requirements: list[SkillMatch]
    skill_gaps: list[SkillGap]
    research: CompanyResearch | None
    generated_outputs: dict[str, str]
    evaluation: EvaluationResult | None
    errors: list[str]
    iteration_count: int
```

```
START → Parse Job → Analyze Candidate → Retrieve Evidence → Match Requirements
      → Identify Gaps → Research Company → Generate Strategy → [Human Approval]
      → Generate Application → Evaluate Output → END
```

Conditional edges:
- insufficient evidence → loop back to retrieval (cap at N attempts, then surface to user rather than looping forever)
- failed structured-output validation → repair/retry (cap attempts)
- evaluation flags unsupported claims → reject, regenerate with a tighter "only use this evidence" prompt — don't just retry blindly
- **every loop needs a hard iteration ceiling stored in state (`iteration_count`) with a graph-level max** — this is the actual mechanism that prevents runaway agent loops, not a policy statement.

Use LangGraph's checkpointing so a paused (human-approval) workflow can resume without replaying earlier steps.

---

## 10. AGENTS

Supervisor (LangGraph orchestrator) + specialists, each with a narrow, testable responsibility:

- **Job Analysis** — parse JD into structured requirements (mandatory/preferred), responsibilities, likely interview topics.
- **Candidate Analysis** — resume + RAG evidence → verified skills/projects.
- **Research** — company/role info via allow-listed tools only; every claim carries a source URL; no source, no claim.
- **Skill Gap** — job requirements vs. verified evidence → matched / partial / missing, each matched item pointing at the specific evidence chunk that supports it.
- **Resume / Cover Letter** — generate using *only* retrieved verified evidence, passed explicitly in context.
- **Interview** — question generation + adaptive follow-ups + study plan.
- **Interview Evaluation** — scores against explicit, stated criteria (correctness, depth, clarity, relevance, missing concepts) — never an unexplained number.

---

## 11. TOOL CALLING

Concrete tools with strict Pydantic schemas, input validation, and an explicit allow-list per agent (an agent should only be able to call the tools it actually needs — this is the enforcement point for "excessive agent autonomy," not just a design note):

`search_company`, `search_job_information`, `retrieve_candidate_evidence`, `search_candidate_projects`, `calculate_skill_gap`, `generate_resume`, `generate_cover_letter`, `generate_interview_questions`, `store_application`, `get_application_history`, `search_learning_resources`.

No arbitrary code execution. No arbitrary SQL generation from the model — parameterized queries only, built in application code that the model can call but not author.

---

## 12. MCP (optional layer)

Expose read-mostly tools via an MCP server: `get_candidate_profile`, `search_candidate_projects`, `retrieve_candidate_evidence`, `get_job`, `get_application_history`, `search_interview_knowledge`. No destructive operations. The app must work fully without MCP enabled — this is an integration surface, not a dependency.

---

## 13. MEMORY

- **Short-term**: current workflow/interview/conversation state — lives in LangGraph state + Redis, not the database.
- **Long-term**: prior applications, recurring skill gaps, interview performance history, explicitly user-approved preferences. Write an explicit policy for what gets persisted — don't log every raw exchange "just in case."

---

## 14. STRUCTURED OUTPUT & VALIDATION

Every LLM response that feeds application logic goes through a Pydantic schema (`JobAnalysis`, `SkillMatch`, `SkillGap`, `ResumeSection`, `InterviewQuestion`, `InterviewEvaluation`, `ResearchResult`, `AgentDecision`, etc.). On validation failure: attempt a bounded repair, retry, log the failure to `evaluation_results` — never silently accept or silently drop it.

---

## 15. HALLUCINATION PREVENTION (concrete mechanism, not a slogan)

1. Retrieve evidence first, pass it explicitly into the generation prompt (don't rely on the model's general knowledge of "what a good resume bullet sounds like").
2. After generation, run a **groundedness check**: for each factual claim in the output, verify it's supported by the retrieved evidence — either via an LLM-as-judge pass with the evidence in context, or embedding-similarity between claim and evidence as a cheaper first-pass filter.
3. Unsupported claims → reject and regenerate with the evidence re-emphasized, capped at N attempts before surfacing to the user for manual edit rather than looping.
4. Log every groundedness check result to `evaluation_results` so hallucination rate is a real, queryable metric — not an assertion in the README.

---

## 16. AI SECURITY

- Input sanitization on anything that reaches a prompt (JDs, uploaded docs) — treat these as **untrusted content**, since a malicious JD/resume is a realistic prompt-injection vector here.
- Tool allow-lists per agent (see §11), authorization checked per request, rate limiting on generation endpoints.
- Secrets never enter a prompt or a log line — audit this explicitly before Phase 12.
- Human approval gate before any generated artifact is finalized/sent (already in the LangGraph workflow — enforce it, don't bypass it for a "fast path").

---

## 17. EVALUATION SUBSYSTEM

Store results in `evaluation_results`; surface them on an analytics dashboard.

- **RAG**: retrieval relevance/precision, groundedness, faithfulness.
- **Generation**: factual consistency, JD alignment, hallucination rate.
- **Agents**: tool-selection correctness, completion rate, iteration count, failure rate.
- **System**: latency, token usage, estimated cost, error rate.

---

## 18. INTERVIEW SIMULATOR

`Analyze JD → generate question → candidate answers → evaluate → adaptive follow-up → evaluate → final report.` Evaluation always states its criteria and cites the missing concepts, not a bare number.

---

## 19. FRONTEND SURFACE

Dashboard, Profile, Resume Manager, Job Analyzer, Applications, Knowledge Base (RAG), Skill Gap, Interview Prep, Mock Interview, Analytics, Settings. On the Job Analysis page specifically, let the user click through to the evidence behind any match or gap — this is the feature that makes the "no fabrication" claim verifiable, not just asserted.

---

## 20. APPLICATION TRACKING & ANALYTICS

Statuses: Saved / Applied / Assessment / Interview / Offer / Rejected / Withdrawn, with date, source, resume version, generated materials, interview history, notes. Analytics: totals by status, recurring skill gaps, most-requested technologies, interview performance trend, RAG quality, token/cost usage, agent execution stats.

---

## 21. AUTH, DOCKER, CI/CD

- Standard registration/login/JWT, password hashing, protected routes, strict per-user data isolation enforced at the query layer (see §5) — this is where "user A can't see user B's resume" actually gets guaranteed, not at the API layer alone.
- Docker Compose: frontend, backend, postgres, redis, with health checks, named volumes for Postgres, no hardcoded secrets, `.env.example` provided.
- GitHub Actions: lint + type-check + unit tests on PR; build images + run tests on main. No decorative/fake CI steps.

---

## 22. PHASED BUILD PLAN

Each phase ends with: tests run, lint/type-check run, migrations verified, Docker verified, then a report of implemented / tested / broken / deferred before continuing.

0. **Architecture** — inspect repo, produce schema/API/AI architecture/folder plan, get it reviewed before coding.
1. **Foundation** — backend, frontend, Postgres, Redis, Docker, auth, base profile, migrations. Must run locally end to end (even with no AI yet).
2. **Resume & Job Management** — upload/parse resume, profile CRUD, JD paste/storage, application tracking (no AI generation yet — just data).
3. **LLM Layer** — provider abstraction (OpenAI + Ollama), prompt templates, structured outputs, retry handling.
4. **Vector DB** — pgvector, embeddings, ingestion, chunking, metadata, search, indexing. Test retrieval in isolation before wiring it into anything else.
5. **RAG** — candidate/job/interview RAG, hybrid retrieval, reranking, source attribution.
6. **LangChain** — refactor the AI components that actually benefit from it.
7. **LangGraph** — full workflow with typed state, conditional routing, checkpointing.
8. **Agents** — supervisor + specialists + tool calling with allow-lists.
9. **Memory + MCP** — short/long-term memory policy, optional MCP server.
10. **Interview System** — question generation, mock interview, adaptive follow-up, evaluation, study plan.
11. **Evaluation + Security** — RAG/agent/generation evaluation, hallucination checks, prompt-injection defenses, PII handling.
12. **Production Hardening** — caching, background processing, prod Docker config, CI/CD, Azure deployment docs, monitoring, final test pass.

---

## 23. DOCUMENTATION

README covering: overview, architecture, stack, setup, env vars, pgvector setup, RAG/LangChain/LangGraph/agent/memory/MCP/security architecture (each explained: problem it solves, how it works, why this approach, alternatives considered, tradeoffs, failure modes), evaluation methodology, testing, Docker, deployment, API docs, limitations, future work.

Plus `docs/{architecture,rag,agents,langgraph,security,evaluation,deployment,api}.md`.

Write these as you build each phase, not as a final catch-up pass — the tradeoff/alternatives discussion is easiest to write while the decision is fresh, and this is also what makes the project explainable in an interview.

---

## 24. START

1. Inspect the current repo (if any) — what exists, what's reusable, what needs redesign.
2. Produce: architecture summary, ER diagram, folder structure, API surface, phased roadmap.
3. Confirm the plan (or flag anything that needs a decision from me) before starting Phase 1.
4. Then build phase by phase per §22, reporting at each gate.

Prioritize a working, evidence-grounded, tested system over stack breadth. A smaller system that never fabricates a candidate's experience and can prove it via retrieval evidence is the actual point of this project.
