"use client";

import React from 'react';
import { useShelter } from '@/context/ShelterContext';
import { EvacueeIntakeForm } from '@/components/social-worker/EvacueeIntakeForm';
import { SocialWorkerRegistryScreen } from '@/components/social-worker/SocialWorkerRegistryScreen';
import { GruposFamiliaresScreen } from '@/components/shared/GruposFamiliaresScreen';
import { FamilySearchModal } from '@/components/social-worker/FamilySearchModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, UserPlus, Users, Home, Search } from 'lucide-react';

export const SocialWorkerDashboard: React.FC = () => {
  const { activeSocialScreen, setActiveSocialScreen, estadias, personas, gruposFamiliares } = useShelter();

  // Render sub screen based on activeSocialScreen
  if (activeSocialScreen === 'ingreso') {
    return <EvacueeIntakeForm onSuccessTab={() => setActiveSocialScreen('estadias_activas')} />;
  }

  if (activeSocialScreen === 'estadias_activas') {
    return <SocialWorkerRegistryScreen />;
  }

  if (activeSocialScreen === 'grupos') {
    return <GruposFamiliaresScreen />;
  }

  if (activeSocialScreen === 'reunificacion') {
    return <FamilySearchModal />;
  }

  // DEFAULT
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-900 text-white p-6 rounded-2xl shadow-md border border-blue-800">
        <div>
          <div className="flex min-w-0 items-start gap-2">
            <ClipboardList className="h-6 w-6 text-blue-300" />
            <h2 className="min-w-0 text-xl font-bold tracking-tight sm:text-2xl">Panel del Trabajador Social</h2>
          </div>
          <p className="text-sm text-blue-200 mt-1">
            Gestión de ingresos, permanencia y egresos sobre las tablas public.personas, public.estadias y public.grupos_familiares.
          </p>
        </div>
        <Button
          onClick={() => setActiveSocialScreen('ingreso')}
          className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-sm"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          + Registrar Nuevo Ingreso
        </Button>
      </div>

      <SocialWorkerRegistryScreen />
    </div>
  );
};
