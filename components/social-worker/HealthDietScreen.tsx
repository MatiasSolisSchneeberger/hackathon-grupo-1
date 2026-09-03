"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed, HeartPulse, Search, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const HealthDietScreen: React.FC = () => {
  const { evacuees, shelters, resources } = useShelter();
  const [selectedShelterFilter, setSelectedShelterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Evacuees with special dietary or health requirements
  const specialCases = evacuees.filter((e) => {
    const hasSpecialDiet = Boolean(e.dietaryNotes && e.dietaryNotes.trim());
    const hasSpecialHealth = e.vulnerabilities.hasChronicCondition || e.vulnerabilities.isPregnant || e.vulnerabilities.hasDisabledMobility || Boolean(e.medicalNotes);
    
    const matchShelter = selectedShelterFilter === 'all' || e.shelterId === selectedShelterFilter;
    const matchSearch = e.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || e.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || e.dni.includes(searchQuery);

    return (hasSpecialDiet || hasSpecialHealth) && matchShelter && matchSearch;
  });

  const celiacCount = evacuees.filter((e) => e.dietaryNotes?.toLowerCase().includes('tacc') || e.dietaryNotes?.toLowerCase().includes('celíaco')).length;
  const chronicCount = evacuees.filter((e) => e.vulnerabilities.hasChronicCondition).length;
  const pregnantCount = evacuees.filter((e) => e.vulnerabilities.isPregnant).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-purple-900 text-white p-6 rounded-2xl shadow-md border border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-purple-300" />
            <h2 className="text-2xl font-bold tracking-tight">Atención de Salud & Requerimientos Alimentarios Especiales</h2>
          </div>
          <p className="text-sm text-purple-200 mt-1">
            Supervisión de dietas (Sin TACC, Hipoalergénico) y seguimiento de pacientes con afecciones crónicas o movilidad reducida.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase">Dieta Sin TACC / Celíacos</span>
              <div className="text-2xl font-extrabold text-amber-900 dark:text-amber-100">{celiacCount} personas</div>
            </div>
            <UtensilsCrossed className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase">Enfermedades Crónicas</span>
              <div className="text-2xl font-extrabold text-purple-900 dark:text-purple-100">{chronicCount} personas</div>
            </div>
            <HeartPulse className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase">Embarazadas asistidas</span>
              <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">{pregnantCount} gestantes</div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </CardContent>
        </Card>
      </div>

      {/* Special Cases Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Refugiados con Requerimientos Específicos de Salud y Alimentos</CardTitle>
              <CardDescription>
                Padrón coordinado entre el Comunicador Social y la Administración para asegurar la cobertura de viandas especiales y medicación.
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Buscar por Nombre o DNI..."
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
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
              <tr>
                <th className="py-3 px-4">Evacuado</th>
                <th className="py-3 px-4">Refugio y Cama</th>
                <th className="py-3 px-4">Requerimiento Alimentario</th>
                <th className="py-3 px-4">Observaciones Médicas</th>
                <th className="py-3 px-4">Condición</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {specialCases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-zinc-500">
                    No se registran refugiados con alertas médicas o dietas especiales para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                specialCases.map((e) => {
                  const shelter = shelters.find((s) => s.id === e.shelterId);

                  return (
                    <tr key={e.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                          {e.lastName}, {e.firstName}
                        </span>
                        <span className="text-xs text-zinc-500">DNI: {e.dni} • {e.age} años</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium block text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                          {shelter ? shelter.name.split('-')[0] : e.shelterId}
                        </span>
                        <span className="text-xs text-zinc-500">Cama: {e.bedNumber || 'N/A'}</span>
                      </td>

                      <td className="py-3 px-4">
                        {e.dietaryNotes ? (
                          <span className="font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded text-xs border border-amber-200 dark:border-amber-900">
                            🌾 {e.dietaryNotes}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Estándar</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-zinc-700 dark:text-zinc-300">
                        {e.medicalNotes || 'Sin notas registradas.'}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {e.vulnerabilities.isPregnant && <Badge variant="warning">🤰 Embarazo</Badge>}
                          {e.vulnerabilities.hasDisabledMobility && <Badge variant="warning">♿ Movilidad</Badge>}
                          {e.vulnerabilities.hasChronicCondition && <Badge variant="destructive">🏥 Crónico</Badge>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
