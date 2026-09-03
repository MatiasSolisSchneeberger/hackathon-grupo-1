"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, Plus, Users, MapPin, Phone, UserCheck, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ShelterManagementScreen: React.FC = () => {
  const { shelters, addShelter, setSelectedShelterId, setActiveAdminScreen } = useShelter();

  // Create Shelter Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Resistencia');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState<number | ''>(50);
  const [infrastructureType, setInfrastructureType] = useState<'polideportivo' | 'escuela' | 'centro_comunitario' | 'otro'>('polideportivo');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && address && managerName && capacity) {
      addShelter({
        name,
        address,
        city,
        managerName,
        phone,
        capacity: Number(capacity),
        infrastructureType,
      });

      setName('');
      setAddress('');
      setManagerName('');
      setPhone('');
      setCapacity(50);
      setShowCreateModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-white p-6 rounded-2xl shadow-md border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold tracking-tight">Red de Refugios de Emergencia</h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Gestión y alta de centros de albergue temporal para alojar a la población evacuada.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Crear Nuevo Refugio
        </Button>
      </div>

      {/* Grid of Created Shelters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shelters.map((shelter) => {
          const pct = Math.round((shelter.occupied / shelter.capacity) * 100);
          let badgeVariant: 'success' | 'warning' | 'destructive' = 'success';
          if (pct >= 90) badgeVariant = 'destructive';
          else if (pct >= 75) badgeVariant = 'warning';

          return (
            <Card key={shelter.id} className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-600 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">{shelter.name}</CardTitle>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" /> {shelter.address}, {shelter.city}
                    </p>
                  </div>
                  <Badge variant={badgeVariant}>
                    {pct >= 100 ? 'LLENO' : `${pct}% OCUPADO`}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between font-bold">
                    <span>Ocupación de Plazas</span>
                    <span>{shelter.occupied} / {shelter.capacity} camas</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="text-[11px] text-zinc-500 text-right">
                    Quedan <strong className="text-emerald-600 dark:text-emerald-400">{shelter.capacity - shelter.occupied}</strong> camas libres
                  </div>
                </div>

                <div className="space-y-1 text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Responsable: <strong>{shelter.managerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Teléfono: {shelter.phone}</span>
                  </div>
                </div>
              </CardContent>

              <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedShelterId(shelter.id);
                    setActiveAdminScreen('shelter_detail');
                  }}
                  className="w-full text-xs font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                >
                  Ver Capacidad & Alimentos →
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: Crear Nuevo Refugio */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-lg">Alta de Nuevo Refugio</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre del Refugio *
                </label>
                <Input
                  placeholder="Ej: Refugio N° 4 - Gimnasio Municipal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Dirección / Ubicación *
                  </label>
                  <Input
                    placeholder="Ej: Calle San Martín 450"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Ciudad
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Responsable a Cargo *
                  </label>
                  <Input
                    placeholder="Ej: Lic. Marcelo Suárez"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Teléfono de Contacto
                  </label>
                  <Input
                    placeholder="Ej: 0362-4499-887"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Capacidad Total de Camas *
                  </label>
                  <Input
                    type="number"
                    min="5"
                    max="1000"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || '')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tipo de Infraestructura
                  </label>
                  <select
                    value={infrastructureType}
                    onChange={(e) => setInfrastructureType(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="polideportivo">Polideportivo / Gimnasio</option>
                    <option value="escuela">Escuela / Colegio</option>
                    <option value="centro_comunitario">Centro Comunitario</option>
                    <option value="otro">Otro edificio</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Crear e Incorporar a la Red
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
