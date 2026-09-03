import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';

interface LoginPageProps {
  searchParams: Promise<{ motivo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { motivo } = await searchParams;

  return (
    <div>
      {motivo === 'perfil-faltante' && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 text-yellow-800 p-4 text-center text-sm dark:bg-yellow-950/30 dark:border-yellow-900 dark:text-yellow-200 z-50">
          ⚠️ No se encontró tu perfil en la base de datos. Por favor contacta al administrador.
        </div>
      )}
      {motivo === 'cuenta-desactivada' && (
        <div className="fixed top-0 left-0 right-0 bg-red-50 border-b border-red-200 text-red-800 p-4 text-center text-sm dark:bg-red-950/30 dark:border-red-900 dark:text-red-200 z-50">
          🔒 Tu cuenta ha sido desactivada. Por favor contacta al administrador.
        </div>
      )}
      <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
