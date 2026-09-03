export type UserRole = 'admin' | 'social_worker';
export type DbRol = 'admin' | 'trabajador_social';

// Usuario autenticado (derivado de auth.users + public.perfiles) usado por la UI
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type TipoDocumento = 'dni' | 'pasaporte' | 'otro';

export type Genero = 'femenino' | 'masculino' | 'otro' | 'no_declara';

export type VinculoFamiliar = 'jefe_hogar' | 'pareja' | 'hijo' | 'familiar' | 'sin_vinculo';

// Tabla public.perfiles
export interface Perfil {
  id: string; // uuid
  nombre_completo: string;
  rol: DbRol;
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

// Tabla public.refugios
export interface Refugio {
  id: number; // bigint
  nombre: string;
  direccion: string;
  localidad: string; // default 'Corrientes'
  capacidad: number;
  telefono?: string;
  referente?: string;
  observaciones?: string;
  activo: boolean;
  latitud?: number;
  longitud?: number;
  creado_en?: string;
  actualizado_en?: string;
  creado_por?: string;
}

// Tabla public.asignaciones
export interface Asignacion {
  usuario_id: string; // uuid
  refugio_id: number; // bigint
  creado_en?: string;
  creado_por?: string;
}

// Tabla public.personas
export interface Persona {
  id: string; // uuid
  tipo_documento: TipoDocumento;
  numero_documento?: string;
  numero_documento_norm?: string;
  apellido: string;
  nombre: string;
  fecha_nacimiento?: string; // date 'YYYY-MM-DD'
  genero: Genero;
  telefono?: string;
  observaciones?: string;
  creado_en?: string;
  actualizado_en?: string;
  creado_por?: string;
}

// Tabla public.grupos_familiares
export interface GrupoFamiliar {
  id: number; // bigint
  refugio_id: number; // bigint
  codigo: string;
  apellido_referencia: string;
  responsable_persona_id?: string; // uuid
  domicilio_origen?: string;
  observaciones?: string;
  fecha_alta: string;
  fecha_cierre?: string;
  creado_por?: string;
  creado_en?: string;
  actualizado_en?: string;
}

// Tabla public.estadias
export interface Estadia {
  id: number; // bigint
  persona_id: string; // uuid
  refugio_id: number; // bigint
  fecha_ingreso: string; // timestamp
  fecha_egreso?: string; // timestamp
  motivo_egreso?: string;
  observaciones?: string;
  registrado_por?: string;
  egreso_registrado_por?: string;
  grupo_id?: number; // bigint
  vinculo: VinculoFamiliar;
  creado_en?: string;
  actualizado_en?: string;
}

export type AdminScreenType = 
  | 'dashboard'
  | 'refugios'
  | 'perfiles'
  | 'estadias'
  | 'grupos';

export type SocialScreenType = 
  | 'ingreso'
  | 'estadias_activas'
  | 'grupos'
  | 'reunificacion';
