import React from 'react';
import { Bot, Play } from 'lucide-react';

export const AgentsStudio: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Bot className="w-6 h-6 text-indigo-400" />
            <span>LangGraph Multi-Agent Studio</span>
          </h1>
          <p className="text-sm text-slate-400">
            Autonomous multi-agent orchestration for Job Scouting, Application Assistant, and Prep Coach with full execution trace auditing.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Section 3.5
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Job Scout', desc: 'Searches for and scores new matching roles using candidate criteria.' },
          { name: 'Application Assistant', desc: 'Synthesizes verified RAG evidence into tailored resumes & cover letters.' },
          { name: 'Prep Coach', desc: 'Generates role-tailored talking points and expected technical questions.' },
        ].map((agent) => (
          <div key={agent.name} className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-base">{agent.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">{agent.desc}</p>
            <button className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <Play className="w-3.5 h-3.5" />
              <span>Launch Run</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
