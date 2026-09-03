import { RegisterForm } from '@/components/auth/RegisterForm';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center">Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
