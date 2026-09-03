import { describe, expect, it } from 'vitest';
import { isActiveUser } from '@/lib/api-auth';

describe('isActiveUser', () => {
  it('devuelve true cuando el perfil está activo', () => {
    expect(isActiveUser({ activo: true })).toBe(true);
  });

  it('devuelve false cuando el perfil está inactivo', () => {
    expect(isActiveUser({ activo: false })).toBe(false);
  });

  it('devuelve false cuando no hay perfil (null)', () => {
    expect(isActiveUser(null)).toBe(false);
  });

  it('devuelve false cuando "activo" no está definido', () => {
    expect(isActiveUser({})).toBe(false);
  });
});
