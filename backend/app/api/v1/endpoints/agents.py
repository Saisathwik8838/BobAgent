"""LangGraph Multi-Agent Studio endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.agent import AgentRunRequest, AgentRunResponse
from app.services.agent import AgentService

router = APIRouter(prefix="/agents", tags=["Multi-Agent Studio"])


@router.post("/run", response_model=AgentRunResponse, status_code=status.HTTP_200_OK)
async def run_agent(
    request: AgentRunRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Execute autonomous agent workflow (job_scout, application_assistant, prep_coach) with trace auditing."""
    service = AgentService(db)
    return await service.execute_agent(current_user, request)
