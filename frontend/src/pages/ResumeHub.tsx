import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Resume } from '../types/resume';
import { Job } from '../types/job';
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

export const ResumeHub: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  // Upload Form
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Tailoring Modal
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tailorJobId, setTailorJobId] = useState<string>('');
  const [tailoring, setTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rList, jList] = await Promise.all([api.listResumes(), api.listJobs()]);
      setResumes(rList);
      setJobs(jList);
      if (rList.length > 0 && !selectedResume) {
        setSelectedResume(rList[0]);
      }
    } catch (err: any) {
      console.error('Error fetching resumes/jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleTailor = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      alert('Failed to tailor resume: ' + err.message);
    } finally {
      setTailoring(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (selectedResume?.id === id) {
        setSelectedResume(resumes.find((r) => r.id !== id) || null);
      }
    } catch (err: any) {
      alert('Failed to delete resume: ' + err.message);
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Resume Hub</span>
          </h1>
          <p className="text-sm text-slate-400">
            Upload, parse, version, and tailor candidate resumes against target job descriptions with verifiable grounding.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Section 3.1
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload and Resumes List (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload Form */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Upload & Parse Resume</span>
              </div>
              <button
                type="button"
                onClick={loadSampleResume}
                className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 underline"
              >
                Load Sample
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Resume Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lead Systems Resume 2024"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Resume Text (Markdown or Plain Text)
                </label>
                <textarea
                  required
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste resume experience, technical skills, and education..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 resize-none font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/25 active:scale-98"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Parsing & Indexing...' : 'Parse & Save Resume'}</span>
              </button>
            </form>
          </div>

          {/* Stored Resumes List */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="text-white font-semibold text-sm">
              Your Resumes ({resumes.length})
            </div>

            {loading ? (
              <div className="text-center py-6 text-slate-500 text-xs">Loading resumes...</div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No resumes uploaded yet. Use the form above to add your first resume.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResume(r)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedResume?.id === r.id
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-200 truncate flex items-center space-x-2">
                        <span>{r.title}</span>
                        {r.is_primary && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {r.versions.length} {r.versions.length === 1 ? 'version' : 'versions'}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          {r.parsed_json.skills?.length || 0} skills detected
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(r.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Parsed Fields & Tailor Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedResume ? (
            <>
              {/* Parsed Fields Detail */}
              <div className="glass-panel p-6 rounded-2xl space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedResume.title}</h2>
                    <p className="text-xs text-slate-400">Structured extraction from raw candidate text</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Verified Evidence</span>
                  </span>
                </div>

                {/* Skills Chips */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Extracted Technical Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResume.parsed_json.skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    )) || <span className="text-xs text-slate-500">None detected</span>}
                  </div>
                </div>

                {/* Experience Bullets */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Verified Experience Bullets
                  </div>
                  <div className="space-y-2">
                    {selectedResume.parsed_json.experience?.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono"
                      >
                        {bullet}
                      </div>
                    )) || <span className="text-xs text-slate-500">None detected</span>}
                  </div>
                </div>
              </div>

              {/* Tailor for Job Action */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                    <Wand2 className="w-4 h-4 text-indigo-400" />
                    <span>Tailor for Target Job</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Zero Fabrication Guaranteed</span>
                </div>

                {jobs.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No jobs ingested yet. Head over to <strong>Job Intelligence</strong> to paste or scrape a job posting first.
                  </p>
                ) : (
                  <form onSubmit={handleTailor} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={tailorJobId}
                        onChange={(e) => setTailorJobId(e.target.value)}
                        required
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
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
                        className="inline-flex items-center justify-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/25"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>{tailoring ? 'Tailoring...' : 'Generate Tailored Draft'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Tailored Diff Result */}
                {tailorResult && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-300">
                        Tailored Version #{tailorResult.version.version_number} Created
                      </span>
                      <span className="text-emerald-400 font-mono text-[10px]">Saved to Versions</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {tailorResult.diff_summary}
                    </div>
                  </div>
                )}
              </div>

              {/* Version History Drawer */}
              {selectedResume.versions.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    <span>Version History ({selectedResume.versions.length})</span>
                  </div>
                  <div className="space-y-3">
                    {selectedResume.versions.map((ver) => (
                      <div
                        key={ver.id}
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">
                            v{ver.version_number}: {ver.target_role}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(ver.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 text-xs text-slate-300 font-mono whitespace-pre-wrap">
                          {ver.diff_summary}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-panel p-16 rounded-2xl text-center text-slate-500 space-y-2">
              <Eye className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs">Select a resume on the left or upload a new one to view details and tailor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
