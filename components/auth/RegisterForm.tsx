'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { registrarse } from '@/app/auth/actions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building2, UserPlus, Lock, Mail, User, AlertCircle } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [state, formAction, isPending] = useActionState(registrarse, {});
  const [localError, setLocalError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setLocalError('');
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setLocalError('');
  };

  const handleSubmit = (formData: FormData) => {
    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    formData.set('password', password);
    formAction(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-10 px-4">
      <Card className="w-full max-w-md border-t-4 border-t-blue-600 shadow-xl bg-white dark:bg-zinc-900">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg mb-2">
            <Building2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Crear Cuenta en IRUPE</CardTitle>
          <CardDescription>
            Alta de Perfil (public.perfiles) para Operadores del Sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {(state.error || localError) && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{state.error || localError}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold flex gap-2 items-start">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Tu cuenta se crea como Trabajador Social. Un administrador puede cambiar tu rol.</span>
          </div>

          <form action={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  name="nombre_completo"
                  placeholder="Ej: Lic. María Fernández"
                  className="pl-9"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="ejemplo@refugia.org"
                  className="pl-9"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="pl-9"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className="pl-9"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 mt-2" disabled={isPending}>
              <UserPlus className="h-4 w-4 mr-2" />
              {isPending ? 'Registrando...' : 'Registrarse e Ingresar'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800 py-3 text-xs">
          <span className="text-zinc-500">¿Ya tienes una cuenta?</span>
          <Link href="/login" className="ml-1.5 font-bold text-blue-600 hover:underline dark:text-blue-400">
            Iniciar Sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
