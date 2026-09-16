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
import { CotizacionesService } from './cotizaciones.service';
import { CreateCotizacionDto, UpdateCotizacionDto } from './dto/create-cotizacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('cotizaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CotizacionesController {
  constructor(private readonly cotizacionesService: CotizacionesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async create(@Body() createCotizacionDto: CreateCotizacionDto) {
    return this.cotizacionesService.create(createCotizacionDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.cotizacionesService.findAll(pageNum, limitNum, search);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async findOne(@Param('id') id: string) {
    return this.cotizacionesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async update(
    @Param('id') id: string,
    @Body() updateCotizacionDto: UpdateCotizacionDto,
  ) {
    return this.cotizacionesService.update(id, updateCotizacionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async remove(@Param('id') id: string) {
    return this.cotizacionesService.remove(id);
  }
}
