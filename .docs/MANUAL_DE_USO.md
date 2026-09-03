# Manual de Uso del Sistema - IRUPE (Alineado con Esquema Supabase / PostgreSQL)

## 📌 1. Mapeo de la Base de Datos con el Frontend

El sistema ha sido estructurado para mapear **1:1** las 6 tablas principales del esquema relacional:

| Tabla PostgreSQL | Mapeo en Frontend | Descripción / Uso |
| :--- | :--- | :--- |
| `public.perfiles` | `Perfil` | Usuarios del sistema (`administrador`, `trabajador_social`). |
| `public.refugios` | `Refugio` | Centros de albergue (`nombre`, `direccion`, `localidad`, `capacidad`, `telefono`, `referente`, `observaciones`, `latitud`, `longitud`). |
| `public.asignaciones` | `Asignacion` | Vinculación entre un `trabajador_social` y sus `refugios` autorizados. |
| `public.personas` | `Persona` | Padrón de personas (`tipo_documento`, `numero_documento`, `apellido`, `nombre`, `fecha_nacimiento`, `genero`, `telefono`, `observaciones`). |
| `public.grupos_familiares` | `GrupoFamiliar` | Núcleos familiares (`refugio_id`, `codigo`, `apellido_referencia`, `responsable_persona_id`, `domicilio_origen`). |
| `public.estadias` | `Estadia` | Registros de ingreso/egreso (`persona_id`, `refugio_id`, `fecha_ingreso`, `fecha_egreso`, `motivo_egreso`, `grupo_id`, `vinculo`). |

---

## 🛡️ 2. Vistas del Administrador

1. **📊 Dashboard General:** Indicadores consolidados de la red de refugios, cálculo de plazas ocupadas (`fecha_egreso IS NULL`) vs capacidad total (`public.refugios.capacidad`).
2. **🏢 Gestión de Refugios (`public.refugios`):** Listado y alta de nuevos refugios verificando las restricciones SQL (`capacidad` de 1 a 10.000, `localidad` por defecto 'Corrientes').
3. **👥 Estadías y Personas (`public.estadias` & `personas`):** Padrón general con filtros por refugio y estado (`Activas` vs `Egresadas`).
4. **🏠 Grupos Familiares (`public.grupos_familiares`):** Control de grupos familiares albergados por refugio.
5. **👤 Perfiles y Asignaciones (`public.perfiles` & `asignaciones`):** Listado de trabajadores sociales y sus refugios asignados.

---

## 📋 3. Vistas del Trabajador Social

1. **➕ Registrar Ingreso:** Formulario que da de alta simultáneamente la `Persona`, la `Estadía` en el refugio asignado y asocia o crea el `Grupo Familiar`.
2. **📋 Estadías Activas:** Lista de personas con estadías abiertas en el refugio. Permite presionar **"Registrar Egreso"** para completar `fecha_egreso` y `motivo_egreso`.
3. **👨‍👩‍👧 Grupos Familiares:** Gestión de grupos familiares del refugio (`codigo`, `apellido_referencia`, `domicilio_origen`).
4. **🔎 Búsqueda & Reunificación:** Buscador cruzado por apellido o número de documento que consulta todas las personas y estadías de la provincia para localizar familiares.
