import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Briefcase,
  Layers,
  Database,
  Bot,
  MessageSquareCode,
  BarChart3,
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tag: 'Overview' },
    { to: '/profile', label: 'Candidate Profile', icon: UserCheck, tag: 'Baseline' },
    { to: '/rag', label: 'Vector RAG Base', icon: Database, tag: 'RAG' },
    { to: '/resume-hub', label: 'Resume Hub', icon: FileText, tag: 'Resumes' },
    { to: '/jobs', label: 'Job Intelligence', icon: Briefcase, tag: 'Jobs' },
    { to: '/applications', label: 'Applications', icon: Layers, tag: 'Kanban' },
    { to: '/agents', label: 'LangGraph Agents', icon: Bot, tag: 'Agents' },
    { to: '/interview', label: 'Interview Simulator', icon: MessageSquareCode, tag: 'Prep' },
    { to: '/eval', label: 'Eval & Analytics', icon: BarChart3, tag: 'Metrics' },
  ];

  return (
    <aside style={{ width: '250px', borderRight: '1px solid var(--border-subtle)', backgroundColor: 'rgba(3, 7, 18, 0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <div className="nav-link-left">
                    <Icon className="nav-icon" style={{ width: '16px', height: '16px' }} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`badge ${isActive ? 'badge-indigo' : 'badge-slate'}`} style={{ fontSize: '0.625rem', padding: '0.15rem 0.4rem' }}>
                    {item.tag}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
        <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: 'var(--radius-lg)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Operating Contract</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--emerald)' }}></span>
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            All AI generations require verifiable candidate evidence retrieved via pgvector.
          </p>
        </div>
      </div>
    </aside>
  );
};
