import React from 'react';
import { MessageSquareCode } from 'lucide-react';

export const InterviewSimulator: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <MessageSquareCode className="w-6 h-6 text-indigo-400" />
            <span>Adaptive Interview Simulator</span>
          </h1>
          <p className="text-sm text-slate-400">
            Practice realistic interviews grounded in target job requirements with immediate criteria-based answer scoring.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Section 3.6
        </span>
      </div>

      <div className="glass-panel p-8 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <MessageSquareCode className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">Start New Practice Session</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Select an ingested job description to simulate technical and behavioral interview questions tailored to your background.
        </p>
      </div>
    </div>
  );
};
