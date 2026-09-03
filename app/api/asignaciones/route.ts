import { NextResponse } from 'next/server';
import { badRequest, forbidden, getAuthenticatedUser, isActiveUser, unauthorized } from '@/lib/api-auth';

export async function GET() {
  const { supabase, user, profile } = await getAuthenticatedUser();
  if (!user || !profile) return unauthorized();
  if (!isActiveUser(profile)) return forbidden();

  const { data, error } = await supabase
    .from('asignaciones')
    .select('*')
    .order('refugio_id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { supabase, user, profile } = await getAuthenticatedUser();
  if (!user || !profile) return unauthorized();
  if (!isActiveUser(profile) || profile.rol !== 'admin') return forbidden();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest('El cuerpo de la solicitud no es JSON válido.');
  }

  const usuarioId = typeof body.usuario_id === 'string' ? body.usuario_id : '';
  const refugioId = Number(body.refugio_id);
  if (!usuarioId || !Number.isInteger(refugioId) || refugioId < 1) return badRequest('Usuario y refugio son obligatorios.');

  const { data, error } = await supabase.from('asignaciones').insert({ usuario_id: usuarioId, refugio_id: refugioId, creado_por: user.id }).select().single();
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'La asignación ya existe.' : error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const { supabase, user, profile } = await getAuthenticatedUser();
  if (!user || !profile) return unauthorized();
  if (!isActiveUser(profile) || profile.rol !== 'admin') return forbidden();

  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('usuario_id') || '';
  const refugioId = Number(searchParams.get('refugio_id'));
  if (!usuarioId || !Number.isInteger(refugioId) || refugioId < 1) return badRequest('Usuario y refugio son obligatorios.');

  const { error } = await supabase.from('asignaciones').delete().eq('usuario_id', usuarioId).eq('refugio_id', refugioId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
