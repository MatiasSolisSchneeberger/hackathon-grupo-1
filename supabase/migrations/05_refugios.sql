-- ============================================================================
-- 05_refugios.sql
-- ============================================================================

create table public.refugios (
  id bigint generated always as identity primary key,
  nombre text not null check (length(trim(nombre)) >= 3 and length(trim(nombre)) <= 120),
  direccion text not null default '',
  localidad text not null default 'Corrientes',
  capacidad integer not null check (capacidad > 0 and capacidad <= 10000),
  telefono text,
  referente text,
  observaciones text,
  activo boolean not null default true,
  latitud numeric,
  longitud numeric,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  creado_por uuid references public.perfiles (id) on delete set null
);

create trigger fn_tocar_actualizado_en_refugios
  before update on public.refugios
  for each row
  execute function public.fn_tocar_actualizado_en();

alter table public.refugios enable row level security;
revoke all on public.refugios from anon;
