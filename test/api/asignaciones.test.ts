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

function postRequest(body: unknown) {
  return new Request('http://localhost/api/asignaciones', { method: 'POST', body: JSON.stringify(body) });
}

beforeEach(() => {
  getAuthenticatedUser.mockReset();
});

describe('GET /api/asignaciones', () => {
  it('devuelve 401 sin sesión', async () => {
    mockAuth(null, null);
    const { GET } = await import('@/app/api/asignaciones/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('devuelve la lista de asignaciones', async () => {
    mockAuth(activeAdmin, activeAdmin, [{ data: [{ id: 1, usuario_id: 'u1', refugio_id: 1 }] }]);
    const { GET } = await import('@/app/api/asignaciones/route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
  });
});

describe('POST /api/asignaciones', () => {
  it('rechaza usuarios no admin (solo admin puede asignar)', async () => {
    mockAuth(activeNonAdmin, activeNonAdmin);
    const { POST } = await import('@/app/api/asignaciones/route');
    const res = await POST(postRequest({ usuario_id: 'u2', refugio_id: 1 }));
    expect(res.status).toBe(403);
  });

  it('rechaza si falta usuario_id', async () => {
    mockAuth(activeAdmin, activeAdmin);
    const { POST } = await import('@/app/api/asignaciones/route');
    const res = await POST(postRequest({ refugio_id: 1 }));
    expect(res.status).toBe(400);
  });

  it('rechaza refugio_id inválido', async () => {
    mockAuth(activeAdmin, activeAdmin);
    const { POST } = await import('@/app/api/asignaciones/route');
    const res = await POST(postRequest({ usuario_id: 'u2', refugio_id: 'no-numero' }));
    expect(res.status).toBe(400);
  });

  it('crea la asignación con 201', async () => {
    mockAuth(activeAdmin, activeAdmin, [{ data: { id: 3, usuario_id: 'u2', refugio_id: 1 } }]);
    const { POST } = await import('@/app/api/asignaciones/route');
    const res = await POST(postRequest({ usuario_id: 'u2', refugio_id: 1 }));
    expect(res.status).toBe(201);
  });

  it('traduce el error de asignación duplicada (23505)', async () => {
    mockAuth(activeAdmin, activeAdmin, [{ data: null, error: { message: 'duplicate key', code: '23505' } }]);
    const { POST } = await import('@/app/api/asignaciones/route');
    const res = await POST(postRequest({ usuario_id: 'u2', refugio_id: 1 }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('La asignación ya existe.');
  });
});
