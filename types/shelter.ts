export type UserRole = 'admin' | 'social_worker';

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
  name: string;
  code: string;
  capacity: number;
  occupied: number;
  description: string;
  category: 'familias' | 'adultos_mayores' | 'general' | 'medica_aislamiento';
}

export interface ResourceItem {
  id: string;
  category: 'alimentos' | 'agua' | 'abrigo' | 'higiene' | 'medicina';
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  status: 'normal' | 'bajo' | 'critico';
  lastRestocked: string;
}

export interface NoticeAlert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'urgent';
  timestamp: string;
  author: string;
}
