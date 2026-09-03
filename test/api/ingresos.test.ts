import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseMock, type QueryResult } from '../utils/supabaseMock';

const { getAuthenticatedUser } = vi.hoisted(() => ({ getAuthenticatedUser: vi.fn() }));

vi.mock('@/lib/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-auth')>();
  return { ...actual, getAuthenticatedUser };
});

const activeUser = { id: 'user-1', activo: true, rol: 'social' };

function mockAuth(user: unknown, profile: unknown, queue: QueryResult[] = []) {
  const supabase = createSupabaseMock(queue);
  getAuthenticatedUser.mockResolvedValue({ supabase, user, profile });
  return supabase;
}

function postRequest(body: unknown) {
  return new Request('http://localhost/api/ingresos', { method: 'POST', body: JSON.stringify(body) });
}

const basePersona = {
  tipo_documento: 'dni',
  numero_documento: '',
  apellido: 'Perez',
  nombre: 'Juan',
  genero: 'masculino',
};
const baseEstadia = { refugio_id: 1, vinculo: 'sin_vinculo' };

beforeEach(() => {
  getAuthenticatedUser.mockReset();
});

describe('POST /api/ingresos — validación de entrada', () => {
  it('devuelve 401 sin sesión', async () => {
    mockAuth(null, null);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: basePersona, estadia: baseEstadia }));
    expect(res.status).toBe(401);
  });

  it('devuelve 403 si la cuenta está inactiva', async () => {
    mockAuth({ id: 'u1' }, { activo: false });
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: basePersona, estadia: baseEstadia }));
    expect(res.status).toBe(403);
  });

  it('rechaza si falta persona o estadia', async () => {
    mockAuth(activeUser, activeUser);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: basePersona }));
    expect(res.status).toBe(400);
  });

  it('rechaza nombre/apellido demasiado cortos', async () => {
    mockAuth(activeUser, activeUser);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: { ...basePersona, apellido: 'P' }, estadia: baseEstadia }));
    expect(res.status).toBe(400);
  });

  it('rechaza refugio_id inválido', async () => {
    mockAuth(activeUser, activeUser);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: basePersona, estadia: { ...baseEstadia, refugio_id: 0 } }));
    expect(res.status).toBe(400);
  });

  it('rechaza tipo_documento no permitido', async () => {
    mockAuth(activeUser, activeUser);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: { ...basePersona, tipo_documento: 'cedula' }, estadia: baseEstadia }));
    expect(res.status).toBe(400);
  });

  it('rechaza género no permitido', async () => {
    mockAuth(activeUser, activeUser);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: { ...basePersona, genero: 'x' }, estadia: baseEstadia }));
    expect(res.status).toBe(400);
  });

  it('rechaza vínculo familiar no permitido', async () => {
    mockAuth(activeUser, activeUser);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: basePersona, estadia: { ...baseEstadia, vinculo: 'x' } }));
    expect(res.status).toBe(400);
  });

  it('rechaza fecha de nacimiento futura', async () => {
    mockAuth(activeUser, activeUser);
    const { POST } = await import('@/app/api/ingresos/route');
    const futura = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10);
    const res = await POST(
      postRequest({ persona: { ...basePersona, fecha_nacimiento: futura }, estadia: baseEstadia })
    );
    expect(res.status).toBe(400);
  });
});

describe('POST /api/ingresos — refugio y capacidad', () => {
  it('rechaza si el refugio no existe o está inactivo', async () => {
    mockAuth(activeUser, activeUser, [{ data: null }]);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: basePersona, estadia: baseEstadia }));
    expect(res.status).toBe(400);
  });

  it('rechaza si el refugio está lleno (count >= capacidad)', async () => {
    mockAuth(activeUser, activeUser, [{ data: { id: 1, capacidad: 5 } }, { count: 5 }]);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: basePersona, estadia: baseEstadia }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/plazas disponibles/);
  });

  it('permite el ingreso justo en el último cupo disponible', async () => {
    mockAuth(activeUser, activeUser, [
      { data: { id: 1, capacidad: 5 } },
      { count: 4 },
      { data: { id: 100, apellido: 'Perez', nombre: 'Juan' } }, // insert persona
      { data: { id: 500 } }, // insert estadia
    ]);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: basePersona, estadia: baseEstadia }));
    expect(res.status).toBe(201);
  });
});

describe('POST /api/ingresos — persona nueva (sin DNI o DNI no registrado)', () => {
  it('crea persona + estadía y devuelve 201', async () => {
    const supabase = mockAuth(activeUser, activeUser, [
      { data: { id: 1, capacidad: 10 } },
      { count: 2 },
      { data: { id: 100, apellido: 'Perez', nombre: 'Juan' } },
      { data: { id: 500, persona_id: 100 } },
    ]);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: basePersona, estadia: baseEstadia }));
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.persona.id).toBe(100);
    expect(body.estadia.id).toBe(500);
    expect(supabase.fromCalls).toEqual(['refugios', 'estadias', 'personas', 'estadias']);
  });
});

