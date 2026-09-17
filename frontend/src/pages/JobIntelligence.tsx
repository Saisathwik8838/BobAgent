import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Job, JobMatchResponse } from '../types/job';
import { Resume } from '../types/resume';
import {
  Briefcase,
  Plus,
  Target,
  Sparkles,
  Trash2,
  ExternalLink,
  Building2,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Layers,
  FileText,
  ChevronRight,
  Search,
  Check,
  X,
} from 'lucide-react';

const SAMPLE_JD = `About the Role:
We are looking for a Senior Full Stack Engineer to architect and scale our real-time collaboration engine. You will own core distributed services, real-time sync mechanisms, and modern web interfaces.

Key Responsibilities:
- Design, implement, and maintain scalable microservices in Python (FastAPI/asyncio) and PostgreSQL.
- Build high-performance frontend interfaces in React 18, TypeScript, and modern CSS.
- Optimize database queries and vector embeddings for semantic retrieval pipelines.
- Implement streaming data pipelines and caching layers using Redis.
- Collaborate with product and design teams to deliver delightful user experiences.

Mandatory Qualifications:
- 5+ years building backend systems in Python (FastAPI, SQLAlchemy, or Django).
- Strong proficiency in modern React, TypeScript, and state management.
- Hands-on experience with PostgreSQL, schema migrations, and indexing strategies.
- Experience building or integrating Vector Search, RAG, or LLM-powered applications.
- Strong understanding of Docker, CI/CD pipelines, and microservices architecture.

Preferred Qualifications:
- Familiarity with Redis pub/sub, caching strategies, and Celery / distributed tasks.
- Experience with pgvector, OpenAI API, LangChain or LangGraph.
- Experience with Kubernetes or AWS cloud deployments.`;

