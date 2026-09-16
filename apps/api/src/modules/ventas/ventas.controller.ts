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
import { VentasService } from './ventas.service';
import { CreateVentaDto, UpdateVentaDto } from './dto/create-venta.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('ventas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async create(
    @Body() createVentaDto: CreateVentaDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.ventasService.create(createVentaDto, userId);
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
    return this.ventasService.findAll(pageNum, limitNum, search);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async findOne(@Param('id') id: string) {
    return this.ventasService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async update(
    @Param('id') id: string,
    @Body() updateVentaDto: UpdateVentaDto,
  ) {
    return this.ventasService.update(id, updateVentaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async remove(@Param('id') id: string) {
    return this.ventasService.remove(id);
  }
}
