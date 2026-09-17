import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCotizacionDto, UpdateCotizacionDto } from './dto/create-cotizacion.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CotizacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCotizacionDto) {
    try {
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: data.clienteId },
      });

      if (!cliente) {
        throw new NotFoundException({
          message: 'Cliente no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      const folio = await this.generateFolio();

      const subtotal = data.detalles.reduce(
        (sum, d) => sum + d.precioUnitario * d.cantidad,
        0,
      );
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      const cotizacion = await this.prisma.cotizacion.create({
        data: {
          folio,
          cliente: { connect: { id: data.clienteId } },
          validez: data.validez || 30,
          tipoCambio: data.tipoCambio
            ? new Prisma.Decimal(data.tipoCambio)
            : null,
          subtotal: new Prisma.Decimal(subtotal),
          iva: new Prisma.Decimal(iva),
          total: new Prisma.Decimal(total),
          estatus: 'BORRADOR' as any,
          notas: data.notas,
          detalles: {
            create: data.detalles.map((d) => ({
              piezaNombre: d.piezaNombre,
              piezaDescripcion: d.piezaDescripcion,
              cantidad: d.cantidad,
              unidad: d.unidad,
              precioUnitario: new Prisma.Decimal(d.precioUnitario),
              subtotal: new Prisma.Decimal(d.precioUnitario * d.cantidad),
              tiempoEstimado: d.tiempoEstimado
                ? new Prisma.Decimal(d.tiempoEstimado)
                : null,
              procesoRequerido: d.procesoRequerido,
              notas: d.notas,
            })),
          },
        },
        include: {
          cliente: true,
          detalles: true,
        },
      });

      return cotizacion;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException({
            message: 'Ya existe una cotización con ese folio',
            statusCode: HttpStatus.CONFLICT,
          });
        }
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.CotizacionWhereInput = search
      ? {
          OR: [
            { folio: { contains: search, mode: 'insensitive' } },
            { cliente: { razonSocial: { contains: search, mode: 'insensitive' } } },
            { cliente: { ciudad: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [cotizaciones, total] = await Promise.all([
      this.prisma.cotizacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cliente: {
            select: {
              id: true,
              codigo: true,
              razonSocial: true,
              ciudad: true,
              estado: true,
            },
          },
          _count: {
            select: { detalles: true },
          },
        },
      }),
      this.prisma.cotizacion.count({ where }),
    ]);

    return {
      data: cotizaciones,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        detalles: true,
        creador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    if (!cotizacion) {
      throw new NotFoundException({
        message: 'Cotización no encontrada',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return cotizacion;
  }

  async update(id: string, data: UpdateCotizacionDto) {
    try {
      const existing = await this.prisma.cotizacion.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException({
          message: 'Cotización no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      let updateData: Prisma.CotizacionUpdateInput = {};
      if (data.detalles) {
        const subtotal = data.detalles.reduce(
          (sum, d) => sum + d.precioUnitario * d.cantidad,
          0,
        );
        const iva = subtotal * 0.16;

        await this.prisma.detalleCotizacion.deleteMany({
          where: { cotizacionId: id },
        });

        updateData = {
          subtotal: new Prisma.Decimal(subtotal),
          iva: new Prisma.Decimal(iva),
          total: new Prisma.Decimal(subtotal + iva),
          detalles: {
            create: data.detalles.map((d) => ({
              piezaNombre: d.piezaNombre,
              piezaDescripcion: d.piezaDescripcion,
              cantidad: d.cantidad,
              unidad: d.unidad,
              precioUnitario: new Prisma.Decimal(d.precioUnitario),
              subtotal: new Prisma.Decimal(d.precioUnitario * d.cantidad),
              tiempoEstimado: d.tiempoEstimado
                ? new Prisma.Decimal(d.tiempoEstimado)
                : null,
              procesoRequerido: d.procesoRequerido,
              notas: d.notas,
            })),
          },
        };
      }

      if (data.clienteId) {
        updateData.cliente = { connect: { id: data.clienteId } } as any;
      }
      if (data.validez) updateData.validez = data.validez;
      if (data.tipoCambio !== undefined)
        updateData.tipoCambio = new Prisma.Decimal(data.tipoCambio);
      if (data.notas !== undefined) updateData.notas = data.notas;
      if (data.estatus) updateData.estatus = data.estatus as any;

      const cotizacion = await this.prisma.cotizacion.update({
        where: { id },
        data: updateData,
        include: {
          cliente: true,
          detalles: true,
        },
      });

      return cotizacion;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'Cotización no encontrada',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const cotizacion = await this.prisma.cotizacion.findUnique({
        where: { id },
      });

      if (!cotizacion) {
        throw new NotFoundException({
          message: 'Cotización no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      if (cotizacion.estatus !== 'BORRADOR') {
        throw new BadRequestException({
          message: 'Solo se pueden eliminar cotizaciones en estatus borrador',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      await this.prisma.cotizacion.delete({
        where: { id },
      });

      return { message: 'Cotización eliminada correctamente' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'Cotización no encontrada',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }
      }
      throw error;
    }
  }

  private async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `COT-${year}-`;

    const lastCotizacion = await this.prisma.cotizacion.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (lastCotizacion) {
      const match = lastCotizacion.folio.match(/COT-\d+-(\d+)/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
