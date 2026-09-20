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
  Req,
} from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('facturas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('estatus') estatus?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.facturacionService.findAll(pageNum, limitNum, search, estatus);
  }

  @Get('pendientes')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async getPendientes() {
    return this.facturacionService.getPendientes();
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.GERENTE)
  async getStats() {
    return this.facturacionService.getStats();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async findOne(@Param('id') id: string) {
    return this.facturacionService.findOne(id);
  }

  @Post('desde-ot/:otId')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async createFromOT(@Param('otId') otId: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.facturacionService.createFromOT(otId, userId);
  }

  @Patch(':id/facturada')
  @Roles(Role.ADMIN, Role.GERENTE)
  async marcarFacturada(@Param('id') id: string) {
    return this.facturacionService.marcarFacturada(id);
  }

  @Patch(':id/cancelar')
  @Roles(Role.ADMIN, Role.GERENTE)
  async cancelar(@Param('id') id: string) {
    return this.facturacionService.cancelar(id);
  }
}
