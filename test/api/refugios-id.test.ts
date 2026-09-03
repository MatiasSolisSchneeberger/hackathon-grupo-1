import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseMock, type QueryResult } from '../utils/supabaseMock';

const { getAuthenticatedUser } = vi.hoisted(() => ({ getAuthenticatedUser: vi.fn() }));

vi.mock('@/lib/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-auth')>();
  return { ...actual, getAuthenticatedUser };
});

const activeAdmin = { id: 'user-1', activo: true, rol: 'admin' };
const activeNonAdmin = { id: 'user-2', activo: true, rol: 'social' };

function mockAuth(user: unknown, profile: unknown, queue: QueryResult[] = []) {
  const supabase = createSupabaseMock(queue);
  getAuthenticatedUser.mockResolvedValue({ supabase, user, profile });
  return supabase;
}

function patchRequest(body: unknown) {
  return new Request('http://localhost/api/refugios/1', { method: 'PATCH', body: JSON.stringify(body) });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  getAuthenticatedUser.mockReset();
});

describe('PATCH /api/refugios/[id]', () => {
  it('devuelve 401 sin sesión', async () => {
    mockAuth(null, null);
    const { PATCH } = await import('@/app/api/refugios/[id]/route');
    const res = await PATCH(patchRequest({ nombre: 'X' }), ctx('1'));
    expect(res.status).toBe(401);
  });

  it('devuelve 403 si el usuario no es admin', async () => {
    mockAuth(activeNonAdmin, activeNonAdmin);
    const { PATCH } = await import('@/app/api/refugios/[id]/route');
    const res = await PATCH(patchRequest({ nombre: 'Refugio Editado' }), ctx('1'));
    expect(res.status).toBe(403);
  });

  it('rechaza un id no numérico', async () => {
    mockAuth(activeAdmin, activeAdmin);
    const { PATCH } = await import('@/app/api/refugios/[id]/route');
    const res = await PATCH(patchRequest({ nombre: 'Refugio Editado' }), ctx('no-es-numero'));
    expect(res.status).toBe(400);
  });

  it('rechaza un id <= 0', async () => {
    mockAuth(activeAdmin, activeAdmin);
    const { PATCH } = await import('@/app/api/refugios/[id]/route');
    const res = await PATCH(patchRequest({ nombre: 'Refugio Editado' }), ctx('0'));
    expect(res.status).toBe(400);
  });

  it('rechaza JSON inválido', async () => {
    mockAuth(activeAdmin, activeAdmin);
    const { PATCH } = await import('@/app/api/refugios/[id]/route');
    const req = new Request('http://localhost/api/refugios/1', { method: 'PATCH', body: '{bad' });
    const res = await PATCH(req, ctx('1'));
    expect(res.status).toBe(400);
  });

  it('rechaza nombre fuera de rango cuando se intenta cambiar', async () => {
    mockAuth(activeAdmin, activeAdmin);
    const { PATCH } = await import('@/app/api/refugios/[id]/route');
    const res = await PATCH(patchRequest({ nombre: 'ab' }), ctx('1'));
    expect(res.status).toBe(400);
  });

  it('rechaza capacidad fuera de rango cuando se intenta cambiar', async () => {
    mockAuth(activeAdmin, activeAdmin);
    const { PATCH } = await import('@/app/api/refugios/[id]/route');
    const res = await PATCH(patchRequest({ capacidad: 0 }), ctx('1'));
    expect(res.status).toBe(400);
  });

  it('solo actualiza los campos enviados (patch parcial)', async () => {
    const supabase = mockAuth(activeAdmin, activeAdmin, [{ data: { id: 1, nombre: 'Nuevo nombre' } }]);
    const { PATCH } = await import('@/app/api/refugios/[id]/route');
    const res = await PATCH(patchRequest({ nombre: 'Nuevo nombre' }), ctx('1'));
    expect(res.status).toBe(200);
    const builder = supabase.from.mock.results[0].value as { update: ReturnType<typeof vi.fn> };
    const updatePayload = builder.update.mock.calls[0][0];
    expect(updatePayload).toHaveProperty('nombre', 'Nuevo nombre');
    expect(updatePayload).not.toHaveProperty('direccion');
    expect(updatePayload).not.toHaveProperty('capacidad');
  });

  it('devuelve 400 si Supabase no encuentra el refugio (single() sin filas)', async () => {
    mockAuth(activeAdmin, activeAdmin, [
      { data: null, error: { message: 'JSON object requested, multiple (or no) rows returned' } },
    ]);
    const { PATCH } = await import('@/app/api/refugios/[id]/route');
    const res = await PATCH(patchRequest({ nombre: 'Refugio Editado' }), ctx('999999'));
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/refugios/[id] (desactivar)', () => {
  it('devuelve 401 sin sesión', async () => {
    mockAuth(null, null);
    const { DELETE } = await import('@/app/api/refugios/[id]/route');
    const res = await DELETE(new Request('http://localhost/api/refugios/1', { method: 'DELETE' }), ctx('1'));
    expect(res.status).toBe(401);
  });

  it('devuelve 403 si el usuario no es admin', async () => {
    mockAuth(activeNonAdmin, activeNonAdmin);
    const { DELETE } = await import('@/app/api/refugios/[id]/route');
    const res = await DELETE(new Request('http://localhost/api/refugios/1', { method: 'DELETE' }), ctx('1'));
    expect(res.status).toBe(403);
  });

  it('marca el refugio como activo=false en vez de borrarlo', async () => {
    const supabase = mockAuth(activeAdmin, activeAdmin, [{ data: { id: 1, activo: false } }]);
    const { DELETE } = await import('@/app/api/refugios/[id]/route');
    const res = await DELETE(new Request('http://localhost/api/refugios/1', { method: 'DELETE' }), ctx('1'));
    expect(res.status).toBe(200);
    const builder = supabase.from.mock.results[0].value as { update: ReturnType<typeof vi.fn> };
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ activo: false }));
  });
});
