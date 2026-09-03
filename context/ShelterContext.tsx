"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Perfil, 
  Refugio, 
  Asignacion, 
  Persona, 
  GrupoFamiliar, 
  Estadia, 
  RolUsuario, 
  AdminScreenType, 
  SocialScreenType 
} from '@/types/shelter';

interface ShelterContextType {
  currentUser: Perfil | null;
  authScreen: 'login' | 'register';
  setAuthScreen: (screen: 'login' | 'register') => void;
  login: (email: string, password: string, rol: RolUsuario, nombreCompleto?: string) => void;
  register: (nombreCompleto: string, email: string, password: string, rol: RolUsuario) => void;
  logout: () => void;
  
  currentRole: RolUsuario;
  setCurrentRole: (rol: RolUsuario) => void;

  activeAdminScreen: AdminScreenType;
  setActiveAdminScreen: (screen: AdminScreenType) => void;
  activeSocialScreen: SocialScreenType;
  setActiveSocialScreen: (screen: SocialScreenType) => void;
  selectedRefugioId: number | null;
  setSelectedRefugioId: (id: number | null) => void;

  // Schema Collections
  perfiles: Perfil[];
  refugios: Refugio[];
  asignaciones: Asignacion[];
  personas: Persona[];
  gruposFamiliares: GrupoFamiliar[];
  estadias: Estadia[];

  // Mutators strictly matching DB schema
  addRefugio: (data: Omit<Refugio, 'id' | 'creado_en' | 'actualizado_en'>) => void;
  addPersonaConEstadia: (
    personaData: Omit<Persona, 'id' | 'creado_en' | 'actualizado_en'>,
    estadiaData: Omit<Estadia, 'id' | 'persona_id' | 'fecha_ingreso' | 'creado_en' | 'actualizado_en'>,
    nuevoGrupo?: { codigo: string; apellido_referencia: string; domicilio_origen?: string }
  ) => void;
  registrarEgreso: (estadiaId: number, motivoEgreso: string, observacionesEgreso?: string) => void;
  addGrupoFamiliar: (data: Omit<GrupoFamiliar, 'id' | 'fecha_alta' | 'creado_en' | 'actualizado_en'>) => void;
  
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const initialPerfiles: Perfil[] = [
  {
    id: 'usr-admin-1',
    nombre_completo: 'Lic. Fernando Rossi (Administrador)',
    rol: 'administrador',
    activo: true,
  },
  {
    id: 'usr-social-1',
    nombre_completo: 'Lic. Sofía Martínez (Trabajadora Social)',
    rol: 'trabajador_social',
    activo: true,
  },
];

const initialRefugios: Refugio[] = [
  {
    id: 1,
    nombre: 'Refugio Municipal Central N° 1',
    direccion: 'Av. 3 de Abril 1450',
    localidad: 'Corrientes',
    capacidad: 120,
    telefono: '3794-455667',
    referente: 'Dr. Alejandro Vera',
    observaciones: 'Polideportivo acondicionado con duchas y comedor comunitario.',
    activo: true,
    latitud: -27.4692,
    longitud: -58.8306,
    creado_en: '2026-09-01T08:00:00Z',
  },
  {
    id: 2,
    nombre: 'Refugio Escuela N° 14 San Martín',
    direccion: 'Calle Belgrano 820',
    localidad: 'Corrientes',
    capacidad: 80,
    telefono: '3794-433221',
    referente: 'Prof. Carmen Ojeda',
    observaciones: 'Aulas acondicionadas con colchones y área médica.',
    activo: true,
    latitud: -27.4725,
    longitud: -58.8350,
    creado_en: '2026-09-02T10:00:00Z',
  },
  {
    id: 3,
    nombre: 'Refugio Centro Comunitario Belgrano',
    direccion: 'Calle Junín 2100',
    localidad: 'Corrientes',
    capacidad: 50,
    telefono: '3794-411998',
    referente: 'Carlos Benítez',
    observaciones: 'Centro vecinal adaptado para recepción nocturna.',
    activo: true,
    latitud: -27.4650,
    longitud: -58.8210,
    creado_en: '2026-09-02T14:30:00Z',
  },
];

const initialAsignaciones: Asignacion[] = [
  {
    usuario_id: 'usr-social-1',
    refugio_id: 1,
  },
  {
    usuario_id: 'usr-social-1',
    refugio_id: 2,
  },
];

const initialPersonas: Persona[] = [
  {
    id: 'per-1111',
    tipo_documento: 'dni',
    numero_documento: '32.451.890',
    numero_documento_norm: '32451890',
    apellido: 'Gómez',
    nombre: 'María Rosa',
    fecha_nacimiento: '1985-04-12',
    genero: 'femenino',
    telefono: '3794-567890',
    observaciones: 'Hipotiroidismo. Trajo medicación. Dieta Sin TACC.',
    creado_en: '2026-09-03T07:45:00Z',
  },
  {
    id: 'per-2222',
    tipo_documento: 'dni',
    numero_documento: '54.120.334',
    numero_documento_norm: '54120334',
    apellido: 'Gómez',
    nombre: 'Lucas',
    fecha_nacimiento: '2018-09-05',
    genero: 'masculino',
    observaciones: 'Menor a cargo de María Rosa Gómez.',
    creado_en: '2026-09-03T07:45:00Z',
  },
  {
    id: 'per-3333',
    tipo_documento: 'dni',
    numero_documento: '14.890.123',
    numero_documento_norm: '14890123',
    apellido: 'Fernández',
    nombre: 'Don Roberto',
    fecha_nacimiento: '1950-02-18',
    genero: 'masculino',
    telefono: '3794-890123',
    observaciones: 'Hipertensión arterial. Anda con bastón. Movilidad reducida.',
    creado_en: '2026-09-03T08:15:00Z',
  },
  {
    id: 'per-4444',
    tipo_documento: 'dni',
    numero_documento: '41.230.988',
    numero_documento_norm: '41230988',
    apellido: 'Benítez',
    nombre: 'Camila',
    fecha_nacimiento: '2000-11-20',
    genero: 'femenino',
    telefono: '3794-667788',
    observaciones: 'Gestación semana 32. Requiere controles de presión.',
    creado_en: '2026-09-03T09:30:00Z',
  },
];

const initialGruposFamiliares: GrupoFamiliar[] = [
  {
    id: 101,
    refugio_id: 1,
    codigo: 'GF-GOMEZ-01',
    apellido_referencia: 'Gómez',
    responsable_persona_id: 'per-1111',
    domicilio_origen: 'Barrio La Tosquera, Manzana 4',
    observaciones: 'Familia evacuada por anegamiento de vivienda.',
    fecha_alta: '2026-09-03T07:45:00Z',
  },
  {
    id: 102,
    refugio_id: 2,
    codigo: 'GF-BENITEZ-02',
    apellido_referencia: 'Benítez',
    responsable_persona_id: 'per-4444',
    domicilio_origen: 'Sector Costanera Sur',
    observaciones: 'Familia derivada preventivamente.',
    fecha_alta: '2026-09-03T09:30:00Z',
  },
];

const initialEstadias: Estadia[] = [
  {
    id: 1,
    persona_id: 'per-1111',
    refugio_id: 1,
    fecha_ingreso: '2026-09-03T07:45:00Z',
    grupo_id: 101,
    vinculo: 'jefe_hogar',
    observaciones: 'Ingresó en buen estado general.',
    registrado_por: 'usr-social-1',
  },
  {
    id: 2,
    persona_id: 'per-2222',
    refugio_id: 1,
    fecha_ingreso: '2026-09-03T07:45:00Z',
    grupo_id: 101,
    vinculo: 'hijo',
    observaciones: 'Acompañado por su madre.',
    registrado_por: 'usr-social-1',
  },
  {
    id: 3,
    persona_id: 'per-3333',
    refugio_id: 1,
    fecha_ingreso: '2026-09-03T08:15:00Z',
    vinculo: 'sin_vinculo',
    observaciones: 'Ubicado en cama baja cerca de enfermería.',
    registrado_por: 'usr-social-1',
  },
  {
    id: 4,
    persona_id: 'per-4444',
    refugio_id: 2,
    fecha_ingreso: '2026-09-03T09:30:00Z',
    grupo_id: 102,
    vinculo: 'jefe_hogar',
    observaciones: 'Asignada litera 08.',
    registrado_por: 'usr-social-1',
  },
];

const ShelterContext = createContext<ShelterContextType | undefined>(undefined);

export const ShelterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Perfil | null>(initialPerfiles[0]);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [currentRole, setCurrentRole] = useState<RolUsuario>('administrador');

