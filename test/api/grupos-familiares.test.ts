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
  return new Request('http://localhost/api/grupos-familiares', { method: 'POST', body: JSON.stringify(body) });
}

beforeEach(() => {
  getAuthenticatedUser.mockReset();
});

describe('GET /api/grupos-familiares', () => {
  it('devuelve 401 sin sesión', async () => {
    mockAuth(null, null);
    const { GET } = await import('@/app/api/grupos-familiares/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('devuelve la lista ordenada por creado_en desc', async () => {
    const supabase = mockAuth(activeUser, activeUser, [{ data: [{ id: 1, codigo: 'FAM-1' }] }]);
    const { GET } = await import('@/app/api/grupos-familiares/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const builder = supabase.from.mock.results[0].value as { order: ReturnType<typeof vi.fn> };
    expect(builder.order).toHaveBeenCalledWith('creado_en', { ascending: false });
  });
});

describe('POST /api/grupos-familiares', () => {
  const validBody = { refugio_id: 1, codigo: 'fam-1', apellido_referencia: 'Gomez' };

  it('devuelve 403 si el usuario está inactivo', async () => {
    mockAuth({ id: 'u1' }, { activo: false });
    const { POST } = await import('@/app/api/grupos-familiares/route');
    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(403);
  });

  it('rechaza refugio_id inválido', async () => {
    mockAuth(activeUser, activeUser);
    const { POST } = await import('@/app/api/grupos-familiares/route');
    const res = await POST(postRequest({ ...validBody, refugio_id: 0 }));
    expect(res.status).toBe(400);
  });

  it('rechaza código vacío', async () => {
    mockAuth(activeUser, activeUser);
    const { POST } = await import('@/app/api/grupos-familiares/route');
    const res = await POST(postRequest({ ...validBody, codigo: '  ' }));
    expect(res.status).toBe(400);
  });

  it('rechaza apellido de referencia demasiado corto', async () => {
    mockAuth(activeUser, activeUser);
    const { POST } = await import('@/app/api/grupos-familiares/route');
    const res = await POST(postRequest({ ...validBody, apellido_referencia: 'G' }));
    expect(res.status).toBe(400);
  });

  it('normaliza el código a mayúsculas', async () => {
    const supabase = mockAuth(activeUser, activeUser, [
      { data: { id: 1, activo: true } }, // refugio existe
      { data: { id: 10, codigo: 'FAM-1' } }, // insert
    ]);
    const { POST } = await import('@/app/api/grupos-familiares/route');
    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(201);
    const insertBuilder = supabase.from.mock.results[1].value as { insert: ReturnType<typeof vi.fn> };
    expect(insertBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ codigo: 'FAM-1' }));
  });

  it('rechaza si el refugio no existe o está inactivo', async () => {
    mockAuth(activeUser, activeUser, [{ data: null }]);
    const { POST } = await import('@/app/api/grupos-familiares/route');
    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(400);
  });

  it('traduce el error de código duplicado (23505) a un mensaje claro', async () => {
    mockAuth(activeUser, activeUser, [
      { data: { id: 1, activo: true } },
      { data: null, error: { message: 'duplicate key', code: '23505' } },
    ]);
    const { POST } = await import('@/app/api/grupos-familiares/route');
    const res = await POST(postRequest(validBody));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBe('El código del grupo ya existe.');
  });
});
