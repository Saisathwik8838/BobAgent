import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AgentRunResponse } from '../types/agent';
import { Job } from '../types/job';
import {
  Bot,
  Play,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Copy,
  Check,
  Building2,
  Briefcase,
  AlertCircle,
  Cpu,
  Terminal,
} from 'lucide-react';

interface AgentCard {
  type: 'job_scout' | 'application_assistant' | 'prep_coach';
  name: string;
  badge: string;
  description: string;
  tools: string[];
}

const AGENTS: AgentCard[] = [
  {
    type: 'job_scout',
    name: 'Job Scout Agent',
    badge: 'Market Discovery',
    description: 'Autonomous market retrieval cross-referencing candidate profile criteria with semantic match scoring.',
    tools: ['get_candidate_profile', 'search_job_information', 'calculate_skill_gap'],
  },
  {
    type: 'application_assistant',
    name: 'Application Assistant',
    badge: 'Zero-Fabrication Synthesis',
    description: 'Synthesizes targeted pitch narratives and cover letters using strictly verified candidate evidence chunks.',
    tools: ['get_job', 'retrieve_candidate_evidence', 'generate_cover_letter', 'evaluate_output'],
  },
  {
    type: 'prep_coach',
    name: 'Interview Prep Coach',
    badge: 'STAR Scenario Formulation',
    description: 'Formulates technical interview scenarios and maps candidate achievements into STAR answer outlines.',
    tools: ['get_job', 'generate_interview_questions', 'search_candidate_projects'],
  },
];

export const AgentsStudio: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [activeAgent, setActiveAgent] = useState<'job_scout' | 'application_assistant' | 'prep_coach'>('job_scout');
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<AgentRunResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jList = await api.listJobs();
        setJobs(jList);
        if (jList.length > 0) setSelectedJobId(jList[0].id);
      } catch (err) {
        console.error('Failed to load jobs for agent studio', err);
      }
    };
    loadJobs();
  }, []);

  const handleLaunchRun = async (agentType: 'job_scout' | 'application_assistant' | 'prep_coach') => {
    setActiveAgent(agentType);
    setRunning(true);
    setError(null);
    try {
      const res = await api.runAgent({
        agent_type: agentType,
        job_id: selectedJobId || undefined,
      });
      setRunResult(res);
    } catch (err: any) {
      setError(err.message || 'Agent execution failed');
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Bot className="w-6 h-6 text-indigo-400" />
            <span>LangGraph Multi-Agent Studio</span>
          </h1>
          <p className="text-sm text-slate-400">
            Autonomous multi-agent workflows with stateful conditional routing, tool allow-lists, and execution trace auditing.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Section 3.5
          </span>
        </div>
      </div>

      {/* Target Job Selector Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 text-xs text-slate-300">
          <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-semibold">Contextual Target Job:</span>
          {jobs.length > 0 ? (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.title} ({j.seniority})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-amber-400 italic">No ingested jobs yet (agents will use global profile criteria)</span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Orchestrator:</span>
          <span className="font-mono text-slate-200">LangGraph v0.2 + Redis State Checkpointing</span>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AGENTS.map((agent) => {
          const isCurrent = activeAgent === agent.type && running;
          return (
            <div
              key={agent.type}
              className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {agent.badge}
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{agent.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{agent.description}</p>

                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Authorized Tools:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.tools.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLaunchRun(agent.type)}
                disabled={running}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
              >
                {isCurrent ? (
                  <>
                    <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Executing Workflow...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch {agent.name}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Execution Results & Trace Section */}
      {runResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary & Score Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Agent Execution Succeeded</h3>
              </div>
              <p className="text-xs text-slate-300">{runResult.summary}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-[11px] text-slate-400 font-medium">Groundedness Score</p>
                <p className="text-lg font-bold text-emerald-400 font-mono">
                  {(runResult.groundedness_score * 100).toFixed(0)}%
                </p>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <p className="text-[11px] text-slate-400 font-medium">Execution Steps</p>
                <p className="text-lg font-bold text-white font-mono">{runResult.traces.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Step-by-Step Trace Timeline */}
            <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Execution Trace & Tool Calls</span>
              </h4>

              <div className="space-y-3">
                {runResult.traces.map((trace) => (
                  <div
                    key={trace.step_number}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono flex items-center justify-center font-bold">
                          {trace.step_number}
                        </span>
                        <span className="font-semibold text-white">{trace.agent_name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{trace.duration_ms}ms</span>
                      </span>
                    </div>

                    <p className="text-slate-300 font-medium">{trace.action}</p>

                    {trace.tool_called && (
                      <div className="text-[10px] font-mono text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-2 py-1 rounded inline-block">
                        call: {trace.tool_called}()
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                      {trace.observation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Deliverables & Generated Artifacts */}
            <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Synthesized Output</span>
                </h4>
                {runResult.outputs.tailored_pitch && (
                  <button
                    onClick={() => handleCopy(runResult.outputs.tailored_pitch)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Pitch'}</span>
                  </button>
                )}
              </div>

              {/* Application Assistant Output */}
              {runResult.outputs.tailored_pitch && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {runResult.outputs.tailored_pitch}
                  </div>
                  {runResult.outputs.key_talking_points && (
                    <div className="space-y-1.5 pt-2">
                      <p className="text-xs font-semibold text-slate-300">Key Grounded Talking Points:</p>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {runResult.outputs.key_talking_points.map((pt: string, idx: number) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Job Scout Output */}
              {runResult.outputs.recommendations && (
                <div className="space-y-3">
                  {runResult.outputs.recommendations.map((rec: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{rec.title}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          {rec.match_score}% Match
                        </span>
                      </div>
                      <p className="text-slate-400 flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-indigo-400" />
                        <span>{rec.company}</span>
                      </p>
                      <p className="text-[11px] text-slate-300 pt-1">{rec.rationale}</p>
                    </div>
                  ))}
                  {runResult.outputs.market_insight && (
                    <p className="text-xs text-indigo-300 italic pt-2">
                      💡 {runResult.outputs.market_insight}
                    </p>
                  )}
                </div>
              )}

              {/* Prep Coach Output */}
              {runResult.outputs.interview_questions && (
                <div className="space-y-3">
                  {runResult.outputs.interview_questions.map((q: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-indigo-400 font-semibold">
                        <span>{q.category}</span>
                        <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          Q{idx + 1}
                        </span>
                      </div>
                      <p className="text-white font-medium">{q.question}</p>
                      {q.star_framework && (
                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                          <p><strong className="text-slate-300">STAR Action:</strong> {q.star_framework.action}</p>
                          <p><strong className="text-emerald-400">Result:</strong> {q.star_framework.result}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Citations */}
              {runResult.evidence_citations && runResult.evidence_citations.length > 0 && (
                <div className="border-t border-slate-800/80 pt-3 space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    <span>Grounding Verification Citations</span>
                  </p>
                  {runResult.evidence_citations.map((cite, i) => (
                    <p key={i} className="text-[10px] font-mono text-slate-500">
                      • {cite}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
