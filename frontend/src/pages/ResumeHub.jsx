import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileText,
  Upload,
  Trash2,
  GitBranch,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';

export const ResumeHub = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);

  // Upload Form
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Tailoring Modal
  const [jobs, setJobs] = useState([]);
  const [tailorJobId, setTailorJobId] = useState('');
  const [tailoring, setTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rList, jList] = await Promise.all([api.listResumes(), api.listJobs()]);
      setResumes(rList || []);
      setJobs(jList || []);
      if (rList && rList.length > 0 && !selectedResume) {
        setSelectedResume(rList[0]);
      }
    } catch (err) {
      console.error('Error fetching resumes/jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim()) {
      setUploadError('Title and resume content are required.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const created = await api.createResume({
        title: title.trim(),
        raw_text: rawText.trim(),
        is_primary: resumes.length === 0,
      });
      setUploadSuccess('Resume parsed and stored with verified candidate grounding.');
      setTitle('');
      setRawText('');
      setResumes((prev) => [created, ...prev]);
      setSelectedResume(created);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleTailor = async (e) => {
    e.preventDefault();
    if (!selectedResume || !tailorJobId) return;

    setTailoring(true);
    try {
      const res = await api.tailorResume(selectedResume.id, tailorJobId);
      setTailorResult(res);
      // Reload updated resume to refresh version history
      const updated = await api.getResume(selectedResume.id);
      setSelectedResume(updated);
      setResumes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err) {
      alert('Failed to tailor resume: ' + (err.message || err));
    } finally {
      setTailoring(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (selectedResume?.id === id) {
        setSelectedResume(resumes.find((r) => r.id !== id) || null);
      }
    } catch (err) {
      alert('Failed to delete resume: ' + (err.message || err));
    }
  };

  const loadSampleResume = () => {
    setTitle('Lead AI Systems Resume');
    setRawText(`Dr. Jane Doe
jane.doe@example.com | San Francisco, CA

EXPERIENCE
Principal AI Architect at HyperScale AI (2021 - Present):
- Built high-concurrency LangGraph and pgvector workflows with zero-fabrication evaluation guarantees.
- Scaled distributed Kubernetes microservices on AWS and Google Cloud supporting 10M daily requests.
- Engineered async FastAPI and Python services with Redis caching, reducing query latency by 45%.

Senior Software Engineer at DataStream Labs (2018 - 2021):
- Implemented real-time telemetry streaming pipelines using Kafka, Docker, and PostgreSQL.
- Mentored a team of 8 engineers and introduced CI/CD automated linting and test coverage gates.

EDUCATION
Ph.D. in Computer Science, UC Berkeley
B.S. in Electrical Engineering, MIT`);
  };

  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <FileText style={{ width: '24px', height: '24px', color: 'var(--brand-primary)' }} />
            <span>Resume Hub</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Upload, parse, version, and tailor candidate resumes against target job descriptions with verifiable grounding.
          </p>
        </div>
        <span className="badge badge-indigo" style={{ fontFamily: 'monospace' }}>
          Section 3.1
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Upload and Resumes List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upload Form */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>
                <Upload style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
                <span>Upload & Parse Resume</span>
              </div>
              <button
                type="button"
                onClick={loadSampleResume}
                style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'underline', cursor: 'pointer' }}
              >
                Load Sample
              </button>
            </div>

            {uploadSuccess && (
              <div className="alert-box alert-success">
                <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {uploadError && (
              <div className="alert-box alert-danger">
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Resume Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lead Systems Resume 2024"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resume Text (Markdown or Plain Text)</label>
                <textarea
                  required
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste resume experience, technical skills, and education..."
                  className="form-input"
                  style={{ resize: 'none', fontFamily: 'monospace', fontSize: '0.75rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Upload style={{ width: '16px', height: '16px' }} />
                <span>{uploading ? 'Parsing & Indexing...' : 'Parse & Save Resume'}</span>
              </button>
            </form>
          </div>

          {/* Stored Resumes List */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>
              Your Resumes ({resumes.length})
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                Loading resumes...
              </div>
            ) : resumes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-dim)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <FileText style={{ width: '32px', height: '32px', color: 'var(--text-dim)' }} />
                <p>No resumes uploaded yet. Use the form above to add your first resume.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResume(r)}
                    style={{
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-lg)',
                      border: selectedResume?.id === r.id ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-subtle)',
                      backgroundColor: selectedResume?.id === r.id ? 'rgba(49, 46, 129, 0.4)' : 'rgba(15, 23, 42, 0.6)',
                      transition: 'all var(--transition-normal)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ minWidth: 0, paddingRight: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{r.title}</span>
                        {r.is_primary && (
                          <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>
                            Primary
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                          {r.versions?.length || 0} {(r.versions?.length || 0) === 1 ? 'version' : 'versions'}
                        </span>
                        <span style={{ fontSize: '0.625rem', color: 'var(--brand-primary)', fontFamily: 'monospace' }}>
                          {r.parsed_json?.skills?.length || 0} skills detected
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(r.id);
                        }}
                        style={{ padding: '0.375rem', color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Parsed Fields & Tailor Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {selectedResume ? (
            <>
              {/* Parsed Fields Detail */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{selectedResume.title}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Structured extraction from raw candidate text</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Check style={{ width: '14px', height: '14px' }} />
                    <span>Verified Evidence</span>
                  </span>
                </div>

                {/* Skills Chips */}
                <div>
                  <div className="form-label" style={{ marginBottom: '0.5rem' }}>
                    Extracted Technical Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {selectedResume.parsed_json?.skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="badge badge-indigo"
                      >
                        {skill}
                      </span>
                    )) || <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>None detected</span>}
                  </div>
                </div>

                {/* Experience Bullets */}
                <div>
                  <div className="form-label" style={{ marginBottom: '0.5rem' }}>
                    Verified Experience Bullets
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedResume.parsed_json?.experience?.map((bullet, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                          fontFamily: 'monospace'
                        }}
                      >
                        {bullet}
                      </div>
                    )) || <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>None detected</span>}
                  </div>
                </div>
              </div>

              {/* Tailor for Job Action */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>
                    <Wand2 style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
                    <span>Tailor for Target Job</span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Zero Fabrication Guaranteed</span>
                </div>

                {jobs.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    No jobs ingested yet. Head over to <strong>Job Intelligence</strong> to paste or scrape a job posting first.
                  </p>
                ) : (
                  <form onSubmit={handleTailor} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <select
                        value={tailorJobId}
                        onChange={(e) => setTailorJobId(e.target.value)}
                        required
                        className="form-input"
                        style={{ flex: 1, minWidth: '200px', fontSize: '0.75rem' }}
                      >
                        <option value="">-- Select Target Job Posting --</option>
                        {jobs.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.company} — {j.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={tailoring || !tailorJobId}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <Wand2 style={{ width: '14px', height: '14px' }} />
                        <span>{tailoring ? 'Tailoring...' : 'Generate Tailored Draft'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Tailored Diff Result */}
                {tailorResult && (
                  <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(2, 6, 23, 0.9)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>
                        Tailored Version #{tailorResult.version?.version_number} Created
                      </span>
                      <span className="badge badge-success" style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>
                        Saved to Versions
                      </span>
                    </div>
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(15, 23, 42, 0.8)', fontSize: '0.75rem', color: '#34d399', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {tailorResult.diff_summary}
                    </div>
                  </div>
                )}
              </div>

              {/* Version History Drawer */}
              {selectedResume.versions && selectedResume.versions.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>
                    <GitBranch style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
                    <span>Version History ({selectedResume.versions.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedResume.versions.map((ver) => (
                      <div
                        key={ver.id}
                        style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            v{ver.version_number}: {ver.target_role}
                          </span>
                          <span style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>
                            {new Date(ver.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(2, 6, 23, 0.9)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          {ver.diff_summary}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <Eye style={{ width: '32px', height: '32px', color: 'var(--text-dim)' }} />
              <p style={{ fontSize: '0.75rem' }}>Select a resume on the left or upload a new one to view details and tailor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
