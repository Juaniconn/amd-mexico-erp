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
  HttpStatus,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(createUsuarioDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Usuario creado exitosamente',
      data: usuario,
    };
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usuariosService.findAll(pageNum, limitNum, search);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE)
  async findOne(@Param('id') id: string) {
    const usuario = await this.usuariosService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      data: usuario,
    };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const usuario = await this.usuariosService.update(id, updateUsuarioDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Usuario actualizado exitosamente',
      data: usuario,
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const usuario = await this.usuariosService.softDelete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Usuario desactivado exitosamente',
      data: usuario,
    };
  }

  @Patch(':id/rol')
  @Roles(Role.ADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: Role,
  ) {
    const usuario = await this.usuariosService.updateRole(id, role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Rol actualizado exitosamente',
      data: usuario,
    };
  }

  @Patch(':id/password')
  @Roles(Role.ADMIN)
  async updatePassword(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    const usuario = await this.usuariosService.updatePassword(id, password);
    return {
      statusCode: HttpStatus.OK,
      message: 'Contraseña actualizada exitosamente',
      data: usuario,
    };
  }
}
