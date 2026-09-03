"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { EvacueeIntakeForm } from '@/components/social-worker/EvacueeIntakeForm';
import { FamilySearchModal } from '@/components/social-worker/FamilySearchModal';
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
  Clock, 
  MapPin, 
  ShieldCheck, 
  Activity,
  AlertCircle
} from 'lucide-react';

export const SocialWorkerDashboard: React.FC = () => {
  const { evacuees, zones, updateEvacueeStatus } = useShelter();
  const [activeTab, setActiveTab] = useState<'intake' | 'live_registry' | 'family_search' | 'shift_log'>('intake');

  // Search filter for live registry
  const [searchRegistry, setSearchRegistry] = useState('');
  const [statusRegistry, setStatusRegistry] = useState<string>('all');

  const filteredRegistry = evacuees.filter((e) => {
    const matchSearch =
      e.firstName.toLowerCase().includes(searchRegistry.toLowerCase()) ||
      e.lastName.toLowerCase().includes(searchRegistry.toLowerCase()) ||
      e.dni.includes(searchRegistry) ||
      e.originNeighborhood.toLowerCase().includes(searchRegistry.toLowerCase());
    
    const matchStatus = statusRegistry === 'all' || e.status === statusRegistry;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Social Worker Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-900 text-white p-6 rounded-2xl shadow-md border border-blue-800">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-300" />
            <h2 className="text-2xl font-bold tracking-tight">Módulo de Ingreso de Evacuados & Asistencia Social</h2>
          </div>
          <p className="text-sm text-blue-200 mt-1">
            Recepción, registro rápido de vulnerabilidades, asignación de alojamientos y contención familiar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setActiveTab('intake')}
            className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-sm"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            Registrar Nuevo Evacuado
          </Button>
        </div>
      </div>

      {/* Quick Shift Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase">Ingresados en Turno</span>
              <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">{evacuees.length} personas</div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase">Casos Vulnerables / Médicos</span>
              <div className="text-2xl font-extrabold text-purple-900 dark:text-purple-100">
                {evacuees.filter((e) => e.vulnerabilities.hasChronicCondition || e.vulnerabilities.isPregnant || e.vulnerabilities.hasDisabledMobility).length} casos
              </div>
            </div>
            <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Grupos Familiares</span>
              <div className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">
                {new Set(evacuees.map((e) => e.familyGroupId).filter(Boolean)).size} familias
              </div>
            </div>
            <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </CardContent>
        </Card>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('intake')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'intake'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          ➕ Formulario de Ingreso Rápido
        </button>
        <button
          onClick={() => setActiveTab('live_registry')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'live_registry'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          📋 Padrón en Vivo ({evacuees.length})
        </button>
        <button
          onClick={() => setActiveTab('family_search')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'family_search'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          🔎 Reunificación Familiar
        </button>
        <button
          onClick={() => setActiveTab('shift_log')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'shift_log'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          📝 Resumen de Cierre de Turno
        </button>
      </div>

      {/* TAB 1: FORMULARIO DE INGRESO */}
      {activeTab === 'intake' && (
        <EvacueeIntakeForm onSuccessTab={() => setActiveTab('live_registry')} />
      )}

      {/* TAB 2: PADRON EN VIVO */}
      {activeTab === 'live_registry' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Registro en Vivo de Evacuados</CardTitle>
                <CardDescription>
                  Gestión del estado de permanencia, derivaciones hospitalarias y egresos del refugio.
                </CardDescription>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
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
                  <th className="py-3 px-4">DNI</th>
                  <th className="py-3 px-4">Barrio Origen</th>
                  <th className="py-3 px-4">Zona / Cama</th>
                  <th className="py-3 px-4">Estado Actual</th>
                  <th className="py-3 px-4 text-right">Cambiar Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredRegistry.map((e) => {
                  const zone = zones.find((z) => z.id === e.zoneId);

                  return (
                    <tr key={e.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                          {e.lastName}, {e.firstName}
                        </span>
                        <span className="text-xs text-zinc-500">{e.age} años • {e.gender}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-800 dark:text-zinc-200">{e.dni}</td>

                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">{e.originNeighborhood}</td>

                      <td className="py-3 px-4">
                        <span className="font-medium block">{zone?.name || e.zoneId}</span>
                        <span className="text-xs text-zinc-500">Cama: {e.bedNumber || 'Sin asignar'}</span>
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
      )}

      {/* TAB 3: REUNIFICACION FAMILIAR */}
      {activeTab === 'family_search' && <FamilySearchModal />}

      {/* TAB 4: RESUMEN DE TURNO */}
      {activeTab === 'shift_log' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informe de Cierre de Turno de Admisión</CardTitle>
            <CardDescription>Resumen para el traspaso de guardia con el siguiente comunicador social.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Resumen Estadístico del Turno</h4>
                <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 text-xs">
                  <li>• Total de personas registradas: <strong>{evacuees.length}</strong></li>
                  <li>• Menores de edad acompañados: <strong>{evacuees.filter((e) => e.vulnerabilities.isMinor).length}</strong></li>
                  <li>• Adultos mayores asistidos: <strong>{evacuees.filter((e) => e.vulnerabilities.isElderly).length}</strong></li>
                  <li>• Derivaciones médicas efectuadas: <strong>{evacuees.filter((e) => e.status === 'derivado_hospital').length}</strong></li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Instrucciones de Guardia</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  Verificar a las 15:00 hs la entrega de raciones especiales para personas con dieta Sin TACC y diabéticos. Mantener coordinación activa con Defensa Civil para posibles nuevos arribos.
                </p>
              </div>
            </div>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              onClick={() => alert("Informe de turno exportado e impreso correctamente.")}
            >
              <FileText className="h-4 w-4 mr-1.5" />
              Generar Acta de Cierre de Guardia
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
