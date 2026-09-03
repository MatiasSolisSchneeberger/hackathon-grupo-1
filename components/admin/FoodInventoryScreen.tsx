"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResourceRestockModal } from '@/components/admin/ResourceRestockModal';
import { ResourceItem } from '@/types/shelter';
import { Package, Utensils, Search, AlertTriangle, Building2, Plus } from 'lucide-react';

export const FoodInventoryScreen: React.FC = () => {
  const { resources, shelters } = useShelter();
  const [selectedShelterFilter, setSelectedShelterFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  const filteredResources = resources.filter((res) => {
    const matchShelter = selectedShelterFilter === 'all' || res.shelterId === selectedShelterFilter;
    const matchCategory = categoryFilter === 'all' || res.category === categoryFilter;
    const matchSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchShelter && matchCategory && matchSearch;
  });

  const lowStockList = resources.filter((r) => r.status === 'critico' || r.status === 'bajo');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-md border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-emerald-400" />
            <h2 className="text-2xl font-bold tracking-tight">Control General de Alimentos e Insumos Logísticos</h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Supervisión del stock de raciones alimentarias, agua potable y abastecimiento en todos los refugios.
          </p>
        </div>
      </div>

      {/* Supply Alert Banner */}
      {lowStockList.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Atención: {lowStockList.length} Insumos Requieren Reabastecimiento</h4>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Se detectaron artículos por debajo del umbral mínimo en la red de refugios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Inventario de Alimentos y Recursos por Refugio</CardTitle>
              <CardDescription>Consulta y reabastecimiento en tiempo real.</CardDescription>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Buscar insumo o alimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">Todas las Categorías</option>
              <option value="alimentos">Alimentos y Raciones</option>
              <option value="agua">Agua Potable</option>
              <option value="abrigo">Abrigo y Mantas</option>
              <option value="higiene">Kits de Higiene</option>
              <option value="medicina">Medicina / Botiquines</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
              <tr>
                <th className="py-3 px-4">Refugio Asignado</th>
                <th className="py-3 px-4">Insumo / Alimento</th>
                <th className="py-3 px-4">Stock Disponible</th>
                <th className="py-3 px-4">Mínimo Requerido</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredResources.map((res) => {
                const shelter = shelters.find((s) => s.id === res.shelterId);

                return (
                  <tr key={res.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                        {shelter ? shelter.name.split('-')[0] : res.shelterId}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold block text-zinc-900 dark:text-zinc-100">{res.name}</span>
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
                        + Reabastecer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

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
