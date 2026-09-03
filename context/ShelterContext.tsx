"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Evacuee, ShelterZone, ResourceItem, NoticeAlert, UserRole, EvacueeStatus, UserProfile } from '@/types/shelter';

interface ShelterContextType {
  currentUser: UserProfile | null;
  authScreen: 'login' | 'register';
  setAuthScreen: (screen: 'login' | 'register') => void;
  login: (email: string, password: string, role: UserRole, customName?: string) => void;
  register: (name: string, email: string, password: string, role: UserRole) => void;
  logout: () => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  evacuees: Evacuee[];
  zones: ShelterZone[];
  resources: ResourceItem[];
  notices: NoticeAlert[];
  addEvacuee: (evacueeData: Omit<Evacuee, 'id' | 'entryTimestamp'>) => void;
  updateEvacueeStatus: (id: string, status: EvacueeStatus, notes?: string) => void;
  restockResource: (id: string, amountToAdd: number) => void;
  addNotice: (title: string, message: string, type: NoticeAlert['type']) => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const initialZones: ShelterZone[] = [
  {
    id: 'zona_a',
    name: 'Zona A - Ala Familias',
    code: 'ZA-100',
    capacity: 50,
    occupied: 38,
    description: 'Espacio adaptado para familias con niños y tutores a cargo.',
    category: 'familias',
  },
  {
    id: 'zona_b',
    name: 'Zona B - Adultos Mayores y Salud',
    code: 'ZB-200',
    capacity: 25,
    occupied: 18,
    description: 'Mapeo cercano a estación de enfermería y accesibilidad reducida.',
    category: 'adultos_mayores',
  },
  {
    id: 'zona_c',
    name: 'Zona C - Alojamiento General',
    code: 'ZC-300',
    capacity: 60,
    occupied: 42,
    description: 'Módulos de camas individuales para adultos y jóvenes.',
    category: 'general',
  },
  {
    id: 'zona_d',
    name: 'Zona D - Atención Médica & Aislamiento',
    code: 'ZD-400',
    capacity: 15,
    occupied: 6,
    description: 'Área reservada para monitoreo clínico y casos de observación.',
    category: 'medica_aislamiento',
  },
];

const initialResources: ResourceItem[] = [
  {
    id: 'res_1',
    category: 'agua',
    name: 'Agua Potable (Bidones 5L)',
    quantity: 42,
    unit: 'bidones',
    minThreshold: 50,
    status: 'bajo',
    lastRestocked: '2026-09-03 08:30',
  },
  {
    id: 'res_2',
    category: 'alimentos',
    name: 'Raciones de Alimento No Perecedero',
    quantity: 340,
    unit: 'raciones',
    minThreshold: 100,
    status: 'normal',
    lastRestocked: '2026-09-02 18:00',
  },
  {
    id: 'res_3',
    category: 'abrigo',
    name: 'Frazadas y Mantas Térmicas',
    quantity: 85,
    unit: 'unidades',
    minThreshold: 100,
    status: 'bajo',
    lastRestocked: '2026-09-01 14:20',
  },
  {
    id: 'res_4',
    category: 'higiene',
    name: 'Kits de Higiene Personal',
    quantity: 22,
    unit: 'kits',
    minThreshold: 40,
    status: 'critico',
    lastRestocked: '2026-08-30 11:00',
  },
  {
    id: 'res_5',
    category: 'alimentos',
    name: 'Leche Maternizada y Pañales',
    quantity: 15,
    unit: 'packs',
    minThreshold: 30,
    status: 'critico',
    lastRestocked: '2026-09-02 20:15',
  },
  {
    id: 'res_6',
    category: 'medicina',
    name: 'Botiquines de Primeros Auxilios',
    quantity: 14,
    unit: 'cajas',
    minThreshold: 10,
    status: 'normal',
    lastRestocked: '2026-09-03 09:00',
  },
];

const initialEvacuees: Evacuee[] = [
  {
    id: 'eva_1',
    firstName: 'María Rosa',
    lastName: 'Gómez',
    dni: '32.451.890',
    age: 41,
    gender: 'femenino',
    phone: '11-4567-8901',
    originNeighborhood: 'Barrio Las Riveras',
    evacuationReason: 'inundacion',
    familyGroupId: 'FAM-GOMEZ-01',
    familyRole: 'jefe_hogar',
    zoneId: 'zona_a',
    bedNumber: 'A-12',
    vulnerabilities: {
      isMinor: false,
      isElderly: false,
      isPregnant: false,
      hasDisabledMobility: false,
      hasChronicCondition: true,
    },
    medicalNotes: 'Hipotiroidismo. Trajo su medicación habitual.',
    dietaryNotes: 'Dieta Hipoalergénica',
    status: 'ingresado',
    entryTimestamp: '2026-09-03T07:45:00Z',
    registeredBy: 'Lic. Sofía Martínez',
  },
  {
    id: 'eva_2',
    firstName: 'Lucas',
    lastName: 'Gómez',
    dni: '54.120.334',
    age: 8,
    gender: 'masculino',
    originNeighborhood: 'Barrio Las Riveras',
    evacuationReason: 'inundacion',
    familyGroupId: 'FAM-GOMEZ-01',
    familyRole: 'hijo',
    zoneId: 'zona_a',
    bedNumber: 'A-13',
    vulnerabilities: {
      isMinor: true,
      isElderly: false,
      isPregnant: false,
      hasDisabledMobility: false,
      hasChronicCondition: false,
    },
    medicalNotes: 'Sin antecedentes relevantes.',
    status: 'ingresado',
    entryTimestamp: '2026-09-03T07:45:00Z',
    registeredBy: 'Lic. Sofía Martínez',
  },
  {
    id: 'eva_3',
    firstName: 'Don Roberto',
    lastName: 'Fernández',
    dni: '14.890.123',
    age: 76,
    gender: 'masculino',
    phone: '11-8901-2345',
    originNeighborhood: 'Villa del Sol',
    evacuationReason: 'temporal',
    familyGroupId: 'INDIV-76',
    familyRole: 'individual',
    zoneId: 'zona_b',
    bedNumber: 'B-04',
    vulnerabilities: {
      isMinor: false,
      isElderly: true,
      isPregnant: false,
      hasDisabledMobility: true,
      hasChronicCondition: true,
    },
    medicalNotes: 'Hipertensión arterial y movilidad reducida (anda con bastón). Requiere asistencia para subir escaleras.',
    dietaryNotes: 'Sin TACC (Celíaco) / Bajo en sodio',
    status: 'ingresado',
    entryTimestamp: '2026-09-03T08:15:00Z',
    registeredBy: 'Carlos Benítez',
  },
  {
    id: 'eva_4',
    firstName: 'Camila',
    lastName: 'Benítez',
    dni: '41.230.988',
    age: 26,
    gender: 'femenino',
    phone: '11-6677-8899',
    originNeighborhood: 'Sector Costanera',
    evacuationReason: 'inundacion',
    familyGroupId: 'FAM-BENITEZ-02',
    familyRole: 'jefe_hogar',
    zoneId: 'zona_a',
    bedNumber: 'A-08',
    vulnerabilities: {
      isMinor: false,
      isElderly: false,
      isPregnant: true,
      hasDisabledMobility: false,
      hasChronicCondition: false,
    },
    medicalNotes: 'Gestación semana 32. Controles en regla.',
    dietaryNotes: 'Suplementación de hierro',
    status: 'ingresado',
    entryTimestamp: '2026-09-03T09:30:00Z',
    registeredBy: 'Lic. Sofía Martínez',
  },
  {
    id: 'eva_5',
    firstName: 'Jorge O.',
    lastName: 'Martínez',
    dni: '28.901.443',
    age: 49,
    gender: 'masculino',
    originNeighborhood: 'Barrio La Florida',
    evacuationReason: 'incendio',
    familyGroupId: 'INDIV-49',
    familyRole: 'individual',
    zoneId: 'zona_d',
    bedNumber: 'D-02',
    vulnerabilities: {
      isMinor: false,
      isElderly: false,
      isPregnant: false,
      hasDisabledMobility: false,
      hasChronicCondition: true,
    },
    medicalNotes: 'Inhalación leve de humo. Evaluado por médico, en observación preventiva.',
    status: 'en_transito',
    entryTimestamp: '2026-09-03T10:10:00Z',
    registeredBy: 'Dr. Alejandro Vera',
  },
];

const initialNotices: NoticeAlert[] = [
  {
    id: 'not_1',
    title: 'Ingreso Masivo Concomitante',
    message: 'Se aguarda un contingente de 15 personas provenientes del Barrio San Cayetano en los próximos 45 minutos.',
    type: 'urgent',
    timestamp: 'Hoy, 11:20 hs',
    author: 'Coordinación Defensa Civil',
  },
  {
    id: 'not_2',
    title: 'Campaña de Vacunación Antitetánica',
    message: 'El equipo de salud iniciará la colocación de refuerzos antitetánicos en Zona A y C a partir de las 14:00 hs.',
    type: 'info',
    timestamp: 'Hoy, 10:00 hs',
    author: 'Dra. Elena Ruiz (Área Médica)',
  },
  {
    id: 'not_3',
    title: 'Restock de Kits de Higiene en Cero',
    message: 'Quedan menos de 25 kits de higiene. Se envió pedido prioritario a logística municipal.',
    type: 'warning',
    timestamp: 'Hoy, 09:15 hs',
    author: 'Depósito Central',
  },
];

const ShelterContext = createContext<ShelterContextType | undefined>(undefined);

export const ShelterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');

