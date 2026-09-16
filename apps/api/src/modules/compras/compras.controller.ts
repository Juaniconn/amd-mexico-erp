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
import { ComprasService } from './compras.service';
import {
  CreateOrdenCompraDto,
  UpdateOrdenCompraDto,
} from './dto/create-orden-compra.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('ordenes-compra')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async create(
    @Body() createOrdenCompraDto: CreateOrdenCompraDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.comprasService.create(createOrdenCompraDto, userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('estatus') estatus?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.comprasService.findAll(pageNumber, limitNumber, search, estatus);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async findOne(@Param('id') id: string) {
    return this.comprasService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.COMPRAS)
  async update(
    @Param('id') id: string,
    @Body() updateOrdenCompraDto: UpdateOrdenCompraDto,
  ) {
    return this.comprasService.update(id, updateOrdenCompraDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.comprasService.remove(id);
  }
}
