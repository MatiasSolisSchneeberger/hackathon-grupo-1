import { requireUsuario } from '@/utils/supabase/auth';
import { AppShell } from '@/components/AppShell';
import { dbRolToUserRole } from '@/lib/roles';
import type { UserProfile } from '@/types/shelter';

export default async function Home() {
  const { user, perfil } = await requireUsuario();

  const userRole = dbRolToUserRole(perfil!.rol);
  const userProfile: UserProfile = {
    id: user.id,
    name: perfil!.nombre_completo,
    email: user.email || '',
    role: userRole,
  };

  return <AppShell initialUser={userProfile} />;
}
