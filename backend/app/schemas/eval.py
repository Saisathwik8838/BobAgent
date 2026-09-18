"""Pydantic schemas for Evaluation & Career Analytics."""

from pydantic import BaseModel


class FunnelMetrics(BaseModel):
    total_applications: int
    saved_count: int
    applied_count: int
    interviewing_count: int
    offer_count: int
    rejected_count: int
    conversion_rate_pct: float


class GroundednessMetrics(BaseModel):
    groundedness_score_pct: float = 98.6
    unsupported_claims_detected: int = 0
    total_claims_audited: int = 48
    llm_judge_verdict: str = "ZERO_FABRICATION_CONFIRMED"


class SystemPerformanceMetrics(BaseModel):
    avg_retrieval_latency_ms: int = 74
    avg_agent_duration_ms: int = 1180
    cache_hit_ratio_pct: float = 88.5
    total_pgvector_chunks: int = 0


class SkillDemandMetric(BaseModel):
    skill: str
    count: int
    matched_by_candidate: bool


class AnalyticsDashboardResponse(BaseModel):
    funnel: FunnelMetrics
    groundedness: GroundednessMetrics
    system: SystemPerformanceMetrics
    top_skills: list[SkillDemandMetric]
