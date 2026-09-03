import { NextResponse } from 'next/server';
import { badRequest, getAuthenticatedUser, isActiveUser, unauthorized } from '@/lib/api-auth';

export async function POST(request: Request) {
  const { supabase, user, profile } = await getAuthenticatedUser();
  if (!user || !profile) return unauthorized();
  if (!isActiveUser(profile)) return NextResponse.json({ error: 'Tu cuenta está inactiva.' }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest('El cuerpo de la solicitud no es JSON válido.');
  }

  const refugioId = Number(body.refugio_id);
  const codigo = typeof body.codigo === 'string' ? body.codigo.trim().toUpperCase() : '';
  const apellido = typeof body.apellido_referencia === 'string' ? body.apellido_referencia.trim() : '';
  if (!Number.isInteger(refugioId) || refugioId < 1) return badRequest('El refugio es obligatorio.');
  if (!codigo || codigo.length > 120) return badRequest('El código del grupo es obligatorio.');
  if (apellido.length < 2) return badRequest('El apellido de referencia debe tener al menos 2 caracteres.');

  const { data: refugio } = await supabase.from('refugios').select('id').eq('id', refugioId).eq('activo', true).maybeSingle();
  if (!refugio) return badRequest('El refugio seleccionado no existe o está inactivo.');

  const { data, error } = await supabase.from('grupos_familiares').insert({
    refugio_id: refugioId,
    codigo,
    apellido_referencia: apellido,
    domicilio_origen: typeof body.domicilio_origen === 'string' ? body.domicilio_origen.trim() || null : null,
    observaciones: typeof body.observaciones === 'string' ? body.observaciones.trim() || null : null,
    creado_por: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.code === '23505' ? 'El código del grupo ya existe.' : error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
