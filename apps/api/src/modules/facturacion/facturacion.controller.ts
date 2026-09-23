import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermiso } from '../../common/decorators/permiso.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { resolveSucursalFilter, AuthUser } from '../../common/sucursal-scope';

/**
 * Cola de monitoreo CONTPAQi — no emite facturas fiscales.
 */
@Controller('facturas')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  @RequirePermiso('facturacion', 'ver')
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('estatus') estatus?: string,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const sid = resolveSucursalFilter(user, sucursalId);
    return this.facturacionService.findAll(
      pageNum,
      limitNum,
      search,
      estatus,
      sid,
    );
  }

  @Get('pendientes')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  @RequirePermiso('facturacion', 'ver')
  async getPendientes() {
    return this.facturacionService.getPendientes();
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  @RequirePermiso('facturacion', 'ver')
  async getStats() {
    return this.facturacionService.getStats();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  @RequirePermiso('facturacion', 'ver')
  async findOne(@Param('id') id: string) {
    return this.facturacionService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  @RequirePermiso('facturacion', 'editar')
  async update(@Param('id') id: string, @Body() body: any) {
    if (body?.estatus) {
      return this.facturacionService.cambiarEstatus(id, body.estatus);
    }
    return this.facturacionService.update(id, { notas: body?.notas });
  }

  @Patch(':id/facturada')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  @RequirePermiso('facturacion', 'editar')
  async marcarFacturadoContpaq(@Param('id') id: string) {
    return this.facturacionService.marcarFacturadoContpaq(id);
  }

  @Patch(':id/cancelar')
  @Roles(Role.ADMIN, Role.GERENTE)
  @RequirePermiso('facturacion', 'cancelar')
  async cancelar(@Param('id') id: string) {
    return this.facturacionService.cancelar(id);
  }
}
