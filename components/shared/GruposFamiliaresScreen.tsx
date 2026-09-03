"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Users, MapPin } from 'lucide-react';

export const GruposFamiliaresScreen: React.FC = () => {
  const { gruposFamiliares, refugios, personas, estadias } = useShelter();
  const [selectedRefugioFilter, setSelectedRefugioFilter] = useState<string>('all');

  const filteredGrupos = gruposFamiliares.filter((g) => {
    return selectedRefugioFilter === 'all' || g.refugio_id === Number(selectedRefugioFilter);
  });

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-white p-6 rounded-2xl shadow-md border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold tracking-tight">Grupos Familiares (Tabla public.grupos_familiares)</h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Gestión de núcleos familiares evacuados para mantener su unidad en el refugio.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-500">Filtrar por Refugio:</span>
        <select
          value={selectedRefugioFilter}
          onChange={(e) => setSelectedRefugioFilter(e.target.value)}
          className="h-9 rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs dark:bg-zinc-950 dark:border-zinc-700"
        >
          <option value="all">Todos los Refugios</option>
          {refugios.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Family Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGrupos.map((grupo) => {
          const refugio = refugios.find((r) => r.id === grupo.refugio_id);
          const responsable = personas.find((p) => p.id === grupo.responsable_persona_id);
          
          // Members of this family group
          const estadiasGrupo = estadias.filter((e) => e.grupo_id === grupo.id && !e.fecha_egreso);
          const miembros = estadiasGrupo.map((e) => personas.find((p) => p.id === e.persona_id)).filter(Boolean);

          return (
            <Card key={grupo.id} className="border-t-4 border-t-purple-600">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                      Código: {grupo.codigo}
                    </span>
                    <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Familia {grupo.apellido_referencia}
                    </CardTitle>
                    {grupo.domicilio_origen && (
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" /> Domicilio Origen: {grupo.domicilio_origen}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {refugio ? refugio.nombre.split('-')[0] : `Refugio N° ${grupo.refugio_id}`}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                {responsable && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    Responsable / Tutor: <strong>{responsable.apellido}, {responsable.nombre}</strong> (DNI: {responsable.numero_documento})
                  </p>
                )}

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-purple-600" />
                    Integrantes Albergados Actualmente ({miembros.length}):
                  </span>
                  <div className="space-y-1.5">
                    {miembros.length === 0 ? (
                      <span className="text-zinc-400 italic">No hay estadías activas asociadas a este grupo.</span>
                    ) : (
                      miembros.map((m) => (
                        <div key={m?.id} className="p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{m?.apellido}, {m?.nombre}</span>
                          <span className="text-[11px] text-zinc-500">{m?.genero}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
};
