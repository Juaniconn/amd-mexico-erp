import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { CreateOrdenTrabajoDto, UpdateOrdenTrabajoDto, UpdateOperacionDto } from './dto/create-orden-trabajo.dto';
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
