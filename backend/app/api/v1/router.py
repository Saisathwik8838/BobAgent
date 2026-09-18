"""V1 API router aggregator."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    agents,
    applications,
    auth,
    eval as eval_router,
    health,
    interview,
    jobs,
    profile,
    rag,
    resumes,
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(rag.router)
api_router.include_router(resumes.router)
api_router.include_router(jobs.router)
api_router.include_router(applications.router)
api_router.include_router(agents.router)
api_router.include_router(interview.router)
api_router.include_router(eval_router.router)
