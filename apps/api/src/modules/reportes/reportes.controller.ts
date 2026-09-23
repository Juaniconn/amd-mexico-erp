import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.GERENTE)
  async getDashboardStats() {
    return this.reportesService.getDashboardStats();
  }

  @Get('tipos')
  @Roles(Role.ADMIN, Role.GERENTE)
  async getTipos() {
    return this.reportesService.getTipos();
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tipo') tipo?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.reportesService.findAll(pageNum, limitNum, tipo);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async findOne(@Param('id') id: string) {
    return this.reportesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE)
  async create(@Body() data: any, @Req() req: any) {
    return this.reportesService.create({ ...data, creadoPorId: req.user?.id });
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.reportesService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async remove(@Param('id') id: string) {
    return this.reportesService.remove(id);
  }

  @Post('generar')
  @Roles(Role.ADMIN, Role.GERENTE)
  async generar(@Body() data: any) {
    return this.reportesService.generarReporte(data.tipo, data.parametros);
  }
}
