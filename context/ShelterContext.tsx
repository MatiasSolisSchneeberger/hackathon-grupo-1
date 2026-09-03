"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Evacuee, 
  ShelterZone, 
  ResourceItem, 
  NoticeAlert, 
  UserRole, 
  EvacueeStatus, 
  UserProfile,
  Shelter,
  AdminScreenType,
  SocialScreenType
} from '@/types/shelter';

interface ShelterContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Active Screen States
  activeAdminScreen: AdminScreenType;
  setActiveAdminScreen: (screen: AdminScreenType) => void;
  activeSocialScreen: SocialScreenType;
  setActiveSocialScreen: (screen: SocialScreenType) => void;
  selectedShelterId: string | null;
  setSelectedShelterId: (id: string | null) => void;

  // Domain Entities
  shelters: Shelter[];
  evacuees: Evacuee[];
  zones: ShelterZone[];
  resources: ResourceItem[];
  notices: NoticeAlert[];

  // Mutators
  addShelter: (data: Omit<Shelter, 'id' | 'occupied' | 'status'>) => void;
  addEvacuee: (evacueeData: Omit<Evacuee, 'id' | 'entryTimestamp'>) => void;
  updateEvacueeStatus: (id: string, status: EvacueeStatus, notes?: string) => void;
  restockResource: (id: string, amountToAdd: number) => void;
  addNotice: (title: string, message: string, type: NoticeAlert['type'], shelterId?: string) => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const initialShelters: Shelter[] = [
  {
    id: 'ref_1',
    name: 'Refugio Central N° 1 - Polideportivo Municipal',
    address: 'Av. Las Heras 1450',
    city: 'Resistencia',
    managerName: 'Ing. Fernando Rossi',
    phone: '0362-4455-667',
    capacity: 150,
    occupied: 104,
    status: 'operativo',
    infrastructureType: 'polideportivo',
  },
  {
    id: 'ref_2',
    name: 'Refugio N° 2 - Escuela Primaria N° 14',
    address: 'Calle Belgrano 820',
    city: 'Resistencia',
    managerName: 'Lic. Graciela Maidana',
    phone: '0362-4433-221',
    capacity: 80,
    occupied: 45,
    status: 'operativo',
    infrastructureType: 'escuela',
  },
  {
    id: 'ref_3',
    name: 'Refugio N° 3 - Centro Comunitario Belgrano',
    address: 'Paso de la Patria 340',
    city: 'Resistencia',
    managerName: 'Carlos Benítez',
    phone: '0362-4411-998',
    capacity: 60,
    occupied: 22,
    status: 'operativo',
    infrastructureType: 'centro_comunitario',
  },
];

const initialZones: ShelterZone[] = [
  // Refugio 1
  {
    id: 'zona_a_ref1',
    shelterId: 'ref_1',
    name: 'Zona A - Ala Familias',
    code: 'ZA-100',
    capacity: 50,
    occupied: 38,
    description: 'Espacio adaptado para familias con niños y tutores a cargo.',
    category: 'familias',
  },
  {
    id: 'zona_b_ref1',
    shelterId: 'ref_1',
    name: 'Zona B - Adultos Mayores y Salud',
    code: 'ZB-200',
    capacity: 25,
    occupied: 18,
    description: 'Mapeo cercano a estación de enfermería y accesibilidad reducida.',
    category: 'adultos_mayores',
  },
  {
    id: 'zona_c_ref1',
    shelterId: 'ref_1',
    name: 'Zona C - Alojamiento General',
    code: 'ZC-300',
    capacity: 60,
    occupied: 42,
    description: 'Módulos de camas individuales para adultos y jóvenes.',
    category: 'general',
  },
  {
    id: 'zona_d_ref1',
    shelterId: 'ref_1',
    name: 'Zona D - Atención Médica & Aislamiento',
    code: 'ZD-400',
    capacity: 15,
    occupied: 6,
    description: 'Área reservada para monitoreo clínico y observación.',
    category: 'medica_aislamiento',
  },

  // Refugio 2
  {
    id: 'zona_a_ref2',
    shelterId: 'ref_2',
    name: 'Gimnasio Principal - Familias',
    code: 'REF2-ZA',
    capacity: 50,
    occupied: 30,
    description: 'Aulas acondicionadas con literas y módulos individuales.',
    category: 'familias',
  },
  {
    id: 'zona_b_ref2',
    shelterId: 'ref_2',
    name: 'Sector Aulas B - Adultos',
    code: 'REF2-ZB',
    capacity: 30,
    occupied: 15,
    description: 'Espacio tranquilo reservado para adultos y adultos mayores.',
    category: 'adultos_mayores',
  },

  // Refugio 3
  {
    id: 'zona_a_ref3',
    shelterId: 'ref_3',
    name: 'Salón Único - Alojamiento General',
    code: 'REF3-ZA',
    capacity: 60,
    occupied: 22,
    description: 'Salón multiuso acondicionado con catres y mantas.',
    category: 'general',
  },
];

