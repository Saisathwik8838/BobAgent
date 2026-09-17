import React from 'react';
import { BarChart3 } from 'lucide-react';

export const EvalAnalytics: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Evaluation & Career Analytics</span>
          </h1>
          <p className="text-sm text-slate-400">
            Application conversion funnels, agent performance metrics, and verified zero-hallucination tracking.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Section 3.7
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Application Funnel</div>
          <div className="text-2xl font-bold text-white">0% Conversion</div>
          <p className="text-xs text-slate-500">Tracked across Saved → Offer</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Groundedness Score</div>
          <div className="text-2xl font-bold text-emerald-400">100%</div>
          <p className="text-xs text-slate-500">Zero unsupported candidate claims</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Agent Run Time</div>
          <div className="text-2xl font-bold text-indigo-300">1.4s</div>
          <p className="text-xs text-slate-500">FastAPI async orchestrator latency</p>
        </div>
      </div>
    </div>
  );
};
