-- ============================================================================
-- 09_funciones_seguridad.sql
-- Helpers de autorización usados por las RLS policies (10_rls_policies.sql)
-- y por las RPC de 12_grupos_familiares.sql.
--
-- SECURITY DEFINER + search_path vacío: corren con los privilegios de quien
-- las creó (bypassean RLS internamente) para poder leer public.perfiles /
-- public.asignaciones sin caer en policies recursivas cuando se las llama
-- desde dentro de una policy de esas mismas tablas.
-- ============================================================================

create or replace function private.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
      and p.activo = true
  );
$$;

create or replace function private.tiene_acceso_refugio(p_refugio_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.es_admin()
    or exists (
      select 1
      from public.asignaciones a
      join public.perfiles p on p.id = a.usuario_id
      where a.usuario_id = auth.uid()
        and a.refugio_id = p_refugio_id
        and p.activo = true
    );
$$;

grant execute on function private.es_admin() to authenticated;
grant execute on function private.tiene_acceso_refugio(bigint) to authenticated;
