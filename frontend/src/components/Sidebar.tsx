import React from 'react';
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

export type NavTab =
  | 'dashboard'
  | 'profile'
  | 'resumes'
  | 'jobs'
  | 'applications'
  | 'knowledge'
  | 'agents'
  | 'interviews'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, phase: 'Phase 1' },
    { id: 'profile' as NavTab, label: 'Candidate Profile', icon: UserCheck, phase: 'Phase 1' },
    { id: 'resumes' as NavTab, label: 'Resume Hub', icon: FileText, phase: 'Phase 2' },
    { id: 'jobs' as NavTab, label: 'Job Intelligence', icon: Briefcase, phase: 'Phase 2' },
    { id: 'applications' as NavTab, label: 'Applications', icon: Layers, phase: 'Phase 2' },
    { id: 'knowledge' as NavTab, label: 'Vector RAG Base', icon: Database, phase: 'Phase 4' },
    { id: 'agents' as NavTab, label: 'LangGraph Agents', icon: Bot, phase: 'Phase 7' },
    { id: 'interviews' as NavTab, label: 'Interview Simulator', icon: MessageSquareCode, phase: 'Phase 10' },
    { id: 'analytics' as NavTab, label: 'Eval & Analytics', icon: BarChart3, phase: 'Phase 11' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/50 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isActive ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-600 bg-slate-900'
              }`}>
                {item.phase}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-900 px-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-slate-200 flex items-center justify-between">
            <span>Operating Contract</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All AI generations require verifiable candidate evidence retrieved via pgvector.
          </p>
        </div>
      </div>
    </aside>
  );
};
