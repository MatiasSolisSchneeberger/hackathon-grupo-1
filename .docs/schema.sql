-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.perfiles (
  id uuid NOT NULL,
  nombre_completo text NOT NULL DEFAULT ''::text,
  rol USER-DEFINED NOT NULL DEFAULT 'trabajador_social'::rol_usuario,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.refugios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL CHECK (length(TRIM(BOTH FROM nombre)) >= 3 AND length(TRIM(BOTH FROM nombre)) <= 120),
  direccion text NOT NULL DEFAULT ''::text,
  localidad text NOT NULL DEFAULT 'Corrientes'::text,
  capacidad integer NOT NULL CHECK (capacidad > 0 AND capacidad <= 10000),
  telefono text,
  referente text,
  observaciones text,
  activo boolean NOT NULL DEFAULT true,
  latitud numeric,
  longitud numeric,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
  creado_por uuid,
  CONSTRAINT refugios_pkey PRIMARY KEY (id),
  CONSTRAINT refugios_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id)
);
CREATE TABLE public.asignaciones (
  usuario_id uuid NOT NULL,
  refugio_id bigint NOT NULL,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  creado_por uuid,
  CONSTRAINT asignaciones_pkey PRIMARY KEY (usuario_id, refugio_id),
  CONSTRAINT asignaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT asignaciones_refugio_id_fkey FOREIGN KEY (refugio_id) REFERENCES public.refugios(id),
  CONSTRAINT asignaciones_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id)
);
CREATE TABLE public.personas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo_documento USER-DEFINED NOT NULL DEFAULT 'dni'::tipo_documento,
  numero_documento text,
  numero_documento_norm text DEFAULT NULLIF(upper(regexp_replace(COALESCE(numero_documento, ''::text), '[^A-Za-z0-9]'::text, ''::text, 'g'::text)), ''::text),
  apellido text NOT NULL CHECK (length(TRIM(BOTH FROM apellido)) >= 2),
  nombre text NOT NULL CHECK (length(TRIM(BOTH FROM nombre)) >= 2),
  fecha_nacimiento date CHECK (fecha_nacimiento <= CURRENT_DATE),
  genero USER-DEFINED NOT NULL DEFAULT 'no_declara'::genero,
  telefono text,
  observaciones text,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
  creado_por uuid,
  CONSTRAINT personas_pkey PRIMARY KEY (id),
  CONSTRAINT personas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id)
);
CREATE TABLE public.estadias (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  persona_id uuid NOT NULL,
  refugio_id bigint NOT NULL,
  fecha_ingreso timestamp with time zone NOT NULL DEFAULT now(),
  fecha_egreso timestamp with time zone,
  motivo_egreso text,
  observaciones text,
  registrado_por uuid,
  egreso_registrado_por uuid,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
  grupo_id bigint,
  vinculo USER-DEFINED DEFAULT 'sin_vinculo'::vinculo_familiar,
  CONSTRAINT estadias_pkey PRIMARY KEY (id),
  CONSTRAINT estadias_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id),
  CONSTRAINT estadias_refugio_id_fkey FOREIGN KEY (refugio_id) REFERENCES public.refugios(id),
  CONSTRAINT estadias_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES public.perfiles(id),
  CONSTRAINT estadias_egreso_registrado_por_fkey FOREIGN KEY (egreso_registrado_por) REFERENCES public.perfiles(id),
  CONSTRAINT estadias_grupo_mismo_refugio_fk FOREIGN KEY (grupo_id) REFERENCES public.grupos_familiares(id),
  CONSTRAINT estadias_grupo_mismo_refugio_fk FOREIGN KEY (refugio_id) REFERENCES public.grupos_familiares(refugio_id)
);
CREATE TABLE public.grupos_familiares (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  refugio_id bigint NOT NULL,
  codigo text NOT NULL UNIQUE,
  apellido_referencia text NOT NULL,
  responsable_persona_id uuid,
  domicilio_origen text,
  observaciones text,
  fecha_alta timestamp with time zone NOT NULL DEFAULT now(),
  fecha_cierre timestamp with time zone,
  creado_por uuid,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT grupos_familiares_pkey PRIMARY KEY (id),
  CONSTRAINT grupos_familiares_refugio_id_fkey FOREIGN KEY (refugio_id) REFERENCES public.refugios(id),
  CONSTRAINT grupos_familiares_responsable_persona_id_fkey FOREIGN KEY (responsable_persona_id) REFERENCES public.personas(id),
  CONSTRAINT grupos_familiares_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id)
);