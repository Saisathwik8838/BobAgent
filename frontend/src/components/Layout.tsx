import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { User } from '../types/auth';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  systemHealthy: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, systemHealthy }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar user={user} onLogout={onLogout} systemHealthy={systemHealthy} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
