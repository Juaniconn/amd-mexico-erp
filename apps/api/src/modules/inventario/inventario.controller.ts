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
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateMovimientoDto,
} from './dto/create-material.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { resolveSucursalFilter, requireSucursalId, AuthUser } from '../../common/sucursal-scope';

@Controller('inventario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get('materiales')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS, Role.OPERADOR)
  async findAllMateriales(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const sid = resolveSucursalFilter(user, sucursalId);
    return this.inventarioService.findAll(pageNum, limitNum, search, sid);
  }

  @Get('materiales/buscar')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS, Role.OPERADOR)
  async buscarMateriales(@Query('search') search: string) {
    if (!search || search.trim().length === 0) {
      return { data: [] };
    }
    return this.inventarioService.buscar(search);
  }

  @Get('materiales/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS, Role.OPERADOR)
  async findOneMaterial(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const sid = resolveSucursalFilter(user, sucursalId);
    return this.inventarioService.findOne(id, sid);
  }

  @Post('materiales')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async createMaterial(
    @Body() dto: CreateMaterialDto & { sucursalId?: string },
    @CurrentUser() user: AuthUser,
  ) {
    const sid = requireSucursalId(user, dto.sucursalId);
    return this.inventarioService.create(dto, sid);
  }

  @Patch('materiales/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async updateMaterial(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.inventarioService.update(id, dto);
  }

  @Delete('materiales/:id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async removeMaterial(@Param('id') id: string) {
    return this.inventarioService.remove(id);
  }

  @Post('materiales/:id/movimientos')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS, Role.OPERADOR)
  async createMovimiento(
    @Param('id') materialId: string,
    @Body() dto: CreateMovimientoDto & { sucursalId?: string },
    @CurrentUser() user: AuthUser,
  ) {
    const sid = requireSucursalId(user, dto.sucursalId);
    return this.inventarioService.movimientoStock(materialId, dto, user.id, sid);
  }

  @Get('materiales/:id/movimientos')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS, Role.OPERADOR)
  async getMovimientos(
    @Param('id') materialId: string,
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const sid = resolveSucursalFilter(user, sucursalId);
    return this.inventarioService.getMovimientos(materialId, pageNum, limitNum, sid);
  }

  @Get('stock-bajo')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async getStockBajo(
    @CurrentUser() user: AuthUser,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const sid = resolveSucursalFilter(user, sucursalId);
    return this.inventarioService.getStockBajo(sid);
  }
}
