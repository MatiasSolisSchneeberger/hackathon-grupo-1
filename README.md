# 🏥 RefugIA - Sistema de Gestión de Refugios de Emergencia (MVP)

Sistema de gestión gráfica e interactiva para refugios de evacuados desarrollado en **Next.js 16 (App Router)**, **Tailwind CSS v4** y componentes **Shadcn UI**.

## 🌟 Características Principales

- 🛡️ **Vista Administrador / Dueño del Refugio**:
  - Panel de ocupación por zonas (porcentaje de plazas ocupadas/disponibles).
  - Control de insumos críticos (agua, alimento, abrigo, higiene, medicina) con alertas de stock y modal de reabastecimiento.
  - Padrón consolidado de evacuados con búsqueda por DNI/nombre y exportación.
  - Emisión de anuncios operativos y bitácora de emergencias.

- 📋 **Vista Comunicador Social (Ingreso de Evacuados)**:
  - Formulario de recepción e ingreso rápido en admisión.
  - Flags de salud y vulnerabilidad (menores, adultos mayores, embarazadas, movilidad reducida, enfermedades crónicas, dietas Sin TACC).
  - Asignación de zona y número de cama.
  - Registro de grupos familiares y herramienta de reunificación familiar.
  - Padrón en vivo con actualización rápida de estado (Ingresado, En tránsito, Derivado a Hospital, Egresado).

- 🔄 **Conmutador de Rol en Vivo**: Permite alternar entre ambas vistas en tiempo real con datos de prueba precargados.

## 🚀 Cómo Ejecutar la Aplicación

1. Instalar dependencias (si no lo hizo aún):
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir en el navegador:
   [http://localhost:3000](http://localhost:3000)

## 📄 Documentación Completa

Para acceder al manual detallado de uso de cada rol y la arquitectura del sistema, consulte:
[Manual de Uso del MVP](docs/MANUAL_DE_USO.md)