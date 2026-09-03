"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EvacuationReason, Gender } from '@/types/shelter';
import { UserPlus, HeartPulse, ShieldAlert, Home, Users, CheckCircle2, Building2 } from 'lucide-react';

export const EvacueeIntakeForm: React.FC<{ onSuccessTab?: () => void }> = ({ onSuccessTab }) => {
  const { shelters, zones, addEvacuee } = useShelter();

  // Form State
  const [shelterId, setShelterId] = useState<string>(shelters[0]?.id || 'ref_1');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('femenino');
  const [phone, setPhone] = useState('');
  const [originNeighborhood, setOriginNeighborhood] = useState('');
  const [evacuationReason, setEvacuationReason] = useState<EvacuationReason>('inundacion');
  const [familyGroupId, setFamilyGroupId] = useState('');
  const [familyRole, setFamilyRole] = useState<'jefe_hogar' | 'pareja' | 'hijo' | 'familiar' | 'individual'>('jefe_hogar');

  // Zones available for selected shelter
  const availableZones = zones.filter((z) => z.shelterId === shelterId);
  const [zoneId, setZoneId] = useState<string>(availableZones[0]?.id || zones[0]?.id || 'zona_a_ref1');
  const [bedNumber, setBedNumber] = useState('');

  // Vulnerability Flags
  const [isMinor, setIsMinor] = useState(false);
  const [isElderly, setIsElderly] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [hasDisabledMobility, setHasDisabledMobility] = useState(false);
  const [hasChronicCondition, setHasChronicCondition] = useState(false);

  const [medicalNotes, setMedicalNotes] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [registeredBy, setRegisteredBy] = useState('Lic. Comunicador Social');

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setAge(val);
      if (val < 18) {
        setIsMinor(true);
        setIsElderly(false);
      } else if (val >= 65) {
        setIsElderly(true);
        setIsMinor(false);
      } else {
        setIsMinor(false);
        setIsElderly(false);
      }
    } else {
      setAge('');
    }
  };

  const handleShelterChange = (newShelterId: string) => {
    setShelterId(newShelterId);
    const newZones = zones.filter((z) => z.shelterId === newShelterId);
    if (newZones.length > 0) {
      setZoneId(newZones[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !dni || age === '' || !originNeighborhood) {
      alert('Por favor complete los campos obligatorios (*).');
      return;
    }

    addEvacuee({
      shelterId,
      firstName,
      lastName,
      dni,
      age: Number(age),
      gender,
      phone,
      originNeighborhood,
      evacuationReason,
      familyGroupId: familyGroupId.trim() ? familyGroupId.toUpperCase() : undefined,
      familyRole,
      zoneId,
      bedNumber: bedNumber || undefined,
      vulnerabilities: {
        isMinor,
        isElderly,
        isPregnant,
        hasDisabledMobility,
        hasChronicCondition,
      },
      medicalNotes,
      dietaryNotes,
      status: 'ingresado',
      registeredBy,
    });

    // Reset Form
    setFirstName('');
    setLastName('');
    setDni('');
    setAge('');
    setPhone('');
    setOriginNeighborhood('');
    setFamilyGroupId('');
    setBedNumber('');
    setMedicalNotes('');
    setDietaryNotes('');
    setIsMinor(false);
    setIsElderly(false);
    setIsPregnant(false);
    setHasDisabledMobility(false);
    setHasChronicCondition(false);

    if (onSuccessTab) {
      onSuccessTab();
    }
  };

  return (
    <Card className="border-t-4 border-t-blue-600 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl">Formulario de Recepción e Ingreso de Evacuaos</CardTitle>
        </div>
        <CardDescription>
          Registro de admisión. Todo evacuado registrado actualiza en tiempo real la capacidad del refugio y las estadísticas del Administrador.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCION 0: Selección de Refugio de Destino */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" /> Seleccionar Refugio de Destino para este Ingreso *
            </label>
            <select
              value={shelterId}
              onChange={(e) => handleShelterChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-blue-300 bg-white px-3 py-1 text-sm font-bold text-blue-900 shadow-xs dark:border-blue-700 dark:bg-zinc-950 dark:text-blue-100"
            >
              {shelters.map((s) => (
                <option key={s.id} value={s.id}>
                  🏢 {s.name} — ({s.occupied} / {s.capacity} camas ocupadas)
                </option>
              ))}
            </select>
          </div>

          {/* SECCION 1: Datos Personales */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2 border-b pb-1">
              <Users className="h-4 w-4" /> 1. Datos Personales de Identificación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre *
                </label>
                <Input
                  placeholder="Ej: Ana María"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Apellido *
                </label>
                <Input
                  placeholder="Ej: Pérez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  DNI / Documento *
                </label>
                <Input
                  placeholder="Ej: 38.900.123"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Edad *
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 34"
                  value={age}
                  onChange={handleAgeChange}
                  min="0"
                  max="120"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Género
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                >
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">Otro</option>
                  <option value="no_especifica">Prefiere no especificar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Teléfono de Contacto
                </label>
                <Input
                  placeholder="Ej: 11-2345-6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECCION 2: Origen y Causa */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2 border-b pb-1">
              <Home className="h-4 w-4" /> 2. Origen y Motivo de Evacuación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Barrio / Zona de Origen *
                </label>
                <Input
                  placeholder="Ej: Barrio San Cayetano, Sector 3"
                  value={originNeighborhood}
                  onChange={(e) => setOriginNeighborhood(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Causa de Evacuación
                </label>
                <select
                  value={evacuationReason}
                  onChange={(e) => setEvacuationReason(e.target.value as EvacuationReason)}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                >
                  <option value="inundacion">Inundación / Crecida de Río</option>
                  <option value="temporal">Temporal / Vientos Fuertes</option>
                  <option value="incendio">Incendio Urbano / Forestal</option>
                  <option value="derrumbe">Derrumbe / Riego Estructural</option>
                  <option value="otro">Otro Evento de Emergencia</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCION 3: Salud y Vulnerabilidades */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-2 border-b pb-1">
              <HeartPulse className="h-4 w-4" /> 3. Evaluación de Salud y Indicadores de Vulnerabilidad
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-200 dark:border-purple-900/50">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMinor}
                  onChange={(e) => setIsMinor(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>🚸 Menor de Edad</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isElderly}
                  onChange={(e) => setIsElderly(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>👴 Adulto Mayor</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>🤰 Embarazada</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDisabledMobility}
                  onChange={(e) => setHasDisabledMobility(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>♿ Movilidad Reducida</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasChronicCondition}
                  onChange={(e) => setHasChronicCondition(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>🏥 Condición Crónica</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Observaciones Médicas / Medicación Requerida
                </label>
                <Input
                  placeholder="Ej: Diabético tipo 2, requiere insulina fría..."
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Requerimientos Alimentarios Especiales
                </label>
                <Input
                  placeholder="Ej: Celíaco (Sin TACC), Hipoalergénico, Sin Sal..."
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECCION 4: Asignación de Refugio y Cama */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2 border-b pb-1">
              <ShieldAlert className="h-4 w-4" /> 4. Asignación de Zona y Grupo Familiar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Zona de Alojamiento Asignada *
                </label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                >
                  {availableZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.capacity - z.occupied} camas libres)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Número de Cama / Módulo
                </label>
                <Input
                  placeholder="Ej: A-15"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Código de Grupo Familiar (Opcional)
                </label>
                <Input
                  placeholder="Ej: FAM-PEREZ-01"
                  value={familyGroupId}
                  onChange={(e) => setFamilyGroupId(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="submit"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-md"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Completar e Ingresar Evacuado
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
