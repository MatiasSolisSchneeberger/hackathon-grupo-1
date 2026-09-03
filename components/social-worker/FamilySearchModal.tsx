"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Heart, MapPin, Building, Home } from 'lucide-react';

export const FamilySearchModal: React.FC = () => {
  const { personas, estadias, refugios, gruposFamiliares } = useShelter();
  const [searchTerm, setSearchTerm] = useState('');

  // Find matching personas
  const matchingPersonas = personas.filter((p) => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase();
    return (
      p.apellido.toLowerCase().includes(term) ||
      p.nombre.toLowerCase().includes(term) ||
      (p.numero_documento && p.numero_documento.includes(term))
    );
  });

  return (
    <Card className="border-t-4 border-t-purple-600 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-purple-600" />
          <CardTitle className="text-xl">Búsqueda & Reunificación Familiar (public.personas)</CardTitle>
        </div>
        <CardDescription>
          Buscador cruzado por apellido o DNI para consultar las personas albergadas en los refugios de la provincia y su grupo familiar.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Ingrese el apellido o número de documento a consultar (ej: Gómez)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-base py-5"
          />
        </div>

        {!searchTerm.trim() ? (
          <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Users className="h-12 w-12 text-zinc-400 mx-auto mb-2" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">Buscador de Personas y Grupos</p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              Escriba el apellido de la familia o número de documento para ubicar la estadía y el refugio donde se encuentra albergada cada persona.
            </p>
          </div>
        ) : matchingPersonas.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            No se encontraron personas albergadas con el criterio &quot;<strong>{searchTerm}</strong>&quot;.
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Personas Encontradas ({matchingPersonas.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingPersonas.map((persona) => {
                // Stays for this persona
                const estadiasPersona = estadias.filter((e) => e.persona_id === persona.id);

                return (
                  <div
                    key={persona.id}
                    className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {persona.apellido}, {persona.nombre}
                      </span>
                      <Badge variant="outline">{persona.tipo_documento.toUpperCase()}: {persona.numero_documento || 'N/A'}</Badge>
                    </div>

                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                      <span>Género: {persona.genero}</span>
                      <span>•</span>
                      <span>Teléfono: {persona.telefono || 'Sin teléfono'}</span>
                    </div>

                    {persona.observaciones && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-900">
                        ℹ️ Observaciones: {persona.observaciones}
                      </p>
                    )}

                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 space-y-1 text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 block">Historial de Estadías en Refugios:</span>
                      {estadiasPersona.map((estadia) => {
                        const refugio = refugios.find((r) => r.id === estadia.refugio_id);
                        const grupo = gruposFamiliares.find((g) => g.id === estadia.grupo_id);

                        return (
                          <div key={estadia.id} className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="flex items-center gap-1">
                                <Building className="h-3.5 w-3.5 text-blue-600" />
                                {refugio?.nombre}
                              </span>
                              <Badge variant={!estadia.fecha_egreso ? 'success' : 'secondary'}>
                                {!estadia.fecha_egreso ? 'INGRESADO (ACTIVO)' : 'EGRESADO'}
                              </Badge>
                            </div>

                            {grupo && (
                              <div className="flex items-center gap-1 text-[11px] text-purple-700 dark:text-purple-300 mt-1 font-medium">
                                <Home className="h-3 w-3" />
                                Grupo: {grupo.codigo} ({grupo.apellido_referencia}) - Vínculo: {estadia.vinculo}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
