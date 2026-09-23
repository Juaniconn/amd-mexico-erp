import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TransferenciasService } from './transferencias.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { resolveSucursalFilter, AuthUser, assertPermiso } from '../../common/sucursal-scope';

@Controller('transferencias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransferenciasController {
  constructor(private readonly service: TransferenciasService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS, Role.OPERADOR)
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const sid = resolveSucursalFilter(user, sucursalId);
    return this.service.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      sid,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS, Role.OPERADOR)
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async create(@Body() body: any, @CurrentUser() user: AuthUser) {
    assertPermiso(user, 'inventario', 'transferencias');
    return this.service.create(body, user.id);
  }

  @Patch(':id/estatus')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async cambiarEstatus(
    @Param('id') id: string,
    @Body() body: { estatus: string },
    @CurrentUser() user: AuthUser,
  ) {
    assertPermiso(user, 'inventario', 'transferencias');
    return this.service.cambiarEstatus(id, body.estatus, user.id);
  }
}
