import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, Cpu, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export const Dashboard = ({ user, profile }) => {
  const navigate = useNavigate();
  const profileComplete = Boolean(profile?.headline && profile?.summary && profile?.location);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1152px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '2rem',
          borderRadius: 'var(--radius-2xl)',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(2, 6, 23, 0.98) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-3rem',
            top: '-3rem',
            width: '16rem',
            height: '16rem',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            borderRadius: '9999px',
            filter: 'blur(48px)',
            pointerEvents: 'none'
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '672px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              fontSize: '0.75rem',
              fontWeight: 600,
              width: 'fit-content'
            }}
          >
            <Sparkles style={{ width: '14px', height: '14px', color: '#818cf8' }} />
            <span>Phase 1 Foundation Operational</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Welcome back, {user?.full_name || 'Candidate'}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            BobAgent connects your verified career evidence with job descriptions using precision pgvector RAG, ensuring your resumes, cover letters, and interview prep never fabricate credentials.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-primary"
            >
              <span>Manage Candidate Profile</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="btn btn-secondary"
            >
              <span>Explore Upcoming Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* System & Architecture Status Grid */}
      <div className="grid-3">
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}
          >
            <ShieldCheck style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>Zero-Fabrication Contract</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.5 }}>
              Every generation strictly requires retrieved evidence chunks with verifiable candidate citations.
            </p>
          </div>
          <div
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#34d399'
            }}
          >
            <span style={{ fontWeight: 500 }}>Guardrail Active</span>
            <CheckCircle2 style={{ width: '16px', height: '16px' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}
          >
            <Database style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>PostgreSQL + pgvector</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.5 }}>
              Dual relational & HNSW vector storage with candidate-scoped multi-tenant data isolation.
            </p>
          </div>
          <div
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#a5b4fc'
            }}
          >
            <span style={{ fontWeight: 500 }}>Schema Initialized</span>
            <CheckCircle2 style={{ width: '16px', height: '16px' }} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc'
            }}
          >
            <Cpu style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>Multi-Agent LangGraph</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.5 }}>
              Supervisor orchestrating specialized agents (Job Analysis, Evidence RAG, Gap Analysis, Evaluation).
            </p>
          </div>
          <div
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#d8b4fe'
            }}
          >
            <span style={{ fontWeight: 500 }}>Orchestrator Ready</span>
            <CheckCircle2 style={{ width: '16px', height: '16px' }} />
          </div>
        </div>
      </div>

      {/* Candidate Profile Readiness Checklist */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>Candidate Readiness Assessment</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Setup your verified career background to power accurate skill matching.
            </p>
          </div>
          <span className={`badge ${profileComplete ? 'badge-success' : 'badge-warning'}`}>
            {profileComplete ? 'Ready for Job Matching' : 'Profile Incomplete'}
          </span>
        </div>

        <div className="grid-4" style={{ paddingTop: '0.5rem' }}>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.7)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Headline</span>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.headline || 'Not provided'}
            </div>
          </div>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.7)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</span>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.location || 'Not provided'}
            </div>
          </div>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.7)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LinkedIn</span>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.linkedin_url ? 'Linked' : 'Not linked'}
            </div>
          </div>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.7)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GitHub</span>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.github_url ? 'Linked' : 'Not linked'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
