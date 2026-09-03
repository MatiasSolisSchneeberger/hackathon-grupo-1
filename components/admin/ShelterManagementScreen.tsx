"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, Plus, MapPin, Phone, UserCheck, Pencil, Trash2 } from 'lucide-react';

export const ShelterManagementScreen: React.FC = () => {
  const { refugios, addRefugio, updateRefugio, deleteRefugio, estadias } = useShelter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRefugioId, setEditingRefugioId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');

  // Form State matching public.refugios
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [localidad, setLocalidad] = useState('Corrientes');
  const [capacidad, setCapacidad] = useState<number | ''>(100);
  const [telefono, setTelefono] = useState('');
  const [referente, setReferente] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [latitud, setLatitud] = useState<number | ''>(-27.4692);
  const [longitud, setLongitud] = useState<number | ''>(-58.8306);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (nombre.trim().length < 3 || nombre.trim().length > 120) {
      setFormError('El nombre del refugio debe tener entre 3 y 120 caracteres.');
      return;
    }

    if (!capacidad || Number(capacidad) <= 0 || Number(capacidad) > 10000) {
      setFormError('La capacidad debe ser entre 1 y 10.000.');
      return;
    }

    const data = {
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      localidad: localidad.trim() || 'Corrientes',
      capacidad: Number(capacidad),
      telefono: telefono.trim() || undefined,
      referente: referente.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
      latitud: latitud !== '' ? Number(latitud) : undefined,
      longitud: longitud !== '' ? Number(longitud) : undefined,
      activo: editingRefugioId === null ? true : refugios.find((refugio) => refugio.id === editingRefugioId)?.activo ?? true,
    };

    try {
      if (editingRefugioId === null) {
        await addRefugio(data);
      } else {
        await updateRefugio(editingRefugioId, data);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el refugio.');
      return;
    }

    setNombre('');
    setDireccion('');
    setTelefono('');
    setReferente('');
    setObservaciones('');
    setShowCreateModal(false);
    setEditingRefugioId(null);
  };

  const toggleRefugio = async (refugio: typeof refugios[number]) => {
    try {
      if (refugio.activo) {
        await deleteRefugio(refugio.id);
      } else {
        await updateRefugio(refugio.id, {
          nombre: refugio.nombre,
          direccion: refugio.direccion,
          localidad: refugio.localidad,
          capacidad: refugio.capacidad,
          telefono: refugio.telefono,
          referente: refugio.referente,
          observaciones: refugio.observaciones,
          latitud: refugio.latitud,
          longitud: refugio.longitud,
          activo: true,
        });
      }
    } catch {
      // El contexto ya muestra el error de la API.
    }
  };

  const openEditModal = (refugio: typeof refugios[number]) => {
    setEditingRefugioId(refugio.id);
    setNombre(refugio.nombre);
    setDireccion(refugio.direccion);
    setLocalidad(refugio.localidad);
    setCapacidad(refugio.capacidad);
    setTelefono(refugio.telefono || '');
    setReferente(refugio.referente || '');
    setObservaciones(refugio.observaciones || '');
    setLatitud(refugio.latitud ?? '');
    setLongitud(refugio.longitud ?? '');
    setShowCreateModal(true);
  };

  const openCreateModal = () => {
    setEditingRefugioId(null);
    setFormError('');
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingRefugioId(null);
    setFormError('');
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-white p-6 rounded-2xl shadow-md border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold tracking-tight">Gestión de Refugios (Tabla public.refugios)</h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Administración de centros de alojamiento temporal en la provincia / localidad.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          + Registrar Nuevo Refugio
        </Button>
      </div>

      {/* Grid of Refugios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {refugios.map((r) => {
          // Count active stays (fecha_egreso IS NULL) in this refugio
          const ocupacionActual = estadias.filter((e) => e.refugio_id === r.id && !e.fecha_egreso).length;
          const pct = Math.round((ocupacionActual / r.capacidad) * 100);

          return (
            <Card key={r.id} className="border-t-4 border-t-blue-600 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="break-words text-base font-bold text-zinc-900 dark:text-zinc-100">{r.nombre}</CardTitle>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" /> {r.direccion}, {r.localidad}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge variant={pct >= 90 ? 'destructive' : 'success'}>
                      {r.activo ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button type="button" variant="outline" size="xs" onClick={() => openEditModal(r)} title="Editar refugio">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button type="button" variant="outline" size="xs" onClick={() => toggleRefugio(r)} title={r.activo ? 'Desactivar refugio' : 'Reactivar refugio'}>
                        {r.activo ? <Trash2 className="h-3 w-3 text-red-600" /> : <Building2 className="h-3 w-3 text-emerald-600" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between font-bold">
                    <span>Ocupación en Tiempo Real</span>
                    <span>{ocupacionActual} / {r.capacidad} plazas</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="text-[11px] text-zinc-500 text-right">
                    Libres: <strong className="text-emerald-600 dark:text-emerald-400">{r.capacidad - ocupacionActual}</strong>
                  </div>
                </div>

                <div className="space-y-1 text-zinc-600 dark:text-zinc-300">
                  {r.referente && (
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Referente: <strong>{r.referente}</strong></span>
                    </div>
                  )}
                  {r.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Teléfono: {r.telefono}</span>
                    </div>
                  )}
                  {r.observaciones && (
                    <p className="text-[11px] text-zinc-500 italic mt-1">{r.observaciones}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Form Modal: public.refugios */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-lg">{editingRefugioId === null ? 'Alta' : 'Editar'} de Refugio (public.refugios)</h3>
              </div>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              {formError && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  {formError}
                </div>
              )}
              <div>
                <label className="block font-semibold mb-1">Nombre del Refugio (3 a 120 caract.) *</label>
                <Input
                  placeholder="Ej: Refugio Municipal N° 4"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Dirección *</label>
                  <Input
                    placeholder="Ej: Av. Italia 500"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Localidad *</label>
                  <Input
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Capacidad Total (1 a 10.000) *</label>
                  <Input
                    type="number"
                    min="1"
                    max="10000"
                    value={capacidad}
                    onChange={(e) => setCapacidad(parseInt(e.target.value) || '')}
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Referente / Responsable</label>
                  <Input
                    placeholder="Ej: Dr. Mario Gómez"
                    value={referente}
                    onChange={(e) => setReferente(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Teléfono</label>
                  <Input
                    placeholder="Ej: 3794-112233"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Coordenadas (Lat / Long)</label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      step="any"
                      placeholder="Latitud"
                      value={latitud}
                      onChange={(e) => setLatitud(parseFloat(e.target.value) || '')}
                    />
                    <Input
                      type="number"
                      step="any"
                      placeholder="Longitud"
                      value={longitud}
                      onChange={(e) => setLongitud(parseFloat(e.target.value) || '')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Observaciones</label>
                <textarea
                  rows={3}
                  placeholder="Detalles de equipamiento..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 p-2 text-xs dark:bg-zinc-950 dark:border-zinc-700"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  {editingRefugioId === null ? 'Guardar en Base de Datos' : 'Actualizar Refugio'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
