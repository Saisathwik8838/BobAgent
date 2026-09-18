export interface FunnelMetrics {
  total_applications: number;
  saved_count: number;
  applied_count: number;
  interviewing_count: number;
  offer_count: number;
  rejected_count: number;
  conversion_rate_pct: number;
}

export interface GroundednessMetrics {
  groundedness_score_pct: number;
  unsupported_claims_detected: number;
  total_claims_audited: number;
  llm_judge_verdict: string;
}

export interface SystemPerformanceMetrics {
  avg_retrieval_latency_ms: number;
  avg_agent_duration_ms: number;
  cache_hit_ratio_pct: number;
  total_pgvector_chunks: number;
}

export interface SkillDemandMetric {
  skill: string;
  count: number;
  matched_by_candidate: boolean;
}

export interface AnalyticsDashboardResponse {
  funnel: FunnelMetrics;
  groundedness: GroundednessMetrics;
  system: SystemPerformanceMetrics;
  top_skills: SkillDemandMetric[];
}
