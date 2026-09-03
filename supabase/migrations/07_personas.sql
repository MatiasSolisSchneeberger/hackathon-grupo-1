-- ============================================================================
-- 07_personas.sql
-- Registro único de personas evacuadas (independiente de sus estadías).
-- numero_documento_norm es una columna generada para deduplicar por DNI
-- ignorando mayúsculas/espacios/puntuación.
-- ============================================================================

create table public.personas (
  id uuid not null primary key default gen_random_uuid(),
  tipo_documento public.tipo_documento not null default 'dni',
  numero_documento text,
  numero_documento_norm text generated always as (
    nullif(upper(regexp_replace(coalesce(numero_documento, ''), '[^A-Za-z0-9]', '', 'g')), '')
  ) stored,
  apellido text not null check (length(trim(apellido)) >= 2),
  nombre text not null check (length(trim(nombre)) >= 2),
  fecha_nacimiento date check (fecha_nacimiento <= current_date),
  genero public.genero not null default 'no_declara',
  telefono text,
  observaciones text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  creado_por uuid references public.perfiles (id) on delete set null
);

-- Evita personas duplicadas con el mismo documento.
create unique index personas_tipo_doc_norm_uk
  on public.personas (tipo_documento, numero_documento_norm)
  where numero_documento_norm is not null;

create index idx_personas_apellido on public.personas (lower(apellido));

create trigger fn_tocar_actualizado_en_personas
  before update on public.personas
  for each row
  execute function public.fn_tocar_actualizado_en();

alter table public.personas enable row level security;
revoke all on public.personas from anon;
