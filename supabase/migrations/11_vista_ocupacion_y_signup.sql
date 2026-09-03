-- ============================================================================
-- 11_vista_ocupacion_y_signup.sql
-- - vw_ocupacion_refugios: usada por registrar_ingreso_grupal() en
--   12_grupos_familiares.sql para validar capacidad disponible.
-- - Trigger sobre auth.users: crea automáticamente la fila en public.perfiles
--   al registrarse, corriendo aunque la confirmación de email esté activada
--   (auth.users se inserta en el signUp sin importar si hay sesión todavía).
--   Ver app/auth/actions.ts: el cliente ya NO hace upsert manual a perfiles.
-- ============================================================================

create or replace view public.vw_ocupacion_refugios
with (security_invoker = on)
as
select
  r.id as refugio_id,
  r.nombre,
  r.capacidad,
  count(e.id) filter (where e.fecha_egreso is null) as ocupadas,
  r.capacidad - count(e.id) filter (where e.fecha_egreso is null) as lugares_disponibles
from public.refugios r
left join public.estadias e on e.refugio_id = r.id
where r.activo = true
group by r.id, r.nombre, r.capacidad;

grant select on public.vw_ocupacion_refugios to authenticated;

create or replace function public.fn_crear_perfil_en_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre_completo, rol, activo)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre_completo'), ''), split_part(new.email, '@', 1)),
    'trabajador_social',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_crear_perfil_en_signup
  after insert on auth.users
  for each row
  execute function public.fn_crear_perfil_en_signup();
