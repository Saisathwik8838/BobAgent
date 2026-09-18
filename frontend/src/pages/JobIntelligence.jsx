import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
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

export const JobIntelligence = () => {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
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
  const [ingestError, setIngestError] = useState(null);

  // Match State
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [matchError, setMatchError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jList, rList] = await Promise.all([api.listJobs(), api.listResumes()]);
      setJobs(jList || []);
      setResumes(rList || []);
      if (jList && jList.length > 0 && !selectedJob) {
        setSelectedJob(jList[0]);
      }
      if (rList && rList.length > 0 && !selectedResumeId) {
        const primary = rList.find((r) => r.is_primary) || rList[0];
        setSelectedResumeId(primary.id);
      }
    } catch (err) {
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

  const handleIngest = async (e) => {
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
    } catch (err) {
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
    } catch (err) {
      setMatchError(err.message || 'Failed to match job with resume');
    } finally {
      setMatching(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to remove this job posting?')) return;
    try {
      await api.deleteJob(jobId);
      const remaining = jobs.filter((j) => j.id !== jobId);
      setJobs(remaining);
      if (selectedJob?.id === jobId) {
        setSelectedJob(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      alert('Failed to delete job: ' + (err.message || err));
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Briefcase style={{ width: '24px', height: '24px', color: 'var(--brand-primary)' }} />
            <span>Job Intelligence</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Ingest target job postings, extract structured skills, and verify semantic fit against candidate evidence.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-indigo" style={{ fontFamily: 'monospace' }}>
            Section 3.2
          </span>
          <button
            onClick={() => setShowIngestModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>Ingest Target Job</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--brand-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading Job Intelligence data...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '576px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-2xl)', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
            <Target style={{ width: '28px', height: '28px' }} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>No Target Jobs Ingested</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Add a target job posting by pasting the job description or filling in key details. BobAgent will parse mandatory & preferred technical skills and evaluate your candidate match.
          </p>
          <button
            onClick={() => {
              handleFillSample();
              setShowIngestModal(true);
            }}
            className="btn btn-primary"
          >
            Ingest Sample Senior Engineer Role
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Left Column: Job Postings List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search jobs or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: '720px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-xl)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-normal)',
                      border: isSelected ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(49, 46, 129, 0.4)' : 'rgba(15, 23, 42, 0.6)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                          {job.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                            <Building2 style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                            <span>{job.company}</span>
                          </span>
                          <span>•</span>
                          <span>{job.seniority}</span>
                        </div>
                      </div>
                      <ChevronRight
                        style={{ width: '16px', height: '16px', color: isSelected ? 'var(--brand-primary)' : 'var(--text-dim)' }}
                      />
                    </div>

                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {job.mandatory_skills?.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="badge badge-neutral"
                          style={{ fontFamily: 'monospace', fontSize: '0.6875rem' }}
                        >
                          {skill}
                        </span>
                      ))}
                      {job.mandatory_skills && job.mandatory_skills.length > 3 && (
                        <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: 'var(--text-dim)', alignSelf: 'center' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            {selectedJob && (
              <>
                {/* Header Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>{selectedJob.title}</h2>
                        {selectedJob.url && (
                          <a
                            href={selectedJob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}
                            title="Open external job posting"
                          >
                            <ExternalLink style={{ width: '16px', height: '16px' }} />
                          </a>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          <Building2 style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                          <span>{selectedJob.company}</span>
                        </span>
                        {selectedJob.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                            <span>{selectedJob.location}</span>
                          </span>
                        )}
                        {selectedJob.salary_range && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#34d399', fontFamily: 'monospace' }}>
                            <DollarSign style={{ width: '14px', height: '14px' }} />
                            <span>{selectedJob.salary_range}</span>
                          </span>
                        )}
                        <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>
                          {selectedJob.seniority}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteJob(selectedJob.id)}
                      style={{ padding: '0.5rem', color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-lg)' }}
                      title="Delete Job"
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>

                  {/* Semantic Match Launcher Bar */}
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: 'rgba(2, 6, 23, 0.4)', padding: '0.875rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Target style={{ width: '16px', height: '16px', color: 'var(--brand-primary)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>Candidate Resume Match:</span>
                      {resumes.length > 0 ? (
                        <select
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="form-input"
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', width: 'auto' }}
                        >
                          {resumes.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.title} {r.is_primary ? '(Primary)' : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ color: '#fbbf24', fontStyle: 'italic' }}>Upload a resume in ResumeHub first</span>
                      )}
                    </div>

                    <button
                      onClick={handleMatch}
                      disabled={matching || resumes.length === 0}
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                    >
                      {matching ? (
                        <>
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #ffffff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                          <span>Evaluating Fit...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles style={{ width: '14px', height: '14px' }} />
                          <span>Run Semantic Match</span>
                        </>
                      )}
                    </button>
                  </div>

                  {matchError && (
                    <div className="alert-box alert-danger">
                      <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                      <span>{matchError}</span>
                    </div>
                  )}
                </div>

                {/* Match Evaluation Results Display */}
                {matchResult && (
                  <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(99, 102, 241, 0.3)', backgroundColor: 'rgba(49, 46, 129, 0.1)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                            border: matchResult.match_percentage >= 70 ? '1px solid rgba(16, 185, 129, 0.3)' : matchResult.match_percentage >= 45 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                            backgroundColor: matchResult.match_percentage >= 70 ? 'rgba(16, 185, 129, 0.1)' : matchResult.match_percentage >= 45 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                            color: matchResult.match_percentage >= 70 ? '#34d399' : matchResult.match_percentage >= 45 ? '#fbbf24' : '#fb7185'
                          }}
                        >
                          {matchResult.match_percentage}%
                        </div>
                        <div>
                          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                            Candidate Match Evaluation
                          </h3>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Zero-fabrication verification against indexed candidate evidence
                          </p>
                        </div>
                      </div>
                      <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>
                        {matchResult.matched_skills?.length || 0} /{' '}
                        {(matchResult.matched_skills?.length || 0) + (matchResult.missing_skills?.length || 0)} Skills
                      </span>
                    </div>

                    {/* Match Rationale */}
                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 600, color: 'var(--brand-primary)', display: 'block', marginBottom: '0.25rem' }}>Fit Rationale:</span>
                      {matchResult.match_rationale}
                    </div>

                    {/* Matched & Missing Skills Columns */}
                    <div className="grid-2">
                      <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>
                          <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                          <span>Matched Requirements ({matchResult.matched_skills?.length || 0})</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', paddingTop: '0.25rem' }}>
                          {matchResult.matched_skills?.map((skill, i) => (
                            <span
                              key={i}
                              className="badge badge-success"
                              style={{ fontFamily: 'monospace', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Check style={{ width: '12px', height: '12px' }} />
                              <span>{skill}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24' }}>
                          <AlertCircle style={{ width: '14px', height: '14px' }} />
                          <span>Missing / Gap Requirements ({matchResult.missing_skills?.length || 0})</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', paddingTop: '0.25rem' }}>
                          {matchResult.missing_skills?.map((skill, i) => (
                            <span
                              key={i}
                              className="badge badge-warning"
                              style={{ fontFamily: 'monospace', fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <X style={{ width: '12px', height: '12px' }} />
                              <span>{skill}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Evidence Citations */}
                    {matchResult.evidence_citations && matchResult.evidence_citations.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Layers style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                          <span>Grounding Evidence Traces</span>
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          {matchResult.evidence_citations.map((cite, idx) => (
                            <div
                              key={idx}
                              style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-subtle)', fontSize: '0.6875rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}
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
                <div className="grid-2">
                  {/* Mandatory Skills */}
                  <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target style={{ width: '14px', height: '14px', color: '#fb7185' }} />
                      <span>Mandatory Qualifications ({selectedJob.mandatory_skills?.length || 0})</span>
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedJob.mandatory_skills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="badge badge-danger"
                          style={{ fontFamily: 'monospace' }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Skills */}
                  <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                      <span>Preferred / Nice-to-Have ({selectedJob.preferred_skills?.length || 0})</span>
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedJob.preferred_skills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="badge badge-indigo"
                          style={{ fontFamily: 'monospace' }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Responsibilities */}
                {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                  <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                      <span>Core Responsibilities</span>
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', listStyle: 'none', padding: 0, margin: 0 }}>
                      {selectedJob.responsibilities.map((resp, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', marginTop: '6px', flexShrink: 0 }} />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Raw Job Description Accordion */}
                <details className="glass-panel" style={{ padding: '1.25rem' }}>
                  <summary style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                      <span>View Raw Job Description Text</span>
                    </span>
                  </summary>
                  <pre style={{ marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(2, 6, 23, 0.8)', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6, border: '1px solid var(--border-subtle)', maxHeight: '24rem', overflowY: 'auto' }}>
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
        <div className="modal-backdrop">
          <div className="glass-panel" style={{ maxWidth: '672px', width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                  <Briefcase style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>Ingest Target Job Posting</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Extracts skills, seniority, and match criteria</p>
                </div>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                style={{ color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleIngest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleFillSample}
                  style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <Sparkles style={{ width: '14px', height: '14px' }} />
                  <span>Fill Sample Senior Engineer JD</span>
                </button>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, OpenAI"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Seniority</label>
                  <select
                    value={seniority}
                    onChange={(e) => setSeniority(e.target.value)}
                    className="form-input"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Staff/Principal">Staff / Principal</option>
                    <option value="Engineering Manager">Engineering Manager</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, San Francisco"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $160k - $200k"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Posting URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/job-id"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Raw Job Description Text *</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste the full job description text with role requirements, responsibilities, and qualifications..."
                  value={rawDescription}
                  onChange={(e) => setRawDescription(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'monospace', lineHeight: 1.6, resize: 'vertical' }}
                />
              </div>

              {ingestError && (
                <div className="alert-box alert-danger">
                  <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span>{ingestError}</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingesting}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem' }}
                >
                  {ingesting ? (
                    <>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #ffffff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                      <span>Parsing Requirements...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles style={{ width: '14px', height: '14px' }} />
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
