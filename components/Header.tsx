'use client';

import React from 'react';
import { useShelter } from '@/context/ShelterContext';
import { cerrarSesion } from '@/app/auth/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Building2, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, currentRole, setCurrentRole, refugios, estadias, toastMessage } = useShelter();

  const totalCapacity = refugios.reduce((acc, r) => acc + r.capacidad, 0);
  const totalOccupied = estadias.filter((e) => !e.fecha_egreso).length;
  const occupancyPercentage = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 shadow-sm">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
          {toastMessage}
        </div>
      )}

      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3">
        {/* Logo & Emergency Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl shadow-md">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                IRUPE <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Sistema de Refugios</span>
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span>Provincia de Corrientes</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">● Estado Operativo</span>
            </p>
          </div>
        </div>

        {/* Live Metrics Quick View */}
        <div className="hidden lg:flex items-center gap-6 text-sm border-x border-zinc-200 dark:border-zinc-800 px-6 py-1">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="text-xs text-zinc-500 block">Ocupación Total Red</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {totalOccupied} / {totalCapacity} ({occupancyPercentage}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600" />
            <div>
              <span className="text-xs text-zinc-500 block">Refugios Activos</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {refugios.length} Centros
              </span>
            </div>
          </div>
        </div>

        {/* User Profile & Auth Controls */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 p-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block line-clamp-1">
                    {currentUser.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                    {currentRole === 'admin' ? '🛡️ Administrador' : '📋 Trabajador Social'}
                  </Badge>
                </div>
              </div>

              {/* Quick Role Switcher for MVP Testing (Admin only) */}
              {currentUser.role === 'admin' && (
                <div className="hidden xl:flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                  <button
                    onClick={() => setCurrentRole('admin')}
                    className={`p-1 px-2 rounded text-[11px] font-bold ${
                      currentRole === 'admin' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="[PREVISUALIZACIÓN] Cambiar a Vista Admin"
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => setCurrentRole('social_worker')}
                    className={`p-1 px-2 rounded text-[11px] font-bold ${
                      currentRole === 'social_worker' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="[PREVISUALIZACIÓN] Cambiar a Vista Trabajador"
                  >
                    Trabajador
                  </button>
                </div>
              )}

              <form action={cerrarSesion} className="contents">
                <Button
                  type="submit"
                  variant="ghost"
                  size="xs"
                  className="text-zinc-500 hover:text-red-600 dark:hover:text-red-400 ml-1"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline ml-1 text-xs">Salir</span>
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-xs font-semibold text-zinc-500 flex items-center gap-2">
              <User className="h-4 w-4 text-zinc-400" />
              <span>Inicie Sesión</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
