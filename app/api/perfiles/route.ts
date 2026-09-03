import { NextResponse } from 'next/server';
import { forbidden, getAuthenticatedUser, isActiveUser, unauthorized } from '@/lib/api-auth';

export async function GET() {
  const { supabase, user, profile } = await getAuthenticatedUser();
  if (!user || !profile) return unauthorized();
  if (!isActiveUser(profile)) return forbidden();

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .order('nombre_completo');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
