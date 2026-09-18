"""Evaluation & Career Analytics endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.eval import AnalyticsDashboardResponse
from app.services.eval import EvalService

router = APIRouter(prefix="/eval", tags=["Evaluation & Analytics"])


@router.get("/dashboard", response_model=AnalyticsDashboardResponse, status_code=status.HTTP_200_OK)
async def get_analytics_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve aggregate application funnel, groundedness verification, and system metrics."""
    service = EvalService(db)
    return await service.get_dashboard_metrics(current_user)
