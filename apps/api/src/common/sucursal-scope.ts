import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

export type AuthUser = {
  id: string;
  role: Role | string;
  sucursalId?: string | null;
  permisos?: Record<string, string[]>;
};

/** Roles that may query/filter across all branches. */
export function canSeeAllSucursales(user?: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === Role.ADMIN || user.role === Role.GERENTE || user.role === 'ADMIN' || user.role === 'GERENTE';
}

/**
 * Resolve effective branch for list/create.
 * - Non admin/gerente: always their sucursalId (required).
 * - Admin/gerente: optional query override, or undefined = all (lists) / must pass for creates via requireSucursalId.
 */
export function resolveSucursalFilter(
  user: AuthUser | undefined,
  querySucursalId?: string | null,
): string | undefined {
  if (!canSeeAllSucursales(user)) {
    if (!user?.sucursalId) {
      throw new ForbiddenException(
        'Tu usuario no tiene sucursal asignada. Contacta al administrador.',
      );
    }
    return user.sucursalId;
  }
  if (querySucursalId && querySucursalId !== 'all') {
    return querySucursalId;
  }
  return undefined; // all branches
}

/** Sucursal required for writes that move stock or create docs. */
export function requireSucursalId(
  user: AuthUser | undefined,
  bodySucursalId?: string | null,
): string {
  if (canSeeAllSucursales(user)) {
    const id = bodySucursalId || user?.sucursalId;
    if (!id) {
      throw new BadRequestException('sucursalId es requerido');
    }
    return id;
  }
  if (!user?.sucursalId) {
    throw new ForbiddenException('Tu usuario no tiene sucursal asignada');
  }
  return user.sucursalId;
}

export function assertPermiso(
  user: AuthUser | undefined,
  modulo: string,
  accion: string,
): void {
  if (!user) throw new ForbiddenException('No autenticado');
  if (user.role === Role.ADMIN || user.role === 'ADMIN') return;
  const map = user.permisos || {};
  if (map['*']?.includes('*')) return;
  const acciones = map[modulo] || [];
  if (!acciones.includes(accion) && !acciones.includes('admin')) {
    // Soft: roles still gate via @Roles; this is extra for critical ops when permisos exist
    if (Object.keys(map).length === 0) return;
    throw new ForbiddenException(`Sin permiso ${modulo}:${accion}`);
  }
}
