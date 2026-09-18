import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';
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

export const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [systemHealthy, setSystemHealthy] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleAuthSuccess = async (auth) => {
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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#94a3b8' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
          <Sparkles style={{ width: '24px', height: '24px' }} />
        </div>
        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Initializing BobAgent...</p>
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
