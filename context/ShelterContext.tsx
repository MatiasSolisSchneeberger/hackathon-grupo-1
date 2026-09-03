"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Perfil,
  Refugio,
  Asignacion,
  Persona,
  GrupoFamiliar,
  Estadia,
  UserRole,
  UserProfile,
  AdminScreenType,
  SocialScreenType,
} from '@/types/shelter';

interface ShelterContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  activeAdminScreen: AdminScreenType;
  setActiveAdminScreen: (screen: AdminScreenType) => void;
  activeSocialScreen: SocialScreenType;
  setActiveSocialScreen: (screen: SocialScreenType) => void;

  // Schema Collections
  perfiles: Perfil[];
  refugios: Refugio[];
  asignaciones: Asignacion[];
  personas: Persona[];
  gruposFamiliares: GrupoFamiliar[];
  estadias: Estadia[];
  cargando: boolean;
  errorCarga: string | null;

  // Mutators strictly matching DB schema
  addRefugio: (data: Omit<Refugio, 'id' | 'creado_en' | 'actualizado_en'>) => Promise<void>;
  updateRefugio: (id: number, data: Omit<Refugio, 'id' | 'creado_en' | 'actualizado_en'>) => Promise<void>;
  deleteRefugio: (id: number) => Promise<void>;
  addPersonaConEstadia: (
    personaData: Omit<Persona, 'id' | 'creado_en' | 'actualizado_en'>,
    estadiaData: Omit<Estadia, 'id' | 'persona_id' | 'fecha_ingreso' | 'creado_en' | 'actualizado_en'>,
    nuevoGrupo?: { codigo: string; apellido_referencia: string; domicilio_origen?: string; observaciones?: string }
  ) => Promise<void>;
  registrarEgreso: (estadiaId: number, motivoEgreso: string, observacionesEgreso?: string) => Promise<void>;
  addGrupoFamiliar: (data: Omit<GrupoFamiliar, 'id' | 'fecha_alta' | 'creado_en' | 'actualizado_en'>) => Promise<void>;

  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const ShelterContext = createContext<ShelterContextType | undefined>(undefined);

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'No se pudo obtener la información.');
  return result as T;
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'No se pudo guardar la información.');
  return result as T;
}