describe('POST /api/ingresos — DNI duplicado / reingreso', () => {
  const personaConDni = { ...basePersona, numero_documento: '30111222' };

  it('reutiliza la persona existente si el DNI ya está registrado y no tiene estadía activa', async () => {
    const supabase = mockAuth(activeUser, activeUser, [
      { data: { id: 1, capacidad: 10 } }, // refugio
      { count: 2 }, // count
      { data: { id: 55, apellido: 'Lopez', nombre: 'Ana' } }, // persona existente encontrada
      { data: null }, // sin estadía activa
      { data: { id: 600, persona_id: 55 } }, // insert estadia
    ]);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: personaConDni, estadia: baseEstadia }));
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.persona.id).toBe(55);
    // No debe haber un segundo insert en 'personas': solo refugios, estadias, personas, estadias, estadias
    expect(supabase.fromCalls).toEqual(['refugios', 'estadias', 'personas', 'estadias', 'estadias']);
  });

  it('rechaza el ingreso si la persona ya tiene una estadía activa (evita doble alojamiento)', async () => {
    mockAuth(activeUser, activeUser, [
      { data: { id: 1, capacidad: 10 } },
      { count: 2 },
      { data: { id: 55, apellido: 'Lopez', nombre: 'Ana' } },
      { data: { id: 999 } }, // ya tiene estadía activa
    ]);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: personaConDni, estadia: baseEstadia }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/ya está albergada/);
  });

  it('propaga el error si falla la búsqueda de persona por DNI', async () => {
    mockAuth(activeUser, activeUser, [
      { data: { id: 1, capacidad: 10 } },
      { count: 2 },
      { data: null, error: { message: 'timeout de conexión' } },
    ]);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(postRequest({ persona: personaConDni, estadia: baseEstadia }));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/ingresos — rollback ante errores', () => {
  it('si falla la creación del grupo familiar, borra la persona recién creada', async () => {
    const supabase = mockAuth(activeUser, activeUser, [
      { data: { id: 1, capacidad: 10 } },
      { count: 2 },
      { data: { id: 100, apellido: 'Perez', nombre: 'Juan' } }, // insert persona (nueva)
      { data: null, error: { message: 'codigo de grupo invalido' } }, // insert grupo falla
      { data: null }, // delete persona (rollback)
    ]);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(
      postRequest({
        persona: basePersona,
        estadia: baseEstadia,
        nuevo_grupo: { codigo: 'FAM-1', apellido_referencia: 'Perez' },
      })
    );
    expect(res.status).toBe(400);
    expect(supabase.fromCalls).toEqual(['refugios', 'estadias', 'personas', 'grupos_familiares', 'personas']);
    const deleteBuilder = supabase.from.mock.results[4].value as { delete: ReturnType<typeof vi.fn> };
    expect(deleteBuilder.delete).toHaveBeenCalled();
  });

  it('si falla la creación de la estadía, borra el grupo y la persona recién creados', async () => {
    const supabase = mockAuth(activeUser, activeUser, [
      { data: { id: 1, capacidad: 10 } },
      { count: 2 },
      { data: { id: 100, apellido: 'Perez', nombre: 'Juan' } }, // insert persona
      { data: { id: 20, codigo: 'FAM-1' } }, // insert grupo
      { data: null, error: { message: 'error insertando estadia' } }, // insert estadia falla
      { data: null }, // delete grupo
      { data: null }, // delete persona
    ]);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(
      postRequest({
        persona: basePersona,
        estadia: baseEstadia,
        nuevo_grupo: { codigo: 'FAM-1', apellido_referencia: 'Perez' },
      })
    );
    expect(res.status).toBe(400);
    expect(supabase.fromCalls).toEqual([
      'refugios',
      'estadias',
      'personas',
      'grupos_familiares',
      'estadias',
      'grupos_familiares',
      'personas',
    ]);
  });

  it('NO borra la persona si era una persona ya existente (reutilizada) y falla la estadía', async () => {
    const supabase = mockAuth(activeUser, activeUser, [
      { data: { id: 1, capacidad: 10 } }, // refugio
      { count: 2 }, // count
      { data: { id: 55, apellido: 'Lopez', nombre: 'Ana' } }, // persona existente
      { data: null }, // sin estadía activa
      { data: null, error: { message: 'error insertando estadia' } }, // insert estadia falla
    ]);
    const { POST } = await import('@/app/api/ingresos/route');
    const res = await POST(
      postRequest({ persona: { ...basePersona, numero_documento: '30111222' }, estadia: baseEstadia })
    );
    expect(res.status).toBe(400);
    // No debe haber ningún delete: la persona reutilizada no se toca.
    expect(supabase.fromCalls).toEqual(['refugios', 'estadias', 'personas', 'estadias', 'estadias']);
  });
});
