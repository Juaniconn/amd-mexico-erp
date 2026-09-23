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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CotizacionesService } from './cotizaciones.service';
import { CotizacionPaqueteService } from './cotizacion-paquete.service';
import { CreateCotizacionDto, UpdateCotizacionDto } from './dto/create-cotizacion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ProduccionService } from '../produccion/produccion.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  resolveSucursalFilter,
  requireSucursalId,
  AuthUser,
} from '../../common/sucursal-scope';

@Controller('cotizaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CotizacionesController {
  constructor(
    private readonly cotizacionesService: CotizacionesService,
    private readonly paqueteService: CotizacionPaqueteService,
    private readonly produccionService: ProduccionService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async create(
    @Body() createCotizacionDto: CreateCotizacionDto,
    @CurrentUser() user: AuthUser,
  ) {
    const sid = requireSucursalId(user, createCotizacionDto.sucursalId);
    return this.cotizacionesService.create({
      ...createCotizacionDto,
      sucursalId: sid,
    });
  }

  @Post('desde-paquete')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'zip', maxCount: 1 },
        { name: 'bomFile', maxCount: 1 },
      ],
      { limits: { fileSize: 100 * 1024 * 1024 } },
    ),
  )
  async createDesdePaquete(
    @UploadedFiles()
    files: {
      zip?: Express.Multer.File[];
      bomFile?: Express.Multer.File[];
    },
    @Body()
    body: {
      clienteId?: string;
      sucursalId?: string;
      moneda?: string;
      notas?: string;
      bom?: string;
    },
    @CurrentUser() user: AuthUser,
  ) {
    const zip = files?.zip?.[0];
    if (!zip?.buffer?.length) {
      throw new BadRequestException('Falta el archivo ZIP (campo zip)');
    }
    const bomText =
      body.bom?.trim() ||
      (files?.bomFile?.[0]?.buffer
        ? files.bomFile[0].buffer.toString('utf8')
        : '');
    if (!bomText) {
      throw new BadRequestException(
        'Falta el BOM (campo bom texto o archivo bomFile)',
      );
    }
    if (!body.clienteId) {
      throw new BadRequestException('Falta clienteId');
    }
    const sid = requireSucursalId(user, body.sucursalId);
    return this.paqueteService.createFromPaquete({
      zipBuffer: zip.buffer,
      zipName: zip.originalname || 'paquete.zip',
      bomText,
      clienteId: body.clienteId,
      sucursalId: sid,
      moneda: body.moneda,
      notas: body.notas,
    });
  }

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sucursalId') sucursalId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const sid = resolveSucursalFilter(user, sucursalId);
    return this.cotizacionesService.findAll(pageNum, limitNum, search, sid);
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

  @Post(':id/aprobar')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async aprobarYConvertir(
    @Param('id') id: string,
    @Body() body: { responsableId?: string },
  ) {
    await this.cotizacionesService.update(id, { estatus: 'ACEPTADA' } as any);
    const ot = await this.produccionService.convertirCotizacionAOrdenTrabajo({
      cotizacionId: id,
      responsableId: body.responsableId,
    });
    await this.cotizacionesService.update(id, { estatus: 'CONVERTIDA' } as any);
    return {
      id: ot.id,
      folio: ot.folio,
      message: 'Cotización aprobada y convertida a OT',
    };
  }

  @Get('cotizacion/:id/ot')
  @Roles(Role.ADMIN, Role.GERENTE, Role.VENDEDOR)
  async getOTByCotizacion(@Param('id') id: string) {
    return this.produccionService.findByCotizacionId(id);
  }
}
