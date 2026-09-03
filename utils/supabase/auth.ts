import { createClient } from './server';
import { redirect } from 'next/navigation';
import type { Perfil } from '@/types/shelter';

export const getUsuarioActual = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, perfil: perfil as Perfil | null };
};

export const requireUsuario = async () => {
  const sesion = await getUsuarioActual();

  if (!sesion) {
    return redirect('/login');
  }

  if (!sesion.perfil) {
    return redirect('/auth/salir?motivo=perfil-faltante');
  }

  if (!sesion.perfil.activo) {
    return redirect('/auth/salir?motivo=cuenta-desactivada');
  }

  return sesion;
};
