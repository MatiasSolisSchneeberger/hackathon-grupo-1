import { NextResponse } from 'next/server';
import { badRequest, forbidden, getAuthenticatedUser, isActiveUser, unauthorized } from '@/lib/api-auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const roles = new Set(['admin', 'trabajador_social']);

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, user, profile } = await getAuthenticatedUser();
  if (!user || !profile) return unauthorized();
  if (!isActiveUser(profile)) return forbidden();
  if (profile.rol !== 'admin') return forbidden();

  const { id } = await context.params;
  if (id === user.id) {
    return badRequest('No podés modificar tu propio rol o estado desde este panel.');
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest('El cuerpo de la solicitud no es JSON válido.');
  }

  const updateData: Record<string, unknown> = {
    actualizado_en: new Date().toISOString(),
  };

  if ('rol' in body) {
    if (typeof body.rol !== 'string' || !roles.has(body.rol)) {
      return badRequest('El rol no es válido.');
    }
    updateData.rol = body.rol;
  }

  if ('activo' in body) {
    updateData.activo = Boolean(body.activo);
  }

  const { data, error } = await supabase
    .from('perfiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
