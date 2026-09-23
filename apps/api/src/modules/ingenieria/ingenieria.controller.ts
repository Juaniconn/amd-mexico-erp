import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngenieriaService } from './ingenieria.service';
import { CreateIngenieriaProyectoDto } from './dto/create-ingenieria-proyecto.dto';
import { UpdateIngenieriaProyectoDto } from './dto/update-ingenieria-proyecto.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { StorageService } from '../../common/storage.service';
import { AuthUser } from '../../common/sucursal-scope';

@Controller('ingenieria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngenieriaController {
  constructor(
    private readonly ingenieriaService: IngenieriaService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async create(
    @Body() createDto: CreateIngenieriaProyectoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ingenieriaService.create(createDto, user?.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.ingenieriaService.findAll(pageNum, limitNum, search);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async getStats() {
    return this.ingenieriaService.getStats();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async findOne(@Param('id') id: string) {
    return this.ingenieriaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateIngenieriaProyectoDto,
  ) {
    return this.ingenieriaService.update(id, updateDto);
  }

  @Post(':id/liberar')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async liberar(@Param('id') id: string) {
    return this.ingenieriaService.liberar(id);
  }

  @Post(':id/cotizar')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async cotizar(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.ingenieriaService.crearCotizacionDesdeProyecto(id, user?.id);
  }

  @Post(':id/planos')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async uploadPlano(
    @Param('id') id: string,
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
    @Body('parteNumero') parteNumero: string,
    @Body('version') version?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Archivo requerido');
    }
    if (!parteNumero?.trim()) {
      throw new BadRequestException('parteNumero es requerido');
    }
    const archivoUrl = await this.storage.upload(
      `ingenieria/${id}`,
      file.originalname || 'plano.bin',
      file.buffer,
      file.mimetype,
    );
    const versionNum = version ? parseInt(version, 10) : 1;
    return this.ingenieriaService.uploadPlano(
      id,
      parteNumero.trim(),
      archivoUrl,
      versionNum,
      user?.id,
    );
  }
}
