import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ComprasService } from './compras.service';
import {
  CreateOrdenCompraDto,
  UpdateOrdenCompraDto,
} from './dto/create-orden-compra.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermiso } from '../../common/decorators/permiso.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import {
  resolveSucursalFilter,
  requireSucursalId,
  AuthUser,
} from '../../common/sucursal-scope';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  // ─── Órdenes de Compra ───────────────────────────────────

  @Post('compras/ordenes')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  @RequirePermiso('compras', 'crear')
  async create(
    @Body() createOrdenCompraDto: CreateOrdenCompraDto,
    @CurrentUser() user: AuthUser,
  ) {
    const sid = requireSucursalId(user, createOrdenCompraDto.sucursalId);
    return this.comprasService.create(
      { ...createOrdenCompraDto, sucursalId: sid },
      user.id,
    );
  }

  @Get('compras/ordenes')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  @RequirePermiso('compras', 'ver')
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('estatus') estatus?: string,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const sid = resolveSucursalFilter(user, sucursalId);
    return this.comprasService.findAll(
      pageNumber,
      limitNumber,
      search,
      estatus,
      sid,
    );
  }

  @Post('compras/ordenes/desde-reorden')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  @RequirePermiso('compras', 'crear')
  async crearDesdeReorden(
    @CurrentUser() user: AuthUser,
    @Body() body: { sucursalId?: string; proveedorId?: string },
  ) {
    let sid: string;
    try {
      sid = requireSucursalId(user, body.sucursalId);
    } catch {
      // ADMIN sin filtro: usar sucursal principal
      const principal = await this.comprasService.getSucursalPrincipalId();
      if (!principal) throw new BadRequestException('No hay sucursal principal');
      sid = principal;
    }
    return this.comprasService.crearDesdeReorden(sid, user.id, body.proveedorId);
  }

  @Post('compras/ordenes/desde-bom-ot')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS, Role.PRODUCCION)
  @RequirePermiso('compras', 'crear')
  async crearDesdeBomOt(
    @CurrentUser() user: AuthUser,
    @Body() body: { otId: string; sucursalId?: string; proveedorId?: string },
  ) {
    if (!body?.otId) throw new BadRequestException('otId es requerido');
    let sid: string | undefined = body.sucursalId;
    try {
      sid = requireSucursalId(user, body.sucursalId);
    } catch {
      sid = body.sucursalId;
    }
    return this.comprasService.crearDesdeBomOt(
      body.otId,
      sid,
      user.id,
      body.proveedorId,
    );
  }

  @Get('compras/ordenes/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async findOne(@Param('id') id: string) {
    return this.comprasService.findOne(id);
  }

  @Patch('compras/ordenes/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async update(
    @Param('id') id: string,
    @Body() updateOrdenCompraDto: UpdateOrdenCompraDto,
  ) {
    return this.comprasService.update(id, updateOrdenCompraDto);
  }

  @Patch('compras/ordenes/:id/estatus')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async cambiarEstatus(
    @Param('id') id: string,
    @Body() body: { estatus: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.comprasService.cambiarEstatus(
      id,
      body.estatus as any,
      userId,
    );
  }

  @Delete('compras/ordenes/:id')
  @Roles(Role.ADMIN, Role.GERENTE)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.comprasService.remove(id);
  }

  // ─── Ordenes por Proveedor ───────────────────────────────

  @Get('compras/proveedores/:id/ordenes')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async findByProveedor(
    @Param('id') proveedorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.comprasService.findByProveedorId(
      proveedorId,
      pageNumber,
      limitNumber,
    );
  }
}
