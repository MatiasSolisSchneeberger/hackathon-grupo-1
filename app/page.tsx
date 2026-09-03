"use client";

import React from 'react';
import { ShelterProvider, useShelter } from '@/context/ShelterContext';
import { Header } from '@/components/Header';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { SocialWorkerDashboard } from '@/components/social-worker/SocialWorkerDashboard';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

function MainContent() {
  const { currentUser, authScreen, setAuthScreen, currentRole } = useShelter();

  if (!currentUser) {
    if (authScreen === 'register') {
      return <RegisterForm onSwitchToLogin={() => setAuthScreen('login')} />;
    }
    return <LoginForm onSwitchToRegister={() => setAuthScreen('register')} />;
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      {currentRole === 'admin' ? (
        <AdminDashboard />
      ) : (
        <SocialWorkerDashboard />
      )}
    </main>
  );
}

export default function Home() {
  return (
    <ShelterProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col font-sans transition-colors duration-200">
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-4 text-center text-xs text-zinc-500">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>RefugIA © 2026 - Sistema de Gestión de Refugios y Asistencia Social</span>
            <span>Desarrollado para Hackathon • Prototipo MVP Funcional</span>
          </div>
        </footer>
      </div>
    </ShelterProvider>
  );
}
