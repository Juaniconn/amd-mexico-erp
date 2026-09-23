import { SetMetadata } from '@nestjs/common';

export const PERMISO_KEY = 'require_permiso';

export type RequirePermisoMeta = { modulo: string; accion: string };

/** Requiere permiso granular (además de @Roles). ADMIN / * siempre pasan. */
export const RequirePermiso = (modulo: string, accion: string) =>
  SetMetadata(PERMISO_KEY, { modulo, accion } as RequirePermisoMeta);
