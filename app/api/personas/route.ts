import { NextResponse } from 'next/server';
import { forbidden, getAuthenticatedUser, isActiveUser, unauthorized } from '@/lib/api-auth';

export async function GET(request: Request) {
  const { supabase, user, profile } = await getAuthenticatedUser();
  if (!user || !profile) return unauthorized();
  if (!isActiveUser(profile)) return forbidden();

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 200, 1), 500);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .order('apellido')
    .order('nombre')
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
