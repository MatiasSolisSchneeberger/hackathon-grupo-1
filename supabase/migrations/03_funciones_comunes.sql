-- ============================================================================
-- 03_funciones_comunes.sql
-- Trigger genérico para mantener actualizado_en al día en cada UPDATE.
-- (Referenciado por 12_grupos_familiares.sql como public.fn_tocar_actualizado_en)
-- ============================================================================

create or replace function public.fn_tocar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;
