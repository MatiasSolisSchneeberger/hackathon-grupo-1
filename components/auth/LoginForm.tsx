"use client";

import React, { useState } from 'react';
import { useShelter } from '@/context/ShelterContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RolUsuario } from '@/types/shelter';
import { Building2, LogIn, Shield, ClipboardList, Lock, Mail, Sparkles } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login } = useShelter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<RolUsuario>('administrador');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email, password, rol);
    }
  };

  const handleDemoLogin = (selectedRol: RolUsuario) => {
    const demoEmail = selectedRol === 'administrador' ? 'admin@refugia.org' : 'social@refugia.org';
    const demoName = selectedRol === 'administrador' ? 'Lic. Fernando Rossi (Administrador)' : 'Lic. Sofía Martínez (Trabajadora Social)';
    login(demoEmail, 'demo123', selectedRol, demoName);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <Card className="w-full max-w-md border-t-4 border-t-blue-600 shadow-xl bg-white dark:bg-zinc-900">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg mb-2">
            <Building2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Acceso a RefugIA</CardTitle>
          <CardDescription>
            Sistema de Gestión de Refugios & Asistencia Social
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="ejemplo@refugia.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Perfil de Rol Requerido
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRol('administrador')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    rol === 'administrador'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-500 shadow-xs'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Administrador
                </button>

                <button
                  type="button"
                  onClick={() => setRol('trabajador_social')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    rol === 'trabajador_social'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-500 shadow-xs'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Trabajador Social
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5">
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          </form>

          {/* Quick Demo Login Bar */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block text-center mb-2">
              ⚡ Demo Rápida (1 Clic)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleDemoLogin('administrador')}
                className="text-[11px] border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                Entrar como Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleDemoLogin('trabajador_social')}
                className="text-[11px] border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                <Sparkles className="h-3 w-3 mr-1 text-emerald-500" />
                Trabajador Social
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800 py-3 text-xs">
          <span className="text-zinc-500">¿No tienes cuenta?</span>
          <button
            onClick={onSwitchToRegister}
            className="ml-1.5 font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Registrarse aquí
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};
