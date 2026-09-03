# Manual de Uso y Documentación del MVP - RefugIA

## 📌 1. Descripción General del Sistema

**RefugIA** es un sistema de gestión multi-refugio para emergencias y situaciones de catástrofe. Permite coordinar una red completa de establecimientos (Polideportivos, Escuelas, Centros Comunitarios) con sincronización de estado bidireccional entre el equipo de admisión (**Comunicadores Sociales**) y la **Administración / Coordinación General**.

Toda la información capturada durante los ingresos en puerta es inmediatamente accesible y consumida por el Administrador para controlar la ocupación de camas, demanda de raciones de alimentos y requerimientos médicos en tiempo real.

---

## 🏛️ 2. Arquitectura Multi-Refugio y Sincronización

El sistema administra múltiples establecimientos físicos en simultáneo:
- **Red de Refugios:** Cada refugio cuenta con su propia capacidad de camas, zonas internas, responsable a cargo e inventario específico de alimentos e insumos logísticos.
- **Sincronización en Tiempo Real:** Cuando el Comunicador Social registra a un evacuado seleccionando el refugio de albergue:
  1. La capacidad ocupada de ese refugio y de su zona específica se actualiza automáticamente.
  2. Los contadores demográficos globales (niños, adultos mayores, pacientes con condiciones crónicas) se sincronizan en los paneles del Administrador.
  3. Los requerimientos alimentarios especiales (viandas Sin TACC, dietas hipoalergénicas) quedan etiquetados para que el Administrador supervise la asignación de víveres en ese establecimiento.

---

## 📱 3. Pantallas por Rol de Usuario (Sidebar Lateral)

### 🛡️ A. Vistas del Administrador / Dueño del Refugio
1. **📊 Dashboard Global:** Visión panorámica de toda la red de refugios, porcentaje general de ocupación, alertas de insumos en rojo y total de evacuaos albergados.
2. **🏢 Gestión de Refugios:** Lista de refugios creados con modal de formulario para **"Crear Nuevo Refugio"** (Nombre, Dirección, Responsable, Capacidad de Camas, Tipo de Infraestructura).
3. **🔍 Detalle por Refugio:** Inspección profunda de un refugio seleccionado. Muestra la ocupación de sus zonas y su **inventario específico de alimentos** (raciones, bidones de agua, viandas Sin TACC) con botón de reabastecimiento.
4. **📦 Control General de Alimentos e Insumos:** Consolidado de existencias alimentarias y logísticas en toda la red con alertas de bajo stock.
5. **👥 Padrón Consolidado de Evacuados:** Tabla master de personas albergadas en todos los refugios con opción de exportación a CSV/Excel.
6. **📢 Bitácora & Anuncios:** Publicación de directivas e instrucciones para el personal operativo.

---

### 📋 B. Vistas del Comunicador Social (Ingresos)
1. **➕ Recepción e Ingreso Rápido de Evacuados:** Formulario ágil de admisión con selección de **Refugio de Destino**, datos personales, barrio de origen, banderas de vulnerabilidad y asignación de cama.
2. **👥 Padrón de Refugiados en Vivo:** Listado de permanencia con actualización de estado (*Ingresado, En tránsito, Derivado a Hospital, Egresado*).
3. **🔎 Reunificación Familiar Inter-Refugios:** Buscador inteligente que rastrea personas albergadas en **cualquier refugio de la red** por apellido o barrio de origen para reagrupar familias.
4. **🏥 Salud & Dietas Especiales:** Panel especializado para coordinar la entrega de alimentos Sin TACC, celíacos y seguimiento de pacientes crónicos o gestantes.
5. **📝 Reporte de Cierre de Guardia:** Resumen exportable para el traspaso de información con el turno entrante.

---

## 🔐 4. Módulo de Autenticación (Login & Registro)
- **Login:** Formulario con selector de perfil y botones de **⚡ Demo Rápida (1 Clic)** (*"Entrar como Admin"* / *"Entrar como Comunicador"*).
- **Registro:** Alta de operadores especificando nombre, email, contraseña y perfil asignado.
- **Cierre de Sesión:** Botón *"Salir"* en la barra superior.

---

## 🔗 5. Conexión con Backend / API Endpoints
Para conectar las pantallas con tu base de datos relacional (PostgreSQL / Prisma / REST API), las funciones en `context/ShelterContext.tsx` están aisladas:

```typescript
// Ejemplo: Alta de evacueado enviando al servidor
const addEvacuee = async (evacueeData) => {
  const res = await fetch('/api/evacuees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evacueeData),
  });
  if (res.ok) {
    const newEvacuee = await res.json();
    // actualizar estado local...
  }
};
```
