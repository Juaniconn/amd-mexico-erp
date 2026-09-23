import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PermisoModulo, PermisoAccion } from './permisos.catalog';

@Controller('permisos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Get('catalogo')
  @Roles(Role.ADMIN, Role.GERENTE)
  getCatalogo() {
    return this.permisosService.getCatalogo();
  }

  @Get('role/:role')
  @Roles(Role.ADMIN, Role.GERENTE)
  getPermisosDefaultPorRole(@Param('role') role: Role) {
    return this.permisosService.getPermisosDefaultPorRole(role);
  }

  @Get('usuario/:id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async getPermisosUsuario(@Param('id') id: string) {
    return this.permisosService.getPermisosUsuario(id);
  }

  @Post('usuario/:id')
  @Roles(Role.ADMIN)
  async asignarPermiso(
    @Param('id') id: string,
    @Body() body: { modulo: PermisoModulo; accion: PermisoAccion; permitido?: boolean }
  ) {
    return this.permisosService.asignarPermiso(id, body.modulo, body.accion, body.permitido ?? true);
  }

  @Patch('usuario/:id')
  @Roles(Role.ADMIN)
  async actualizarPermisos(
    @Param('id') id: string,
    @Body() body: { permisos: { modulo: PermisoModulo; accion: PermisoAccion; permitido: boolean }[] }
  ) {
    return this.permisosService.actualizarPermisos(id, body.permisos);
  }

  @Delete('usuario/:id/:modulo/:accion')
  @Roles(Role.ADMIN)
  async revocarPermiso(
    @Param('id') id: string,
    @Param('modulo') modulo: PermisoModulo,
    @Param('accion') accion: PermisoAccion
  ) {
    return this.permisosService.revocarPermiso(id, modulo, accion);
  }
}
