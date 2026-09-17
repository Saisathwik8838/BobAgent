import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { User, CandidateProfile, AuthResponse } from './types/auth';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Construction, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
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
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar user={user} onLogout={handleLogout} systemHealthy={systemHealthy} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentTab === 'dashboard' && (
            <Dashboard user={user} profile={profile} onNavigate={setCurrentTab} />
          )}

          {currentTab === 'profile' && (
            <Profile
              initialProfile={profile}
              onProfileUpdated={(updated) => setProfile(updated)}
            />
          )}

          {currentTab !== 'dashboard' && currentTab !== 'profile' && (
            <div className="max-w-3xl mx-auto glass-panel p-12 rounded-2xl text-center space-y-4 border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                <Construction className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white capitalize">
                {currentTab.replace('-', ' ')} Module
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                This module is scheduled in the phased build roadmap. The foundation layer is verified, and Phase 2 (Resume & Job Management) is ready for implementation.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
