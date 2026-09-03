"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ShelterManagementScreen } from '@/components/admin/ShelterManagementScreen';
import { ShelterDetailScreen } from '@/components/admin/ShelterDetailScreen';
import { FoodInventoryScreen } from '@/components/admin/FoodInventoryScreen';
import { AdminEvacueesScreen } from '@/components/admin/AdminEvacueesScreen';
import { ResourceRestockModal } from '@/components/admin/ResourceRestockModal';
import { ResourceItem } from '@/types/shelter';
import { 
  Users, 
  Building2, 
  Package, 
  AlertTriangle, 
  HeartPulse, 
  Megaphone,
  Shield,
  ArrowRight,
  Utensils
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    activeAdminScreen, 
    setActiveAdminScreen, 
    setSelectedShelterId, 
    shelters, 
    evacuees, 
    resources, 
    notices, 
    addNotice 
  } = useShelter();

  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  // New Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeType, setNoticeType] = useState<'info' | 'warning' | 'urgent'>('info');

  // Computed metrics across all shelters
  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.occupied, 0);
  const totalAvailable = totalCapacity - totalOccupied;
  const globalOccupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const minorCount = evacuees.filter((e) => e.vulnerabilities.isMinor).length;
  const elderlyCount = evacuees.filter((e) => e.vulnerabilities.isElderly).length;
  const medicalCount = evacuees.filter((e) => e.vulnerabilities.hasChronicCondition || e.vulnerabilities.hasDisabledMobility || e.vulnerabilities.isPregnant).length;

  const lowStockResources = resources.filter((r) => r.status === 'critico' || r.status === 'bajo');

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (noticeTitle.trim() && noticeMessage.trim()) {
      addNotice(noticeTitle, noticeMessage, noticeType);
      setNoticeTitle('');
      setNoticeMessage('');
    }
  };

  // Render specific screen based on activeAdminScreen
  if (activeAdminScreen === 'shelters') {
    return <ShelterManagementScreen />;
  }

  if (activeAdminScreen === 'shelter_detail') {
    return <ShelterDetailScreen />;
  }

  if (activeAdminScreen === 'food_inventory') {
    return <FoodInventoryScreen />;
  }

  if (activeAdminScreen === 'evacuees') {
    return <AdminEvacueesScreen />;
  }

  if (activeAdminScreen === 'notices') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blue-600" />
              Emitir Anuncio u Orden Operativa
            </CardTitle>
            <CardDescription>Publicar aviso o alerta visible para todo el personal de los refugios.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Título de la Novedad
                </label>
                <input
                  type="text"
                  placeholder="Ej: Llegada de contingente..."
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 p-2 text-sm dark:bg-zinc-950 dark:border-zinc-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Prioridad / Tipo
                </label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value as any)}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="info">Información General</option>
                  <option value="warning">Advertencia / Alerta</option>
                  <option value="urgent">Urgente / Prioritario</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mensaje / Detalle
                </label>
                <textarea
                  rows={4}
                  placeholder="Escriba el detalle de la instrucción..."
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white p-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                Publicar Anuncio Global
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Bitácora de Anuncios Operativos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">{n.title}</span>
                  <Badge variant={n.type === 'urgent' ? 'destructive' : n.type === 'warning' ? 'warning' : 'default'}>
                    {n.type.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{n.message}</p>
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Autor: {n.author}</span>
                  <span>{n.timestamp}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // DEFAULT DASHBOARD GLOBAL SCREEN
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-white p-6 rounded-2xl shadow-md border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold tracking-tight">Panel de Control - Red de Refugios de Emergencia</h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Supervisión estratégica unificada. Toda admisión realizada por Comunicadores Sociales se consolida aquí automáticamente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setActiveAdminScreen('shelters')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            <Building2 className="h-4 w-4 mr-1.5" />
            Gestión de Refugios ({shelters.length})
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Capacidad General Red
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
              <span>{totalOccupied} Camas Ocupadas</span>
              <span className="text-emerald-600 font-bold dark:text-emerald-400">{totalAvailable} Disponibles</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Total Evacuados Albergados
              <Users className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{evacuees.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Personas registradas en sistema</p>
            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>🚸 {minorCount} Niños</span>
              <span>👴 {elderlyCount} Mayores</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Casos con Atención Médica
              <HeartPulse className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{medicalCount}</div>
            <p className="text-xs text-zinc-500 mt-1">Pacientes con monitoreo especial</p>
            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-purple-700 dark:text-purple-300 font-medium">
              ● Seguimiento continuo en refugios
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Alertas de Alimentos / Insumos
              <Utensils className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {lowStockResources.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Artículos bajo el umbral mínimo</p>
            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-amber-700 dark:text-amber-300 font-medium">
              {lowStockResources.length > 0 ? '⚠️ Reabastecimiento requerido' : '✅ Stock abastecido'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Shelters Summary Cards & Supply Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Estado de la Red de Refugios Creados</CardTitle>
                <CardDescription>Resumen de ocupación física en cada establecimiento.</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveAdminScreen('shelters')}
              >
                Ver Todos →
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shelters.map((s) => {
                const sPct = Math.round((s.occupied / s.capacity) * 100);

                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{s.name}</span>
                      <Badge variant={sPct >= 90 ? 'destructive' : sPct >= 75 ? 'warning' : 'secondary'}>
                        {s.occupied}/{s.capacity}
                      </Badge>
                    </div>
                    <Progress value={sPct} className="h-2" />
                    <div className="flex justify-between text-xs text-zinc-500 pt-1">
                      <span>Ocupación: {sPct}%</span>
                      <button
                        onClick={() => {
                          setSelectedShelterId(s.id);
                          setActiveAdminScreen('shelter_detail');
                        }}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Ver Alimentos & Camas →
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Insumos y Alimentos Críticos</span>
                <Package className="h-5 w-5 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockResources.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No hay insumos críticos.</p>
              ) : (
                lowStockResources.map((res) => (
                  <div key={res.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold block text-zinc-900 dark:text-zinc-100">{res.name}</span>
                      <span className="text-zinc-500">Stock: {res.quantity} {res.unit}</span>
                    </div>
                    <Button size="xs" variant="outline" onClick={() => setSelectedResource(res)}>
                      Reabastecer
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Restock Modal */}
      {selectedResource && (
        <ResourceRestockModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
};
