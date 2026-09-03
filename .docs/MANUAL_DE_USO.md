# Manual de Uso y Documentación del MVP - RefugIA

## 📌 1. Descripción General del Sistema

**RefugIA** es un sistema de gestión para refugios de emergencia en situaciones de catástrofe o evacuaciones masivas (inundaciones, temporales, incendios). La plataforma ha sido diseñada para optimizar la toma de decisiones y acelerar la atención humana mediante dos vistas de rol diferenciadas y coordinadas en tiempo real.

El prototipo (MVP) incluye un módulo de **Autenticación (Login & Registro)** estilizado con la misma identidad visual (Shadcn UI + Tailwind CSS) que dirige a cada usuario a su panel correspondiente según su rol.

---

## 🔐 2. Módulo de Autenticación (Login & Registro)

El acceso al sistema requiere identificación de usuario:

1. **Iniciar Sesión (`LoginForm.tsx`):**
   - Ingreso con Correo Electrónico y Contraseña.
   - Selección de Perfil (*Administrador / Dueño* o *Comunicador Social*).
   - **⚡ Botones Demo Rápida (1 Clic):** Permiten iniciar sesión al instante con perfiles de prueba precargados para presentaciones y evaluaciones del MVP (*"Entrar como Admin"* y *"Entrar como Comunicador"*).
2. **Crear Cuenta (`RegisterForm.tsx`):**
   - Alta de operador especificando Nombre, Correo, Contraseña y Rol asignado.
   - Validación de coincidencia de contraseña.
3. **Cierre de Sesión:**
   - Botón *"Salir / Cerrar Sesión"* disponible en la barra superior.

---

## 👥 3. Vistas y Roles del Sistema

### 🛡️ A. Vista Administrador / Dueño del Refugio
Diseñada para el coordinador o dueño del refugio que necesita una visión panorámica de la operación.

**Funcionalidades Clave:**
1. **KPIs en Tiempo Real:**
   - **Capacidad Total y Ocupación (%):** Gráficos y barras de progreso por zonas (Zona A: Ala Familias, Zona B: Adultos Mayores/Salud, Zona C: Alojamiento General, Zona D: Atención Médica).
   - **Población Evacuada:** Conteo total de personas albergadas con desglose automático de grupos vulnerables (niños, adultos mayores, pacientes con enfermedades crónicas/movilidad reducida).
   - **Alertas de Insumos Críticos:** Indicadores visuales de bajo stock (Agua potable, raciones de alimento, frazadas, kits de higiene).
2. **Control de Inventario e Insumos:**
   - Visualización por categoría.
   - Modal interactivo de **Reabastecimiento (+ Stock)** que actualiza inmediatamente el estado de los artículos.
3. **Padrón Consolidado:**
   - Búsqueda global por DNI, Nombre o Barrio.
   - Filtros por zona de alojamiento y por estado (Ingresado, En tránsito, Derivado a Hospital, Egresado).
   - Simulación de exportación a planilla Excel / CSV.
4. **Bitácora y Anuncios Operativos:**
   - Formulario para emitir alertas o instrucciones urgentes para el personal del refugio.

---

### 📋 B. Vista Comunicador Social / Ingreso de Evacuados
Diseñada para el equipo de admisión, trabajo social y recepción en puerta de los evacuados.

**Funcionalidades Clave:**
1. **Formulario de Registro Rápido:**
   - **Datos Personales:** Nombre, Apellido, DNI, Edad, Género, Teléfono.
   - **Origen y Causa:** Barrio de origen y motivo de evacuación (inundación, incendio, temporal, etc.).
   - **Evaluación de Vulnerabilidad y Salud:** Banderas de alerta (*Menor de Edad, Adulto Mayor, Embarazo, Movilidad Reducida, Condición Crónica*) y notas de requerimientos alimentarios (Sin TACC, Hipoalergénico).
   - **Asignación de Cama y Zona:** Selección de zona disponible y código de módulo/cama.
   - **Vínculo Familiar:** Registro de código de grupo familiar y rol (Jefe de hogar, cónyuge, hijo, etc.).
2. **Padrón en Vivo:**
   - Tabla interactiva con cambio inmediato de estado (*Ingresado, En tránsito, Derivado a Hospital, Egresado*).
3. **Herramienta de Reunificación Familiar:**
   - Buscador especializado para consultar integrantes de una misma familia o personas del mismo barrio, facilitando la reunificación familiar o atención por rescatistas.
4. **Resumen de Cierre de Guardia / Turno:**
   - Informe sintético para el traspaso de información con la siguiente guardia.

---

## 🚀 4. Guía de Prueba Interactiva del MVP

1. **Abrir la Aplicación:** Ejecutar `npm run dev` y navegar a `http://localhost:3000`.
2. **Pantalla de Inicio de Sesión:**
   - Probar los botones de **⚡ Demo Rápida** (*"Entrar como Admin"* o *"Entrar como Comunicador"*).
   - O crear un nuevo usuario desde *"Registrarse aquí"*.
3. **Simular el Ingreso de un Nuevo Evacuado:**
   - Ingresar con el perfil de Comunicador Social.
   - Ir a **Formulario de Ingreso Rápido**, completar los datos y presionar **Completar e Ingresar Evacuado**.
4. **Verificar Sincronización Inmediata:**
   - Cambiar a la vista de Administrador (usando el conmutador superior o cerrando sesión e ingresando como Admin).
   - Notará que el indicador de capacidad total aumentó y el nuevo evacuado aparece en el Padrón Consolidado.
5. **Reabastecer Insumos:**
   - En la vista de Administrador, ir a **Control de Inventario**.
   - Hacer clic en **+ Reabastecer**, sumar existencias y confirmar.

---

## 🔗 5. Cómo Conectar con Backend / API Externa

Las funciones de autenticación en `context/ShelterContext.tsx` están estructuradas para reemplazarse directamente con peticiones `fetch()` / `axios`:

```typescript
// Ejemplo de conexión con backend propio:
const login = async (email: string, password: string, role: UserRole) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  const data = await res.json();
  if (res.ok) {
    setCurrentUser(data.user);
    // guardar token JWT si aplica...
  }
};
```
