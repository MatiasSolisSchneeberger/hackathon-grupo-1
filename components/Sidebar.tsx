"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { AdminScreenType, SocialScreenType } from '@/types/shelter';
import { 
  LayoutDashboard, 
  Building2, 
  Search, 
  Package, 
  Users, 
  Megaphone, 
  UserPlus, 
  Heart, 
  FileText, 
  Menu, 
  X, 
  ShieldCheck, 
  ClipboardList,
  UtensilsCrossed
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentRole, 
    activeAdminScreen, 
    setActiveAdminScreen, 
    activeSocialScreen, 
    setActiveSocialScreen,
    shelters,
    resources,
    evacuees
  } = useShelter();

  const [isOpen, setIsOpen] = useState(false);

  const lowStockCount = resources.filter((r) => r.status === 'critico' || r.status === 'bajo').length;
  const specialDietCount = evacuees.filter((e) => e.dietaryNotes || e.vulnerabilities.hasChronicCondition).length;

  const adminMenuItems: { id: AdminScreenType; label: string; icon: any; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard Global', icon: LayoutDashboard },
    { id: 'shelters', label: 'Gestión de Refugios', icon: Building2, badge: shelters.length },
    { id: 'shelter_detail', label: 'Detalle por Refugio', icon: Search },
    { id: 'food_inventory', label: 'Inventario de Alimentos', icon: Package, badge: lowStockCount > 0 ? `⚠️ ${lowStockCount}` : undefined },
    { id: 'evacuees', label: 'Padrón Consolidado', icon: Users, badge: evacuees.length },
    { id: 'notices', label: 'Bitácora & Anuncios', icon: Megaphone },
  ];

  const socialMenuItems: { id: SocialScreenType; label: string; icon: any; badge?: string | number }[] = [
    { id: 'intake', label: 'Ingreso de Evacuados', icon: UserPlus },
    { id: 'registry', label: 'Padrón de Refugiados', icon: Users, badge: evacuees.length },
    { id: 'family_search', label: 'Reunificación Familiar', icon: Search },
    { id: 'health_diet', label: 'Salud & Dietas Especiales', icon: UtensilsCrossed, badge: specialDietCount > 0 ? specialDietCount : undefined },
    { id: 'shift_report', label: 'Reporte de Guardia', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden p-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm">
          {currentRole === 'admin' ? (
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          ) : (
            <ClipboardList className="h-4 w-4 text-blue-600" />
          )}
          <span>Menú de Navegación</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Body */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-full w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Role Identity Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {currentRole === 'admin' ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                <ClipboardList className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {currentRole === 'admin' ? 'Vista Administrador' : 'Comunicador Social'}
              </h3>
              <p className="text-[11px] text-zinc-500">
                {currentRole === 'admin' ? 'Gestión Multi-Refugio' : 'Recepción & Asistencia'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {currentRole === 'admin'
            ? adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeAdminScreen === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveAdminScreen(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            : socialMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSocialScreen === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSocialScreen(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
        </nav>

        {/* Network Status Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 text-xs bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between text-zinc-500">
            <span>Red de Refugios</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">● {shelters.length} Activos</span>
          </div>
        </div>
      </aside>
    </>
  );
};
