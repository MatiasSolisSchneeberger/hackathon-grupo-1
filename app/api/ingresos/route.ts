import { NextResponse } from 'next/server';
import { badRequest, getAuthenticatedUser, isActiveUser, unauthorized } from '@/lib/api-auth';

const tiposDocumento = new Set(['dni', 'pasaporte', 'otro']);
const generos = new Set(['femenino', 'masculino', 'otro', 'no_declara']);
const vinculos = new Set([
  'responsable',
  'conyuge',
  'hijo_a',
  'padre_madre',
  'hermano_a',
  'otro_familiar',
  'sin_vinculo',
]);

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

  const persona = body.persona as Record<string, unknown> | undefined;
  const estadia = body.estadia as Record<string, unknown> | undefined;
  if (!persona || !estadia) return badRequest('Los datos de persona y estadía son obligatorios.');
  if (String(persona.apellido || '').trim().length < 2 || String(persona.nombre || '').trim().length < 2) {
    return badRequest('Nombre y apellido deben tener al menos 2 caracteres.');
  }

  const refugioId = Number(estadia.refugio_id);
  if (!Number.isInteger(refugioId) || refugioId < 1) return badRequest('El refugio es obligatorio.');
  if (typeof persona.tipo_documento !== 'string' || !tiposDocumento.has(persona.tipo_documento)) {
    return badRequest('El tipo de documento no es válido.');
  }
  if (typeof persona.genero !== 'string' || !generos.has(persona.genero)) {
    return badRequest('El género no es válido.');
  }
  if (typeof estadia.vinculo !== 'string' || !vinculos.has(estadia.vinculo)) {
    return badRequest('El vínculo familiar no es válido.');
  }
  if (typeof persona.fecha_nacimiento === 'string' && persona.fecha_nacimiento) {
    const nacimiento = new Date(`${persona.fecha_nacimiento}T00:00:00Z`);
    if (Number.isNaN(nacimiento.getTime()) || nacimiento > new Date()) {
      return badRequest('La fecha de nacimiento no puede ser futura.');
    }
  }
  const { data: refugio } = await supabase.from('refugios').select('id, capacidad').eq('id', refugioId).eq('activo', true).maybeSingle();
  if (!refugio) return badRequest('El refugio no existe o está inactivo.');

  const { count } = await supabase.from('estadias').select('id', { count: 'exact', head: true }).eq('refugio_id', refugioId).is('fecha_egreso', null);
  if ((count || 0) >= refugio.capacidad) return badRequest('El refugio no tiene plazas disponibles.');

  const dni = typeof persona.numero_documento === 'string' ? persona.numero_documento.trim() : '';
  let existingPersonaId: string | null = null;
  if (dni) {
    const dniNorm = dni.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const { data: duplicate } = await supabase
      .from('personas')
      .select('id')
      .eq('tipo_documento', persona.tipo_documento)
      .eq('numero_documento_norm', dniNorm)
      .maybeSingle();
    if (duplicate) {
      existingPersonaId = duplicate.id;
      const { data: activeStay } = await supabase
        .from('estadias')
        .select('id')
        .eq('persona_id', existingPersonaId)
        .is('fecha_egreso', null)
        .maybeSingle();
      if (activeStay) return badRequest('La persona ya tiene una estadía activa.');
    }
  }

  const personaPayload = {
    tipo_documento: persona.tipo_documento,
    numero_documento: dni || null,
    apellido: String(persona.apellido).trim(),
    nombre: String(persona.nombre).trim(),
    fecha_nacimiento: typeof persona.fecha_nacimiento === 'string' ? persona.fecha_nacimiento : null,
    genero: persona.genero,
    telefono: typeof persona.telefono === 'string' ? persona.telefono.trim() || null : null,
    observaciones: typeof persona.observaciones === 'string' ? persona.observaciones.trim() || null : null,
  };

  const personaQuery = existingPersonaId
    ? supabase.from('personas').update({ ...personaPayload, actualizado_en: new Date().toISOString() }).eq('id', existingPersonaId).select().single()
    : supabase.from('personas').insert({ ...personaPayload, creado_por: user.id }).select().single();
  const { data: savedPersona, error: personaError } = await personaQuery;
  if (personaError) return NextResponse.json({ error: personaError.message }, { status: 400 });

  let grupoId = estadia.grupo_id ? Number(estadia.grupo_id) : null;
  const nuevoGrupo = body.nuevo_grupo as Record<string, unknown> | undefined;
  if (nuevoGrupo) {
    const { data: grupo, error: grupoError } = await supabase.from('grupos_familiares').insert({
      refugio_id: refugioId,
      codigo: String(nuevoGrupo.codigo || '').trim().toUpperCase(),
      apellido_referencia: String(nuevoGrupo.apellido_referencia || persona.apellido).trim(),
      domicilio_origen: typeof nuevoGrupo.domicilio_origen === 'string' ? nuevoGrupo.domicilio_origen.trim() || null : null,
      observaciones: typeof nuevoGrupo.observaciones === 'string' ? nuevoGrupo.observaciones.trim() || null : null,
      responsable_persona_id: estadia.vinculo === 'responsable' ? savedPersona.id : null,
      creado_por: user.id,
    }).select().single();
    if (grupoError) {
      if (!existingPersonaId) await supabase.from('personas').delete().eq('id', savedPersona.id);
      return NextResponse.json({ error: grupoError.message }, { status: 400 });
    }
    grupoId = grupo.id;
  }

  const { data: savedEstadia, error: estadiaError } = await supabase.from('estadias').insert({
    persona_id: savedPersona.id,
    refugio_id: refugioId,
    grupo_id: grupoId,
    vinculo: estadia.vinculo,
    observaciones: typeof estadia.observaciones === 'string' ? estadia.observaciones.trim() || null : null,
    registrado_por: user.id,
  }).select().single();
  if (estadiaError) {
    if (grupoId && nuevoGrupo) await supabase.from('grupos_familiares').delete().eq('id', grupoId);
    if (!existingPersonaId) await supabase.from('personas').delete().eq('id', savedPersona.id);
    return NextResponse.json({ error: estadiaError.message }, { status: 400 });
  }

  const grupo = grupoId
    ? (await supabase.from('grupos_familiares').select('*').eq('id', grupoId).maybeSingle()).data
    : null;

  return NextResponse.json({ persona: savedPersona, estadia: savedEstadia, grupo }, { status: 201 });
}
