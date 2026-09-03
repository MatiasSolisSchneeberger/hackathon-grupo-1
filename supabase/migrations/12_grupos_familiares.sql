-- ============================================================================
-- 12_grupos_familiares.sql
-- Agrega soporte para agrupar personas por familia en un refugio.
-- Modelo: grupos efímeros por evento de ingreso, con ingreso/egreso masivo
-- y garantía de que la familia no se divide entre refugios distintos.
-- ============================================================================

-- Enum: tipo de vínculo familiar
create type public.vinculo_familiar as enum (
  'responsable',
  'conyuge',
  'hijo_a',
  'padre_madre',
  'hermano_a',
  'otro_familiar',
  'sin_vinculo'
);

-- Tabla: grupos familiares
create table public.grupos_familiares (
  id bigint generated always as identity primary key,
  refugio_id bigint not null references public.refugios (id) on delete restrict,

  -- Código de grupo autogenerado: GF-2026-0001, etc.
  codigo text not null unique,

  -- Apellido de referencia para búsqueda rápida en padrón
  apellido_referencia text not null,

  -- Adulto responsable del grupo (FK a personas)
  responsable_persona_id uuid references public.personas (id) on delete set null,

  -- Datos de origen
  domicilio_origen text,
  observaciones text,

  -- Fechas de ciclo de vida
  fecha_alta timestamptz not null default now(),
  fecha_cierre timestamptz,  -- Se completa al egresar el último integrante

  -- Auditoría
  creado_por uuid references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Índices para grupos_familiares
create index idx_grupos_familiares_refugio_activos
  on public.grupos_familiares (refugio_id)
  where fecha_cierre is null;

create index idx_grupos_familiares_apellido
  on public.grupos_familiares (lower(apellido_referencia));

-- Unique constraint: cada grupo está atado a UN refugio
-- (Esto habilita la FK compuesta en estadias que previene división de familia)
alter table public.grupos_familiares
  add constraint grupos_familiares_id_refugio_uk unique (id, refugio_id);

-- Actualizar trigger: actualizado_en se toca en cada UPDATE
create trigger fn_tocar_actualizado_en_grupos_familiares
  before update on public.grupos_familiares
  for each row
  execute function public.fn_tocar_actualizado_en();

-- ============================================================================
-- Alter table estadias: agregar campos de familia
-- ============================================================================

alter table public.estadias
  add column grupo_id bigint,
  add column vinculo public.vinculo_familiar default 'sin_vinculo';

-- FK compuesta: si una estadia tiene grupo, ese grupo debe estar
-- en el MISMO refugio que la estadia. Esto previene división de familia.
alter table public.estadias
  add constraint estadias_grupo_mismo_refugio_fk
  foreign key (grupo_id, refugio_id)
  references public.grupos_familiares (id, refugio_id)
  on delete restrict;

-- Índice para búsquedas por grupo (con integrantes activos)
create index idx_estadias_grupo_activas
  on public.estadias (grupo_id)
  where grupo_id is not null and fecha_egreso is null;

-- ============================================================================
-- Triggers para lifecycle de grupos
-- ============================================================================

-- Trigger 1: Validar que el responsable del grupo siga activo en el grupo
create or replace function public.fn_validar_responsable_grupo()
  returns trigger
  language plpgsql
  as $$
begin
  if new.responsable_persona_id is not null then
    -- Verificar que el responsable tiene una estadía activa en este grupo
    if not exists (
      select 1 from public.estadias e
      where e.grupo_id = new.id
        and e.persona_id = new.responsable_persona_id
        and e.fecha_egreso is null
    ) then
      raise exception 'El responsable (%) debe tener una estadia activa en el grupo',
                      new.responsable_persona_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_validar_responsable_grupo
  before update on public.grupos_familiares
  for each row
  when (old.responsable_persona_id is distinct from new.responsable_persona_id)
  execute function public.fn_validar_responsable_grupo();

-- Trigger 2: Auto-cerrar grupo cuando egresa el último integrante,
-- o re-abrirlo si alguien vuelve a entrar.
create or replace function public.fn_cerrar_grupo_vacio()
  returns trigger
  language plpgsql
  as $$
declare
  v_integrantes_activos int;
begin
  if new.grupo_id is not null then
    -- Contar integrantes activos en el grupo después del egreso
    select count(*) into v_integrantes_activos
    from public.estadias e
    where e.grupo_id = new.grupo_id
      and e.fecha_egreso is null;

    -- Si no hay más integrantes activos, cerrar el grupo
    if v_integrantes_activos = 0 then
      update public.grupos_familiares
      set fecha_cierre = now()
      where id = new.grupo_id and fecha_cierre is null;
    end if;
  elsif old.grupo_id is not null then
    -- (Caso de DELETE de estadia, aunque idealmente no pasa en prod)
    select count(*) into v_integrantes_activos
    from public.estadias e
    where e.grupo_id = old.grupo_id
      and e.fecha_egreso is null;

    if v_integrantes_activos = 0 then
      update public.grupos_familiares
      set fecha_cierre = now()
      where id = old.grupo_id and fecha_cierre is null;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_cerrar_grupo_vacio
  after update of fecha_egreso on public.estadias
  for each row
  when (new.fecha_egreso is distinct from old.fecha_egreso and new.fecha_egreso is not null)
  execute function public.fn_cerrar_grupo_vacio();

-- ============================================================================
-- RPCs para ingreso/egreso masivo
-- ============================================================================

-- RPC 1: Registrar ingreso grupal
-- Entrada: refugio_id, apellido_referencia, domicilio_origen, observaciones,
--          integrantes como jsonb array con {apellido, nombre, tipo_documento, numero_documento, vinculo}
-- Salida: grupo creado con sus estadías
create or replace function public.registrar_ingreso_grupal(
  p_refugio_id bigint,
  p_apellido_referencia text,
  p_domicilio_origen text default null,
  p_observaciones text default null,
  p_integrantes jsonb default '[]'::jsonb
)
returns table (
  grupo_id bigint,
  grupo_codigo text,
  cantidad_integrantes bigint,
  estadias_abiertas jsonb
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_grupo_id bigint;
  v_grupo_codigo text;
  v_responsable_persona_id uuid;
  v_integrante jsonb;
  v_persona_id uuid;
  v_tipo_doc text;
  v_numero_doc text;
  v_numero_doc_norm text;
  v_vinculo public.vinculo_familiar;
  v_capacidad_libre int;
  v_total_integrantes int;
  v_estadias jsonb := '[]'::jsonb;
begin
  -- Validar que el refugio existe y calcular capacidad libre
  select public.vw_ocupacion_refugios.lugares_disponibles into v_capacidad_libre
  from public.vw_ocupacion_refugios
  where public.vw_ocupacion_refugios.refugio_id = p_refugio_id;

  if v_capacidad_libre is null then
    raise exception 'Refugio % no existe', p_refugio_id;
  end if;

  v_total_integrantes := jsonb_array_length(p_integrantes);

  if v_total_integrantes > v_capacidad_libre then
    raise exception 'Capacidad insuficiente: se intenta ingresar % personas pero solo hay % lugares disponibles',
                    v_total_integrantes, v_capacidad_libre;
  end if;

  -- Generar código de grupo
  v_grupo_codigo := 'GF-' || to_char(now(), 'YYYY') || '-' ||
                    to_char((select coalesce(max(id), 0) + 1 from public.grupos_familiares), '0000');

  -- Crear grupo
  insert into public.grupos_familiares (
    refugio_id, codigo, apellido_referencia, domicilio_origen, observaciones, creado_por
  ) values (
    p_refugio_id, v_grupo_codigo, p_apellido_referencia, p_domicilio_origen, p_observaciones,
    auth.uid()
  )
  returning id into v_grupo_id;

  -- Procesar cada integrante
  for v_integrante in select jsonb_array_elements(p_integrantes)
  loop
    v_tipo_doc := v_integrante->>'tipo_documento';
    v_numero_doc := v_integrante->>'numero_documento';
    v_vinculo := (v_integrante->>'vinculo')::public.vinculo_familiar;

    -- Normalizar número de documento (eliminar espacios, convertir a mayúsculas)
    v_numero_doc_norm := upper(regexp_replace(v_numero_doc, '\s+', '', 'g'));

    -- Buscar o crear persona
    select id into v_persona_id
    from public.personas p
    where p.tipo_documento = v_tipo_doc::public.tipo_documento
      and p.numero_documento_norm = v_numero_doc_norm;

    if v_persona_id is null then
      -- Crear nueva persona
      insert into public.personas (
        apellido, nombre, tipo_documento, numero_documento
      ) values (
        v_integrante->>'apellido',
        v_integrante->>'nombre',
        v_tipo_doc::public.tipo_documento,
        v_numero_doc
      )
      returning id into v_persona_id;
    end if;

    -- Abrir estadía con grupo_id
    insert into public.estadias (
      refugio_id, persona_id, grupo_id, vinculo, fecha_ingreso
    ) values (
      p_refugio_id, v_persona_id, v_grupo_id, v_vinculo, now()
    );

    -- Agregar a la respuesta
    v_estadias := v_estadias || jsonb_build_object(
      'persona_id', v_persona_id,
      'vinculo', v_vinculo::text,
      'fecha_ingreso', now()
    );

    -- Si es responsable, actualizar el grupo
    if v_vinculo = 'responsable' then
      update public.grupos_familiares
      set responsable_persona_id = v_persona_id
      where id = v_grupo_id;
      v_responsable_persona_id := v_persona_id;
    end if;
  end loop;

  -- Retornar resultado
  return query
  select v_grupo_id, v_grupo_codigo, v_total_integrantes::bigint, v_estadias;
end;
$$;

-- RPC 2: Registrar egreso grupal
-- Cierra todas las estadías activas de un grupo
create or replace function public.registrar_egreso_grupal(
  p_grupo_id bigint,
  p_motivo text default 'Egreso masivo',
  p_fecha_egreso timestamptz default now()
)
returns table (
  cantidad_egresos_registrados bigint,
  grupo_codigo text,
  fecha_cierre_grupo timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_grupo_codigo text;
  v_cantidad_egresos int := 0;
begin
  -- Validar que el grupo existe
  select codigo into v_grupo_codigo
  from public.grupos_familiares
  where id = p_grupo_id;

  if v_grupo_codigo is null then
    raise exception 'Grupo % no existe', p_grupo_id;
  end if;

  -- Actualizar estadías: cerrar todas las activas del grupo
  update public.estadias
  set fecha_egreso = p_fecha_egreso,
      egreso_registrado_por = auth.uid(),
      observaciones = coalesce(observaciones || ' | ', '') || p_motivo
  where grupo_id = p_grupo_id
    and fecha_egreso is null;

  get diagnostics v_cantidad_egresos = row_count;

  -- El trigger fn_cerrar_grupo_vacio() ya cierra el grupo automáticamente
  -- Retornar resultado
  return query
  select v_cantidad_egresos::bigint,
         v_grupo_codigo,
         (select fecha_cierre from public.grupos_familiares where id = p_grupo_id);
end;
$$;

-- RPC 3: Agregar integrante a grupo ya abierto (llega tarde)
create or replace function public.agregar_integrante_grupo(
  p_grupo_id bigint,
  p_persona jsonb,  -- {apellido, nombre, tipo_documento, numero_documento, fecha_nacimiento, genero, etc.}
  p_vinculo public.vinculo_familiar default 'sin_vinculo'
)
returns table (
  persona_id uuid,
  estadia_id bigint,
  vinculo text,
  fecha_ingreso timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_grupo_refugio_id bigint;
  v_tipo_doc text;
  v_numero_doc text;
  v_numero_doc_norm text;
  v_persona_id uuid;
  v_estadia_id bigint;
begin
  -- Validar grupo y obtener refugio_id
  select refugio_id into v_grupo_refugio_id
  from public.grupos_familiares
  where id = p_grupo_id
    and fecha_cierre is null;

  if v_grupo_refugio_id is null then
    raise exception 'Grupo % no existe o ya está cerrado', p_grupo_id;
  end if;

  v_tipo_doc := p_persona->>'tipo_documento';
  v_numero_doc := p_persona->>'numero_documento';
  v_numero_doc_norm := upper(regexp_replace(v_numero_doc, '\s+', '', 'g'));

  -- Buscar o crear persona
  select id into v_persona_id
  from public.personas per
  where per.tipo_documento = v_tipo_doc::public.tipo_documento
    and per.numero_documento_norm = v_numero_doc_norm;

  if v_persona_id is null then
    insert into public.personas (
      apellido, nombre, tipo_documento, numero_documento,
      fecha_nacimiento, genero, telefono
    ) values (
      p_persona->>'apellido',
      p_persona->>'nombre',
      v_tipo_doc::public.tipo_documento,
      v_numero_doc,
      (p_persona->>'fecha_nacimiento')::date,
      (p_persona->>'genero')::public.genero,
      p_persona->>'telefono'
    )
    returning id into v_persona_id;
  end if;

  -- Abrir estadía con grupo
  insert into public.estadias (
    refugio_id, persona_id, grupo_id, vinculo, fecha_ingreso
  ) values (
    v_grupo_refugio_id, v_persona_id, p_grupo_id, p_vinculo, now()
  )
  returning id into v_estadia_id;

  return query
  select v_persona_id, v_estadia_id, p_vinculo::text, now();
end;
$$;

-- ============================================================================
-- Vistas
-- ============================================================================

-- Vista nueva: grupos activos con estadísticas
create or replace view public.vw_grupos_activos
with (security_invoker = on)
as
select
  gf.id as grupo_id,
  gf.codigo as grupo_codigo,
  gf.apellido_referencia,
  gf.refugio_id,
  r.nombre as refugio_nombre,
  gf.responsable_persona_id,
  coalesce(p.apellido || ', ' || p.nombre, 'Sin asignar') as responsable_nombre,
  gf.domicilio_origen,
  gf.observaciones,
  (select count(*) from public.estadias e
   where e.grupo_id = gf.id and e.fecha_egreso is null) as cantidad_integrantes,
  (select count(*) from public.estadias e
   join public.personas pers on e.persona_id = pers.id
   where e.grupo_id = gf.id
     and e.fecha_egreso is null
     and extract(year from age(pers.fecha_nacimiento)) < 18) as menores,
  (select count(*) from public.estadias e
   join public.personas pers on e.persona_id = pers.id
   where e.grupo_id = gf.id
     and e.fecha_egreso is null
     and extract(year from age(pers.fecha_nacimiento)) >= 65) as adultos_mayores,
  gf.fecha_alta,
  gf.fecha_cierre,
  gf.creado_en
from public.grupos_familiares gf
left join public.refugios r on gf.refugio_id = r.id
left join public.personas p on gf.responsable_persona_id = p.id
where gf.fecha_cierre is null;

grant select on public.vw_grupos_activos to authenticated;

-- Vista modificada: estadías activas con información de grupo
-- (Se reescribe respetando columnas existentes y agrega nuevas al final)
create or replace view public.vw_estadias_activas
with (security_invoker = on)
as
select
  e.id as estadia_id,
  e.refugio_id,
  r.nombre as refugio_nombre,
  e.persona_id,
  p.apellido,
  p.nombre,
  p.tipo_documento,
  p.numero_documento,
  p.fecha_nacimiento,
  p.genero,
  e.fecha_ingreso,
  now() - e.fecha_ingreso as tiempo_en_refugio,
  e.observaciones,
  -- Columnas nuevas para grupo
  e.grupo_id,
  gf.codigo as grupo_codigo,
  gf.apellido_referencia as grupo_apellido,
  e.vinculo
from public.estadias e
join public.refugios r on e.refugio_id = r.id
join public.personas p on e.persona_id = p.id
left join public.grupos_familiares gf on e.grupo_id = gf.id
where e.fecha_egreso is null;

grant select on public.vw_estadias_activas to authenticated;

-- ============================================================================
-- RLS Policies
-- ============================================================================

alter table public.grupos_familiares enable row level security;

-- SELECT: solo si el usuario tiene acceso al refugio
create policy "grupos_familiares_select_refugio"
  on public.grupos_familiares
  for select
  using (private.tiene_acceso_refugio(refugio_id));

-- INSERT: solo si el usuario tiene acceso al refugio
create policy "grupos_familiares_insert_refugio"
  on public.grupos_familiares
  for insert
  with check (private.tiene_acceso_refugio(refugio_id));

-- UPDATE: solo si el usuario tiene acceso al refugio
create policy "grupos_familiares_update_refugio"
  on public.grupos_familiares
  for update
  using (private.tiene_acceso_refugio(refugio_id))
  with check (private.tiene_acceso_refugio(refugio_id));

-- DELETE: solo administradores
create policy "grupos_familiares_delete_admin"
  on public.grupos_familiares
  for delete
  using (private.es_admin());

revoke all on public.grupos_familiares from anon;

-- ============================================================================
-- Fin de script
-- ============================================================================

-- COMENTARIO: ejemplo de uso (descomentar y probar después de ejecutar script)
/*

-- 1. Ingreso grupal de familia Ramírez en refugio 1
select * from public.registrar_ingreso_grupal(
  1,  -- refugio_id
  'Ramírez',
  'Calle Esperanza 123',
  'Evacuados por crecida del río',
  '[
    {"apellido":"Ramírez","nombre":"Ana María","tipo_documento":"dni","numero_documento":"28111222","vinculo":"responsable"},
    {"apellido":"Ramírez","nombre":"Carlos","tipo_documento":"dni","numero_documento":"28333444","vinculo":"conyuge"},
    {"apellido":"Ramírez","nombre":"Lucas","tipo_documento":"dni","numero_documento":"44555666","vinculo":"hijo_a"},
    {"apellido":"Ramírez","nombre":"Sofia","tipo_documento":"dni","numero_documento":"44777888","vinculo":"hijo_a"}
  ]'::jsonb
);

-- 2. Ver grupo creado
select * from public.vw_grupos_activos where grupo_codigo = 'GF-2026-0001';

-- 3. Ver estadías activas con familia
select * from public.vw_estadias_activas where grupo_id = 1;

-- 4. Intentar dividir familia (debe fallar)
-- update public.estadias set refugio_id = 2 where grupo_id = 1 limit 1;

-- 5. Egreso grupal
select * from public.registrar_egreso_grupal(1, 'Bajó el agua');

-- 6. Verificar que grupo se cerró y estadías se cierran
select * from public.vw_ocupacion_refugios where refugio_id = 1;

*/
