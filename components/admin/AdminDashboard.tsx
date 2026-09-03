"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ResourceRestockModal } from '@/components/admin/ResourceRestockModal';
import { ResourceItem, Evacuee } from '@/types/shelter';
import { 
  Users, 
  Building2, 
  Package, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  Clock, 
  HeartPulse, 
  PlusCircle, 
  Shield, 
  Activity, 
  Filter,
  FileSpreadsheet,
  Megaphone
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { evacuees, zones, resources, notices, addNotice } = useShelter();
  const [activeTab, setActiveTab] = useState<'overview' | 'evacuees' | 'inventory' | 'notices'>('overview');
  
  // Search & Filters for Evacuees Table
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Restock Modal State
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  // New Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeType, setNoticeType] = useState<'info' | 'warning' | 'urgent'>('info');

  // Computed metrics
  const totalCapacity = zones.reduce((acc, z) => acc + z.capacity, 0);
  const totalOccupied = zones.reduce((acc, z) => acc + z.occupied, 0);
  const totalAvailable = totalCapacity - totalOccupied;
  const occupancyPercentage = Math.round((totalOccupied / totalCapacity) * 100);

  const minorCount = evacuees.filter((e) => e.vulnerabilities.isMinor).length;
  const elderlyCount = evacuees.filter((e) => e.vulnerabilities.isElderly).length;
  const medicalCount = evacuees.filter((e) => e.vulnerabilities.hasChronicCondition || e.vulnerabilities.hasDisabledMobility || e.vulnerabilities.isPregnant).length;

  const lowStockResources = resources.filter((r) => r.status === 'critico' || r.status === 'bajo');

  // Filtered evacuees
  const filteredEvacuees = evacuees.filter((e) => {
    const matchesSearch = 
      e.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.dni.includes(searchQuery) ||
      e.originNeighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesZone = zoneFilter === 'all' || e.zoneId === zoneFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;

    return matchesSearch && matchesZone && matchesStatus;
  });

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (noticeTitle.trim() && noticeMessage.trim()) {
      addNotice(noticeTitle, noticeMessage, noticeType);
      setNoticeTitle('');
      setNoticeMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-white p-6 rounded-2xl shadow-md border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold tracking-tight">Panel de Administración del Refugio</h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Supervisión estratégica de ocupación, recursos críticos, padrón consolidado y logística de emergencia.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setActiveTab('inventory')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
          >
            <Package className="h-4 w-4 mr-1.5" />
            Revisar Inventario
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Occupancy */}
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Capacidad de Refugio
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{occupancyPercentage}%</span>
              <span className="text-xs text-zinc-500 font-medium">Ocupado</span>
            </div>
            <Progress value={occupancyPercentage} className="mt-3 h-2" />
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>{totalOccupied} Ocupadas</span>
              <span className="text-emerald-600 font-bold dark:text-emerald-400">{totalAvailable} Disponibles</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Total Evacuees */}
        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Población Evacuada
              <Users className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{evacuees.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Personas albergadas activas</p>
            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>🚸 {minorCount} Niños</span>
              <span>👴 {elderlyCount} Mayores</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Health & Vulnerabilities */}
        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Atención Médica & Salud
              <HeartPulse className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{medicalCount}</div>
            <p className="text-xs text-zinc-500 mt-1">Requieren seguimiento especial</p>
            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-purple-700 dark:text-purple-300 font-medium">
              ● Monitoreo continuo de dosis y dietas
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Inventory Alerts */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
              Estado de Insumos
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {lowStockResources.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Insumos bajo el umbral mínimo</p>
            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-amber-700 dark:text-amber-300 font-medium">
              {lowStockResources.length > 0 ? '⚠️ Reabastecimiento requerido' : '✅ Stock abastecido'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          📊 Visión General del Refugio
        </button>
        <button
          onClick={() => setActiveTab('evacuees')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'evacuees'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          📋 Padrón Consolidado de Evacuados
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          📦 Control de Inventario ({lowStockResources.length > 0 ? `⚠️ ${lowStockResources.length}` : resources.length})
        </button>
        <button
          onClick={() => setActiveTab('notices')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'notices'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          📢 Bitácora y Anuncios
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Zone Capacity Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Distribución y Capacidad por Zonas</span>
                  <Badge variant="outline">{zones.length} Zonas Operativas</Badge>
                </CardTitle>
                <CardDescription>
                  Monitoreo del nivel de ocupación en tiempo real en cada área del refugio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {zones.map((zone) => {
                  const pct = Math.round((zone.occupied / zone.capacity) * 100);
                  let progressColor = 'bg-blue-600';
                  if (pct >= 90) progressColor = 'bg-red-600';
                  else if (pct >= 75) progressColor = 'bg-amber-500';

                  return (
                    <div key={zone.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{zone.name}</span>
                          <span className="text-xs text-zinc-500 ml-2">[{zone.code}]</span>
                        </div>
                        <Badge variant={pct >= 90 ? 'destructive' : pct >= 75 ? 'warning' : 'secondary'}>
                          {zone.occupied} / {zone.capacity} plazas ({pct}%)
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500">{zone.description}</p>
                      <Progress value={pct} indicatorClassName={progressColor} className="h-2.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Operational Notices Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-blue-600" />
                  Novedades de la Operativa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border text-sm ${
                      n.type === 'urgent'
                        ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
                        : n.type === 'warning'
                        ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200'
                        : 'border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span>{n.title}</span>
                      <span className="text-xs font-normal opacity-75">{n.timestamp}</span>
                    </div>
                    <p className="text-xs">{n.message}</p>
                    <span className="text-[10px] opacity-70 block mt-1">Emitido por: {n.author}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Supply Warnings & Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Alertas de Insumos Críticos</span>
                  <Package className="h-5 w-5 text-amber-500" />
                </CardTitle>
                <CardDescription>Artículos que requieren reposición inmediata.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowStockResources.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-sm">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    Todos los insumos se encuentran en niveles seguros.
                  </div>
                ) : (
                  lowStockResources.map((res) => (
                    <div key={res.id} className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-sm block text-zinc-900 dark:text-zinc-100">{res.name}</span>
                        <span className="text-xs text-amber-700 dark:text-amber-400">
                          Quedan: <strong>{res.quantity} {res.unit}</strong> (Min: {res.minThreshold})
                        </span>
                      </div>
                      <Button
                        size="xs"
                        variant="warning"
                        onClick={() => setSelectedResource(res)}
                      >
                        Reabastecer
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumen Demográfico de Ingresos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Menores de edad (0-17):</span>
                  <span className="font-bold">{minorCount}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Adultos Mayores (+65):</span>
                  <span className="font-bold">{elderlyCount}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Condición Médica / Embarazo:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{medicalCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: PADRON DE EVACUADOS */}
      {activeTab === 'evacuees' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Padrón Consolidado de Evacuados</CardTitle>
                <CardDescription>
                  Listado global con filtros de búsqueda rápida, zona asignada y banderas de vulnerabilidad.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => alert("Simulando exportación a Excel / CSV...")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600" />
                  Exportar Padrón
                </Button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Buscar por Nombre, DNI o Barrio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
              >
                <option value="all">Todas las Zonas</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
              >
                <option value="all">Todos los Estados</option>
                <option value="ingresado">Ingresados</option>
                <option value="en_transito">En Tránsito</option>
                <option value="derivado_hospital">Derivados a Hospital</option>
                <option value="egresado">Egresados</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Evacuado</th>
                  <th className="py-3 px-4">DNI / Edad</th>
                  <th className="py-3 px-4">Barrio / Causa</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Vulnerabilidad & Salud</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredEvacuees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-zinc-500">
                      No se encontraron evacuados con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredEvacuees.map((e) => {
                    const zone = zones.find((z) => z.id === e.zoneId);

                    return (
                      <tr key={e.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <td className="py-3 px-4">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                            {e.lastName}, {e.firstName}
                          </span>
                          {e.familyGroupId && (
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                              Grupo: {e.familyGroupId} ({e.familyRole})
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-zinc-800 dark:text-zinc-200">{e.dni}</div>
                          <div className="text-xs text-zinc-500">{e.age} años</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-zinc-800 dark:text-zinc-200">{e.originNeighborhood}</div>
                          <div className="text-xs text-zinc-500 capitalize">{e.evacuationReason}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium block text-zinc-800 dark:text-zinc-200">
                            {zone ? zone.name.split('-')[0] : e.zoneId}
                          </span>
                          <span className="text-xs text-zinc-500">Cama: {e.bedNumber || 'Sin asignar'}</span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {e.vulnerabilities.isMinor && <Badge variant="secondary">🚸 Menor</Badge>}
                            {e.vulnerabilities.isElderly && <Badge variant="secondary">👴 Mayor</Badge>}
                            {e.vulnerabilities.isPregnant && <Badge variant="warning">🤰 Embarazo</Badge>}
                            {e.vulnerabilities.hasDisabledMobility && <Badge variant="warning">♿ Movilidad</Badge>}
                            {e.vulnerabilities.hasChronicCondition && <Badge variant="destructive">🏥 Crónico</Badge>}
                          </div>
                          {e.medicalNotes && (
                            <p className="text-[11px] text-zinc-500 mt-1 italic line-clamp-1">{e.medicalNotes}</p>
                          )}
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
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: INVENTARIO */}
      {activeTab === 'inventory' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Gestión de Inventario e Insumos</CardTitle>
              <CardDescription>
                Control de existencias de agua, víveres, ropa de cama y botiquines de primeros auxilios.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Insumo / Categoría</th>
                  <th className="py-3 px-4">Stock Actual</th>
                  <th className="py-3 px-4">Umbral Mínimo</th>
                  <th className="py-3 px-4">Estado Stock</th>
                  <th className="py-3 px-4">Última Reposición</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{res.name}</span>
                      <span className="text-xs text-zinc-500 capitalize">{res.category}</span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-base">
                      {res.quantity} <span className="text-xs font-normal text-zinc-500">{res.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {res.minThreshold} {res.unit}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          res.status === 'critico'
                            ? 'destructive'
                            : res.status === 'bajo'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {res.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-zinc-500">{res.lastRestocked}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedResource(res)}
                      >
                        + Reabastecer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: BITACORA Y ANUNCIOS */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Emitir Anuncio Operativo</CardTitle>
              <CardDescription>Publicar aviso o alerta visible para todo el personal del refugio.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePostNotice} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Título de la Novedad
                  </label>
                  <Input
                    placeholder="Ej: Llegada de ambulancia..."
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
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
                    className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
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
                    placeholder="Escriba el detalle de la instrucción o novedad..."
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white p-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Publicar Anuncio
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Bitácora de Anuncios Publicados</CardTitle>
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
      )}

      {/* Restock Modal Trigger */}
      {selectedResource && (
        <ResourceRestockModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
};
