import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';
import { User, CandidateProfile, AuthResponse } from './types/auth';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { ResumeHub } from './pages/ResumeHub';
import { JobIntelligence } from './pages/JobIntelligence';
import { Applications } from './pages/Applications';
import { VectorRAG } from './pages/VectorRAG';
import { AgentsStudio } from './pages/AgentsStudio';
import { InterviewSimulator } from './pages/InterviewSimulator';
import { EvalAnalytics } from './pages/EvalAnalytics';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [systemHealthy, setSystemHealthy] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check health & auth
  useEffect(() => {
    const initApp = async () => {
      try {
        const health = await api.checkHealth();
        if (health.status === 'healthy') {
          setSystemHealthy(true);
        }
      } catch (err) {
        console.warn('Health check failed', err);
        setSystemHealthy(false);
      }

      if (api.getToken()) {
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
          const currentProfile = await api.getProfile();
          setProfile(currentProfile);
        } catch (err) {
          console.warn('Auth validation failed, clearing token', err);
          api.logout();
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    };

    initApp();
  }, []);

  const handleAuthSuccess = async (auth: AuthResponse) => {
    setUser(auth.user);
    try {
      const prof = await api.getProfile();
      setProfile(prof);
    } catch (err) {
      console.warn('Failed to load profile post-login', err);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setProfile(null);
    setAuthView('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium">Initializing BobAgent...</p>
      </div>
    );
  }

  // If not logged in, show Auth screens
  if (!user) {
    return authView === 'login' ? (
      <Login
        onSuccess={handleAuthSuccess}
        onSwitchToRegister={() => setAuthView('register')}
      />
    ) : (
      <Register
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <Layout
              user={user}
              onLogout={handleLogout}
              systemHealthy={systemHealthy}
            />
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={<Dashboard user={user} profile={profile} />}
          />
          <Route
            path="/profile"
            element={
              <Profile
                initialProfile={profile}
                onProfileUpdated={(updated) => setProfile(updated)}
              />
            }
          />
          <Route path="/resume-hub" element={<ResumeHub />} />
          <Route path="/jobs" element={<JobIntelligence />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/rag" element={<VectorRAG />} />
          <Route path="/agents" element={<AgentsStudio />} />
          <Route path="/interview" element={<InterviewSimulator />} />
          <Route path="/eval" element={<EvalAnalytics />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
