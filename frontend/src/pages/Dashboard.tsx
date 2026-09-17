import React from 'react';
import { User, CandidateProfile } from '../types/auth';
import { ShieldCheck, Database, Cpu, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface DashboardProps {
  user: User;
  profile: CandidateProfile | null;
  onNavigate: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, profile, onNavigate }) => {
  const profileComplete = Boolean(profile?.headline && profile?.summary && profile?.location);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phase 1 Foundation Operational</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome back, {user.full_name}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            BobAgent connects your verified career evidence with job descriptions using precision pgvector RAG, ensuring your resumes, cover letters, and interview prep never fabricate credentials.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
            >
              <span>Manage Candidate Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('jobs')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-sm font-medium transition-all"
            >
              <span>Explore Upcoming Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* System & Architecture Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Zero-Fabrication Contract</h3>
            <p className="text-xs text-slate-400 mt-1">
              Every generation strictly requires retrieved evidence chunks with verifiable candidate citations.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400">
            <span className="font-medium">Guardrail Active</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">PostgreSQL + pgvector</h3>
            <p className="text-xs text-slate-400 mt-1">
              Dual relational & HNSW vector storage with candidate-scoped multi-tenant data isolation.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-300">
            <span className="font-medium">Schema Initialized</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Multi-Agent LangGraph</h3>
            <p className="text-xs text-slate-400 mt-1">
              Supervisor orchestrating specialized agents (Job Analysis, Evidence RAG, Gap Analysis, Evaluation).
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-purple-300">
            <span className="font-medium">Orchestrator Ready</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Candidate Profile Readiness Checklist */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Candidate Readiness Assessment</h2>
            <p className="text-xs text-slate-400">Setup your verified career background to power accurate skill matching.</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            profileComplete ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
          }`}>
            {profileComplete ? 'Ready for Job Matching' : 'Profile Incomplete'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <span className="text-xs text-slate-400">Headline</span>
            <div className="text-sm font-medium text-slate-200 truncate">
              {profile?.headline || 'Not provided'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <span className="text-xs text-slate-400">Location</span>
            <div className="text-sm font-medium text-slate-200 truncate">
              {profile?.location || 'Not provided'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <span className="text-xs text-slate-400">LinkedIn</span>
            <div className="text-sm font-medium text-slate-200 truncate">
              {profile?.linkedin_url ? 'Linked' : 'Not linked'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <span className="text-xs text-slate-400">GitHub</span>
            <div className="text-sm font-medium text-slate-200 truncate">
              {profile?.github_url ? 'Linked' : 'Not linked'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
