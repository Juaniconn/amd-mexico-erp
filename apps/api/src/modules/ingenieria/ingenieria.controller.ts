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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngenieriaService } from './ingenieria.service';
import { CreateIngenieriaProyectoDto } from './dto/create-ingenieria-proyecto.dto';
import { UpdateIngenieriaProyectoDto } from './dto/update-ingenieria-proyecto.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('ingenieria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngenieriaController {
  constructor(private readonly ingenieriaService: IngenieriaService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  async create(@Body() createDto: CreateIngenieriaProyectoDto) {
    return this.ingenieriaService.create(createDto);
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

  @Post(':id/planos')
  @Roles(Role.ADMIN, Role.GERENTE, Role.PRODUCCION)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPlano(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('parteNumero') parteNumero: string,
    @Body('version') version?: string,
  ) {
    // In production, this would upload to MinIO
    // For now, we simulate the URL
    const archivoUrl = `/uploads/ingenieria/${id}/${file.originalname}`;
    const versionNum = version ? parseInt(version, 10) : 1;
    return this.ingenieriaService.uploadPlano(id, parteNumero, archivoUrl, versionNum);
  }
}
