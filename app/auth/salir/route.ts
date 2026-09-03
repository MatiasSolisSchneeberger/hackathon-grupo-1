import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const motivo = request.nextUrl.searchParams.get('motivo');
  const params = new URLSearchParams();

  if (motivo === 'perfil-faltante') {
    params.set('motivo', 'perfil-faltante');
  } else if (motivo === 'cuenta-desactivada') {
    params.set('motivo', 'cuenta-desactivada');
  }

  return NextResponse.redirect(new URL(`/login?${params}`, request.url));
};
