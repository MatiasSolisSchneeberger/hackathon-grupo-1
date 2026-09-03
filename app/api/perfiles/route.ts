import { NextResponse } from 'next/server';
import { getActiveAuthenticatedUser } from '@/lib/api-auth';

export async function GET() {
  const { supabase, response } = await getActiveAuthenticatedUser();
  if (response) return response;

  const { data, error } = await supabase.from('perfiles').select('*').order('nombre_completo');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}
