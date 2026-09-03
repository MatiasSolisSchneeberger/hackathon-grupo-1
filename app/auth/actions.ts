'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export const registrarse = async (
  prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nombre_completo = formData.get('nombre_completo') as string;

  if (!email || !password || !nombre_completo) {
    return { error: 'Todos los campos son requeridos' };
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre_completo,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
};

export const iniciarSesion = async (
  prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email y contraseña requeridos' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: 'Correo o contraseña incorrectos' };
    }
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
};

export const cerrarSesion = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
};
