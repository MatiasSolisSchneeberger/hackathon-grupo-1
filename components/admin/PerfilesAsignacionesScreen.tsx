"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Building2, X, ShieldCheck, ShieldOff, Power } from 'lucide-react';

export const PerfilesAsignacionesScreen: React.FC = () => {
  const { perfiles, refugios, asignaciones, currentUser, updatePerfil, addAsignacion, removeAsignacion } = useShelter();
  const [refugioSeleccionado, setRefugioSeleccionado] = useState<Record<string, string>>({});
  const [procesando, setProcesando] = useState<string | null>(null);

  const handleAsignar = async (usuarioId: string) => {
    const refugioId = Number(refugioSeleccionado[usuarioId]);
    if (!Number.isInteger(refugioId) || refugioId < 1) return;
    setProcesando(usuarioId);
    try {
      await addAsignacion(usuarioId, refugioId);
      setRefugioSeleccionado((prev) => ({ ...prev, [usuarioId]: '' }));
    } catch {
      // toast ya se setea en el contexto
    } finally {
      setProcesando(null);
    }
  };

  const handleQuitarAsignacion = async (usuarioId: string, refugioId: number) => {
    setProcesando(`${usuarioId}-${refugioId}`);
    try {
      await removeAsignacion(usuarioId, refugioId);
    } catch {
      // toast ya se setea en el contexto
    } finally {
      setProcesando(null);
    }
  };

  const handleCambiarRol = async (usuarioId: string, rolActual: 'admin' | 'trabajador_social') => {
    const nuevoRol = rolActual === 'admin' ? 'trabajador_social' : 'admin';
    if (!confirm(`¿Cambiar el rol de este usuario a "${nuevoRol}"?`)) return;
    setProcesando(usuarioId);
    try {
      await updatePerfil(usuarioId, { rol: nuevoRol });
    } catch {
      // toast ya se setea en el contexto
    } finally {
      setProcesando(null);
    }
  };

  const handleToggleActivo = async (usuarioId: string, activo: boolean) => {
    setProcesando(usuarioId);
    try {
      await updatePerfil(usuarioId, { activo: !activo });
    } catch {
      // toast ya se setea en el contexto
    } finally {
      setProcesando(null);
    }
  };

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
          const esUnoMismo = perfil.id === currentUser.id;
          const userAsignaciones = asignaciones.filter((a) => a.usuario_id === perfil.id);
          const refugiosAsignados = userAsignaciones
            .map((a) => refugios.find((r) => r.id === a.refugio_id))
            .filter((r): r is NonNullable<typeof r> => Boolean(r));
          const refugiosDisponibles = refugios.filter(
            (r) => r.activo && !userAsignaciones.some((a) => a.refugio_id === r.id)
          );

          return (
            <Card key={perfil.id} className="border-t-4 border-t-blue-600">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {perfil.nombre_completo}
                      {esUnoMismo && <span className="ml-1.5 text-[10px] font-normal text-zinc-400">(vos)</span>}
                    </CardTitle>
                    <span className="text-xs text-zinc-500 font-mono">ID: {perfil.id}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={perfil.rol === 'admin' ? 'default' : 'secondary'}>
                      {perfil.rol === 'admin' ? '🛡️ Administrador' : '📋 Trabajador Social'}
                    </Badge>
                    {!perfil.activo && <Badge variant="destructive">INACTIVO</Badge>}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                {!esUnoMismo && (
                  <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      disabled={procesando === perfil.id}
                      onClick={() => handleCambiarRol(perfil.id, perfil.rol)}
                    >
                      {perfil.rol === 'admin' ? (
                        <>
                          <ShieldOff className="h-3 w-3 mr-1" /> Quitar admin
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3 w-3 mr-1" /> Hacer admin
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-7 text-xs px-2 ${perfil.activo ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'}`}
                      disabled={procesando === perfil.id}
                      onClick={() => handleToggleActivo(perfil.id, perfil.activo)}
                    >
                      <Power className="h-3 w-3 mr-1" /> {perfil.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 block flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    Refugios Asignados en public.asignaciones ({refugiosAsignados.length}):
                  </span>

                  {perfil.rol === 'admin' ? (
                    <span className="text-blue-600 font-semibold block">Acceso Global a Todos los Refugios</span>
                  ) : (
                    <>
                      {refugiosAsignados.length === 0 ? (
                        <span className="text-zinc-400 italic">Sin asignaciones registradas.</span>
                      ) : (
                        refugiosAsignados.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between gap-2 p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-medium"
                          >
                            <span>🏢 {r.nombre} ({r.direccion}, {r.localidad})</span>
                            <button
                              onClick={() => handleQuitarAsignacion(perfil.id, r.id)}
                              disabled={procesando === `${perfil.id}-${r.id}`}
                              className="text-zinc-400 hover:text-red-600 shrink-0"
                              title="Quitar asignación"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}

                      {refugiosDisponibles.length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                          <select
                            value={refugioSeleccionado[perfil.id] || ''}
                            onChange={(e) =>
                              setRefugioSeleccionado((prev) => ({ ...prev, [perfil.id]: e.target.value }))
                            }
                            className="h-8 flex-1 rounded-md border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                          >
                            <option value="">Asignar refugio...</option>
                            {refugiosDisponibles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombre}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!refugioSeleccionado[perfil.id] || procesando === perfil.id}
                            onClick={() => handleAsignar(perfil.id)}
                          >
                            Asignar
                          </Button>
                        </div>
                      )}
                    </>
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
