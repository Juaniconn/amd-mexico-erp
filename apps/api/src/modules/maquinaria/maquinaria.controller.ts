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
  HttpStatus,
} from '@nestjs/common';
import { MaquinariaService } from './maquinaria.service';
import {
  CreateMaquinaDto,
  UpdateMaquinaDto,
  AsignarOperadorDto,
  CreateMantenimientoDto,
  UpdateEstatusMaquinaDto,
} from './dto/create-maquina.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('maquinaria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaquinariaController {
  constructor(private readonly maquinariaService: MaquinariaService) {}

  // ─── CRUD Máquinas ──────────────────────────────────────

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE)
  async createMaquina(@Body() dto: CreateMaquinaDto) {
    return this.maquinariaService.createMaquina(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.OPERADOR)
  async findAllMaquinas(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('tipo') tipo?: string,
    @Query('estatus') estatus?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.maquinariaService.findAllMaquinas(pageNum, limitNum, search, tipo, estatus);
  }

  @Get('capacidad')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async getCapacidadInstalada() {
    return this.maquinariaService.getCapacidadInstalada();
  }

  @Get('ocupacion')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async getOcupacionMaquinas(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.maquinariaService.getOcupacionMaquinas(fechaInicio, fechaFin);
  }

  @Get('agenda-semanal')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async getAgendaSemanal(@Query('inicio') inicio?: string) {
    return this.maquinariaService.getAgendaSemanal(inicio);
  }

  @Get('gantt-semanal')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async getGanttSemanal(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.maquinariaService.getGanttSemanal(desde, hasta);
  }

  @Get('conflictos')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async getConflictos(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.maquinariaService.getConflictosProgramacion(desde, hasta);
  }

  @Get('preventivos-vencidos')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async getPreventivosVencidos() {
    return this.maquinariaService.getPreventivosVencidos();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.OPERADOR)
  async findOneMaquina(@Param('id') id: string) {
    return this.maquinariaService.findOneMaquina(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async updateMaquina(@Param('id') id: string, @Body() dto: UpdateMaquinaDto) {
    return this.maquinariaService.updateMaquina(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async deleteMaquina(@Param('id') id: string) {
    return this.maquinariaService.deleteMaquina(id);
  }

  // ─── Estatus ────────────────────────────────────────────

  @Patch(':id/estatus')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async updateEstatus(@Param('id') id: string, @Body() dto: UpdateEstatusMaquinaDto) {
    return this.maquinariaService.updateEstatus(id, dto);
  }

  // ─── Mantenimiento ───────────────────────────────────────

  @Post(':id/mantenimientos')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async addMantenimiento(
    @Param('id') id: string,
    @Body() dto: CreateMantenimientoDto,
  ) {
    return this.maquinariaService.addMantenimiento(id, dto);
  }

  @Get(':id/mantenimientos')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.OPERADOR)
  async findMantenimientos(@Param('id') id: string) {
    return this.maquinariaService.findMantenimientos(id);
  }

  // ─── Historial de operaciones ────────────────────────────

  @Get(':id/historial-operaciones')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.OPERADOR)
  async getHistorialOperaciones(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.maquinariaService.getHistorialOperaciones(id, pageNum, limitNum);
  }
}
