import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
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

const AGENTS = [
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

export const AgentsStudio = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [activeAgent, setActiveAgent] = useState('job_scout');
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jList = await api.listJobs();
        setJobs(jList || []);
        if (jList && jList.length > 0) setSelectedJobId(jList[0].id);
      } catch (err) {
        console.error('Failed to load jobs for agent studio', err);
      }
    };
    loadJobs();
  }, []);

  const handleLaunchRun = async (agentType) => {
    setActiveAgent(agentType);
    setRunning(true);
    setError(null);
    try {
      const res = await api.runAgent({
        agent_type: agentType,
        job_id: selectedJobId || undefined,
      });
      setRunResult(res);
    } catch (err) {
      setError(err.message || 'Agent execution failed');
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Bot style={{ width: '24px', height: '24px', color: 'var(--brand-primary)' }} />
            <span>LangGraph Multi-Agent Studio</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Autonomous multi-agent workflows with stateful conditional routing, tool allow-lists, and execution trace auditing.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-indigo" style={{ fontFamily: 'monospace' }}>
            Section 3.5
          </span>
        </div>
      </div>

      {/* Target Job Selector Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <Briefcase style={{ width: '16px', height: '16px', color: 'var(--brand-primary)', flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>Contextual Target Job:</span>
          {jobs.length > 0 ? (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', width: 'auto' }}
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.title} ({j.seniority})
                </option>
              ))}
            </select>
          ) : (
            <span style={{ color: '#fbbf24', fontStyle: 'italic' }}>No ingested jobs yet (agents will use global profile criteria)</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Cpu style={{ width: '14px', height: '14px', color: '#34d399' }} />
          <span>Orchestrator:</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>LangGraph v0.2 + Redis State Checkpointing</span>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid-3">
        {AGENTS.map((agent) => {
          const isCurrent = activeAgent === agent.type && running;
          return (
            <div
              key={agent.type}
              className="glass-panel"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-indigo" style={{ fontFamily: 'monospace' }}>
                    {agent.badge}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                    <span>Active</span>
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{agent.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{agent.description}</p>

                <div style={{ paddingTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Authorized Tools:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {agent.tools.map((t) => (
                      <span
                        key={t}
                        className="badge badge-neutral"
                        style={{ fontFamily: 'monospace', fontSize: '0.625rem' }}
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
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}
              >
                {isCurrent ? (
                  <>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #ffffff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                    <span>Executing Workflow...</span>
                  </>
                ) : (
                  <>
                    <Play style={{ width: '14px', height: '14px', fill: 'currentColor' }} />
                    <span>Launch {agent.name}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Execution Results & Trace Section */}
      {runResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary & Score Banner */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(99, 102, 241, 0.3)', backgroundColor: 'rgba(49, 46, 129, 0.15)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 style={{ width: '20px', height: '20px', color: '#34d399' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Agent Execution Succeeded</h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{runResult.summary}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Groundedness Score</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
                  {(runResult.groundedness_score * 100).toFixed(0)}%
                </p>
              </div>
              <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Execution Steps</p>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>{runResult.traces?.length || 0}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Left: Step-by-Step Trace Timeline */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
                <span>Execution Trace & Tool Calls</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {runResult.traces?.map((trace) => (
                  <div
                    key={trace.step_number}
                    style={{ padding: '0.875rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '20px', height: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--brand-primary)', fontSize: '0.625rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {trace.step_number}
                        </span>
                        <span style={{ fontWeight: 600, color: '#ffffff' }}>{trace.agent_name}</span>
                      </div>
                      <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock style={{ width: '10px', height: '10px' }} />
                        <span>{trace.duration_ms}ms</span>
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>{trace.action}</p>

                    {trace.tool_called && (
                      <div style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: 'var(--brand-primary)', backgroundColor: 'rgba(49, 46, 129, 0.4)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
                        call: {trace.tool_called}()
                      </div>
                    )}

                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', backgroundColor: 'rgba(2, 6, 23, 0.4)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', margin: 0 }}>
                      {trace.observation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Deliverables & Generated Artifacts */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
                  <span>Synthesized Output</span>
                </h4>
                {runResult.outputs?.tailored_pitch && (
                  <button
                    onClick={() => handleCopy(runResult.outputs.tailored_pitch)}
                    style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    {copied ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                    <span>{copied ? 'Copied' : 'Copy Pitch'}</span>
                  </button>
                )}
              </div>

              {/* Application Assistant Output */}
              {runResult.outputs?.tailored_pitch && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: '18rem', overflowY: 'auto' }}>
                    {runResult.outputs.tailored_pitch}
                  </div>
                  {runResult.outputs.key_talking_points && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', paddingTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Key Grounded Talking Points:</p>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', listStyle: 'none', padding: 0, margin: 0 }}>
                        {runResult.outputs.key_talking_points.map((pt, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', marginTop: '6px', flexShrink: 0 }} />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Job Scout Output */}
              {runResult.outputs?.recommendations && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {runResult.outputs.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      style={{ padding: '0.875rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>{rec.title}</span>
                        <span className="badge badge-success" style={{ fontFamily: 'monospace' }}>
                          {rec.match_score}% Match
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0 }}>
                        <Building2 style={{ width: '12px', height: '12px', color: 'var(--brand-primary)' }} />
                        <span>{rec.company}</span>
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', margin: 0, paddingTop: '0.25rem' }}>{rec.rationale}</p>
                    </div>
                  ))}
                  {runResult.outputs.market_insight && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontStyle: 'italic', paddingTop: '0.5rem', margin: 0 }}>
                      💡 {runResult.outputs.market_insight}
                    </p>
                  )}
                </div>
              )}

              {/* Prep Coach Output */}
              {runResult.outputs?.interview_questions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {runResult.outputs.interview_questions.map((q, idx) => (
                    <div
                      key={idx}
                      style={{ padding: '1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.75rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 600 }}>
                        <span>{q.category}</span>
                        <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>
                          Q{idx + 1}
                        </span>
                      </div>
                      <p style={{ color: '#ffffff', fontWeight: 500, margin: 0 }}>{q.question}</p>
                      {q.star_framework && (
                        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(2, 6, 23, 0.6)', border: '1px solid var(--border-subtle)', fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <p style={{ margin: 0 }}><strong style={{ color: 'var(--text-secondary)' }}>STAR Action:</strong> {q.star_framework.action}</p>
                          <p style={{ margin: 0 }}><strong style={{ color: '#34d399' }}>Result:</strong> {q.star_framework.result}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Citations */}
              {runResult.evidence_citations && runResult.evidence_citations.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                    <Layers style={{ width: '12px', height: '12px', color: 'var(--brand-primary)' }} />
                    <span>Grounding Verification Citations</span>
                  </p>
                  {runResult.evidence_citations.map((cite, i) => (
                    <p key={i} style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: 'var(--text-dim)', margin: 0 }}>
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
