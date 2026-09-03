"use client";

import React from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ShelterManagementScreen } from '@/components/admin/ShelterManagementScreen';
import { AdminEvacueesScreen } from '@/components/admin/AdminEvacueesScreen';
import { GruposFamiliaresScreen } from '@/components/shared/GruposFamiliaresScreen';
import { PerfilesAsignacionesScreen } from '@/components/admin/PerfilesAsignacionesScreen';
import { 
  Users, 
  Building2, 
  Home, 
  UserCheck, 
  Shield, 
  CheckCircle2, 
  MapPin, 
  ArrowRight 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    activeAdminScreen, 
    setActiveAdminScreen, 
    refugios, 
    personas, 
    estadias, 
    gruposFamiliares, 
    perfiles 
  } = useShelter();

  // Active stays across network (fecha_egreso IS NULL)
  const estadiasActivas = estadias.filter((e) => !e.fecha_egreso);
  const totalCapacidad = refugios.reduce((acc, r) => acc + r.capacidad, 0);
  const totalOcupadas = estadiasActivas.length;
  const globalOccupancyPct = totalCapacidad > 0 ? Math.round((totalOcupadas / totalCapacidad) * 100) : 0;

  // Render specific screen based on activeAdminScreen
  if (activeAdminScreen === 'refugios') {
    return <ShelterManagementScreen />;
  }

  if (activeAdminScreen === 'estadias') {
    return <AdminEvacueesScreen />;
  }

  if (activeAdminScreen === 'grupos') {
    return <GruposFamiliaresScreen />;
  }

  if (activeAdminScreen === 'perfiles') {
    return <PerfilesAsignacionesScreen />;
  }

  // DEFAULT DASHBOARD GLOBAL
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-white p-6 rounded-2xl shadow-md border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold tracking-tight">Panel General del Administrador</h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Supervisión consolidada basada exactamente en las tablas public.refugios, personas, estadias, grupos_familiares y perfiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setActiveAdminScreen('refugios')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            <Building2 className="h-4 w-4 mr-1.5" />
            Gestión de Refugios ({refugios.length})
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Capacidad de Red
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{globalOccupancyPct}%</span>
              <span className="text-xs text-zinc-500 font-medium">Ocupado</span>
            </div>
            <Progress value={globalOccupancyPct} className="mt-3 h-2" />
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>{totalOcupadas} Plazas Ocupadas</span>
              <span className="text-emerald-600 font-bold dark:text-emerald-400">{totalCapacidad - totalOcupadas} Libres</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Estadías Activas
              <Users className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{estadiasActivas.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Personas albergadas (fecha_egreso IS NULL)</p>
            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
              Total Personas registradas: {personas.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Grupos Familiares
              <Home className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{gruposFamiliares.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Núcleos familiares conformados</p>
            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-purple-700 dark:text-purple-300 font-medium">
              ● Mantenimiento de la unidad familiar
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Trabajadores Sociales
              <UserCheck className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {perfiles.filter((p) => p.rol === 'trabajador_social').length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Operadores asignados en puerta</p>
            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-amber-700 dark:text-amber-300 font-medium">
              ● Asignados a refugios de la red
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refugios Summary List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Refugios Activos (public.refugios)</CardTitle>
            <CardDescription>Ocupación en tiempo real por cada establecimiento.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveAdminScreen('refugios')}
          >
            Administrar Refugios →
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {refugios.map((r) => {
            const ocupadas = estadias.filter((e) => e.refugio_id === r.id && !e.fecha_egreso).length;
            const pct = Math.round((ocupadas / r.capacidad) * 100);

            return (
              <div key={r.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">{r.nombre}</span>
                    <span className="text-xs text-zinc-500">{r.direccion}, {r.localidad}</span>
                  </div>
                  <Badge variant={pct >= 90 ? 'destructive' : 'success'}>
                    {ocupadas}/{r.capacidad}
                  </Badge>
                </div>
                <Progress value={pct} className="h-2" />
                <div className="flex justify-between text-xs text-zinc-500 pt-1 font-medium">
                  <span>Ocupado: {pct}%</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Libres: {r.capacidad - ocupadas}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
