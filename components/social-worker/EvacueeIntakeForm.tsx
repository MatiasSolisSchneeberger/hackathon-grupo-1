"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TipoDocumento, Genero, VinculoFamiliar } from '@/types/shelter';
import { UserPlus, Building2, Users, CheckCircle2, Home } from 'lucide-react';

export const EvacueeIntakeForm: React.FC<{ onSuccessTab?: () => void }> = ({ onSuccessTab }) => {
  const { refugios, gruposFamiliares, addPersonaConEstadia, cargando, errorCarga } = useShelter();

  // Selected Refugio for stay
  const [refugioId, setRefugioId] = useState<number>(refugios[0]?.id || 0);

  // Persona Fields (public.personas)
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('dni');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState<Genero>('no_declara');
  const [telefono, setTelefono] = useState('');
  const [observacionesPersona, setObservacionesPersona] = useState('');

  // Estadía Fields (public.estadias)
  const [vinculo, setVinculo] = useState<VinculoFamiliar>('sin_vinculo');
  const [observacionesEstadia, setObservacionesEstadia] = useState('');

  // Grupo Familiar Selection / Creation
  const [crearNuevoGrupo, setCrearNuevoGrupo] = useState(false);
  const [grupoExistenteId, setGrupoExistenteId] = useState<number | ''>('');
  
  // New Group Fields (public.grupos_familiares)
  const [codigoGrupo, setCodigoGrupo] = useState('');
  const [domicilioOrigen, setDomicilioOrigen] = useState('');
  const [observacionesGrupo, setObservacionesGrupo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter groups for selected refugio
  const refugiosActivos = refugios.filter((refugio) => refugio.activo);
  const selectedRefugioId = refugioId || refugiosActivos[0]?.id || 0;
  const gruposRefugio = gruposFamiliares.filter(
    (grupo) => grupo.refugio_id === selectedRefugioId && !grupo.fecha_cierre,
  );

  if (cargando) {
    return <Card className="p-6 text-sm text-zinc-500">Cargando refugios y datos de ingreso...</Card>;
  }

  if (errorCarga) {
    return <Card role="alert" className="border-red-200 p-6 text-sm text-red-700 dark:border-red-900 dark:text-red-300">{errorCarga}</Card>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (nombre.trim().length < 2 || apellido.trim().length < 2) {
      setFormError('Nombre y apellido deben tener al menos 2 caracteres.');
      return;
    }

    if (!selectedRefugioId || refugiosActivos.length === 0) {
      setFormError('Seleccioná un refugio activo antes de registrar el ingreso.');
      return;
    }

    if (fechaNacimiento && fechaNacimiento > new Date().toISOString().slice(0, 10)) {
      setFormError('La fecha de nacimiento no puede ser futura.');
      return;
    }

    let nuevoGrupoPayload = undefined;
    if (crearNuevoGrupo) {
      const generatedCode = codigoGrupo.trim() ? codigoGrupo.trim() : `GF-${apellido.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      nuevoGrupoPayload = {
        codigo: generatedCode,
        apellido_referencia: apellido.trim(),
        domicilio_origen: domicilioOrigen.trim() || undefined,
        observaciones: observacionesGrupo.trim() || undefined,
      };
    }

    setIsSaving(true);
    try {
      await addPersonaConEstadia(
        {
          tipo_documento: tipoDocumento,
          numero_documento: numeroDocumento.trim() || undefined,
          apellido: apellido.trim(),
          nombre: nombre.trim(),
          fecha_nacimiento: fechaNacimiento || undefined,
          genero,
          telefono: telefono.trim() || undefined,
          observaciones: observacionesPersona.trim() || undefined,
        },
        {
          refugio_id: selectedRefugioId,
          vinculo,
          grupo_id: !crearNuevoGrupo && grupoExistenteId !== '' ? Number(grupoExistenteId) : undefined,
          observaciones: observacionesEstadia.trim() || undefined,
        },
        nuevoGrupoPayload
      );
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo registrar el ingreso.');
      return;
    } finally {
      setIsSaving(false);
    }

    // Reset Form
    setNombre('');
    setApellido('');
    setNumeroDocumento('');
    setFechaNacimiento('');
    setTelefono('');
    setObservacionesPersona('');
    setObservacionesEstadia('');
    setCrearNuevoGrupo(false);
    setGrupoExistenteId('');
    setCodigoGrupo('');
    setDomicilioOrigen('');
    setObservacionesGrupo('');

    if (onSuccessTab) {
      onSuccessTab();
    }
  };

  return (
    <Card className="border-t-4 border-t-blue-600 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl">Alta de Persona y Registro de Estadía en Refugio</CardTitle>
        </div>
        <CardDescription>
          Mapeo de datos para las tablas public.personas, public.estadias y public.grupos_familiares.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              {formError}
            </div>
          )}
          {/* SECCION 0: Refugio de Destino */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" /> Refugio Asignado (public.estadias.refugio_id) *
            </label>
            <select
              value={selectedRefugioId}
              onChange={(e) => setRefugioId(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-blue-300 bg-white px-3 py-1 text-sm font-bold text-blue-900 shadow-xs dark:border-blue-700 dark:bg-zinc-950 dark:text-blue-100"
            >
              {refugiosActivos.map((r) => (
                <option key={r.id} value={r.id}>
                  🏢 {r.nombre} ({r.direccion}, {r.localidad}) — Capacidad: {r.capacidad}
                </option>
              ))}
            </select>
          </div>

          {/* SECCION 1: Persona (public.personas) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2 border-b pb-1">
              <Users className="h-4 w-4" /> 1. Datos de la Persona (public.personas)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Apellido * (min. 2 caract.)
                </label>
                <Input
                  placeholder="Ej: Gómez"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre * (min. 2 caract.)
                </label>
                <Input
                  placeholder="Ej: María Rosa"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tipo Documento
                </label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="dni">DNI</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Número Documento
                </label>
                <Input
                  placeholder="Ej: 32451890"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Fecha de Nacimiento
                </label>
                <Input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Género
                </label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value as Genero)}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">Otro</option>
                  <option value="no_declara">No declara</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Teléfono de Contacto
                </label>
                <Input
                  placeholder="Ej: 3794-567890"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Observaciones de la Persona (Salud, dietas Sin TACC, medicación, etc.)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Hipotiroidismo, celíaco (dieta Sin TACC), hipertensión..."
                  value={observacionesPersona}
                  onChange={(e) => setObservacionesPersona(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 p-2 text-xs dark:bg-zinc-950 dark:border-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* SECCION 2: Grupo Familiar (public.grupos_familiares) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2 border-b pb-1">
              <Home className="h-4 w-4" /> 2. Grupo Familiar (public.grupos_familiares & vinculo)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Vínculo Familiar en la Estadía
                </label>
                <select
                  value={vinculo}
                  onChange={(e) => setVinculo(e.target.value as VinculoFamiliar)}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="sin_vinculo">Sin Vínculo (Ingreso Individual)</option>
                  <option value="responsable">Responsable del grupo</option>
                  <option value="conyuge">Cónyuge / Pareja</option>
                  <option value="hijo_a">Hijo/a</option>
                  <option value="padre_madre">Padre / Madre</option>
                  <option value="hermano_a">Hermano/a</option>
                  <option value="otro_familiar">Otro familiar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Asignación de Grupo Familiar
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="grupoOption"
                      checked={!crearNuevoGrupo}
                      onChange={() => setCrearNuevoGrupo(false)}
                    />
                    <span>Asignar a Grupo Existente</span>
                  </label>
                  <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="grupoOption"
                      checked={crearNuevoGrupo}
                      onChange={() => setCrearNuevoGrupo(true)}
                    />
                    <span>Crear Nuevo Grupo Familiar</span>
                  </label>
                </div>
              </div>

              {!crearNuevoGrupo ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Seleccionar Grupo Familiar Existente en este Refugio
                  </label>
                  <select
                    value={grupoExistenteId}
                    onChange={(e) => setGrupoExistenteId(e.target.value !== '' ? Number(e.target.value) : '')}
                    className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    <option value="">Ninguno (Sin Grupo)</option>
                    {gruposRefugio.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.codigo} — Familia {g.apellido_referencia} ({g.domicilio_origen || 'Sin dom.'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Código de Grupo (Opcional, autogenerado si se omite)
                    </label>
                    <Input
                      placeholder="Ej: GF-PEREZ-01"
                      value={codigoGrupo}
                      onChange={(e) => setCodigoGrupo(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Domicilio de Origen (Barrio / Dirección)
                    </label>
                    <Input
                      placeholder="Ej: Barrio La Tosquera, Mz 4"
                      value={domicilioOrigen}
                      onChange={(e) => setDomicilioOrigen(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Observaciones del Grupo Familiar
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Evacuados por anegamiento de vivienda..."
                      value={observacionesGrupo}
                      onChange={(e) => setObservacionesGrupo(e.target.value)}
                      className="w-full rounded-md border border-zinc-300 p-2 text-xs dark:bg-zinc-950 dark:border-zinc-700"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SECCION 3: Estadía (public.estadias) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2 border-b pb-1">
              <Building2 className="h-4 w-4" /> 3. Detalles de Estadía (public.estadias)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Observaciones de Ingreso de Estadía
              </label>
              <Input
                placeholder="Ej: Asignada cama 14, ingresa en buen estado general..."
                value={observacionesEstadia}
                onChange={(e) => setObservacionesEstadia(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="submit"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-md"
              disabled={isSaving || refugiosActivos.length === 0}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {isSaving ? 'Guardando ingreso...' : 'Guardar Persona y Dar de Alta Estadía'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
