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

  const estadiaId = Number(body.estadia_id);
  const motivo = typeof body.motivo_egreso === 'string' ? body.motivo_egreso.trim() : '';
  if (!Number.isInteger(estadiaId) || estadiaId < 1 || !motivo) return badRequest('La estadía y el motivo son obligatorios.');

  const { data, error } = await supabase.from('estadias').update({
    fecha_egreso: new Date().toISOString(),
    motivo_egreso: motivo,
    observaciones: typeof body.observaciones === 'string' ? body.observaciones.trim() || null : null,
    egreso_registrado_por: user.id,
    actualizado_en: new Date().toISOString(),
  }).eq('id', estadiaId).is('fecha_egreso', null).select().single();

  if (error) return NextResponse.json({ error: error.code === 'PGRST116' ? 'La estadía no existe o ya fue egresada.' : error.message }, { status: 400 });
  return NextResponse.json(data, { status: 200 });
}
