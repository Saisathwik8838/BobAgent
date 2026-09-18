import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  MessageSquareCode,
  Play,
  AlertCircle,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Award,
  Send,
  HelpCircle,
} from 'lucide-react';

const SAMPLE_ANSWER = `In FastAPI and PostgreSQL, I prevent connection pool exhaustion by configuring asyncpg's connection pool limits with min_size=10 and max_size=30 per worker process, paired with PgBouncer operating in transaction pooling mode. 
Additionally, for high-concurrency read queries, I implement Redis caching with TTLs to offload 85% of queries from PostgreSQL. 
Finally, I ensure all database calls are strictly awaited within async context managers so no synchronous blocking occurs on the event loop, maintaining sub-45ms p99 latency under 12,000 RPS.`;

export const InterviewSimulator = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [roleTitle, setRoleTitle] = useState('Senior Distributed Systems Engineer');
  const [difficulty, setDifficulty] = useState('Senior');

  // Session State
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [starting, setStarting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jList = await api.listJobs();
        setJobs(jList || []);
        if (jList && jList.length > 0) {
          setSelectedJobId(jList[0].id);
          setRoleTitle(`${jList[0].title} at ${jList[0].company}`);
        }
      } catch (err) {
        console.error('Failed to load jobs for interview simulator', err);
      }
    };
    loadJobs();
  }, []);

  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
    const found = jobs.find((j) => j.id === jobId);
    if (found) {
      setRoleTitle(`${found.title} at ${found.company}`);
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    setStarting(true);
    setError(null);
    setEvaluation(null);
    setHistory([]);
    setCurrentIdx(0);
    setAnswerText('');

    try {
      const newSession = await api.startInterviewSession({
        job_id: selectedJobId || undefined,
        role_title: roleTitle,
        difficulty: difficulty,
      });
      setSession(newSession);
    } catch (err) {
      setError(err.message || 'Failed to start interview session');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !answerText.trim()) return;
    const currentQ = session.questions[currentIdx];

    setEvaluating(true);
    setError(null);
    try {
      const evalResult = await api.evaluateAnswer({
        session_id: session.session_id,
        question_id: currentQ.id,
        answer_text: answerText.trim(),
      });
      setEvaluation(evalResult);
      setHistory((prev) => [...prev, { question: currentQ, eval: evalResult }]);
    } catch (err) {
      setError(err.message || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (!session) return;
    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setAnswerText('');
      setEvaluation(null);
    }
  };

  const currentQ = session?.questions[currentIdx];

  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <MessageSquareCode style={{ width: '24px', height: '24px', color: 'var(--brand-primary)' }} />
            <span>Adaptive Interview Simulator</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Practice realistic technical and architectural questions tailored to target job requirements with immediate criteria-based answer scoring.
          </p>
        </div>
        <span className="badge badge-indigo" style={{ fontFamily: 'monospace' }}>
          Section 3.6
        </span>
      </div>

      {!session ? (
        /* Configuration Setup Panel */
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '672px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
              <Sparkles style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Configure Simulation Session</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tailored to job requirements and candidate ground-truth</p>
            </div>
          </div>

          <form onSubmit={handleStartSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Role Context</label>
              {jobs.length > 0 ? (
                <select
                  value={selectedJobId}
                  onChange={(e) => handleJobSelect(e.target.value)}
                  className="form-input"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.company} — {j.title} ({j.seniority})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Senior Backend Engineer"
                />
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Interview Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="form-input"
                >
                  <option value="Mid-Level">Mid-Level Engineer</option>
                  <option value="Senior">Senior Engineer</option>
                  <option value="Staff/Principal">Staff / Principal Architect</option>
                  <option value="Engineering Manager">Engineering Manager</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Evaluation Engine</label>
                <div style={{ padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Structured LLM Judge</span>
                  <span className="badge badge-success" style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>Zero Hallucination</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert-box alert-danger">
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={starting}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {starting ? (
                <>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #ffffff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                  <span>Synthesizing Tailored Questions...</span>
                </>
              ) : (
                <>
                  <Play style={{ width: '16px', height: '16px', fill: 'currentColor' }} />
                  <span>Begin Mock Interview Session</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Active Interview Dialogue Interface */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Session Progress Bar */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-indigo" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  Question {currentIdx + 1} of {session.questions.length}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{session.role_title}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>Difficulty: {session.difficulty}</span>
                <button
                  onClick={() => setSession(null)}
                  style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.5rem' }}
                >
                  <RotateCcw style={{ width: '12px', height: '12px' }} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {history.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.625rem', textTransform: 'uppercase', fontFamily: 'monospace' }}>Prior Scores:</span>
                {history.map((h, i) => (
                  <span
                    key={i}
                    className="badge badge-success"
                    style={{ fontFamily: 'monospace', fontSize: '0.625rem', fontWeight: 700 }}
                  >
                    Q{i + 1}: {h.eval.score}%
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Question Card */}
          {currentQ && (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-indigo" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {currentQ.category}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>Scenario Q{currentIdx + 1}</span>
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.4 }}>
                {currentQ.question_text}
              </h3>

              {/* Expected Rubric Concepts */}
              <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                  <HelpCircle style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                  <span>Key Concepts Interviewers Look For:</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {currentQ.expected_points?.map((pt, i) => (
                    <span
                      key={i}
                      className="badge badge-neutral"
                      style={{ fontFamily: 'monospace', fontSize: '0.625rem' }}
                    >
                      {pt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Answer Input Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Your Technical Response</label>
                  <button
                    type="button"
                    onClick={() => setAnswerText(SAMPLE_ANSWER)}
                    style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Sparkles style={{ width: '14px', height: '14px' }} />
                    <span>Fill High-Signal Sample Answer</span>
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Articulate your architectural decision, specific tools used, trade-offs evaluated, and measurable outcomes achieved..."
                  className="form-input"
                  style={{ fontFamily: 'monospace', lineHeight: 1.6 }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                    {answerText.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !answerText.trim()}
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {evaluating ? (
                      <>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #ffffff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                        <span>Evaluating Criteria...</span>
                      </>
                    ) : (
                      <>
                        <Send style={{ width: '14px', height: '14px' }} />
                        <span>Submit Response for Scoring</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time Evaluation Card */}
              {evaluation && (
                <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-2xl)', backgroundColor: 'rgba(49, 46, 129, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-xl)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.125rem',
                          border: evaluation.score >= 80 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                          backgroundColor: evaluation.score >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: evaluation.score >= 80 ? '#34d399' : '#fbbf24'
                        }}
                      >
                        {evaluation.score}%
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>Answer Evaluation Score</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scored on correctness, clarity, and architectural depth</p>
                      </div>
                    </div>

                    {currentIdx < session.questions.length - 1 ? (
                      <button
                        onClick={handleNextQuestion}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <span>Next Question</span>
                        <ChevronRight style={{ width: '16px', height: '16px' }} />
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Award style={{ width: '16px', height: '16px' }} />
                        <span>Session Complete!</span>
                      </div>
                    )}
                  </div>

                  {/* Sub-scores */}
                  <div className="grid-3">
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontWeight: 500, margin: 0 }}>Correctness</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace', margin: '0.25rem 0 0' }}>{evaluation.correctness}%</p>
                    </div>
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontWeight: 500, margin: 0 }}>Clarity</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace', margin: '0.25rem 0 0' }}>{evaluation.clarity}%</p>
                    </div>
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontWeight: 500, margin: 0 }}>Depth</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace', margin: '0.25rem 0 0' }}>{evaluation.depth}%</p>
                    </div>
                  </div>

                  {/* Qualitative Feedback */}
                  <div style={{ padding: '1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--brand-primary)', display: 'block', marginBottom: '0.25rem' }}>Evaluator Feedback:</strong>
                    {evaluation.feedback}
                  </div>

                  {/* Missing concepts */}
                  {evaluation.missing_concepts && evaluation.missing_concepts.length > 0 && (
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.75rem', color: '#fbbf24', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <strong style={{ display: 'block', fontWeight: 600 }}>Suggested Additions:</strong>
                      <ul style={{ listStyle: 'disc', listStylePosition: 'inside', margin: 0, padding: 0 }}>
                        {evaluation.missing_concepts.map((mc, idx) => (
                          <li key={idx}>{mc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Grounded tip */}
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    💡 Tip: {evaluation.grounded_suggestion}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
