import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { CreateOrdenTrabajoDto, UpdateOrdenTrabajoDto, UpdateOperacionDto } from './dto/create-orden-trabajo.dto';
import { CreateOrdenTrabajoFromQuoteDto } from './dto/create-orden-trabajo-from-quote.dto';
import { AsignarParteDto } from './dto/asignar-parte.dto';
import { UpdateEstatusParteDto } from './dto/update-estatus-parte.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProduccionController {
  constructor(private readonly produccionService: ProduccionService) {}

  @Post('ordenes-trabajo')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async createOrdenTrabajo(@Body() dto: CreateOrdenTrabajoDto) {
    return this.produccionService.createOrdenTrabajo(dto);
  }

  @Post('ordenes-trabajo/convertir-cotizacion')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async convertirCotizacion(@Body() dto: CreateOrdenTrabajoFromQuoteDto) {
    return this.produccionService.convertirCotizacionAOrdenTrabajo(dto);
  }

  @Patch('ordenes-trabajo/:id/asignar-responsable')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async asignarResponsable(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.produccionService.asignarResponsableOT(id, body.userId);
  }

  @Get('ordenes-trabajo/cotizacion/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async findByCotizacion(@Param('id') id: string) {
    return this.produccionService.findByCotizacionId(id);
  }

  @Get('ordenes-trabajo')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.OPERADOR)
  async findAllOrdenesTrabajo(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('estatus') estatus?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.produccionService.findAllOrdenesTrabajo(pageNum, limitNum, search, estatus);
  }

  @Get('ordenes-trabajo/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async findOneOrdenTrabajo(@Param('id') id: string) {
    return this.produccionService.findOneOrdenTrabajo(id);
  }

  @Put('ordenes-trabajo/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async updateOrdenTrabajo(@Param('id') id: string, @Body() dto: UpdateOrdenTrabajoDto) {
    return this.produccionService.updateOrdenTrabajo(id, dto);
  }

  @Patch('partes-ot/:id/asignar-operador')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async asignarOperador(@Param('id') id: string, @Body() dto: AsignarParteDto) {
    return this.produccionService.asignarOperadorAParte(id, dto);
  }

  @Patch('partes-ot/:id/estatus')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.CALIDAD)
  async actualizarEstatus(@Param('id') id: string, @Body() dto: UpdateEstatusParteDto) {
    return this.produccionService.actualizarEstatusParte(id, dto);
  }

  @Get('partes-ot/orden-trabajo/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.OPERADOR)
  async findPartesByOT(@Param('id') id: string) {
    return this.produccionService.findPartesByOT(id);
  }

  @Get('operaciones')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.OPERADOR)
  async findAllOperaciones(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('estatus') estatus?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.produccionService.findAllOperaciones(pageNum, limitNum, estatus);
  }

  @Get('operaciones/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async findOneOperacion(@Param('id') id: string) {
    return this.produccionService.findOneOperacion(id);
  }

  @Put('operaciones/:id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION, Role.OPERADOR)
  async updateOperacion(@Param('id') id: string, @Body() dto: UpdateOperacionDto) {
    return this.produccionService.updateOperacion(id, dto);
  }
}