const initialResources: ResourceItem[] = [
  // Refugio 1
  {
    id: 'res_1',
    shelterId: 'ref_1',
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
    shelterId: 'ref_1',
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
    shelterId: 'ref_1',
    category: 'alimentos',
    name: 'Viandas Específicas Sin TACC (Celíacos)',
    quantity: 12,
    unit: 'viandas',
    minThreshold: 25,
    status: 'critico',
    lastRestocked: '2026-09-02 14:00',
  },
  {
    id: 'res_4',
    shelterId: 'ref_1',
    category: 'abrigo',
    name: 'Frazadas y Mantas Térmicas',
    quantity: 85,
    unit: 'unidades',
    minThreshold: 100,
    status: 'bajo',
    lastRestocked: '2026-09-01 14:20',
  },
  {
    id: 'res_5',
    shelterId: 'ref_1',
    category: 'higiene',
    name: 'Kits de Higiene Personal',
    quantity: 22,
    unit: 'kits',
    minThreshold: 40,
    status: 'critico',
    lastRestocked: '2026-08-30 11:00',
  },

  // Refugio 2
  {
    id: 'res_6',
    shelterId: 'ref_2',
    category: 'agua',
    name: 'Agua Potable (Bidones 5L)',
    quantity: 75,
    unit: 'bidones',
    minThreshold: 30,
    status: 'normal',
    lastRestocked: '2026-09-03 09:15',
  },
  {
    id: 'res_7',
    shelterId: 'ref_2',
    category: 'alimentos',
    name: 'Leche Maternizada y Pañales Infantil',
    quantity: 18,
    unit: 'packs',
    minThreshold: 20,
    status: 'bajo',
    lastRestocked: '2026-09-02 20:15',
  },
  {
    id: 'res_8',
    shelterId: 'ref_2',
    category: 'alimentos',
    name: 'Raciones Secas / Almacén',
    quantity: 190,
    unit: 'raciones',
    minThreshold: 60,
    status: 'normal',
    lastRestocked: '2026-09-02 11:30',
  },

  // Refugio 3
  {
    id: 'res_9',
    shelterId: 'ref_3',
    category: 'alimentos',
    name: 'Kits Alimentarios de Emergencia',
    quantity: 50,
    unit: 'kits',
    minThreshold: 30,
    status: 'normal',
    lastRestocked: '2026-09-03 07:00',
  },
  {
    id: 'res_10',
    shelterId: 'ref_3',
    category: 'medicina',
    name: 'Botiquines de Primeros Auxilios',
    quantity: 8,
    unit: 'cajas',
    minThreshold: 10,
    status: 'bajo',
    lastRestocked: '2026-09-01 16:00',
  },
];

const initialEvacuees: Evacuee[] = [
  {
    id: 'eva_1',
    shelterId: 'ref_1',
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
    zoneId: 'zona_a_ref1',
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
    shelterId: 'ref_1',
    firstName: 'Lucas',
    lastName: 'Gómez',
    dni: '54.120.334',
    age: 8,
    gender: 'masculino',
    originNeighborhood: 'Barrio Las Riveras',
    evacuationReason: 'inundacion',
    familyGroupId: 'FAM-GOMEZ-01',
    familyRole: 'hijo',
    zoneId: 'zona_a_ref1',
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
    shelterId: 'ref_1',
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
    zoneId: 'zona_b_ref1',
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
    shelterId: 'ref_2',
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
    zoneId: 'zona_a_ref2',
    bedNumber: 'E14-08',
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
    shelterId: 'ref_3',
    firstName: 'Jorge O.',
    lastName: 'Martínez',
    dni: '28.901.443',
    age: 49,
    gender: 'masculino',
    originNeighborhood: 'Barrio La Florida',
    evacuationReason: 'incendio',
    familyGroupId: 'INDIV-49',
    familyRole: 'individual',
    zoneId: 'zona_a_ref3',
    bedNumber: 'C-02',
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
    shelterId: 'ref_1',
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
    title: 'Restock de Kits de Higiene Requerido',
    message: 'Quedan menos de 25 kits de higiene en Refugio N° 1. Se envió pedido prioritario a logística municipal.',
    type: 'warning',
    timestamp: 'Hoy, 09:15 hs',
    author: 'Depósito Central',
    shelterId: 'ref_1',
  },
];

const ShelterContext = createContext<ShelterContextType | undefined>(undefined);

