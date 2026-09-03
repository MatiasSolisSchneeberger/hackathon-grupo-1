-- ============================================================================
-- 06_asignaciones.sql
-- Qué trabajador_social tiene acceso a qué refugio. Un admin no necesita fila
-- acá: private.tiene_acceso_refugio() siempre es true para admins.
-- ============================================================================

create table public.asignaciones (
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  refugio_id bigint not null references public.refugios (id) on delete cascade,
  creado_en timestamptz not null default now(),
  creado_por uuid references public.perfiles (id) on delete set null,
  primary key (usuario_id, refugio_id)
);

alter table public.asignaciones enable row level security;
revoke all on public.asignaciones from anon;