  const [evacuees, setEvacuees] = useState<Evacuee[]>(initialEvacuees);
  const [zones, setZones] = useState<ShelterZone[]>(initialZones);
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [notices, setNotices] = useState<NoticeAlert[]>(initialNotices);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto hide toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const login = (email: string, password: string, role: UserRole, customName?: string) => {
    const formattedName = customName || (email.split('@')[0].replace('.', ' ').toUpperCase());
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      name: formattedName,
      email,
      role,
    };

    setCurrentUser(user);
    setCurrentRole(role);
    setToastMessage(`👋 Bienvenido ${user.name} (${role === 'admin' ? 'Administrador' : 'Comunicador Social'})`);
  };

  const register = (name: string, email: string, password: string, role: UserRole) => {
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
    };

    setCurrentUser(user);
    setCurrentRole(role);
    setToastMessage(`✅ Cuenta registrada e ingreso exitoso. ¡Bienvenido ${user.name}!`);
  };

  const logout = () => {
    setCurrentUser(null);
    setToastMessage('Sesión cerrada correctamente.');
  };

  const addEvacuee = (evacueeData: Omit<Evacuee, 'id' | 'entryTimestamp'>) => {
    const newId = `eva_${Date.now()}`;
    const newEvacuee: Evacuee = {
      ...evacueeData,
      id: newId,
      entryTimestamp: new Date().toISOString(),
    };

    setEvacuees((prev) => [newEvacuee, ...prev]);

    // Automatically update zone occupancy
    setZones((prevZones) =>
      prevZones.map((z) => {
        if (z.id === evacueeData.zoneId) {
          return { ...z, occupied: z.occupied + 1 };
        }
        return z;
      })
    );

    setToastMessage(`✅ Evacuado ${newEvacuee.firstName} ${newEvacuee.lastName} ingresado con éxito.`);
  };

  const updateEvacueeStatus = (id: string, status: EvacueeStatus, notes?: string) => {
    setEvacuees((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            status,
            medicalNotes: notes ? `${e.medicalNotes || ''} [Update: ${notes}]` : e.medicalNotes,
          };
        }
        return e;
      })
    );

    setToastMessage(`Estado de evacueado actualizado a "${status.toUpperCase()}".`);
  };

  const restockResource = (id: string, amountToAdd: number) => {
    setResources((prev) =>
      prev.map((res) => {
        if (res.id === id) {
          const newQty = res.quantity + amountToAdd;
          let newStatus: ResourceItem['status'] = 'normal';
          if (newQty < res.minThreshold / 2) {
            newStatus = 'critico';
          } else if (newQty < res.minThreshold) {
            newStatus = 'bajo';
          }

          return {
            ...res,
            quantity: newQty,
            status: newStatus,
            lastRestocked: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };
        }
        return res;
      })
    );

    setToastMessage(`📦 Stock reabastecido correctamente (+${amountToAdd}).`);
  };

  const addNotice = (title: string, message: string, type: NoticeAlert['type']) => {
    const newNotice: NoticeAlert = {
      id: `not_${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Justo ahora',
      author: currentUser ? currentUser.name : (currentRole === 'admin' ? 'Administración Refugio' : 'Comunicador Social'),
    };

    setNotices((prev) => [newNotice, ...prev]);
    setToastMessage(`📢 Anuncio publicado en la bitácora.`);
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
        evacuees,
        zones,
        resources,
        notices,
        addEvacuee,
        updateEvacueeStatus,
        restockResource,
        addNotice,
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
    throw new Error('useShelter must be used within a ShelterProvider');
  }
  return context;
};