  const [activeAdminScreen, setActiveAdminScreen] = useState<AdminScreenType>('dashboard');
  const [activeSocialScreen, setActiveSocialScreen] = useState<SocialScreenType>('ingreso');
  const [selectedRefugioId, setSelectedRefugioId] = useState<number | null>(1);

  const [perfiles, setPerfiles] = useState<Perfil[]>(initialPerfiles);
  const [refugios, setRefugios] = useState<Refugio[]>(initialRefugios);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>(initialAsignaciones);
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [gruposFamiliares, setGruposFamiliares] = useState<GrupoFamiliar[]>(initialGruposFamiliares);
  const [estadias, setEstadias] = useState<Estadia[]>(initialEstadias);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const login = (email: string, password: string, rol: RolUsuario, nombreCompleto?: string) => {
    const formattedName = nombreCompleto || (email.split('@')[0].toUpperCase());
    const newPerfil: Perfil = {
      id: `usr-${Date.now()}`,
      nombre_completo: formattedName,
      rol,
      activo: true,
    };

    setCurrentUser(newPerfil);
    setCurrentRole(rol);
    setToastMessage(`👋 Sesión iniciada: ${newPerfil.nombre_completo} (${rol === 'administrador' ? 'Administrador' : 'Trabajador Social'})`);
  };

