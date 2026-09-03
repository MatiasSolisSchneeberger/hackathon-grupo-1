import { NextResponse } from 'next/server';
import { badRequest, forbidden, getAuthenticatedUser, isActiveUser, unauthorized } from '@/lib/api-auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { supabase, user, profile } = await getAuthenticatedUser();
  if (!user || !profile) return unauthorized();
  if (!isActiveUser(profile)) return forbidden();
  if (profile.rol !== 'admin') return forbidden();

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    return badRequest('El ID del refugio no es válido.');
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

  if ('nombre' in body) {
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
    if (nombre.length < 3 || nombre.length > 120) {
      return badRequest('El nombre debe tener entre 3 y 120 caracteres.');
    }
    updateData.nombre = nombre;
  }

  if ('direccion' in body) {
    const direccion = typeof body.direccion === 'string' ? body.direccion.trim() : '';
    if (!direccion) return badRequest('La dirección no puede estar vacía.');
    updateData.direccion = direccion;
  }

  if ('localidad' in body) {
    const localidad = typeof body.localidad === 'string' ? body.localidad.trim() : '';
    updateData.localidad = localidad || 'Corrientes';
  }

  if ('capacidad' in body) {
    const capacidad = Number(body.capacidad);
    if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > 10000) {
      return badRequest('La capacidad debe estar entre 1 y 10.000.');
    }
    updateData.capacidad = capacidad;
  }

  if ('telefono' in body) {
    updateData.telefono = typeof body.telefono === 'string' ? body.telefono.trim() || null : null;
  }

  if ('referente' in body) {
    updateData.referente = typeof body.referente === 'string' ? body.referente.trim() || null : null;
  }

  if ('observaciones' in body) {
    updateData.observaciones = typeof body.observaciones === 'string' ? body.observaciones.trim() || null : null;
  }

  if ('latitud' in body) {
    updateData.latitud = body.latitud === '' || body.latitud == null ? null : Number(body.latitud);
  }

  if ('longitud' in body) {
    updateData.longitud = body.longitud === '' || body.longitud == null ? null : Number(body.longitud);
  }

  if ('activo' in body) {
    updateData.activo = Boolean(body.activo);
  }

  const { data, error } = await supabase
    .from('refugios')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, user, profile } = await getAuthenticatedUser();
  if (!user || !profile) return unauthorized();
  if (!isActiveUser(profile)) return forbidden();
  if (profile.rol !== 'admin') return forbidden();

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    return badRequest('El ID del refugio no es válido.');
  }

  const { data, error } = await supabase
    .from('refugios')
    .update({
      activo: false,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
