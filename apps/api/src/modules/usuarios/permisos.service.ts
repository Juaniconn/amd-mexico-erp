import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';
import { PERMISOS_CATALOGO, PERMISOS_DEFAULT_POR_ROLE, PermisoModulo, PermisoAccion } from './permisos.catalog';

@Injectable()
export class PermisosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los permisos de un usuario.
   * Si es ADMIN, tiene todos los permisos.
   * Si es otro rol, combina permisos por defecto del rol + permisos específicos.
   */
  async getPermisosUsuario(usuarioId: string): Promise<{ modulo: string; accion: string; permitido: boolean }[]> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { permisos: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // ADMIN tiene todos los permisos
    if (usuario.role === Role.ADMIN) {
      return PERMISOS_CATALOGO.flatMap((p) =>
        p.acciones.map((a) => ({ modulo: p.modulo, accion: a, permitido: true }))
      );
    }

    // Obtener permisos por defecto del rol
    const permisosDefault = PERMISOS_DEFAULT_POR_ROLE[usuario.role] || [];
    const permisosMap = new Map<string, boolean>();

    // Aplicar permisos por defecto
    for (const pd of permisosDefault) {
      for (const accion of pd.acciones) {
        permisosMap.set(`${pd.modulo}:${accion}`, true);
      }
    }

    // Aplicar permisos específicos del usuario (pueden anular)
    for (const permiso of usuario.permisos) {
      permisosMap.set(`${permiso.modulo}:${permiso.accion}`, permiso.permitido);
    }

    // Convertir a array
    return Array.from(permisosMap.entries()).map(([key, permitido]) => {
      const [modulo, accion] = key.split(':');
      return { modulo, accion, permitido };
    });
  }

  /**
   * Verifica si un usuario tiene un permiso específico.
   */
  async tienePermiso(usuarioId: string, modulo: PermisoModulo, accion: PermisoAccion): Promise<boolean> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { permisos: true },
    });

    if (!usuario) return false;
    if (usuario.role === Role.ADMIN) return true;

    // Buscar permiso específico del usuario
    const permisoEspecifico = usuario.permisos.find(
      (p) => p.modulo === modulo && p.accion === accion
    );

    if (permisoEspecifico) {
      return permisoEspecifico.permitido;
    }

    // Buscar en permisos por defecto del rol
    const permisosDefault = PERMISOS_DEFAULT_POR_ROLE[usuario.role] || [];
    const moduloDefault = permisosDefault.find((p) => p.modulo === modulo);
    if (moduloDefault && moduloDefault.acciones.includes(accion)) {
      return true;
    }

    return false;
  }

  /**
   * Asigna un permiso a un usuario.
   */
  async asignarPermiso(
    usuarioId: string,
    modulo: PermisoModulo,
    accion: PermisoAccion,
    permitido: boolean = true
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el módulo y acción existen en el catálogo
    const moduloCatalogo = PERMISOS_CATALOGO.find((p) => p.modulo === modulo);
    if (!moduloCatalogo) {
      throw new NotFoundException(`Módulo ${modulo} no encontrado`);
    }
    if (!moduloCatalogo.acciones.includes(accion)) {
      throw new NotFoundException(`Acción ${accion} no encontrada en módulo ${modulo}`);
    }

    const permiso = await this.prisma.usuarioPermiso.upsert({
      where: {
        usuarioId_modulo_accion: {
          usuarioId,
          modulo,
          accion,
        },
      },
      update: { permitido },
      create: {
        usuarioId,
        modulo,
        accion,
        permitido,
      },
    });

    return {
      statusCode: 201,
      message: 'Permiso asignado exitosamente',
      data: permiso,
    };
  }

  /**
   * Revoca un permiso de un usuario.
   */
  async revocarPermiso(usuarioId: string, modulo: PermisoModulo, accion: PermisoAccion) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    try {
      await this.prisma.usuarioPermiso.delete({
        where: {
          usuarioId_modulo_accion: {
            usuarioId,
            modulo,
            accion,
          },
        },
      });

      return {
        statusCode: 200,
        message: 'Permiso revocado exitosamente',
      };
    } catch (error) {
      throw new NotFoundException('Permiso no encontrado');
    }
  }

  /**
   * Obtiene el catálogo completo de permisos.
   */
  getCatalogo() {
    return PERMISOS_CATALOGO;
  }

  /**
   * Obtiene los permisos por defecto para un rol.
   */
  getPermisosDefaultPorRole(role: Role) {
    return PERMISOS_DEFAULT_POR_ROLE[role] || [];
  }

  /**
   * Inicializa los permisos por defecto para un usuario según su rol.
   * Se llama al crear un usuario.
   */
  async inicializarPermisosUsuario(usuarioId: string, role: Role) {
    if (role === Role.ADMIN) return; // Admin no necesita permisos explícitos

    const permisosDefault = PERMISOS_DEFAULT_POR_ROLE[role] || [];
    const data = permisosDefault.flatMap((p) =>
      p.acciones.map((a) => ({
        usuarioId,
        modulo: p.modulo,
        accion: a,
        permitido: true,
      }))
    );

    if (data.length > 0) {
      await this.prisma.usuarioPermiso.createMany({
        data,
        skipDuplicates: true,
      });
    }
  }

  /**
   * Actualiza múltiples permisos de un usuario.
   */
  async actualizarPermisos(
    usuarioId: string,
    permisos: { modulo: PermisoModulo; accion: PermisoAccion; permitido: boolean }[]
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const resultados = [];
    for (const permiso of permisos) {
      const resultado = await this.prisma.usuarioPermiso.upsert({
        where: {
          usuarioId_modulo_accion: {
            usuarioId,
            modulo: permiso.modulo,
            accion: permiso.accion,
          },
        },
        update: { permitido: permiso.permitido },
        create: {
          usuarioId,
          modulo: permiso.modulo,
          accion: permiso.accion,
          permitido: permiso.permitido,
        },
      });
      resultados.push(resultado);
    }

    return {
      statusCode: 200,
      message: 'Permisos actualizados exitosamente',
      data: resultados,
    };
  }
}
