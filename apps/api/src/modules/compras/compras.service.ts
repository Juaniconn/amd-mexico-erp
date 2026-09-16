import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateOrdenCompraDto,
  UpdateOrdenCompraDto,
} from './dto/create-orden-compra.dto';
import { Prisma, EstatusPO } from '@prisma/client';

const IVA_RATE = 0.16; // 16% IVA

@Injectable()
export class ComprasService {
  constructor(private readonly prisma: PrismaService) {}

  async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `OC-${year}-`;

    const lastOrden = await this.prisma.ordenCompra.findFirst({
      where: {
        folio: {
          startsWith: prefix,
        },
      },
      orderBy: {
        folio: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastOrden) {
      const parts = lastOrden.folio.split('-');
      const lastNumber = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  async create(data: CreateOrdenCompraDto, userId?: string) {
    const folio = await this.generateFolio();

    let subtotal = 0;
    const proveedoresData: Prisma.OrdenCompraProveedorCreateWithoutOrdenCompraInput[] = [];

    for (const prov of data.proveedores) {
      const importe = Number(prov.cantidad) * Number(prov.precioUnitario);
      subtotal += importe;

      const proveedorExists = await this.prisma.proveedor.findUnique({
        where: { id: prov.proveedorId },
      });

      if (!proveedorExists) {
        throw new BadRequestException({
          message: `Proveedor con ID ${prov.proveedorId} no encontrado`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      proveedoresData.push({
        proveedor: {
          connect: { id: prov.proveedorId },
        },
        cantidad: new Prisma.Decimal(prov.cantidad),
        precioUnitario: new Prisma.Decimal(prov.precioUnitario),
        notas: prov.notas,
      });
    }

    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;

    const clienteExists = await this.prisma.cliente.findUnique({
      where: { id: data.clienteId },
    });

    if (!clienteExists) {
      throw new BadRequestException({
        message: `Cliente con ID ${data.clienteId} no encontrado`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (data.cotizacionId) {
      const cotizacionExists = await this.prisma.cotizacion.findUnique({
        where: { id: data.cotizacionId },
      });

      if (!cotizacionExists) {
        throw new BadRequestException({
          message: `Cotización con ID ${data.cotizacionId} no encontrada`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    }

    try {
      const ordenCompra = await this.prisma.ordenCompra.create({
        data: {
          folio,
          cliente: {
            connect: { id: data.clienteId },
          },
          ...(data.cotizacionId && {
            cotizacion: {
              connect: { id: data.cotizacionId },
            },
          }),
          ...(userId && {
            creador: {
              connect: { id: userId },
            },
          }),
          condicionesPago: data.condicionesPago,
          notas: data.notas,
          subtotal: new Prisma.Decimal(subtotal),
          iva: new Prisma.Decimal(iva),
          total: new Prisma.Decimal(total),
          proveedores: {
            create: proveedoresData,
          },
        },
        include: {
          cliente: true,
          cotizacion: true,
          proveedores: {
            include: {
              proveedor: true,
            },
          },
        },
      });

      return ordenCompra;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({
          message: 'Ya existe una orden de compra con ese folio',
          statusCode: HttpStatus.CONFLICT,
        });
      }
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    estatus?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.OrdenCompraWhereInput = {
      ...(search
        ? {
            OR: [
              { folio: { contains: search, mode: 'insensitive' } },
              { cliente: { razonSocial: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(estatus ? { estatus: estatus as EstatusPO } : {}),
    };

    const [ordenes, total] = await Promise.all([
      this.prisma.ordenCompra.findMany({
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
            },
          },
          cotizacion: {
            select: {
              id: true,
              folio: true,
            },
          },
          _count: {
            select: { proveedores: true },
          },
        },
      }),
      this.prisma.ordenCompra.count({ where }),
    ]);

    return {
      data: ordenes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const ordenCompra = await this.prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        cliente: true,
        cotizacion: true,
        creador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        proveedores: {
          include: {
            proveedor: true,
          },
        },
        ordenesTrabajo: true,
      },
    });

    if (!ordenCompra) {
      throw new NotFoundException({
        message: 'Orden de compra no encontrada',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return ordenCompra;
  }

  async update(id: string, data: UpdateOrdenCompraDto) {
    try {
      const updateData: Prisma.OrdenCompraUpdateInput = {};

      if (data.estatus) {
        updateData.estatus = data.estatus.toUpperCase() as EstatusPO;
      }
      if (data.condicionesPago !== undefined)
        updateData.condicionesPago = data.condicionesPago;
      if (data.notas !== undefined) updateData.notas = data.notas;

      return await this.prisma.ordenCompra.update({
        where: { id },
        data: updateData,
        include: {
          cliente: true,
          cotizacion: true,
          proveedores: {
            include: {
              proveedor: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({
          message: 'Orden de compra no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({
          message: 'Conflicto de datos al actualizar',
          statusCode: HttpStatus.CONFLICT,
        });
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const ordenCompra = await this.prisma.ordenCompra.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              proveedores: true,
              ordenesTrabajo: true,
            },
          },
        },
      });

      if (!ordenCompra) {
        throw new NotFoundException({
          message: 'Orden de compra no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      if (ordenCompra._count.ordenesTrabajo > 0) {
        throw new ConflictException({
          message: 'No se puede eliminar una orden de compra con órdenes de trabajo asociadas',
          statusCode: HttpStatus.CONFLICT,
        });
      }

      await this.prisma.ordenCompraProveedor.deleteMany({
        where: { ordenCompraId: id },
      });

      await this.prisma.ordenCompra.delete({ where: { id } });
      return { message: 'Orden de compra eliminada correctamente' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({
          message: 'Orden de compra no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      throw error;
    }
  }
}
