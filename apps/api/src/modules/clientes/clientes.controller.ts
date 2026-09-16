import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClientDto } from './clientes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientesService.create(createClientDto);
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
    return this.clientesService.findAll(pageNum, limitNum, search);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: Partial<CreateClientDto>,
  ) {
    return this.clientesService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async remove(@Param('id') id: string) {
    return this.clientesService.remove(id);
  }
}
