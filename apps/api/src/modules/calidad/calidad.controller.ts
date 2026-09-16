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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CalidadService } from './calidad.service';
import { CreateControlCalidadDto, UpdateControlCalidadDto } from './dto/create-control-calidad.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('calidad')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalidadController {
  constructor(private readonly calidadService: CalidadService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.CALIDAD)
  async create(@Body() dto: CreateControlCalidadDto) {
    return this.calidadService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.CALIDAD, Role.PRODUCCION)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('resultado') resultado?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.calidadService.findAll(pageNumber, limitNumber, search, resultado);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.CALIDAD)
  async findOne(@Param('id') id: string) {
    return this.calidadService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.CALIDAD)
  async update(@Param('id') id: string, @Body() dto: UpdateControlCalidadDto) {
    return this.calidadService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.calidadService.remove(id);
  }
}