  const register = (nombreCompleto: string, email: string, password: string, rol: RolUsuario) => {
    const newPerfil: Perfil = {
      id: `usr-${Date.now()}`,
      nombre_completo: nombreCompleto,
      rol,
      activo: true,
    };

    setPerfiles((prev) => [...prev, newPerfil]);
    setCurrentUser(newPerfil);
    setCurrentRole(rol);
    setToastMessage(`✅ Perfil de ${newPerfil.nombre_completo} registrado en sistema.`);
  };

  const logout = () => {
    setCurrentUser(null);
    setToastMessage('Sesión cerrada.');
  };

  // Crear Refugio (Tabla public.refugios)
  const addRefugio = (data: Omit<Refugio, 'id' | 'creado_en' | 'actualizado_en'>) => {
    const newId = Date.now();
    const newRefugio: Refugio = {
      ...data,
      id: newId,
      activo: true,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
      creado_por: currentUser?.id,
    };

    setRefugios((prev) => [...prev, newRefugio]);
    setToastMessage(`🏢 Refugio "${newRefugio.nombre}" creado exitosamente.`);
  };

  // Crear Grupo Familiar (Tabla public.grupos_familiares)
  const addGrupoFamiliar = (data: Omit<GrupoFamiliar, 'id' | 'fecha_alta' | 'creado_en' | 'actualizado_en'>) => {
    const newId = Date.now();
    const newGrupo: GrupoFamiliar = {
      ...data,
      id: newId,
      fecha_alta: new Date().toISOString(),
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
      creado_por: currentUser?.id,
    };

    setGruposFamiliares((prev) => [...prev, newGrupo]);
    setToastMessage(`👨‍👩‍👧 Grupo Familiar "${newGrupo.codigo}" creado.`);
  };

  // Dar de alta Persona + Estadía (Tablas public.personas y public.estadias)
  const addPersonaConEstadia = (
    personaData: Omit<Persona, 'id' | 'creado_en' | 'actualizado_en'>,
    estadiaData: Omit<Estadia, 'id' | 'persona_id' | 'fecha_ingreso' | 'creado_en' | 'actualizado_en'>,
    nuevoGrupo?: { codigo: string; apellido_referencia: string; domicilio_origen?: string }
  ) => {
    const newPersonaId = `per-${Date.now()}`;
    const normDni = personaData.numero_documento ? personaData.numero_documento.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : undefined;

    const newPersona: Persona = {
      ...personaData,
      id: newPersonaId,
      numero_documento_norm: normDni,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
      creado_por: currentUser?.id,
    };

    let grupoIdAsignado = estadiaData.grupo_id;

    // Si creó un nuevo grupo familiar en el mismo acto
    if (nuevoGrupo) {
      const newGrupoId = Date.now();
      const newGrupoObj: GrupoFamiliar = {
        id: newGrupoId,
        refugio_id: estadiaData.refugio_id,
        codigo: nuevoGrupo.codigo.toUpperCase(),
        apellido_referencia: nuevoGrupo.apellido_referencia,
        responsable_persona_id: newPersonaId,
        domicilio_origen: nuevoGrupo.domicilio_origen,
        fecha_alta: new Date().toISOString(),
        creado_por: currentUser?.id,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      };
      setGruposFamiliares((prev) => [...prev, newGrupoObj]);
      grupoIdAsignado = newGrupoId;
    }

    const newEstadia: Estadia = {
      ...estadiaData,
      id: Date.now(),
      persona_id: newPersonaId,
      grupo_id: grupoIdAsignado,
      fecha_ingreso: new Date().toISOString(),
      registrado_por: currentUser?.id,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };

    setPersonas((prev) => [newPersona, ...prev]);
    setEstadias((prev) => [newEstadia, ...prev]);

    const targetRefugio = refugios.find((r) => r.id === estadiaData.refugio_id);
    setToastMessage(`✅ Persona ${newPersona.apellido}, ${newPersona.nombre} registrada con estadía en "${targetRefugio?.nombre}".`);
  };

  // Registrar egreso de persona (Tabla public.estadias update fecha_egreso)
  const registrarEgreso = (estadiaId: number, motivoEgreso: string, observacionesEgreso?: string) => {
    const timestampNow = new Date().toISOString();

    setEstadias((prev) =>
      prev.map((e) => {
        if (e.id === estadiaId) {
          return {
            ...e,
            fecha_egreso: timestampNow,
            motivo_egreso: motivoEgreso,
            observaciones: observacionesEgreso ? `${e.observaciones || ''} [Egreso: ${observacionesEgreso}]` : e.observaciones,
            egreso_registrado_por: currentUser?.id,
            actualizado_en: timestampNow,
          };
        }
        return e;
      })
    );

    setToastMessage(`🚪 Egreso registrado correctamente en sistema.`);
  };

  return (
    <ShelterContext.Provider
      value={{
        currentUser,
        authScreen,
        setAuthScreen,
        login,
        register,
        logout,
        currentRole,
        setCurrentRole,
        activeAdminScreen,
        setActiveAdminScreen,
        activeSocialScreen,
        setActiveSocialScreen,
        selectedRefugioId,
        setSelectedRefugioId,

        perfiles,
        refugios,
        asignaciones,
        personas,
        gruposFamiliares,
        estadias,

        addRefugio,
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
