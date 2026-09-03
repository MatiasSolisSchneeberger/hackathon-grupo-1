"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, LogOut, CheckCircle2, X } from 'lucide-react';

export const SocialWorkerRegistryScreen: React.FC = () => {
  const { estadias, personas, refugios, gruposFamiliares, registrarEgreso } = useShelter();

  const [searchQuery, setSearchQuery] = useState('');
  const [refugioFilter, setRefugioFilter] = useState<string>('all');
  const [estadoFilter, setEstadoFilter] = useState<'activas' | 'egresadas' | 'todas'>('activas');

  // Modal de Egreso
  const [selectedEstadiaId, setSelectedEstadiaId] = useState<number | null>(null);
  const [motivoEgreso, setMotivoEgreso] = useState('');
  const [observacionesEgreso, setObservacionesEgreso] = useState('');

  const filteredEstadias = estadias.filter((estadia) => {
    const persona = personas.find((p) => p.id === estadia.persona_id);
    if (!persona) return false;

    const matchSearch =
      persona.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (persona.numero_documento && persona.numero_documento.includes(searchQuery));

    const matchRefugio = refugioFilter === 'all' || estadia.refugio_id === Number(refugioFilter);

    const matchEstado =
      estadoFilter === 'todas' ||
      (estadoFilter === 'activas' && !estadia.fecha_egreso) ||
      (estadoFilter === 'egresadas' && Boolean(estadia.fecha_egreso));

    return matchSearch && matchRefugio && matchEstado;
  });

  const handleConfirmEgreso = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEstadiaId && motivoEgreso.trim()) {
      registrarEgreso(selectedEstadiaId, motivoEgreso.trim(), observacionesEgreso.trim());
      setSelectedEstadiaId(null);
      setMotivoEgreso('');
      setObservacionesEgreso('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Gestión de Estadías en Refugios (Tabla public.estadias)</CardTitle>
              <CardDescription>
                Registro de altas y egresos de personas albergadas.
              </CardDescription>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Buscar por Nombre, Apellido o DNI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={refugioFilter}
              onChange={(e) => setRefugioFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">Todos los Refugios</option>
              {refugios.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>

            <select
              value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value as 'activas' | 'egresadas' | 'todas')}
              className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
            >
              <option value="activas">🟢 Estadías Activas (Sin Egreso)</option>
              <option value="egresadas">⚪ Estadías Concluidas (Egresadas)</option>
              <option value="todas">Todas las Estadías</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
              <tr>
                <th className="py-3 px-4">Persona Albergada</th>
                <th className="py-3 px-4">Refugio</th>
                <th className="py-3 px-4">Grupo / Vínculo</th>
                <th className="py-3 px-4">Fecha Ingreso</th>
                <th className="py-3 px-4">Estado Estadía</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredEstadias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-zinc-500">
                    No se hallaron estadías para los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredEstadias.map((estadia) => {
                  const persona = personas.find((p) => p.id === estadia.persona_id);
                  const refugio = refugios.find((r) => r.id === estadia.refugio_id);
                  const grupo = gruposFamiliares.find((g) => g.id === estadia.grupo_id);

                  if (!persona) return null;

                  return (
                    <tr key={estadia.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                          {persona.apellido}, {persona.nombre}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {persona.tipo_documento.toUpperCase()}: {persona.numero_documento || 'Sin doc'}
                        </span>
                        {persona.observaciones && (
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 line-clamp-1">
                            ℹ️ {persona.observaciones}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold block text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                          {refugio ? refugio.nombre.split('-')[0] : estadia.refugio_id}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {grupo ? (
                          <span className="font-bold text-blue-600 dark:text-blue-400 block text-xs">
                            {grupo.codigo} ({grupo.apellido_referencia})
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">Sin grupo</span>
                        )}
                        <span className="text-xs text-zinc-500 capitalize">{estadia.vinculo.replace('_', ' ')}</span>
                      </td>

                      <td className="py-3 px-4 text-xs text-zinc-600 dark:text-zinc-300">
                        {new Date(estadia.fecha_ingreso).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4">
                        {!estadia.fecha_egreso ? (
                          <Badge variant="success">ACTIVA (INGRESADO)</Badge>
                        ) : (
                          <div>
                            <Badge variant="secondary">EGRESADO</Badge>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              Motivo: {estadia.motivo_egreso}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!estadia.fecha_egreso ? (
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={() => setSelectedEstadiaId(estadia.id)}
                          >
                            <LogOut className="h-3.5 w-3.5 mr-1" />
                            Registrar Egreso
                          </Button>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Concluida</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal Registrar Egreso */}
      {selectedEstadiaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <LogOut className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-lg">Registrar Egreso de Estadía</h3>
              </div>
              <button onClick={() => setSelectedEstadiaId(null)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmEgreso} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Motivo del Egreso *</label>
                <select
                  value={motivoEgreso}
                  onChange={(e) => setMotivoEgreso(e.target.value)}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-xs dark:bg-zinc-950 dark:border-zinc-700"
                  required
                >
                  <option value="">-- Seleccionar motivo --</option>
                  <option value="Retorno a domicilio particular">Retorno a domicilio particular</option>
                  <option value="Derivación a centro de salud / hospital">Derivación a centro de salud / hospital</option>
                  <option value="Traslado a otro refugio">Traslado a otro refugio</option>
                  <option value="Retiro voluntario">Retiro voluntario</option>
                  <option value="Otro motivo">Otro motivo</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Observaciones Adicionales</label>
                <textarea
                  rows={3}
                  placeholder="Escriba detalles del egreso..."
                  value={observacionesEgreso}
                  onChange={(e) => setObservacionesEgreso(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 p-2 text-xs dark:bg-zinc-950 dark:border-zinc-700"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setSelectedEstadiaId(null)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold">
                  Confirmar Egreso en DB
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
