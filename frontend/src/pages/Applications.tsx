import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Application, ApplicationStatus } from '../types/application';
import { Job } from '../types/job';
import { Resume } from '../types/resume';
import {
  Layers,
  Plus,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Trash2,
  X,
  FileText,
  Mail,
  User as UserIcon,
  Clock,
  Sparkles,
  Briefcase,
  AlertCircle,
  History,
} from 'lucide-react';

interface ColumnDef {
  key: ApplicationStatus;
  label: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'saved',
    label: 'Saved / To Apply',
    color: 'text-slate-300',
    badgeBg: 'bg-slate-800 text-slate-300',
    badgeBorder: 'border-slate-700',
  },
  {
    key: 'applied',
    label: 'Applied',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-300',
    badgeBorder: 'border-indigo-500/20',
  },
  {
    key: 'interviewing',
    label: 'Interviewing',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300',
    badgeBorder: 'border-amber-500/20',
  },
  {
    key: 'offer',
    label: 'Offer',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300',
    badgeBorder: 'border-emerald-500/20',
  },
  {
    key: 'rejected',
    label: 'Archived',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-300',
    badgeBorder: 'border-rose-500/20',
  },
];

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingContactName, setEditingContactName] = useState('');
  const [editingContactEmail, setEditingContactEmail] = useState('');
  const [editingSalary, setEditingSalary] = useState('');
  const [updating, setUpdating] = useState(false);

  // Create Application Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJobId, setNewJobId] = useState('');
  const [newResumeId, setNewResumeId] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('saved');
  const [newNotes, setNewNotes] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appList, jobList, resList] = await Promise.all([
        api.listApplications(),
        api.listJobs(),
        api.listResumes(),
      ]);
      setApplications(appList);
      setJobs(jobList);
      setResumes(resList);
      if (jobList.length > 0 && !newJobId) setNewJobId(jobList[0].id);
      if (resList.length > 0 && !newResumeId) {
        const primary = resList.find((r) => r.is_primary) || resList[0];
        setNewResumeId(primary.id);
      }
    } catch (err: any) {
      console.error('Failed to load applications data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDetail = (app: Application) => {
    setSelectedApp(app);
    setEditingNotes(app.notes || '');
    setEditingContactName(app.contact_name || '');
    setEditingContactEmail(app.contact_email || '');
    setEditingSalary(app.salary_offered || '');
  };

  const handleUpdateStatus = async (appId: string, nextStatus: ApplicationStatus) => {
    try {
      const updated = await api.updateApplication(appId, { status: nextStatus });
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      if (selectedApp?.id === appId) setSelectedApp(updated);
    } catch (err: any) {
      alert('Failed to update stage: ' + err.message);
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const updated = await api.updateApplication(selectedApp.id, {
        notes: editingNotes,
        contact_name: editingContactName,
        contact_email: editingContactEmail,
        salary_offered: editingSalary,
      });
      setApplications((prev) => prev.map((a) => (a.id === selectedApp.id ? updated : a)));
      setSelectedApp(updated);
    } catch (err: any) {
      alert('Failed to update details: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to remove this application from your pipeline?')) return;
    try {
      await api.deleteApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      if (selectedApp?.id === appId) setSelectedApp(null);
    } catch (err: any) {
      alert('Failed to delete application: ' + err.message);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobId) {
      setCreateError('Please select a target job posting.');
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const created = await api.createApplication({
        job_id: newJobId,
        resume_id: newResumeId || undefined,
        status: newStatus,
        notes: newNotes,
        contact_name: newContactName || undefined,
        contact_email: newContactEmail || undefined,
      });
      setApplications((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewNotes('');
      setNewContactName('');
      setNewContactEmail('');
    } catch (err: any) {
      setCreateError(err.message || 'Failed to track application');
    } finally {
      setCreating(false);
    }
  };

  const getStageIndex = (status: ApplicationStatus) => {
    const order: ApplicationStatus[] = ['saved', 'applied', 'interviewing', 'offer', 'rejected'];
    return order.indexOf(status);
  };

  const moveStage = (app: Application, direction: 'prev' | 'next') => {
    const order: ApplicationStatus[] = ['saved', 'applied', 'interviewing', 'offer', 'rejected'];
    const currentIdx = order.indexOf(app.status);
    const nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx >= 0 && nextIdx < order.length) {
      handleUpdateStatus(app.id, order[nextIdx]);
    }
  };

  // Stats calculation
  const totalCount = applications.length;
  const interviewingCount = applications.filter((a) => a.status === 'interviewing').length;
  const offerCount = applications.filter((a) => a.status === 'offer').length;
  const appliedCount = applications.filter((a) => a.status === 'applied').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Application Pipeline</span>
          </h1>
          <p className="text-sm text-slate-400">
            End-to-end Kanban tracking from saved opportunities to offers, backed by event audit logging.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Section 3.3
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition shadow-lg shadow-indigo-500/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Track Application</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Tracked</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Applied Stage</p>
            <p className="text-xl font-bold text-indigo-400 mt-0.5">{appliedCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Mail className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">In Interview</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{interviewingCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Offers Received</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{offerCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Kanban Board */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading applications pipeline...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-white">Pipeline Empty</h3>
          <p className="text-sm text-slate-400">
            Track your first job application to monitor stages, schedule interviews, and log transition milestones.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-500/20"
          >
            Track First Application
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.key);
            return (
              <div
                key={col.key}
                className="glass-panel p-4 rounded-2xl border border-slate-800/80 space-y-3 min-h-[600px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                    {col.label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono border ${col.badgeBg} ${col.badgeBorder}`}
                  >
                    {colApps.length}
                  </span>
                </div>

                {/* Card Container */}
                <div className="space-y-3 flex-1">
                  {colApps.map((app) => {
                    const stageIdx = getStageIndex(app.status);
                    return (
                      <div
                        key={app.id}
                        onClick={() => openDetail(app)}
                        className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-indigo-500/30 transition cursor-pointer space-y-2.5 shadow-sm group"
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition line-clamp-1">
                            {app.job?.title || 'Target Role'}
                          </h4>
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                            <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="font-medium text-slate-300 line-clamp-1">
                              {app.job?.company || 'Company'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          {app.job?.location && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/40 flex items-center space-x-1">
                              <MapPin className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[90px]">{app.job.location}</span>
                            </span>
                          )}
                          {app.salary_offered ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                              {app.salary_offered}
                            </span>
                          ) : app.job?.salary_range ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
                              {app.job.salary_range}
                            </span>
                          ) : null}
                        </div>

                        {app.applied_date && (
                          <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>Applied {new Date(app.applied_date).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Stage Quick Advance Buttons */}
                        <div
                          className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            disabled={stageIdx <= 0}
                            onClick={() => moveStage(app, 'prev')}
                            className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-20 transition"
                            title="Move back a stage"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            {app.status}
                          </span>
                          <button
                            disabled={stageIdx >= COLUMNS.length - 1}
                            onClick={() => moveStage(app, 'next')}
                            className="p-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-20 transition"
                            title="Advance stage"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {colApps.length === 0 && (
                    <div className="py-8 text-center border border-dashed border-slate-800/60 rounded-xl text-slate-600 text-xs">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel max-w-2xl w-full p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white">
                    {selectedApp.job?.title || 'Application Details'}
                  </h3>
                  {selectedApp.job?.url && (
                    <a
                      href={selectedApp.job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-slate-300">{selectedApp.job?.company}</span>
                  <span>•</span>
                  <span>{selectedApp.job?.seniority}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteApplication(selectedApp.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  title="Delete Application"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stage Selector Action Bar */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <label className="text-xs font-semibold text-slate-300">Pipeline Stage</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {COLUMNS.map((col) => {
                  const isCurrent = selectedApp.status === col.key;
                  return (
                    <button
                      key={col.key}
                      onClick={() => handleUpdateStatus(selectedApp.id, col.key)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                        isCurrent
                          ? `${col.badgeBg} ${col.badgeBorder} shadow-sm`
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {col.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recruiter Contact & Salary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 flex items-center space-x-1">
                  <UserIcon className="w-3 h-3 text-slate-500" />
                  <span>Contact Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins (Recruiter)"
                  value={editingContactName}
                  onChange={(e) => setEditingContactName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>Contact Email</span>
                </label>
                <input
                  type="email"
                  placeholder="recruiter@company.com"
                  value={editingContactEmail}
                  onChange={(e) => setEditingContactEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 text-slate-500" />
                  <span>Offer / Target Salary</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. $185,000 + equity"
                  value={editingSalary}
                  onChange={(e) => setEditingSalary(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Application Notes & Strategy</span>
              </label>
              <textarea
                rows={4}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Log interviews, referral notes, preparation priorities..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveDetails}
                  disabled={updating}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition shadow-md shadow-indigo-600/20"
                >
                  {updating ? 'Saving...' : 'Save Notes & Details'}
                </button>
              </div>
            </div>

            {/* Event Audit History Timeline */}
            <div className="space-y-3 border-t border-slate-800/80 pt-4">
              <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Stage Transition & Audit Timeline</span>
              </h4>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {selectedApp.events && selectedApp.events.length > 0 ? (
                  selectedApp.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="font-mono uppercase text-indigo-400 font-semibold">
                          {ev.event_type}
                        </span>
                        <span>{new Date(ev.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300">{ev.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No events logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track Application Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Track Application</h3>
                  <p className="text-xs text-slate-400">Connect a target job to your pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Target Job Posting *</label>
                {jobs.length > 0 ? (
                  <select
                    value={newJobId}
                    onChange={(e) => setNewJobId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.company} — {j.title} ({j.seniority})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400">
                    No target jobs found. Please ingest a job in Job Intelligence first!
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Grounding Resume (Optional)</label>
                <select
                  value={newResumeId}
                  onChange={(e) => setNewResumeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">None Selected</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} {r.is_primary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Initial Pipeline Stage</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="saved">Saved / To Apply</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Recruiter Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Recruiter Email</label>
                <input
                  type="email"
                  placeholder="jane.doe@company.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Notes & Strategy</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Referral notes, initial outreach date, target salary..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {createError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || jobs.length === 0}
                  className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Tracking...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Track In Pipeline</span>
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
