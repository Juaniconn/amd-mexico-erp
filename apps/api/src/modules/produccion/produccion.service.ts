import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrdenTrabajoDto, UpdateOrdenTrabajoDto, UpdateOperacionDto } from './dto/create-orden-trabajo.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProduccionService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrdenTrabajo(data: CreateOrdenTrabajoDto) {
    const ordenCompra = await this.prisma.ordenCompra.findUnique({ where: { id: data.ordenCompraId } });
    if (!ordenCompra) {
      throw new NotFoundException({ message: 'Orden de compra no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    const folio = await this.generateFolio();

    const ordenTrabajo = await this.prisma.ordenTrabajo.create({
      data: {
        folio,
        po: { connect: { id: data.ordenCompraId } },
        piezaNombre: data.piezaNombre,
        piezaDescripcion: data.piezaDescripcion,
        cantidad: data.cantidad,
        unidad: data.unidad,
        prioridad: (data.prioridad as any) || 'MEDIA',
        notas: data.notas,
        estatus: 'PENDIENTE' as any,
        operaciones: data.operaciones
          ? {
              create: data.operaciones.map((op, idx) => ({
                proceso: op.proceso,
                secuencia: op.secuencia || idx + 1,
                maquinaId: op.maquinaId,
                operadorId: op.operadorId,
                tiempoEstimado: op.tiempoEstimado ? new Prisma.Decimal(op.tiempoEstimado) : null,
                notas: op.notas,
              })),
            }
          : undefined,
      },
      include: { po: true, operaciones: true },
    });

    return ordenTrabajo;
  }

  async findAllOrdenesTrabajo(page: number = 1, limit: number = 10, search?: string, estatus?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrdenTrabajoWhereInput = {
      ...(estatus ? { estatus: estatus as any } : {}),
      ...(search
        ? {
            OR: [
              { folio: { contains: search, mode: 'insensitive' } },
              { piezaNombre: { contains: search, mode: 'insensitive' } },
              { po: { cliente: { razonSocial: { contains: search, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const [ordenes, total] = await Promise.all([
      this.prisma.ordenTrabajo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          po: { include: { cliente: { select: { id: true, codigo: true, razonSocial: true } } } },
          _count: { select: { operaciones: true, inspecciones: true } },
        },
      }),
      this.prisma.ordenTrabajo.count({ where }),
    ]);

    return { data: ordenes, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneOrdenTrabajo(id: string) {
    const orden = await this.prisma.ordenTrabajo.findUnique({
      where: { id },
      include: {
        po: { include: { cliente: true, cotizacion: true } },
        operaciones: { include: { maquina: true, operador: true, inspecciones: true } },
        inspecciones: true,
      },
    });

    if (!orden) {
      throw new NotFoundException({ message: 'Orden de trabajo no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    return orden;
  }

  async updateOrdenTrabajo(id: string, data: UpdateOrdenTrabajoDto) {
    try {
      const updateData: Prisma.OrdenTrabajoUpdateInput = {};
      if (data.estatus) updateData.estatus = data.estatus as any;
      if (data.notas !== undefined) updateData.notas = data.notas;
      if (data.cantidad) updateData.cantidad = data.cantidad;

      return await this.prisma.ordenTrabajo.update({ where: { id }, data: updateData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Orden de trabajo no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async findAllOperaciones(page: number = 1, limit: number = 20, estatus?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.OperacionWhereInput = estatus ? { estatus: estatus as any } : {};
    const [operaciones, total] = await Promise.all([
      this.prisma.operacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wo: { include: { po: { include: { cliente: { select: { razonSocial: true, codigo: true } } } } } },
          maquina: true,
          operador: { select: { id: true, nombre: true, apellido: true, username: true } },
        },
      }),
      this.prisma.operacion.count({ where }),
    ]);

    return { data: operaciones, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneOperacion(id: string) {
    const operacion = await this.prisma.operacion.findUnique({
      where: { id },
      include: { wo: { include: { po: { include: { cliente: true } } } }, maquina: true, operador: true, inspecciones: true },
    });

    if (!operacion) {
      throw new NotFoundException({ message: 'Operación no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    return operacion;
  }

  async updateOperacion(id: string, data: UpdateOperacionDto) {
    try {
      const updateData: Prisma.OperacionUpdateInput = {};
      if (data.tiempoReal !== undefined) updateData.tiempoReal = new Prisma.Decimal(data.tiempoReal);
      if (data.estatus) updateData.estatus = data.estatus as any;
      if (data.notas !== undefined) updateData.notas = data.notas;

      return await this.prisma.operacion.update({ where: { id }, data: updateData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Operación no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  private async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `WO-${year}-`;
    const last = await this.prisma.ordenTrabajo.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
    });
    let sequence = 1;
    if (last) {
      const match = last.folio.match(/WO-\d+-(\d+)/);
      if (match) sequence = parseInt(match[1], 10) + 1;
    }
    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
