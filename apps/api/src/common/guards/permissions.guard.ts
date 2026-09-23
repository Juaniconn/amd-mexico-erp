import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISO_KEY, RequirePermisoMeta } from '../decorators/permiso.decorator';
import { PERMISOS_DEFAULT_POR_ROLE } from '../../modules/usuarios/permisos.catalog';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequirePermisoMeta>(
      PERMISO_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException({
        message: 'No autenticado',
        statusCode: 403,
      });
    }

    if (user.role === 'ADMIN') return true;

    const map: Record<string, string[]> = user.permisos || {};
    if (map['*']?.includes('*')) return true;

    const hasExplicit = Object.keys(map).length > 0;
    if (hasExplicit) {
      const acciones = map[required.modulo] || [];
      if (acciones.includes(required.accion) || acciones.includes('admin')) {
        return true;
      }
      throw new ForbiddenException({
        message: `Sin permiso ${required.modulo}:${required.accion}`,
        statusCode: 403,
      });
    }

    // Sin filas en usuario_permisos → defaults por rol
    const defaults = PERMISOS_DEFAULT_POR_ROLE[user.role] || [];
    const mod = defaults.find((d) => d.modulo === required.modulo);
    if (mod?.acciones?.includes(required.accion as any)) {
      return true;
    }

    throw new ForbiddenException({
      message: `Sin permiso ${required.modulo}:${required.accion}`,
      statusCode: 403,
    });
  }
}
