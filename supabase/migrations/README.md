# Migraciones — reconstrucción

Estos archivos (01 a 11) fueron reconstruidos a partir de `.docs/schema.sql` (dump de
contexto), del script `12_grupos_familiares.sql` (que ya asumía este esquema base:
`private.es_admin()`, `private.tiene_acceso_refugio()`, `fn_tocar_actualizado_en()`,
`vw_ocupacion_refugios`) y del comportamiento que asume el código de la app (rutas en
`app/api/**`, RLS implícita en los mensajes de error, etc).

**No se generaron con `supabase db pull`** porque el entorno donde se escribieron no
tenía Docker corriendo (`db pull`/`db dump` lo requieren). Antes de confiar en esto como
fuente de verdad para producción (`hackaton-grupo01`), corré:

```bash
supabase db pull --linked
# o
supabase db diff --linked --schema public,private
```

y reconciliá cualquier diferencia. El script `12_grupos_familiares.sql` (movido acá sin
cambios funcionales) sí es el original.

Aplicar contra un proyecto nuevo (vacío):

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```
