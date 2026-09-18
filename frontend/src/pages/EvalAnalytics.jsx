import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  ShieldCheck,
  Zap,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';

export const EvalAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalyticsDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load evaluation analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <BarChart3 style={{ width: '24px', height: '24px', color: 'var(--brand-primary)' }} />
            <span>Evaluation & Career Analytics</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Real-time conversion funnels, pgvector performance latency, and verifiable zero-hallucination tracking.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-indigo" style={{ fontFamily: 'monospace' }}>
            Section 3.7
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
          >
            <RotateCcw style={{ width: '14px', height: '14px' }} />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--brand-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Aggregating career intelligence metrics...</p>
        </div>
      ) : data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top 3 High-Impact Metric Cards */}
          <div className="grid-3">
            {/* Groundedness Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.05)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <ShieldCheck style={{ width: '16px', height: '16px' }} />
                  <span>Groundedness Integrity</span>
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>
                  {data.groundedness?.llm_judge_verdict}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                  {data.groundedness?.groundedness_score_pct}%
                </span>
                <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Verified Evidence</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {data.groundedness?.unsupported_claims_detected} unsupported claims detected across{' '}
                {data.groundedness?.total_claims_audited} audited candidate assertions.
              </p>
            </div>

            {/* Application Funnel Conversion */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <TrendingUp style={{ width: '16px', height: '16px' }} />
                  <span>Pipeline Conversion</span>
                </span>
                <span className="badge badge-indigo" style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>
                  {data.funnel?.total_applications} Applications
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                  {data.funnel?.conversion_rate_pct}%
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)' }}>Offer Conversion Rate</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {data.funnel?.interviewing_count} currently in active interviews, {data.funnel?.offer_count} offers extended.
              </p>
            </div>

            {/* Performance Latency */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Zap style={{ width: '16px', height: '16px' }} />
                  <span>Retrieval & Cache</span>
                </span>
                <span className="badge badge-warning" style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>
                  pgvector HNSW
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                  {data.system?.avg_retrieval_latency_ms}ms
                </span>
                <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Avg Retrieval Latency</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {data.system?.cache_hit_ratio_pct}% Redis cache hit ratio across vector embedding queries.
              </p>
            </div>
          </div>

          {/* Application Funnel Breakdown Progress */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Layers style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
              <span>Full Pipeline Stage Funnel</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Saved</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace', margin: 0 }}>{data.funnel?.saved_count}</p>
                <div style={{ width: '100%', backgroundColor: 'rgba(51, 65, 85, 0.6)', height: '6px', borderRadius: '9999px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--text-muted)', height: '100%', borderRadius: '9999px', width: '100%' }} />
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', margin: 0 }}>Applied</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'monospace', margin: 0 }}>{data.funnel?.applied_count}</p>
                <div style={{ width: '100%', backgroundColor: 'rgba(51, 65, 85, 0.6)', height: '6px', borderRadius: '9999px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--brand-primary)',
                      height: '100%',
                      borderRadius: '9999px',
                      width: `${data.funnel?.total_applications > 0 ? (data.funnel.applied_count / data.funnel.total_applications) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#fbbf24', margin: 0 }}>Interviewing</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace', margin: 0 }}>{data.funnel?.interviewing_count}</p>
                <div style={{ width: '100%', backgroundColor: 'rgba(51, 65, 85, 0.6)', height: '6px', borderRadius: '9999px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div
                    style={{
                      backgroundColor: '#fbbf24',
                      height: '100%',
                      borderRadius: '9999px',
                      width: `${data.funnel?.total_applications > 0 ? (data.funnel.interviewing_count / data.funnel.total_applications) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#34d399', margin: 0 }}>Offer</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace', margin: 0 }}>{data.funnel?.offer_count}</p>
                <div style={{ width: '100%', backgroundColor: 'rgba(51, 65, 85, 0.6)', height: '6px', borderRadius: '9999px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div
                    style={{
                      backgroundColor: '#34d399',
                      height: '100%',
                      borderRadius: '9999px',
                      width: `${data.funnel?.total_applications > 0 ? (data.funnel.offer_count / data.funnel.total_applications) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#fb7185', margin: 0 }}>Archived</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fb7185', fontFamily: 'monospace', margin: 0 }}>{data.funnel?.rejected_count}</p>
                <div style={{ width: '100%', backgroundColor: 'rgba(51, 65, 85, 0.6)', height: '6px', borderRadius: '9999px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div
                    style={{
                      backgroundColor: '#fb7185',
                      height: '100%',
                      borderRadius: '9999px',
                      width: `${data.funnel?.total_applications > 0 ? (data.funnel.rejected_count / data.funnel.total_applications) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Market Skill Demand vs Candidate Alignment */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Sparkles style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
                <span>Target Market Skill Demand vs Candidate Evidence</span>
              </h3>

              <div className="grid-2">
                {data.top_skills?.map((s, idx) => (
                  <div
                    key={idx}
                    style={{ padding: '0.875rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      {s.matched_by_candidate ? (
                        <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                          <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                        </div>
                      ) : (
                        <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                          <AlertTriangle style={{ width: '16px', height: '16px' }} />
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>{s.skill}</p>
                        <p style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontFamily: 'monospace', margin: '0.125rem 0 0' }}>
                          {s.matched_by_candidate ? 'Verified in profile/RAG' : 'Skill gap / missing evidence'}
                        </p>
                      </div>
                    </div>

                    <span className="badge badge-indigo" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {s.count} {s.count === 1 ? 'role' : 'roles'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Performance & Architecture telemetry */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '420px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Cpu style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
                <span>System Architecture Telemetry</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Database style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                    <span>pgvector Chunks Indexed</span>
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
                    {data.system?.total_pgvector_chunks}
                  </span>
                </div>

                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Zap style={{ width: '14px', height: '14px', color: '#fbbf24' }} />
                    <span>Avg Agent Workflow Latency</span>
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
                    {data.system?.avg_agent_duration_ms}ms
                  </span>
                </div>

                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <ShieldCheck style={{ width: '14px', height: '14px', color: '#34d399' }} />
                    <span>Hallucination Filter</span>
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#34d399' }}>Strict Guard Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
