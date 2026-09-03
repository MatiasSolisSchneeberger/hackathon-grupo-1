"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Shield, Building2, UserPlus, CheckCircle2 } from 'lucide-react';

export const PerfilesAsignacionesScreen: React.FC = () => {
  const { perfiles, refugios, asignaciones } = useShelter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-md border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold tracking-tight">Perfiles y Asignaciones (public.perfiles & asignaciones)</h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Gestión de usuarios registrados, roles y asignación de Trabajadores Sociales a refugios específicos.
          </p>
        </div>
      </div>

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {perfiles.map((perfil) => {
          // Asignaciones for this user
          const userAsignaciones = asignaciones.filter((a) => a.usuario_id === perfil.id);
          const refugiosAsignados = userAsignaciones
            .map((a) => refugios.find((r) => r.id === a.refugio_id))
            .filter(Boolean);

          return (
            <Card key={perfil.id} className="border-t-4 border-t-blue-600">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">{perfil.nombre_completo}</CardTitle>
                    <span className="text-xs text-zinc-500 font-mono">ID: {perfil.id}</span>
                  </div>
                  <Badge variant={perfil.rol === 'admin' ? 'default' : 'secondary'}>
                    {perfil.rol === 'admin' ? '🛡️ Administrador' : '📋 Trabajador Social'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 space-y-1.5">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 block flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    Refugios Asignados en public.asignaciones ({refugiosAsignados.length}):
                  </span>

                  {perfil.rol === 'admin' ? (
                    <span className="text-blue-600 font-semibold block">Acceso Global a Todos los Refugios</span>
                  ) : refugiosAsignados.length === 0 ? (
                    <span className="text-zinc-400 italic">Sin asignaciones registradas.</span>
                  ) : (
                    refugiosAsignados.map((r) => (
                      <div key={r?.id} className="p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-medium">
                        🏢 {r?.nombre} ({r?.direccion}, {r?.localidad})
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
