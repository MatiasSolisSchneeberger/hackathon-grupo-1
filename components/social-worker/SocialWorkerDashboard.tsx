"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { EvacueeIntakeForm } from '@/components/social-worker/EvacueeIntakeForm';
import { FamilySearchModal } from '@/components/social-worker/FamilySearchModal';
import { HealthDietScreen } from '@/components/social-worker/HealthDietScreen';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EvacueeStatus } from '@/types/shelter';
import { 
  ClipboardList, 
  UserPlus, 
  Search, 
  Heart, 
  FileText, 
  CheckCircle2, 
  Building2,
  UtensilsCrossed,
  ShieldCheck
} from 'lucide-react';

export const SocialWorkerDashboard: React.FC = () => {
  const { 
    activeSocialScreen, 
    setActiveSocialScreen, 
    evacuees, 
    shelters, 
    zones, 
    updateEvacueeStatus 
  } = useShelter();

  // Search filter for live registry
  const [searchRegistry, setSearchRegistry] = useState('');
  const [selectedShelterFilter, setSelectedShelterFilter] = useState<string>('all');
  const [statusRegistry, setStatusRegistry] = useState<string>('all');

  const filteredRegistry = evacuees.filter((e) => {
    const matchSearch =
      e.firstName.toLowerCase().includes(searchRegistry.toLowerCase()) ||
      e.lastName.toLowerCase().includes(searchRegistry.toLowerCase()) ||
      e.dni.includes(searchRegistry) ||
      e.originNeighborhood.toLowerCase().includes(searchRegistry.toLowerCase());
    
    const matchShelter = selectedShelterFilter === 'all' || e.shelterId === selectedShelterFilter;
    const matchStatus = statusRegistry === 'all' || e.status === statusRegistry;

    return matchSearch && matchShelter && matchStatus;
  });

  // Render sub screen based on activeSocialScreen
  if (activeSocialScreen === 'intake') {
    return <EvacueeIntakeForm onSuccessTab={() => setActiveSocialScreen('registry')} />;
  }

  if (activeSocialScreen === 'family_search') {
    return <FamilySearchModal />;
  }

  if (activeSocialScreen === 'health_diet') {
    return <HealthDietScreen />;
  }

  if (activeSocialScreen === 'shift_report') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informe de Cierre de Guardia de Trabajo Social</CardTitle>
          <CardDescription>Acta resumida para el traspaso de información con el equipo entrante.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Resumen Estadístico del Turno</h4>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 text-xs">
                <li>• Total de evacuees albergados en red: <strong>{evacuees.length} personas</strong></li>
                <li>• Menores de edad asistidos: <strong>{evacuees.filter((e) => e.vulnerabilities.isMinor).length}</strong></li>
                <li>• Adultos mayores asistidos: <strong>{evacuees.filter((e) => e.vulnerabilities.isElderly).length}</strong></li>
                <li>• Personas con dietas especiales / Sin TACC: <strong>{evacuees.filter((e) => e.dietaryNotes).length}</strong></li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Instrucciones para la Guardia Entrante</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Verificar la entrega oportuna de raciones Sin TACC en Refugio N° 1 y el seguimiento de paciente en Zona B (Zona de Salud).
              </p>
            </div>
          </div>

          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            onClick={() => alert("Informe de turno exportado e impreso correctamente.")}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Generar y Descargar Acta de Cierre
          </Button>
        </CardContent>
      </Card>
    );
  }

  // DEFAULT REGISTRY SCREEN
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-900 text-white p-6 rounded-2xl shadow-md border border-blue-800">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-300" />
            <h2 className="text-2xl font-bold tracking-tight">Padrón de Refugiados en Vivo</h2>
          </div>
          <p className="text-sm text-blue-200 mt-1">
            Registro unificado de la población evacuada. Los cambios de estado o altas se sincronizan con la Administración.
          </p>
        </div>
        <Button
          onClick={() => setActiveSocialScreen('intake')}
          className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-sm"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          + Registrar Nuevo Evacuado
        </Button>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Registro de Permanencia y Derivaciones</CardTitle>
              <CardDescription>Actualización de estado en tiempo real.</CardDescription>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Filtrar por Nombre, DNI o Barrio..."
                value={searchRegistry}
                onChange={(e) => setSearchRegistry(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={selectedShelterFilter}
              onChange={(e) => setSelectedShelterFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">Todos los Refugios</option>
              {shelters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={statusRegistry}
              onChange={(e) => setStatusRegistry(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">Todos los Estados</option>
              <option value="ingresado">Ingresado</option>
              <option value="en_transito">En Tránsito / Observación</option>
              <option value="derivado_hospital">Derivado a Hospital</option>
              <option value="egresado">Egresado del Refugio</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
              <tr>
                <th className="py-3 px-4">Evacuado</th>
                <th className="py-3 px-4">Refugio Albergue</th>
                <th className="py-3 px-4">Cama / Módulo</th>
                <th className="py-3 px-4">Requerimientos Salud / Dieta</th>
                <th className="py-3 px-4">Estado Actual</th>
                <th className="py-3 px-4 text-right">Cambiar Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredRegistry.map((e) => {
                const shelter = shelters.find((s) => s.id === e.shelterId);
                const zone = zones.find((z) => z.id === e.zoneId);

                return (
                  <tr key={e.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                        {e.lastName}, {e.firstName}
                      </span>
                      <span className="text-xs text-zinc-500">DNI: {e.dni} • {e.age} años</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                        {shelter ? shelter.name.split('-')[0] : e.shelterId}
                      </span>
                      <span className="text-xs text-zinc-500">Origen: {e.originNeighborhood}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium block">{zone ? zone.name : e.zoneId}</span>
                      <span className="text-xs text-zinc-500">Cama: {e.bedNumber || 'N/A'}</span>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {e.dietaryNotes && (
                        <span className="font-semibold text-amber-700 dark:text-amber-400 block">🌾 {e.dietaryNotes}</span>
                      )}
                      {e.medicalNotes && (
                        <span className="text-zinc-500 line-clamp-1 italic">{e.medicalNotes}</span>
                      )}
                      {!e.dietaryNotes && !e.medicalNotes && <span className="text-zinc-400">Normal</span>}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          e.status === 'ingresado'
                            ? 'success'
                            : e.status === 'en_transito'
                            ? 'warning'
                            : e.status === 'derivado_hospital'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {e.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <select
                        value={e.status}
                        onChange={(evt) => updateEvacueeStatus(e.id, evt.target.value as EvacueeStatus)}
                        className="h-8 rounded-md border border-zinc-300 bg-white px-2 py-0.5 text-xs shadow-xs dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                      >
                        <option value="ingresado">🟢 Ingresado</option>
                        <option value="en_transito">🟡 En Tránsito</option>
                        <option value="derivado_hospital">🔴 Derivado a Hospital</option>
                        <option value="egresado">⚪ Egresado</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
