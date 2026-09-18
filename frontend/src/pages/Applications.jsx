import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
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

const COLUMNS = [
  {
    key: 'saved',
    label: 'Saved / To Apply',
    badgeClass: 'badge-neutral',
    color: '#cbd5e1',
  },
  {
    key: 'applied',
    label: 'Applied',
    badgeClass: 'badge-indigo',
    color: '#818cf8',
  },
  {
    key: 'interviewing',
    label: 'Interviewing',
    badgeClass: 'badge-warning',
    color: '#fbbf24',
  },
  {
    key: 'offer',
    label: 'Offer',
    badgeClass: 'badge-success',
    color: '#34d399',
  },
  {
    key: 'rejected',
    label: 'Archived',
    badgeClass: 'badge-danger',
    color: '#fb7185',
  },
];

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingContactName, setEditingContactName] = useState('');
  const [editingContactEmail, setEditingContactEmail] = useState('');
  const [editingSalary, setEditingSalary] = useState('');
  const [updating, setUpdating] = useState(false);

  // Create Application Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJobId, setNewJobId] = useState('');
  const [newResumeId, setNewResumeId] = useState('');
  const [newStatus, setNewStatus] = useState('saved');
  const [newNotes, setNewNotes] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appList, jobList, resList] = await Promise.all([
        api.listApplications(),
        api.listJobs(),
        api.listResumes(),
      ]);
      setApplications(appList || []);
      setJobs(jobList || []);
      setResumes(resList || []);
      if (jobList && jobList.length > 0 && !newJobId) setNewJobId(jobList[0].id);
      if (resList && resList.length > 0 && !newResumeId) {
        const primary = resList.find((r) => r.is_primary) || resList[0];
        setNewResumeId(primary.id);
      }
    } catch (err) {
      console.error('Failed to load applications data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDetail = (app) => {
    setSelectedApp(app);
    setEditingNotes(app.notes || '');
    setEditingContactName(app.contact_name || '');
    setEditingContactEmail(app.contact_email || '');
    setEditingSalary(app.salary_offered || '');
  };

  const handleUpdateStatus = async (appId, nextStatus) => {
    try {
      const updated = await api.updateApplication(appId, { status: nextStatus });
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      if (selectedApp?.id === appId) setSelectedApp(updated);
    } catch (err) {
      alert('Failed to update stage: ' + (err.message || err));
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
    } catch (err) {
      alert('Failed to update details: ' + (err.message || err));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!confirm('Are you sure you want to remove this application from your pipeline?')) return;
    try {
      await api.deleteApplication(appId);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      if (selectedApp?.id === appId) setSelectedApp(null);
    } catch (err) {
      alert('Failed to delete application: ' + (err.message || err));
    }
  };

  const handleCreateApplication = async (e) => {
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
    } catch (err) {
      setCreateError(err.message || 'Failed to track application');
    } finally {
      setCreating(false);
    }
  };

  const getStageIndex = (status) => {
    const order = ['saved', 'applied', 'interviewing', 'offer', 'rejected'];
    return order.indexOf(status);
  };

  const moveStage = (app, direction) => {
    const order = ['saved', 'applied', 'interviewing', 'offer', 'rejected'];
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
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Layers style={{ width: '24px', height: '24px', color: 'var(--brand-primary)' }} />
            <span>Application Pipeline</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            End-to-end Kanban tracking from saved opportunities to offers, backed by event audit logging.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-indigo" style={{ fontFamily: 'monospace' }}>
            Section 3.3
          </span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>Track Application</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Bar */}
      <div className="grid-4">
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Tracked</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '0.125rem' }}>{totalCount}</p>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
            <Briefcase style={{ width: '16px', height: '16px' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Applied Stage</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-primary)', marginTop: '0.125rem' }}>{appliedCount}</p>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
            <Mail style={{ width: '16px', height: '16px' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>In Interview</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.125rem' }}>{interviewingCount}</p>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <Clock style={{ width: '16px', height: '16px' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Offers Received</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', marginTop: '0.125rem' }}>{offerCount}</p>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <Sparkles style={{ width: '16px', height: '16px' }} />
          </div>
        </div>
      </div>

      {/* Main Kanban Board */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--brand-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading applications pipeline...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '576px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-2xl)', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
            <Layers style={{ width: '28px', height: '28px' }} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>Pipeline Empty</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Track your first job application to monitor stages, schedule interviews, and log transition milestones.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Track First Application
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'start' }}>
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.key);
            return (
              <div
                key={col.key}
                className="glass-panel"
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '600px' }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: col.color }}>
                    {col.label}
                  </span>
                  <span className={`badge ${col.badgeClass}`} style={{ fontFamily: 'monospace' }}>
                    {colApps.length}
                  </span>
                </div>

                {/* Card Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {colApps.map((app) => {
                    const stageIdx = getStageIndex(app.status);
                    return (
                      <div
                        key={app.id}
                        onClick={() => openDetail(app)}
                        style={{
                          padding: '0.875rem',
                          borderRadius: 'var(--radius-xl)',
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid var(--border-subtle)',
                          transition: 'all var(--transition-normal)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.625rem'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {app.job?.title || 'Target Role'}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            <Building2 style={{ width: '12px', height: '12px', color: 'var(--brand-primary)', flexShrink: 0 }} />
                            <span style={{ fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {app.job?.company || 'Company'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.375rem', fontSize: '0.625rem' }}>
                          {app.job?.location && (
                            <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MapPin style={{ width: '10px', height: '10px' }} />
                              <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job.location}</span>
                            </span>
                          )}
                          {app.salary_offered ? (
                            <span className="badge badge-success" style={{ fontFamily: 'monospace' }}>
                              {app.salary_offered}
                            </span>
                          ) : app.job?.salary_range ? (
                            <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>
                              {app.job.salary_range}
                            </span>
                          ) : null}
                        </div>

                        {app.applied_date && (
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar style={{ width: '10px', height: '10px' }} />
                            <span>Applied {new Date(app.applied_date).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Stage Quick Advance Buttons */}
                        <div
                          style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            disabled={stageIdx <= 0}
                            onClick={() => moveStage(app, 'prev')}
                            style={{ padding: '0.25rem', color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: stageIdx <= 0 ? 'not-allowed' : 'pointer', opacity: stageIdx <= 0 ? 0.2 : 1 }}
                            title="Move back a stage"
                          >
                            <ChevronLeft style={{ width: '14px', height: '14px' }} />
                          </button>
                          <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                            {app.status}
                          </span>
                          <button
                            disabled={stageIdx >= COLUMNS.length - 1}
                            onClick={() => moveStage(app, 'next')}
                            style={{ padding: '0.25rem', color: 'var(--brand-primary)', background: 'transparent', border: 'none', cursor: stageIdx >= COLUMNS.length - 1 ? 'not-allowed' : 'pointer', opacity: stageIdx >= COLUMNS.length - 1 ? 0.2 : 1 }}
                            title="Advance stage"
                          >
                            <ChevronRight style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {colApps.length === 0 && (
                    <div style={{ padding: '2rem 0', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-xl)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
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
        <div className="modal-backdrop">
          <div className="glass-panel" style={{ maxWidth: '672px', width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
                    {selectedApp.job?.title || 'Application Details'}
                  </h3>
                  {selectedApp.job?.url && (
                    <a
                      href={selectedApp.job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      <ExternalLink style={{ width: '16px', height: '16px' }} />
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <Building2 style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{selectedApp.job?.company}</span>
                  <span>•</span>
                  <span>{selectedApp.job?.seniority}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => handleDeleteApplication(selectedApp.id)}
                  style={{ padding: '0.375rem', color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  title="Delete Application"
                >
                  <Trash2 style={{ width: '16px', height: '16px' }} />
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  style={{ padding: '0.375rem', color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>

            {/* Stage Selector Action Bar */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pipeline Stage</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                {COLUMNS.map((col) => {
                  const isCurrent = selectedApp.status === col.key;
                  return (
                    <button
                      key={col.key}
                      onClick={() => handleUpdateStatus(selectedApp.id, col.key)}
                      className={`btn ${isCurrent ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem', justifyContent: 'center' }}
                    >
                      {col.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recruiter Contact & Salary Details */}
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <UserIcon style={{ width: '12px', height: '12px', color: 'var(--text-dim)' }} />
                  <span>Contact Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins (Recruiter)"
                  value={editingContactName}
                  onChange={(e) => setEditingContactName(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.75rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Mail style={{ width: '12px', height: '12px', color: 'var(--text-dim)' }} />
                  <span>Contact Email</span>
                </label>
                <input
                  type="email"
                  placeholder="recruiter@company.com"
                  value={editingContactEmail}
                  onChange={(e) => setEditingContactEmail(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.75rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <DollarSign style={{ width: '12px', height: '12px', color: 'var(--text-dim)' }} />
                  <span>Offer / Target Salary</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. $185,000 + equity"
                  value={editingSalary}
                  onChange={(e) => setEditingSalary(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.75rem' }}
                />
              </div>
            </div>

            {/* Notes Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FileText style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                <span>Application Notes & Strategy</span>
              </label>
              <textarea
                rows={4}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Log interviews, referral notes, preparation priorities..."
                className="form-input"
                style={{ resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleSaveDetails}
                  disabled={updating}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem' }}
                >
                  {updating ? 'Saving...' : 'Save Notes & Details'}
                </button>
              </div>
            </div>

            {/* Event Audit History Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                <span>Stage Transition & Audit Timeline</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: '12rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {selectedApp.events && selectedApp.events.length > 0 ? (
                  selectedApp.events.map((ev) => (
                    <div
                      key={ev.id}
                      style={{ padding: '0.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.625rem' }}>
                        <span style={{ fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--brand-primary)', fontWeight: 600 }}>
                          {ev.event_type}
                        </span>
                        <span>{new Date(ev.created_at).toLocaleString()}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>{ev.description}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No events logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track Application Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="glass-panel" style={{ maxWidth: '512px', width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                  <Layers style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>Track Application</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connect a target job to your pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Job Posting *</label>
                {jobs.length > 0 ? (
                  <select
                    value={newJobId}
                    onChange={(e) => setNewJobId(e.target.value)}
                    className="form-input"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.company} — {j.title} ({j.seniority})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="alert-box alert-warning">
                    No target jobs found. Please ingest a job in Job Intelligence first!
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Grounding Resume (Optional)</label>
                <select
                  value={newResumeId}
                  onChange={(e) => setNewResumeId(e.target.value)}
                  className="form-input"
                >
                  <option value="">None Selected</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} {r.is_primary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Initial Pipeline Stage</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="form-input"
                  >
                    <option value="saved">Saved / To Apply</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Recruiter Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Recruiter Email</label>
                <input
                  type="email"
                  placeholder="jane.doe@company.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Strategy</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Referral notes, initial outreach date, target salary..."
                  className="form-input"
                />
              </div>

              {createError && (
                <div className="alert-box alert-danger">
                  <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span>{createError}</span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || jobs.length === 0}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem' }}
                >
                  {creating ? (
                    <>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #ffffff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                      <span>Tracking...</span>
                    </>
                  ) : (
                    <>
                      <Plus style={{ width: '14px', height: '14px' }} />
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
