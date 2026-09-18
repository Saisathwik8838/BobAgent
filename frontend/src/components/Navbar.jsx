import React from 'react';
import { Sparkles, ShieldCheck, LogOut } from 'lucide-react';

export const Navbar = ({ user, onLogout, systemHealthy }) => {
  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 14px -2px rgba(99, 102, 241, 0.4)' }}>
          <Sparkles style={{ width: '18px', height: '18px' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
              BobAgent
            </span>
            <span className="badge badge-indigo">
              v0.1.0
            </span>
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Evidence-Grounded Career Intelligence
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* System Health Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', background: 'var(--bg-input)', border: '1px solid var(--border-slate)', fontSize: '0.75rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: systemHealthy ? 'var(--emerald)' : 'var(--amber)', boxShadow: systemHealthy ? '0 0 8px rgba(16,185,129,0.7)' : 'none' }}></span>
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{systemHealthy ? 'Core API Online' : 'Connecting...'}</span>
        </div>

        {/* Anti-fabrication badge */}
        <div className="badge badge-indigo" style={{ padding: '0.35rem 0.75rem' }}>
          <ShieldCheck style={{ width: '14px', height: '14px' }} />
          <span>Zero Fabrication Active</span>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-slate)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff' }}>{user.full_name}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="btn-icon"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
