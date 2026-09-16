import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateVentaDto, userId?: string) {
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

      const subtotal = data.items.reduce(
        (sum, d) => sum + d.precioUnitario * d.cantidad,
        0,
      );
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      const venta = await this.prisma.venta.create({
        data: {
          folio,
          cliente: { connect: { id: data.clienteId } },
          ...(data.sucursalId && { sucursal: { connect: { id: data.sucursalId } } }),
          ...(userId && { creador: { connect: { id: userId } } }),
          moneda: (data.moneda as any) || 'MXN',
          tipoCambio: data.tipoCambio
            ? new Prisma.Decimal(data.tipoCambio)
            : null,
          ...(data.fechaEntrega && { fechaEntrega: new Date(data.fechaEntrega) }),
          subtotal: new Prisma.Decimal(subtotal),
          iva: new Prisma.Decimal(iva),
          total: new Prisma.Decimal(total),
          estatus: 'COTIZACION' as any,
          condicionesPago: data.condicionesPago,
          notas: data.notas,
          items: {
            create: data.items.map((d) => ({
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
          items: true,
        },
      });

      return venta;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException({
            message: 'Ya existe una venta con ese folio',
            statusCode: HttpStatus.CONFLICT,
          });
        }
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.VentaWhereInput = search
      ? {
          OR: [
            { folio: { contains: search, mode: 'insensitive' } },
            { cliente: { razonSocial: { contains: search, mode: 'insensitive' } } },
            { cliente: { ciudad: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [ventas, total] = await Promise.all([
      this.prisma.venta.findMany({
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
            select: { items: true },
          },
        },
      }),
      this.prisma.venta.count({ where }),
    ]);

    return {
      data: ventas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const venta = await this.prisma.venta.findUnique({
      where: { id },
      include: {
        cliente: true,
        items: true,
      },
    });

    if (!venta) {
      throw new NotFoundException({
        message: 'Venta no encontrada',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return venta;
  }

  async update(id: string, data: UpdateVentaDto) {
    try {
      const existing = await this.prisma.venta.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException({
          message: 'Venta no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      let updateData: Prisma.VentaUpdateInput = {};
      if (data.items) {
        const subtotal = data.items.reduce(
          (sum, d) => sum + d.precioUnitario * d.cantidad,
          0,
        );
        const iva = subtotal * 0.16;

        await this.prisma.ventaItem.deleteMany({
          where: { ventaId: id },
        });

        updateData = {
          ...updateData,
          subtotal: new Prisma.Decimal(subtotal),
          iva: new Prisma.Decimal(iva),
          total: new Prisma.Decimal(subtotal + iva),
          items: {
            create: data.items.map((d) => ({
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
      if (data.sucursalId) {
        updateData.sucursal = { connect: { id: data.sucursalId } } as any;
      }
      if (data.moneda) updateData.moneda = data.moneda as any;
      if (data.tipoCambio !== undefined)
        updateData.tipoCambio = new Prisma.Decimal(data.tipoCambio);
      if (data.fechaEntrega)
        updateData.fechaEntrega = new Date(data.fechaEntrega);
      if (data.notas !== undefined) updateData.notas = data.notas;
      if (data.condicionesPago !== undefined) updateData.condicionesPago = data.condicionesPago;
      if (data.estatus) updateData.estatus = data.estatus as any;

      const venta = await this.prisma.venta.update({
        where: { id },
        data: updateData,
        include: {
          cliente: true,
          items: true,
        },
      });

      return venta;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'Venta no encontrada',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const venta = await this.prisma.venta.findUnique({
        where: { id },
      });

      if (!venta) {
        throw new NotFoundException({
          message: 'Venta no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      if (venta.estatus !== 'COTIZACION') {
        throw new BadRequestException({
          message: 'Solo se pueden eliminar ventas en estatus cotización',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      await this.prisma.venta.delete({
        where: { id },
      });

      return { message: 'Venta eliminada correctamente' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'Venta no encontrada',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }
      }
      throw error;
    }
  }

  private async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `VTA-${year}-`;

    const lastVenta = await this.prisma.venta.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (lastVenta) {
      const match = lastVenta.folio.match(/VTA-\d+-(\d+)/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
