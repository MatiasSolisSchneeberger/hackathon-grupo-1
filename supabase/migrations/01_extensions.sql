-- ============================================================================
-- 01_extensions.sql
-- Extensiones y schema privado para funciones de seguridad (RLS helpers).
-- ============================================================================

create extension if not exists "pgcrypto" with schema extensions;

-- Schema separado para funciones de seguridad que no deben exponerse via API.
create schema if not exists private;

-- Los policies de RLS ejecutan como el usuario autenticado (`authenticated`),
-- así que necesita permiso para invocar funciones de este schema.
grant usage on schema private to authenticated;