export const JobIntelligence: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Ingestion Form State
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [url, setUrl] = useState('');
  const [seniority, setSeniority] = useState('Senior');
  const [location, setLocation] = useState('Remote');
  const [salaryRange, setSalaryRange] = useState('$150,000 - $185,000');
  const [rawDescription, setRawDescription] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);

  // Match State
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResponse | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jList, rList] = await Promise.all([api.listJobs(), api.listResumes()]);
      setJobs(jList);
      setResumes(rList);
      if (jList.length > 0 && !selectedJob) {
        setSelectedJob(jList[0]);
      }
      if (rList.length > 0 && !selectedResumeId) {
        const primary = rList.find((r) => r.is_primary) || rList[0];
        setSelectedResumeId(primary.id);
      }
    } catch (err: any) {
      console.error('Failed to load jobs or resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Clear match result when switching jobs
  useEffect(() => {
    setMatchResult(null);
    setMatchError(null);
  }, [selectedJob?.id]);

  const handleFillSample = () => {
    setTitle('Senior Full Stack Engineer');
    setCompany('ScaleAI Systems');
    setSeniority('Senior');
    setLocation('San Francisco, CA (Hybrid)');
    setSalaryRange('$160,000 - $200,000');
    setUrl('https://jobs.example.com/scale-ai/senior-fullstack');
    setRawDescription(SAMPLE_JD);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !rawDescription.trim()) {
      setIngestError('Title, company, and raw job description are required.');
      return;
    }

    setIngesting(true);
    setIngestError(null);
    try {
      const created = await api.createJob({
        title: title.trim(),
        company: company.trim(),
        url: url.trim() || undefined,
        seniority: seniority || undefined,
        location: location.trim() || undefined,
        salary_range: salaryRange.trim() || undefined,
        raw_description: rawDescription.trim(),
      });
      setJobs((prev) => [created, ...prev]);
      setSelectedJob(created);
      setShowIngestModal(false);
      // Reset form
      setTitle('');
      setCompany('');
      setUrl('');
      setRawDescription('');
    } catch (err: any) {
      setIngestError(err.message || 'Failed to ingest job posting');
    } finally {
      setIngesting(false);
    }
  };

  const handleMatch = async () => {
    if (!selectedJob) return;
    setMatching(true);
    setMatchError(null);
    try {
      const result = await api.matchJob(selectedJob.id, selectedResumeId || undefined);
      setMatchResult(result);
    } catch (err: any) {
      setMatchError(err.message || 'Failed to match job with resume');
    } finally {
      setMatching(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this job posting?')) return;
    try {
      await api.deleteJob(jobId);
      const remaining = jobs.filter((j) => j.id !== jobId);
      setJobs(remaining);
      if (selectedJob?.id === jobId) {
        setSelectedJob(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err: any) {
      alert('Failed to delete job: ' + err.message);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            <span>Job Intelligence</span>
          </h1>
          <p className="text-sm text-slate-400">
            Ingest target job postings, extract structured skills, and verify semantic fit against candidate evidence.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Section 3.2
          </span>
          <button
            onClick={() => setShowIngestModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition shadow-lg shadow-indigo-500/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest Target Job</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading Job Intelligence data...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-white">No Target Jobs Ingested</h3>
          <p className="text-sm text-slate-400">
            Add a target job posting by pasting the job description or filling in key details. BobAgent will parse mandatory & preferred technical skills and evaluate your candidate match.
          </p>
          <button
            onClick={() => {
              handleFillSample();
              setShowIngestModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-500/20"
          >
            Ingest Sample Senior Engineer Role
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Job Postings List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/50'
                        : 'bg-slate-900/40 hover:bg-slate-800/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-white hover:text-indigo-300 transition">
                          {job.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <span className="flex items-center space-x-1 font-medium text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{job.company}</span>
                          </span>
                          <span>•</span>
                          <span>{job.seniority}</span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition ${
                          isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'
                        }`}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.mandatory_skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.mandatory_skills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[11px] font-mono text-slate-500">
                          +{job.mandatory_skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Job Detail & Candidate Matcher */}
          <div className="lg:col-span-8 space-y-6">
            {selectedJob && (
              <>
                {/* Header Card */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
                        {selectedJob.url && (
                          <a
                            href={selectedJob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 transition"
                            title="Open external job posting"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center space-x-1 text-slate-300 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{selectedJob.company}</span>
                        </span>
                        {selectedJob.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{selectedJob.location}</span>
                          </span>
                        )}
                        {selectedJob.salary_range && (
                          <span className="flex items-center space-x-1 text-emerald-400 font-mono">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{selectedJob.salary_range}</span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                          {selectedJob.seniority}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteJob(selectedJob.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/20 self-start"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Semantic Match Launcher Bar */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-3.5 rounded-xl border">
                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                      <Target className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-medium">Candidate Resume Match:</span>
                      {resumes.length > 0 ? (
                        <select
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                        >
                          {resumes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.title} {r.is_primary ? '(Primary)' : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-amber-400 italic">Upload a resume in ResumeHub first</span>
                      )}
                    </div>

                    <button
                      onClick={handleMatch}
                      disabled={matching || resumes.length === 0}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
                    >
                      {matching ? (
                        <>
                          <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                          <span>Evaluating Fit...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Run Semantic Match</span>
                        </>
                      )}
                    </button>
                  </div>

                  {matchError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-xs text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{matchError}</span>
                    </div>
                  )}
                </div>

                {/* Match Evaluation Results Display */}
                {matchResult && (
                  <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-5 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${
                            matchResult.match_percentage >= 70
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : matchResult.match_percentage >= 45
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {matchResult.match_percentage}%
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            Candidate Match Evaluation
                          </h3>
                          <p className="text-xs text-slate-400">
                            Zero-fabrication verification against indexed candidate evidence
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                        {matchResult.matched_skills.length} /{' '}
                        {matchResult.matched_skills.length + matchResult.missing_skills.length} Skills
                      </span>
                    </div>

                    {/* Match Rationale */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-indigo-300 block mb-1">Fit Rationale:</span>
                      {matchResult.match_rationale}
                    </div>

                    {/* Matched & Missing Skills Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-2">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Matched Requirements ({matchResult.matched_skills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {matchResult.matched_skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>{skill}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-2">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Missing / Gap Requirements ({matchResult.missing_skills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {matchResult.missing_skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center space-x-1"
                            >
                              <X className="w-3 h-3" />
                              <span>{skill}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Evidence Citations */}
                    {matchResult.evidence_citations && matchResult.evidence_citations.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Grounding Evidence Traces</span>
                        </h4>
                        <div className="space-y-1.5">
                          {matchResult.evidence_citations.map((cite, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-mono"
                            >
                              "{cite}"
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Structured Requirements Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mandatory Skills */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
                      <Target className="w-3.5 h-3.5 text-rose-400" />
                      <span>Mandatory Qualifications ({selectedJob.mandatory_skills.length})</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.mandatory_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Skills */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Preferred / Nice-to-Have ({selectedJob.preferred_skills.length})</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.preferred_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Responsibilities */}
                {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Core Responsibilities</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {selectedJob.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Raw Job Description Accordion */}
                <details className="glass-panel p-5 rounded-2xl border border-slate-800/80 group">
                  <summary className="text-xs font-semibold text-slate-400 cursor-pointer hover:text-slate-200 transition flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Raw Job Description Text</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 group-open:hidden">Show</span>
                    <span className="text-[11px] font-mono text-slate-500 hidden group-open:inline">Hide</span>
                  </summary>
                  <pre className="mt-4 p-4 rounded-xl bg-slate-950/80 text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed border border-slate-800/60 max-h-96 overflow-y-auto">
                    {selectedJob.raw_description}
                  </pre>
                </details>
              </>
            )}
          </div>
        </div>
      )}

      {/* Ingest Job Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel max-w-2xl w-full p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Ingest Target Job Posting</h3>
                  <p className="text-xs text-slate-400">Extracts skills, seniority, and match criteria</p>
                </div>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIngest} className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fill Sample Senior Engineer JD</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, OpenAI"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Seniority</label>
                  <select
                    value={seniority}
                    onChange={(e) => setSeniority(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Staff/Principal">Staff / Principal</option>
                    <option value="Engineering Manager">Engineering Manager</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, San Francisco"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $160k - $200k"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Job Posting URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/job-id"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Raw Job Description Text *</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste the full job description text with role requirements, responsibilities, and qualifications..."
                  value={rawDescription}
                  onChange={(e) => setRawDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                />
              </div>

              {ingestError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ingestError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingesting}
                  className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition"
                >
                  {ingesting ? (
                    <>
                      <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Parsing Requirements...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse & Ingest Job</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