export const ShelterProvider: React.FC<{ children: React.ReactNode; initialUser: UserProfile }> = ({ children, initialUser }) => {
  const [currentUser] = useState<UserProfile>(initialUser);
  const [currentRole, setCurrentRole] = useState<UserRole>(initialUser.role);

  // Navigation Screens
  const [activeAdminScreen, setActiveAdminScreen] = useState<AdminScreenType>('dashboard');
  const [activeSocialScreen, setActiveSocialScreen] = useState<SocialScreenType>('intake');
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>('ref_1');

  // Multi-Shelter Domain Collections
  const [shelters, setShelters] = useState<Shelter[]>(initialShelters);
  const [evacuees, setEvacuees] = useState<Evacuee[]>(initialEvacuees);
  const [zones, setZones] = useState<ShelterZone[]>(initialZones);
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [notices, setNotices] = useState<NoticeAlert[]>(initialNotices);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const addShelter = (data: Omit<Shelter, 'id' | 'occupied' | 'status'>) => {
    const newShelterId = `ref_${Date.now()}`;
    const newShelter: Shelter = {
      ...data,
      id: newShelterId,
      occupied: 0,
      status: 'operativo',
    };

    setShelters((prev) => [...prev, newShelter]);

    // Create initial standard zones for the new shelter
    const defaultZones: ShelterZone[] = [
      {
        id: `zone_fam_${newShelterId}`,
        shelterId: newShelterId,
        name: 'Ala Familias',
        code: `${newShelter.name.substring(0, 4).toUpperCase()}-ZA`,
        capacity: Math.round(data.capacity * 0.5),
        occupied: 0,
        description: 'Sector destinado a grupos familiares con niños.',
        category: 'familias',
      },
      {
        id: `zone_gen_${newShelterId}`,
        shelterId: newShelterId,
        name: 'Alojamiento General',
        code: `${newShelter.name.substring(0, 4).toUpperCase()}-ZB`,
        capacity: Math.round(data.capacity * 0.5),
        occupied: 0,
        description: 'Módulos individuales de descanso.',
        category: 'general',
      },
    ];

    setZones((prev) => [...prev, ...defaultZones]);

    // Create initial basic food inventory for the new shelter
    const defaultFood: ResourceItem[] = [
      {
        id: `res_agua_${newShelterId}`,
        shelterId: newShelterId,
        category: 'agua',
        name: 'Agua Potable (Bidones 5L)',
        quantity: 50,
        unit: 'bidones',
        minThreshold: 40,
        status: 'normal',
        lastRestocked: new Date().toISOString().substring(0, 10),
      },
      {
        id: `res_alimento_${newShelterId}`,
        shelterId: newShelterId,
        category: 'alimentos',
        name: 'Raciones No Perecederas',
        quantity: 150,
        unit: 'raciones',
        minThreshold: 80,
        status: 'normal',
        lastRestocked: new Date().toISOString().substring(0, 10),
      },
    ];

    setResources((prev) => [...prev, ...defaultFood]);

    setToastMessage(`🏢 Refugio "${newShelter.name}" creado con éxito en la red.`);
  };

  const addEvacuee = (evacueeData: Omit<Evacuee, 'id' | 'entryTimestamp'>) => {
    const newId = `eva_${Date.now()}`;
    const newEvacuee: Evacuee = {
      ...evacueeData,
      id: newId,
      entryTimestamp: new Date().toISOString(),
    };

    setEvacuees((prev) => [newEvacuee, ...prev]);

    // Automatically update shelter occupancy count
    setShelters((prevShelters) =>
      prevShelters.map((s) => {
        if (s.id === evacueeData.shelterId) {
          const newOcc = s.occupied + 1;
          return {
            ...s,
            occupied: newOcc,
            status: newOcc >= s.capacity ? 'lleno' : 'operativo',
          };
        }
        return s;
      })
    );

    // Automatically update zone occupancy
    setZones((prevZones) =>
      prevZones.map((z) => {
        if (z.id === evacueeData.zoneId) {
          return { ...z, occupied: z.occupied + 1 };
        }
        return z;
      })
    );

    const targetShelter = shelters.find((s) => s.id === evacueeData.shelterId);
    setToastMessage(`✅ Evacuado ${newEvacuee.firstName} ${newEvacuee.lastName} ingresado en "${targetShelter?.name || 'Refugio'}". Datos sincronizados con el Administrador.`);
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

    setToastMessage(`Estado de evacueado actualizado a "${status.toUpperCase()}". Sincronizado en tiempo real.`);
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

    setToastMessage(`📦 Stock de insumo reabastecido (+${amountToAdd}).`);
  };

  const addNotice = (title: string, message: string, type: NoticeAlert['type'], shelterId?: string) => {
    const newNotice: NoticeAlert = {
      id: `not_${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Justo ahora',
      author: currentUser ? currentUser.name : (currentRole === 'admin' ? 'Administración General' : 'Comunicador Social'),
      shelterId,
    };

    setNotices((prev) => [newNotice, ...prev]);
    setToastMessage(`📢 Anuncio publicado en la bitácora.`);
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
        selectedShelterId,
        setSelectedShelterId,

        shelters,
        evacuees,
        zones,
        resources,
        notices,

        addShelter,
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
