import type { UserRole, DbRol } from '@/types/shelter';

export const dbRolToUserRole = (dbRol: DbRol): UserRole => {
  return dbRol === 'admin' ? 'admin' : 'social_worker';
};

export const userRoleToDbRol = (userRole: UserRole): DbRol => {
  return userRole === 'admin' ? 'admin' : 'trabajador_social';
};

export const getRoleLabel = (role: UserRole): string => {
  return role === 'admin' ? '🛡️ Admin / Dueño' : '📋 Comunicador';
};

export const getDbRoleLabel = (dbRol: DbRol): string => {
  return dbRol === 'admin' ? '🛡️ Admin / Dueño' : '📋 Comunicador';
};
