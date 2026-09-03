# 🏥 IRUPE - Sistema de Gestión de Refugios de Emergencia (MVP)

Sistema de gestión de refugios de evacuados desarrollado en **Next.js 16 (App Router)**,
**Tailwind CSS v4**, componentes **Shadcn UI** y **Supabase** (Postgres + Auth + RLS)
como backend.

## 🌟 Características Principales

- 🛡️ **Vista Administrador**:
  - Alta, edición y baja de refugios (`public.refugios`), con ocupación en tiempo real.
  - Gestión de perfiles: cambio de rol (admin / trabajador social), activar/desactivar
    usuarios, y asignación de trabajadores sociales a refugios específicos
    (`public.asignaciones`) — el acceso de cada trabajador social está limitado por RLS
    a los refugios que tiene asignados.
  - Padrón consolidado de estadías y personas, con búsqueda y filtros por refugio/estado.

- 📋 **Vista Trabajador Social**:
  - Registro de ingreso de evacuados (persona + estadía), con detección de duplicados por
    documento.
  - Registro de grupos familiares al ingresar, evitando que una familia quede dividida
    entre refugios distintos.
  - Búsqueda y reunificación familiar.
  - Registro de egresos (con motivo).

Un usuario nuevo se registra siempre como **Trabajador Social**; solo un administrador
puede ascenderlo. El primer administrador del sistema se crea manualmente en el dashboard
de Supabase (Table Editor → `perfiles` → editar `rol` a `admin`); desde ahí, ese admin ya
puede promover a otros usuarios desde la app.

## 🚀 Cómo Ejecutar la Aplicación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar las variables de entorno: copiá `.env.example` a `.env.local` y completá
   los valores desde tu proyecto de Supabase (Project Settings → API).

3. Aplicar el esquema de base de datos: las migraciones están en `supabase/migrations/`
   (ver [supabase/migrations/README.md](supabase/migrations/README.md) para el detalle).
   ```bash
   supabase link --project-ref <tu-project-ref>
   supabase db push
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abrir en el navegador:
   [http://localhost:3000](http://localhost:3000)

## 📄 Documentación Completa

Para acceder al manual detallado de uso de cada rol y la arquitectura del sistema, consulte:
[Manual de Uso del MVP](.docs/MANUAL_DE_USO.md)
