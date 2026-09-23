import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmbarquesService } from './embarques.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermiso } from '../../common/decorators/permiso.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { resolveSucursalFilter, AuthUser } from '../../common/sucursal-scope';

@Controller('embarques')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class EmbarquesController {
  constructor(private readonly embarquesService: EmbarquesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.VENDEDOR)
  @RequirePermiso('embarques', 'ver')
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('otId') otId?: string,
    @Query('estatus') estatus?: string,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const sid = resolveSucursalFilter(user, sucursalId);
    return this.embarquesService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      otId,
      estatus,
      sid,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.VENDEDOR)
  @RequirePermiso('embarques', 'ver')
  async findOne(@Param('id') id: string) {
    return this.embarquesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.VENDEDOR)
  @RequirePermiso('embarques', 'crear')
  async create(@Body() body: any, @CurrentUser() user: AuthUser) {
    return this.embarquesService.create(body, user.id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.VENDEDOR)
  @RequirePermiso('embarques', 'editar')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.embarquesService.update(id, body);
  }

  @Post(':id/enviar')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.VENDEDOR)
  @RequirePermiso('embarques', 'enviar')
  async enviar(@Param('id') id: string) {
    return this.embarquesService.enviar(id);
  }

  @Patch(':id/cancelar')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  @RequirePermiso('embarques', 'eliminar')
  async cancelar(@Param('id') id: string) {
    return this.embarquesService.cancelar(id);
  }
}
