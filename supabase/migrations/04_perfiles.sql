-- ============================================================================
-- 04_perfiles.sql
-- Perfil de aplicación 1:1 con auth.users. RLS y policies se agregan en 10_rls_policies.sql
-- una vez que existen las funciones de private.* (definidas en 09).
-- ============================================================================

create table public.perfiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  nombre_completo text not null default '',
  rol public.rol_usuario not null default 'trabajador_social',
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create trigger fn_tocar_actualizado_en_perfiles
  before update on public.perfiles
  for each row
  execute function public.fn_tocar_actualizado_en();

alter table public.perfiles enable row level security;
revoke all on public.perfiles from anon;
