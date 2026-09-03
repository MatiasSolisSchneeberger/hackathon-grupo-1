"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, FileSpreadsheet, HeartPulse } from 'lucide-react';

export const AdminEvacueesScreen: React.FC = () => {
  const { evacuees, shelters, zones } = useShelter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShelterFilter, setSelectedShelterFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvacuees = evacuees.filter((e) => {
    const matchSearch =
      e.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.dni.includes(searchQuery) ||
      e.originNeighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchShelter = selectedShelterFilter === 'all' || e.shelterId === selectedShelterFilter;
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;

    return matchSearch && matchShelter && matchStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Padrón Consolidado de Evacuados (Red de Refugios)</CardTitle>
            <CardDescription>
              Base de datos centralizada de personas albergadas en todos los refugios activos. Datos alimentados en tiempo real por el equipo de Comunicadores Sociales.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => alert("Exportando padrón consolidado a CSV/Excel...")}>
            <FileSpreadsheet className="h-4 w-4 mr-1.5 text-emerald-600" />
            Exportar Padrón Global
          </Button>
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
              <th className="py-3 px-4">Refugio Albergue</th>
              <th className="py-3 px-4">Ubicación / Cama</th>
              <th className="py-3 px-4">Vulnerabilidades & Salud</th>
              <th className="py-3 px-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredEvacuees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-zinc-500">
                  No se encontraron evacuaos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredEvacuees.map((e) => {
                const shelter = shelters.find((s) => s.id === e.shelterId);
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
                      <div className="font-mono text-zinc-800 dark:text-zinc-200">{e.dni}</div>
                      <div className="text-xs text-zinc-500">{e.age} años</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold block text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                        {shelter ? shelter.name.split('-')[0] : e.shelterId}
                      </span>
                      <span className="text-xs text-zinc-500">Origen: {e.originNeighborhood}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium block">{zone ? zone.name : e.zoneId}</span>
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
                      {e.dietaryNotes && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1">🌾 {e.dietaryNotes}</p>
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
  );
};
