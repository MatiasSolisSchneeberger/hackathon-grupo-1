import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, rol, activo')
    .eq('id', data.user.id)
    .maybeSingle();

  return { supabase, user: data.user, profile };
}

export async function getActiveAuthenticatedUser() {
  const auth = await getAuthenticatedUser();
  if (!auth.user || !auth.profile) {
    return { ...auth, response: unauthorized() };
  }

  if (!isActiveUser(auth.profile)) {
    return { ...auth, response: forbidden() };
  }

  return { ...auth, response: null };
}

export function unauthorized() {
  return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'No tienes permisos para realizar esta operación.' }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function isActiveUser(profile: { activo?: boolean } | null): boolean {
  return Boolean(profile?.activo);
}
