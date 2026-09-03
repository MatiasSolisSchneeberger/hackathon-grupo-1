-- ============================================================================
-- 08_estadias.sql
-- Una estadía = un período de alojamiento de una persona en un refugio.
-- grupo_id/vinculo se agregan en 12_grupos_familiares.sql junto con la FK
-- compuesta que impide que una familia quede dividida entre refugios.
-- ============================================================================

create table public.estadias (
  id bigint generated always as identity primary key,
  persona_id uuid not null references public.personas (id) on delete restrict,
  refugio_id bigint not null references public.refugios (id) on delete restrict,
  fecha_ingreso timestamptz not null default now(),
  fecha_egreso timestamptz,
  motivo_egreso text,
  observaciones text,
  registrado_por uuid references public.perfiles (id) on delete set null,
  egreso_registrado_por uuid references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Una persona no puede tener dos estadías activas (sin egreso) a la vez.
create unique index estadias_persona_activa_uk
  on public.estadias (persona_id)
  where fecha_egreso is null;

create index idx_estadias_refugio_activas
  on public.estadias (refugio_id)
  where fecha_egreso is null;

create index idx_estadias_fecha_ingreso on public.estadias (fecha_ingreso desc);

create trigger fn_tocar_actualizado_en_estadias
  before update on public.estadias
  for each row
  execute function public.fn_tocar_actualizado_en();

alter table public.estadias enable row level security;
revoke all on public.estadias from anon;
