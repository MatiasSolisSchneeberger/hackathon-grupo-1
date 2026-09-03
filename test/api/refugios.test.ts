import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseMock, type QueryResult } from '../utils/supabaseMock';

const { getAuthenticatedUser } = vi.hoisted(() => ({ getAuthenticatedUser: vi.fn() }));

vi.mock('@/lib/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-auth')>();
  return { ...actual, getAuthenticatedUser };
});

const activeAdmin = { id: 'user-1', activo: true, rol: 'admin' };

function mockAuth(user: unknown, profile: unknown, queue: QueryResult[] = []) {
  const supabase = createSupabaseMock(queue);
  getAuthenticatedUser.mockResolvedValue({ supabase, user, profile });
  return supabase;
}

function postRequest(body: unknown) {
  return new Request('http://localhost/api/refugios', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  getAuthenticatedUser.mockReset();
});

describe('GET /api/refugios', () => {
  it('devuelve 401 si no hay usuario autenticado', async () => {
    mockAuth(null, null);
    const { GET } = await import('@/app/api/refugios/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('devuelve 403 si el usuario está inactivo', async () => {
    mockAuth({ id: 'u1' }, { activo: false, rol: 'social' });
    const { GET } = await import('@/app/api/refugios/route');
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('devuelve la lista de refugios cuando todo está OK', async () => {
    mockAuth(activeAdmin, activeAdmin, [{ data: [{ id: 1, nombre: 'Refugio A' }] }]);
    const { GET } = await import('@/app/api/refugios/route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual([{ id: 1, nombre: 'Refugio A' }]);
  });

  it('devuelve [] en vez de null cuando Supabase no trae datos', async () => {
    mockAuth(activeAdmin, activeAdmin, [{ data: null }]);
    const { GET } = await import('@/app/api/refugios/route');
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it('devuelve 500 si Supabase falla', async () => {
    mockAuth(activeAdmin, activeAdmin, [{ data: null, error: { message: 'db down' } }]);
    const { GET } = await import('@/app/api/refugios/route');
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe('POST /api/refugios', () => {
  it('devuelve 401 sin sesión', async () => {
    mockAuth(null, null);
    const { POST } = await import('@/app/api/refugios/route');
    const res = await POST(postRequest({}));
    expect(res.status).toBe(401);
  });

  it('devuelve 403 si el usuario no es admin', async () => {
    mockAuth({ id: 'u1' }, { activo: true, rol: 'social' });
    const { POST } = await import('@/app/api/refugios/route');
    const res = await POST(postRequest({ nombre: 'Refugio Norte', direccion: 'Calle 1', capacidad: 10 }));
    expect(res.status).toBe(403);
  });

  it('rechaza un JSON inválido en el body', async () => {
    mockAuth(activeAdmin, activeAdmin);
    const { POST } = await import('@/app/api/refugios/route');
    const req = new Request('http://localhost/api/refugios', { method: 'POST', body: '{invalido' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rechaza nombre demasiado corto', async () => {
    mockAuth(activeAdmin, activeAdmin);
    const { POST } = await import('@/app/api/refugios/route');
    const res = await POST(postRequest({ nombre: 'ab', direccion: 'Calle 1', capacidad: 10 }));
    expect(res.status).toBe(400);
  });

  it('rechaza dirección vacía', async () => {
    mockAuth(activeAdmin, activeAdmin);
    const { POST } = await import('@/app/api/refugios/route');
    const res = await POST(postRequest({ nombre: 'Refugio Norte', direccion: '  ', capacidad: 10 }));
    expect(res.status).toBe(400);
  });

  it.each([0, -5, 10001, 1.5, NaN])('rechaza capacidad inválida: %s', async (capacidad) => {
    mockAuth(activeAdmin, activeAdmin);
    const { POST } = await import('@/app/api/refugios/route');
    const res = await POST(postRequest({ nombre: 'Refugio Norte', direccion: 'Calle 1', capacidad }));
    expect(res.status).toBe(400);
  });

  it('usa "Corrientes" como localidad por defecto cuando no se envía', async () => {
    const supabase = mockAuth(activeAdmin, activeAdmin, [
      { data: { id: 5, nombre: 'Refugio Norte', localidad: 'Corrientes' } },
    ]);
    const { POST } = await import('@/app/api/refugios/route');
    const res = await POST(postRequest({ nombre: 'Refugio Norte', direccion: 'Calle 1', capacidad: 10 }));
    expect(res.status).toBe(201);
    const builder = supabase.from.mock.results[0].value as { insert: ReturnType<typeof vi.fn> };
    expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({ localidad: 'Corrientes' }));
  });

  it('crea el refugio y devuelve 201 con los datos', async () => {
    mockAuth(activeAdmin, activeAdmin, [{ data: { id: 5, nombre: 'Refugio Norte' } }]);
    const { POST } = await import('@/app/api/refugios/route');
    const res = await POST(postRequest({ nombre: 'Refugio Norte', direccion: 'Calle 1', capacidad: 10 }));
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body).toEqual({ id: 5, nombre: 'Refugio Norte' });
  });

  it('devuelve 400 si Supabase rechaza el insert', async () => {
    mockAuth(activeAdmin, activeAdmin, [{ data: null, error: { message: 'constraint violada' } }]);
    const { POST } = await import('@/app/api/refugios/route');
    const res = await POST(postRequest({ nombre: 'Refugio Norte', direccion: 'Calle 1', capacidad: 10 }));
    expect(res.status).toBe(400);
  });
});
