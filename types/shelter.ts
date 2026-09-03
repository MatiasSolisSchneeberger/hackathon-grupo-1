export type UserRole = 'admin' | 'social_worker';
export type DbRol = 'admin' | 'trabajador_social';

export interface Perfil {
  id: string;
  nombre_completo: string;
  rol: DbRol;
  activo: boolean;
}

export type EvacuationReason = 'inundacion' | 'incendio' | 'temporal' | 'derrumbe' | 'otro';

export type Gender = 'masculino' | 'femenino' | 'otro' | 'no_especifica';

export type EvacueeStatus = 'ingresado' | 'en_transito' | 'derivado_hospital' | 'egresado';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Vulnerabilities {
  isMinor: boolean;
  isElderly: boolean;
  isPregnant: boolean;
  hasDisabledMobility: boolean;
  hasChronicCondition: boolean;
}

export interface Evacuee {
  id: string;
  shelterId: string; // Refugio al que pertenece
  firstName: string;
  lastName: string;
  dni: string;
  age: number;
  gender: Gender;
  phone?: string;
  originNeighborhood: string;
  evacuationReason: EvacuationReason;
  familyGroupId?: string;
  familyRole?: 'jefe_hogar' | 'pareja' | 'hijo' | 'familiar' | 'individual';
  zoneId: string;
  bedNumber?: string;
  vulnerabilities: Vulnerabilities;
  medicalNotes?: string;
  dietaryNotes?: string;
  status: EvacueeStatus;
  entryTimestamp: string;
  registeredBy: string;
}

export interface ShelterZone {
  id: string;
  shelterId: string;
  name: string;
  code: string;
  capacity: number;
  occupied: number;
  description: string;
  category: 'familias' | 'adultos_mayores' | 'general' | 'medica_aislamiento';
}

export interface ResourceItem {
  id: string;
  shelterId: string; // Refugio al que pertenece este alimento/insumo
  category: 'alimentos' | 'agua' | 'abrigo' | 'higiene' | 'medicina';
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  status: 'normal' | 'bajo' | 'critico';
  lastRestocked: string;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  city: string;
  managerName: string;
  phone: string;
  capacity: number;
  occupied: number;
  status: 'operativo' | 'lleno' | 'mantenimiento';
  infrastructureType: 'polideportivo' | 'escuela' | 'centro_comunitario' | 'otro';
}

export interface NoticeAlert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'urgent';
  timestamp: string;
  author: string;
  shelterId?: string; // Opcional si es específico de un refugio
}

export type AdminScreenType = 
  | 'dashboard'
  | 'shelters'
  | 'shelter_detail'
  | 'food_inventory'
  | 'evacuees'
  | 'notices';

export type SocialScreenType = 
  | 'intake'
  | 'registry'
  | 'family_search'
  | 'health_diet'
  | 'shift_report';
