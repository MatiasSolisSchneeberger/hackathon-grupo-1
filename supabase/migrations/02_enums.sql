-- ============================================================================
-- 02_enums.sql
-- Enums usados por public.perfiles, public.personas.
-- (public.vinculo_familiar se define en 12_grupos_familiares.sql)
-- ============================================================================

create type public.rol_usuario as enum (
  'admin',
  'trabajador_social'
);

create type public.tipo_documento as enum (
  'dni',
  'pasaporte',
  'otro'
);

create type public.genero as enum (
  'femenino',
  'masculino',
  'otro',
  'no_declara'
);
