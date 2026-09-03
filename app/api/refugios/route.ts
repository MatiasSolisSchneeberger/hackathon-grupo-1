import { NextResponse } from 'next/server';
import { badRequest, forbidden, getActiveAuthenticatedUser, getAuthenticatedUser, isActiveUser, unauthorized } from '@/lib/api-auth';

export async function GET() {
  const { supabase, response } = await getActiveAuthenticatedUser();
  if (response) return response;

  const { data, error } = await supabase.from('refugios').select('*').order('nombre');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const { supabase, user, profile } = await getAuthenticatedUser();
  if (!user || !profile) return unauthorized();
  if (!isActiveUser(profile)) return forbidden();
  if (profile.rol !== 'admin') return forbidden();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest('El cuerpo de la solicitud no es JSON válido.');
  }

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const direccion = typeof body.direccion === 'string' ? body.direccion.trim() : '';
  const localidad = typeof body.localidad === 'string' && body.localidad.trim() ? body.localidad.trim() : 'Corrientes';
  const capacidad = Number(body.capacidad);

  if (nombre.length < 3 || nombre.length > 120) return badRequest('El nombre debe tener entre 3 y 120 caracteres.');
  if (!direccion) return badRequest('La dirección es obligatoria.');
  if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > 10000) return badRequest('La capacidad debe estar entre 1 y 10.000.');

  const { data, error } = await supabase.from('refugios').insert({
    nombre,
    direccion,
    localidad,
    capacidad,
    telefono: typeof body.telefono === 'string' ? body.telefono.trim() || null : null,
    referente: typeof body.referente === 'string' ? body.referente.trim() || null : null,
    observaciones: typeof body.observaciones === 'string' ? body.observaciones.trim() || null : null,
    latitud: body.latitud === '' || body.latitud == null ? null : Number(body.latitud),
    longitud: body.longitud === '' || body.longitud == null ? null : Number(body.longitud),
    creado_por: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
