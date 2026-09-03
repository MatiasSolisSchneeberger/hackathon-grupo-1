"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Users, Building2, Plus, MapPin } from 'lucide-react';

export const GruposFamiliaresScreen: React.FC = () => {
  const { gruposFamiliares, refugios, personas, estadias, addGrupoFamiliar } = useShelter();
  const [selectedRefugioFilter, setSelectedRefugioFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for public.grupos_familiares
  const [refugioId, setRefugioId] = useState<number>(refugios[0]?.id || 1);
  const [codigo, setCodigo] = useState('');
  const [apellidoReferencia, setApellidoReferencia] = useState('');
  const [domicilioOrigen, setDomicilioOrigen] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const filteredGrupos = gruposFamiliares.filter((g) => {
    return selectedRefugioFilter === 'all' || g.refugio_id === Number(selectedRefugioFilter);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim() || !apellidoReferencia.trim()) {
      alert('Código y Apellido de Referencia son obligatorios.');
      return;
    }

    addGrupoFamiliar({
      refugio_id: refugioId,
      codigo: codigo.trim().toUpperCase(),
      apellido_referencia: apellidoReferencia.trim(),
      domicilio_origen: domicilioOrigen.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
    });

    setCodigo('');
    setApellidoReferencia('');
    setDomicilioOrigen('');
    setObservaciones('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
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
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          + Crear Grupo Familiar
        </Button>
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

      {/* Form Modal: public.grupos_familiares */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-lg">Alta de Grupo Familiar</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Refugio Asignado *</label>
                <select
                  value={refugioId}
                  onChange={(e) => setRefugioId(Number(e.target.value))}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-xs dark:bg-zinc-950 dark:border-zinc-700"
                >
                  {refugios.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Código de Grupo *</label>
                <Input
                  placeholder="Ej: GF-GOMEZ-01"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Apellido de Referencia *</label>
                <Input
                  placeholder="Ej: Gómez"
                  value={apellidoReferencia}
                  onChange={(e) => setApellidoReferencia(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Domicilio de Origen</label>
                <Input
                  placeholder="Ej: Barrio La Tosquera, Mz 4"
                  value={domicilioOrigen}
                  onChange={(e) => setDomicilioOrigen(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Notas adicionales..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 p-2 text-xs dark:bg-zinc-950 dark:border-zinc-700"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  Crear Grupo en DB
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
