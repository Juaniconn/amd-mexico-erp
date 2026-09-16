import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/create-material.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('inventario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get('materiales')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR, Role.PRODUCCION, Role.COMPRAS)
  async findAllMateriales(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.inventarioService.findAll(pageNum, limitNum, search);
  }

  @Get('materiales/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.COMPRAS)
  async findOneMaterial(@Param('id') id: string) {
    return this.inventarioService.findOne(id);
  }

  @Post('materiales')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async createMaterial(@Body() dto: CreateMaterialDto) {
    return this.inventarioService.create(dto);
  }

  @Put('materiales/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async updateMaterial(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.inventarioService.update(id, dto);
  }

  @Delete('materiales/:id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async removeMaterial(@Param('id') id: string) {
    return this.inventarioService.remove(id);
  }
}
