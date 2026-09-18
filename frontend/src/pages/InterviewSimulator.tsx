import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Job } from '../types/job';
import {
  InterviewQuestion,
  InterviewSessionResponse,
  AnswerEvaluationResponse,
} from '../types/interview';
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

export const InterviewSimulator: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [roleTitle, setRoleTitle] = useState('Senior Distributed Systems Engineer');
  const [difficulty, setDifficulty] = useState('Senior');

  // Session State
  const [session, setSession] = useState<InterviewSessionResponse | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [starting, setStarting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluationResponse | null>(null);
  const [history, setHistory] = useState<{ question: InterviewQuestion; eval: AnswerEvaluationResponse }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jList = await api.listJobs();
        setJobs(jList);
        if (jList.length > 0) {
          setSelectedJobId(jList[0].id);
          setRoleTitle(`${jList[0].title} at ${jList[0].company}`);
        }
      } catch (err) {
        console.error('Failed to load jobs for interview simulator', err);
      }
    };
    loadJobs();
  }, []);

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    const found = jobs.find((j) => j.id === jobId);
    if (found) {
      setRoleTitle(`${found.title} at ${found.company}`);
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <MessageSquareCode className="w-6 h-6 text-indigo-400" />
            <span>Adaptive Interview Simulator</span>
          </h1>
          <p className="text-sm text-slate-400">
            Practice realistic technical and architectural questions tailored to target job requirements with immediate criteria-based answer scoring.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Section 3.6
        </span>
      </div>

      {!session ? (
        /* Configuration Setup Panel */
        <div className="glass-panel p-8 rounded-2xl border border-slate-800/80 max-w-2xl mx-auto space-y-6 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configure Simulation Session</h2>
              <p className="text-xs text-slate-400">Tailored to job requirements and candidate ground-truth</p>
            </div>
          </div>

          <form onSubmit={handleStartSession} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Role Context</label>
              {jobs.length > 0 ? (
                <select
                  value={selectedJobId}
                  onChange={(e) => handleJobSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Senior Backend Engineer"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Interview Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Mid-Level">Mid-Level Engineer</option>
                  <option value="Senior">Senior Engineer</option>
                  <option value="Staff/Principal">Staff / Principal Architect</option>
                  <option value="Engineering Manager">Engineering Manager</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Evaluation Engine</label>
                <div className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>Structured LLM Judge</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Zero Hallucination</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={starting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition mt-2"
            >
              {starting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Synthesizing Tailored Questions...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Begin Mock Interview Session</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Active Interview Dialogue Interface */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Session Progress Bar */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex flex-col space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                  Question {currentIdx + 1} of {session.questions.length}
                </span>
                <span className="text-xs text-slate-300 font-medium">{session.role_title}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-mono">Difficulty: {session.difficulty}</span>
                <button
                  onClick={() => setSession(null)}
                  className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 pl-2 border-l border-slate-800"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {history.length > 0 && (
              <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Prior Scores:</span>
                {history.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"
                  >
                    Q{i + 1}: {h.eval.score}%
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Question Card */}
          {currentQ && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                  {currentQ.category}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Scenario Q{currentIdx + 1}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {currentQ.question_text}
              </h3>

              {/* Expected Rubric Concepts */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Key Concepts Interviewers Look For:</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentQ.expected_points.map((pt, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {pt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Answer Input Area */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Your Technical Response</label>
                  <button
                    type="button"
                    onClick={() => setAnswerText(SAMPLE_ANSWER)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fill High-Signal Sample Answer</span>
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Articulate your architectural decision, specific tools used, trade-offs evaluated, and measurable outcomes achieved..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-slate-500">
                    {answerText.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !answerText.trim()}
                    className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
                  >
                    {evaluating ? (
                      <>
                        <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Evaluating Criteria...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Response for Scoring</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time Evaluation Card */}
              {evaluation && (
                <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${
                          evaluation.score >= 80
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {evaluation.score}%
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Answer Evaluation Score</h4>
                        <p className="text-xs text-slate-400">Scored on correctness, clarity, and architectural depth</p>
                      </div>
                    </div>

                    {currentIdx < session.questions.length - 1 ? (
                      <button
                        onClick={handleNextQuestion}
                        className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                        <Award className="w-4 h-4" />
                        <span>Session Complete!</span>
                      </div>
                    )}
                  </div>

                  {/* Sub-scores */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 font-medium">Correctness</p>
                      <p className="text-sm font-bold text-white font-mono mt-0.5">{evaluation.correctness}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 font-medium">Clarity</p>
                      <p className="text-sm font-bold text-white font-mono mt-0.5">{evaluation.clarity}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-400 font-medium">Depth</p>
                      <p className="text-sm font-bold text-white font-mono mt-0.5">{evaluation.depth}%</p>
                    </div>
                  </div>

                  {/* Qualitative Feedback */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-indigo-300 block mb-1">Evaluator Feedback:</strong>
                    {evaluation.feedback}
                  </div>

                  {/* Missing concepts */}
                  {evaluation.missing_concepts && evaluation.missing_concepts.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                      <strong className="block font-semibold">Suggested Additions:</strong>
                      <ul className="list-disc list-inside space-y-0.5">
                        {evaluation.missing_concepts.map((mc, idx) => (
                          <li key={idx}>{mc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Grounded tip */}
                  <div className="text-[11px] text-slate-400 italic">
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
