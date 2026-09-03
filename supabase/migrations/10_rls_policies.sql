-- ============================================================================
-- 10_rls_policies.sql
-- Policies para perfiles, refugios, asignaciones, personas, estadias.
-- (grupos_familiares tiene las suyas en 12_grupos_familiares.sql)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- perfiles
-- ----------------------------------------------------------------------------

-- Cada usuario ve su propio perfil; un admin ve todos.
create policy "perfiles_select_propio_o_admin"
  on public.perfiles
  for select
  using (id = auth.uid() or private.es_admin());

-- No hay policy de INSERT a propósito: los perfiles se crean únicamente por
-- el trigger de auth.users (11_vista_y_trigger_signup.sql), que corre como
-- security definer y por lo tanto ignora RLS. Ningún cliente autenticado
-- puede insertar perfiles directamente.

-- Un usuario puede editar su propio nombre; solo un admin puede tocar
-- rol/activo (lo impone además el trigger fn_proteger_cambios_perfil).
create policy "perfiles_update_propio_o_admin"
  on public.perfiles
  for update
  using (id = auth.uid() or private.es_admin())
  with check (id = auth.uid() or private.es_admin());

create or replace function public.fn_proteger_cambios_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.rol is distinct from old.rol or new.activo is distinct from old.activo)
     and not private.es_admin() then
    raise exception 'No tenés permisos para modificar el rol o el estado de un perfil.';
  end if;
  return new;
end;
$$;

create trigger trg_proteger_cambios_perfil
  before update on public.perfiles
  for each row
  execute function public.fn_proteger_cambios_perfil();

-- ----------------------------------------------------------------------------
-- refugios
-- ----------------------------------------------------------------------------

-- Un trabajador_social solo ve los refugios a los que está asignado.
create policy "refugios_select_con_acceso"
  on public.refugios
  for select
  using (private.tiene_acceso_refugio(id));

create policy "refugios_insert_admin"
  on public.refugios
  for insert
  with check (private.es_admin());

create policy "refugios_update_admin"
  on public.refugios
  for update
  using (private.es_admin())
  with check (private.es_admin());

-- ----------------------------------------------------------------------------
-- asignaciones
-- ----------------------------------------------------------------------------

create policy "asignaciones_select_propia_o_admin"
  on public.asignaciones
  for select
  using (usuario_id = auth.uid() or private.es_admin());

create policy "asignaciones_insert_admin"
  on public.asignaciones
  for insert
  with check (private.es_admin());

create policy "asignaciones_delete_admin"
  on public.asignaciones
  for delete
  using (private.es_admin());

-- ----------------------------------------------------------------------------
-- personas
-- ----------------------------------------------------------------------------

-- Visible si sos admin, si vos la registraste, o si tenés acceso a algún
-- refugio donde tiene (o tuvo) una estadía.
create policy "personas_select_con_acceso"
  on public.personas
  for select
  using (
    private.es_admin()
    or creado_por = auth.uid()
    or exists (
      select 1 from public.estadias e
      where e.persona_id = personas.id
        and private.tiene_acceso_refugio(e.refugio_id)
    )
  );

create policy "personas_insert_usuario_activo"
  on public.personas
  for insert
  with check (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.activo = true)
  );

create policy "personas_update_con_acceso"
  on public.personas
  for update
  using (
    private.es_admin()
    or exists (
      select 1 from public.estadias e
      where e.persona_id = personas.id
        and private.tiene_acceso_refugio(e.refugio_id)
    )
  )
  with check (
    private.es_admin()
    or exists (
      select 1 from public.estadias e
      where e.persona_id = personas.id
        and private.tiene_acceso_refugio(e.refugio_id)
    )
  );

-- ----------------------------------------------------------------------------
-- estadias
-- ----------------------------------------------------------------------------

create policy "estadias_select_con_acceso"
  on public.estadias
  for select
  using (private.tiene_acceso_refugio(refugio_id));

create policy "estadias_insert_con_acceso"
  on public.estadias
  for insert
  with check (private.tiene_acceso_refugio(refugio_id));

create policy "estadias_update_con_acceso"
  on public.estadias
  for update
  using (private.tiene_acceso_refugio(refugio_id))
  with check (private.tiene_acceso_refugio(refugio_id));

create policy "estadias_delete_admin"
  on public.estadias
  for delete
  using (private.es_admin());
