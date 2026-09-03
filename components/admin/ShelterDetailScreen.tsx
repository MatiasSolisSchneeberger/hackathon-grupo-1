"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ResourceRestockModal } from '@/components/admin/ResourceRestockModal';
import { ResourceItem } from '@/types/shelter';
import { Building2, Package, Users, Utensils, AlertTriangle, MapPin, UserCheck, Plus, CheckCircle2 } from 'lucide-react';

export const ShelterDetailScreen: React.FC = () => {
  const { shelters, selectedShelterId, setSelectedShelterId, zones, resources, evacuees } = useShelter();

  // If no shelter selected, default to first
  const activeShelterId = selectedShelterId || shelters[0]?.id || 'ref_1';
  const activeShelter = shelters.find((s) => s.id === activeShelterId) || shelters[0];

  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  if (!activeShelter) {
    return <div className="p-6 text-center text-zinc-500">No hay refugios creados en el sistema.</div>;
  }

  // Filter data specifically for this shelter
  const shelterZones = zones.filter((z) => z.shelterId === activeShelter.id);
  const shelterResources = resources.filter((r) => r.shelterId === activeShelter.id);
  const shelterEvacuees = evacuees.filter((e) => e.shelterId === activeShelter.id);

  const foodResources = shelterResources.filter((r) => r.category === 'alimentos' || r.category === 'agua');
  const lowStockCount = shelterResources.filter((r) => r.status === 'critico' || r.status === 'bajo').length;

  const pct = Math.round((activeShelter.occupied / activeShelter.capacity) * 100);

  return (
    <div className="space-y-6">
      {/* Top Selector & Header */}
      <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-md border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider block">Inspección de Refugio Específico</span>
            <h2 className="text-2xl font-bold tracking-tight">{activeShelter.name}</h2>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {activeShelter.address}, {activeShelter.city}
              <span>•</span>
              <UserCheck className="h-3.5 w-3.5 text-zinc-400" /> Responsable: {activeShelter.managerName}
            </p>
          </div>

          {/* Selector of Shelters */}
          <div className="w-full sm:w-72">
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1 uppercase">Cambiar de Refugio</label>
            <select
              value={activeShelter.id}
              onChange={(e) => setSelectedShelterId(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {shelters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.occupied}/{s.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Capacity overview bar */}
        <div className="pt-2 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700">
            <span className="text-zinc-400 block">Capacidad de Camas</span>
            <span className="text-lg font-bold">{activeShelter.occupied} / {activeShelter.capacity} plazas ({pct}%)</span>
            <Progress value={pct} className="h-1.5 mt-2" />
          </div>

          <div className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700">
            <span className="text-zinc-400 block">Evacuados Albergados</span>
            <span className="text-lg font-bold text-emerald-400">{shelterEvacuees.length} registradas</span>
            <span className="text-[11px] text-zinc-400 block mt-1">Sincronizados en tiempo real</span>
          </div>

          <div className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700">
            <span className="text-zinc-400 block">Alimentos e Insumos</span>
            <span className="text-lg font-bold text-amber-400">{shelterResources.length} insumos registrados</span>
            <span className="text-[11px] text-amber-300 block mt-1">
              {lowStockCount > 0 ? `⚠️ ${lowStockCount} insumos bajo mínimo` : '✅ Stock seguro'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Food Inventory & Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alimentos e Insumos asignados a este refugio */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-t-4 border-t-emerald-600">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-emerald-600" />
                  Alimentos y Agua Asignados a este Refugio
                </CardTitle>
                <CardDescription>
                  Inventario de raciones alimentarias, agua y viandas especiales disponibles en {activeShelter.name}.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Alimento / Recurso</th>
                    <th className="py-3 px-4">Stock Disponible</th>
                    <th className="py-3 px-4">Mínimo Requerido</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {shelterResources.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-zinc-500">
                        No hay insumos registrados para este refugio.
                      </td>
                    </tr>
                  ) : (
                    shelterResources.map((res) => (
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
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setSelectedResource(res)}
                          >
                            + Sumar Stock
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Lista de Evacuados en este refugio (Sincronizado con el Comunicador Social) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Refugiados Albergados en este Refugio ({shelterEvacuees.length})
              </CardTitle>
              <CardDescription>
                Población alojada registrada por los Comunicadores Sociales en este establecimiento.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Evacuado</th>
                    <th className="py-3 px-4">DNI</th>
                    <th className="py-3 px-4">Barrio Origen</th>
                    <th className="py-3 px-4">Cama / Módulo</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {shelterEvacuees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-zinc-500">
                        Aún no hay personas registradas en este refugio.
                      </td>
                    </tr>
                  ) : (
                    shelterEvacuees.map((e) => (
                      <tr key={e.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <td className="py-3 px-4 font-bold">{e.lastName}, {e.firstName} ({e.age}a)</td>
                        <td className="py-3 px-4 font-mono">{e.dni}</td>
                        <td className="py-3 px-4">{e.originNeighborhood}</td>
                        <td className="py-3 px-4">{e.bedNumber || 'Sin asignar'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{e.status.toUpperCase()}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Zonas del Refugio */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zonas de Alojamiento Interno</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shelterZones.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No hay zonas configuradas.</p>
              ) : (
                shelterZones.map((z) => {
                  const zonePct = Math.round((z.occupied / z.capacity) * 100);
                  return (
                    <div key={z.id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{z.name}</span>
                        <Badge variant="secondary">{z.occupied}/{z.capacity} camas</Badge>
                      </div>
                      <p className="text-[11px] text-zinc-500">{z.description}</p>
                      <Progress value={zonePct} className="h-2" />
                    </div>
                  );
                })
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
