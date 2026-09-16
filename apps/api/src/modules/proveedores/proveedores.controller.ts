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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto, UpdateProveedorDto } from './dto/create-proveedor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('proveedores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedorDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.proveedoresService.findAll(pageNumber, limitNumber, search);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async update(
    @Param('id') id: string,
    @Body() updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedoresService.update(id, updateProveedorDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.proveedoresService.remove(id);
  }
}
