import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class FacturacionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, search?: string, estatus?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      ...(estatus ? { estatus: estatus as any } : {}),
      ...(search
        ? {
            OR: [
              { folio: { contains: search, mode: 'insensitive' } },
              { ot: { folio: { contains: search, mode: 'insensitive' } } },
              { cliente: { razonSocial: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [facturas, total] = await Promise.all([
      this.prisma.factura.findMany({
        where,
        skip,
        take: limit,
        include: {
          ot: { select: { id: true, folio: true, estatus: true } },
          cliente: { select: { id: true, razonSocial: true } },
          sucursal: { select: { id: true, nombre: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.factura.count({ where }),
    ]);

    return {
      data: facturas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const factura = await this.prisma.factura.findUnique({
      where: { id },
      include: {
        ot: {
          include: {
            partes: true,
            cotizacion: { include: { cliente: true } },
          },
        },
        cliente: true,
        sucursal: true,
        creador: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    return factura;
  }

  async createFromOT(otId: string, userId?: string) {
    const ot = await this.prisma.ordenTrabajo.findUnique({
      where: { id: otId },
      include: {
        cotizacion: { include: { cliente: true } },
        partes: true,
      },
    });

    if (!ot) {
      throw new NotFoundException('Orden de trabajo no encontrada');
    }

    if (ot.estatus !== 'COMPLETADA') {
      throw new Error('Solo se pueden facturar órdenes de trabajo completadas');
    }

    // Verificar si ya existe una factura para esta OT
    const existing = await this.prisma.factura.findFirst({
      where: { otId },
    });

    if (existing) {
      throw new Error('Ya existe una factura para esta orden de trabajo');
    }

    // Calcular totales desde la cotización
    const cotizacion = ot.cotizacion;
    const subtotal = cotizacion ? Number(cotizacion.subtotal) : 0;
    const iva = cotizacion ? Number(cotizacion.iva) : 0;
    const total = cotizacion ? Number(cotizacion.total) : 0;

    // Generar folio de factura
    const lastFactura = await this.prisma.factura.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { folio: true },
    });

    const lastNumber = lastFactura
      ? parseInt(lastFactura.folio.replace('FAC-', ''), 10)
      : 0;
    const folio = `FAC-${String(lastNumber + 1).padStart(6, '0')}`;

    const factura = await this.prisma.factura.create({
      data: {
        folio,
        otId,
        clienteId: cotizacion?.clienteId || '',
        sucursalId: ot.sucursalId,
        moneda: cotizacion?.moneda || 'MXN',
        tipoCambio: cotizacion?.tipoCambio,
        subtotal,
        iva,
        total,
        estatus: 'PENDIENTE',
        creadoPor: userId,
      },
      include: {
        ot: { select: { id: true, folio: true } },
        cliente: { select: { id: true, razonSocial: true } },
      },
    });

    return factura;
  }

  async marcarFacturada(id: string) {
    const factura = await this.prisma.factura.findUnique({ where: { id } });
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    return this.prisma.factura.update({
      where: { id },
      data: {
        estatus: 'FACTURADA',
        fechaFactura: new Date(),
      },
    });
  }

  async cancelar(id: string) {
    const factura = await this.prisma.factura.findUnique({ where: { id } });
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    if (factura.estatus === 'FACTURADA') {
      throw new Error('No se puede cancelar una factura ya facturada');
    }

    return this.prisma.factura.update({
      where: { id },
      data: { estatus: 'CANCELADA' },
    });
  }

  async getPendientes() {
    return this.prisma.factura.findMany({
      where: { estatus: 'PENDIENTE' },
      include: {
        ot: { select: { id: true, folio: true, estatus: true } },
        cliente: { select: { id: true, razonSocial: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getStats() {
    const [total, pendientes, facturadas, canceladas] = await Promise.all([
      this.prisma.factura.count(),
      this.prisma.factura.count({ where: { estatus: 'PENDIENTE' } }),
      this.prisma.factura.count({ where: { estatus: 'FACTURADA' } }),
      this.prisma.factura.count({ where: { estatus: 'CANCELADA' } }),
    ]);

    const totalPendiente = await this.prisma.factura.aggregate({
      where: { estatus: 'PENDIENTE' },
      _sum: { total: true },
    });

    return {
      total,
      pendientes,
      facturadas,
      canceladas,
      totalPendiente: totalPendiente._sum.total || 0,
    };
  }
}
