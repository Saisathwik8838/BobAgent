import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsDashboardResponse } from '../types/eval';
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

export const EvalAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsDashboardResponse | null>(null);
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Evaluation & Career Analytics</span>
          </h1>
          <p className="text-sm text-slate-400">
            Real-time conversion funnels, pgvector performance latency, and verifiable zero-hallucination tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Section 3.7
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-400">Aggregating career intelligence metrics...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top 3 High-Impact Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Groundedness Card */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Groundedness Integrity</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {data.groundedness.llm_judge_verdict}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {data.groundedness.groundedness_score_pct}%
                </span>
                <span className="text-xs text-emerald-400">Verified Evidence</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {data.groundedness.unsupported_claims_detected} unsupported claims detected across{' '}
                {data.groundedness.total_claims_audited} audited candidate assertions.
              </p>
            </div>

            {/* Application Funnel Conversion */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Pipeline Conversion</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {data.funnel.total_applications} Applications
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {data.funnel.conversion_rate_pct}%
                </span>
                <span className="text-xs text-indigo-300">Offer Conversion Rate</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {data.funnel.interviewing_count} currently in active interviews, {data.funnel.offer_count} offers extended.
              </p>
            </div>

            {/* Performance Latency */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Retrieval & Cache</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  pgvector HNSW
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {data.system.avg_retrieval_latency_ms}ms
                </span>
                <span className="text-xs text-amber-300">Avg Retrieval Latency</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {data.system.cache_hit_ratio_pct}% Redis cache hit ratio across vector embedding queries.
              </p>
            </div>
          </div>

          {/* Application Funnel Breakdown Progress */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Full Pipeline Stage Funnel</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
                <p className="text-xs text-slate-400">Saved</p>
                <p className="text-xl font-bold text-white font-mono">{data.funnel.saved_count}</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
                <p className="text-xs text-indigo-400">Applied</p>
                <p className="text-xl font-bold text-indigo-300 font-mono">{data.funnel.applied_count}</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{
                      width: `${data.funnel.total_applications > 0 ? (data.funnel.applied_count / data.funnel.total_applications) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
                <p className="text-xs text-amber-400">Interviewing</p>
                <p className="text-xl font-bold text-amber-300 font-mono">{data.funnel.interviewing_count}</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${data.funnel.total_applications > 0 ? (data.funnel.interviewing_count / data.funnel.total_applications) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
                <p className="text-xs text-emerald-400">Offer</p>
                <p className="text-xl font-bold text-emerald-300 font-mono">{data.funnel.offer_count}</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${data.funnel.total_applications > 0 ? (data.funnel.offer_count / data.funnel.total_applications) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
                <p className="text-xs text-rose-400">Archived</p>
                <p className="text-xl font-bold text-rose-300 font-mono">{data.funnel.rejected_count}</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{
                      width: `${data.funnel.total_applications > 0 ? (data.funnel.rejected_count / data.funnel.total_applications) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Market Skill Demand vs Candidate Alignment */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Target Market Skill Demand vs Candidate Evidence</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.top_skills.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      {s.matched_by_candidate ? (
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-white">{s.skill}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {s.matched_by_candidate ? 'Verified in profile/RAG' : 'Skill gap / missing evidence'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                      {s.count} {s.count === 1 ? 'role' : 'roles'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Performance & Architecture telemetry */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>System Architecture Telemetry</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span>pgvector Chunks Indexed</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {data.system.total_pgvector_chunks}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Avg Agent Workflow Latency</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {data.system.avg_agent_duration_ms}ms
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hallucination Filter</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">Strict Guard Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