export const ShelterProvider: React.FC<{ children: React.ReactNode; initialUser: UserProfile }> = ({
  children,
  initialUser,
}) => {
  const [currentUser] = useState<UserProfile>(initialUser);
  const [currentRole, setCurrentRole] = useState<UserRole>(initialUser.role);

  const [activeAdminScreen, setActiveAdminScreen] = useState<AdminScreenType>('dashboard');
  const [activeSocialScreen, setActiveSocialScreen] = useState<SocialScreenType>('ingreso');

  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [gruposFamiliares, setGruposFamiliares] = useState<GrupoFamiliar[]>([]);
  const [estadias, setEstadias] = useState<Estadia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refrescar = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const [
        refugiosData,
        personasData,
        estadiasData,
        gruposData,
        perfilesData,
        asignacionesData,
      ] = await Promise.all([
        getJson<Refugio[]>('/api/refugios'),
        getJson<Persona[]>('/api/personas'),
        getJson<Estadia[]>('/api/estadias'),
        getJson<GrupoFamiliar[]>('/api/grupos-familiares'),
        getJson<Perfil[]>('/api/perfiles'),
        getJson<Asignacion[]>('/api/asignaciones'),
      ]);

      setRefugios(Array.isArray(refugiosData) ? refugiosData : []);
      setPersonas(Array.isArray(personasData) ? personasData : []);
      setEstadias(Array.isArray(estadiasData) ? estadiasData : []);
      setGruposFamiliares(Array.isArray(gruposData) ? gruposData : []);
      setPerfiles(Array.isArray(perfilesData) ? perfilesData : []);
      setAsignaciones(Array.isArray(asignacionesData) ? asignacionesData : []);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al cargar los datos del sistema.';
      setErrorCarga(msg);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void refrescar(), 0);
    return () => clearTimeout(timer);
  }, [refrescar]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Crear Refugio (Tabla public.refugios)
  const addRefugio = async (data: Omit<Refugio, 'id' | 'creado_en' | 'actualizado_en'>) => {
    try {
      const newRefugio = await postJson<Refugio>('/api/refugios', data);
      await refrescar();
      setToastMessage(`Refugio "${newRefugio.nombre}" creado exitosamente.`);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'No se pudo crear el refugio.');
    }
  };

  // Crear Grupo Familiar (Tabla public.grupos_familiares)
  const addGrupoFamiliar = async (data: Omit<GrupoFamiliar, 'id' | 'fecha_alta' | 'creado_en' | 'actualizado_en'>) => {
    try {
      const newGrupo = await postJson<GrupoFamiliar>('/api/grupos-familiares', data);
      await refrescar();
      setToastMessage(`Grupo Familiar "${newGrupo.codigo}" creado.`);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'No se pudo crear el grupo familiar.');
      throw error;
    }
  };

  // Dar de alta Persona + Estadía (Tablas public.personas y public.estadias)
  const addPersonaConEstadia = async (
    personaData: Omit<Persona, 'id' | 'creado_en' | 'actualizado_en'>,
    estadiaData: Omit<Estadia, 'id' | 'persona_id' | 'fecha_ingreso' | 'creado_en' | 'actualizado_en'>,
    nuevoGrupo?: { codigo: string; apellido_referencia: string; domicilio_origen?: string; observaciones?: string }
  ) => {
    return postJson<{ persona: Persona; estadia: Estadia }>('/api/ingresos', {
      persona: personaData,
      estadia: estadiaData,
      nuevo_grupo: nuevoGrupo,
    }).then(async ({ persona, estadia }) => {
      setPersonas((prev) => [persona, ...prev]);
      setEstadias((prev) => [estadia, ...prev]);
      await refrescar();
      const targetRefugio = refugios.find((r) => r.id === estadia.refugio_id);
       setToastMessage(`Persona ${persona.apellido}, ${persona.nombre} registrada con estadía en "${targetRefugio?.nombre}".`);
     }).catch((error) => {
       setToastMessage(error instanceof Error ? error.message : 'No se pudo registrar el ingreso.');
       throw error;
     });
  };

  // Registrar egreso de persona (Tabla public.estadias update fecha_egreso)
  const registrarEgreso = async (estadiaId: number, motivoEgreso: string, observacionesEgreso?: string) => {
    try {
      await postJson<Estadia>('/api/egresos', {
        estadia_id: estadiaId,
        motivo_egreso: motivoEgreso,
        observaciones: observacionesEgreso,
      });
      await refrescar();
      setToastMessage('Egreso registrado correctamente en sistema.');
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'No se pudo registrar el egreso.');
      throw error;
    }
  };

  const updateRefugio = async (id: number, data: Omit<Refugio, 'id' | 'creado_en' | 'actualizado_en'>) => {
    try {
      const updated = await fetch(`/api/refugios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'No se pudo actualizar el refugio.');
        return result as Refugio;
      });
      setRefugios((prev) => prev.map((refugio) => refugio.id === id ? updated : refugio));
      setToastMessage(`Refugio "${updated.nombre}" actualizado.`);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'No se pudo actualizar el refugio.');
      throw error;
    }
  };

  const deleteRefugio = async (id: number) => {
    try {
      const response = await fetch(`/api/refugios/${id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'No se pudo desactivar el refugio.');
      const updated = result as Refugio;
      setRefugios((prev) => prev.map((refugio) => refugio.id === id ? updated : refugio));
      setToastMessage('Refugio desactivado correctamente.');
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'No se pudo desactivar el refugio.');
      throw error;
    }
  };

  return (
    <ShelterContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,

        activeAdminScreen,
        setActiveAdminScreen,
        activeSocialScreen,
        setActiveSocialScreen,

        perfiles,
        refugios,
        asignaciones,
        personas,
        gruposFamiliares,
        estadias,
        cargando,
        errorCarga,

        addRefugio,
        updateRefugio,
        deleteRefugio,
        addPersonaConEstadia,
        registrarEgreso,
        addGrupoFamiliar,

        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </ShelterContext.Provider>
  );
};

export const useShelter = () => {
  const context = useContext(ShelterContext);
  if (!context) {
    throw new Error('useShelter debe ser utilizado dentro de un ShelterProvider');
  }
  return context;
};
