import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Cola de monitoreo para Contabilidad (CONTPAQi).
 * No emite CFDI ni gestiona contabilidad: solo registra pedidos
 * OT + cotización listos para facturar en CONTPAQi.
 */
@Injectable()
export class FacturacionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    estatus?: string,
    sucursalId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      ...(estatus ? { estatus: estatus as any } : {}),
      ...(sucursalId ? { sucursalId } : {}),
      ...(search
        ? {
            OR: [
              { folio: { contains: search, mode: 'insensitive' } },
              { ot: { folio: { contains: search, mode: 'insensitive' } } },
              {
                ot: {
                  cotizacion: {
                    folio: { contains: search, mode: 'insensitive' },
                  },
                },
              },
              {
                cliente: {
                  razonSocial: { contains: search, mode: 'insensitive' },
                },
              },
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
          ot: {
            select: {
              id: true,
              folio: true,
              estatus: true,
              cotizacion: { select: { id: true, folio: true, total: true } },
            },
          },
          cliente: { select: { id: true, razonSocial: true, rfc: true } },
          sucursal: { select: { id: true, nombre: true, codigo: true } },
          embarque: { select: { id: true, folio: true, estatus: true } },
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
            cotizacion: { include: { cliente: true, detalles: true } },
          },
        },
        cliente: true,
        sucursal: true,
        creador: { select: { id: true, nombre: true, apellido: true } },
        embarque: true,
        detalles: true,
      },
    });

    if (!factura) {
      throw new NotFoundException('Pedido de facturación no encontrado');
    }

    return factura;
  }

  /**
   * Crea (o reutiliza) pedido de facturación para Contabilidad.
   * Disparado al finalizar entrega (embarque ENVIADO).
   */
  async crearPedidoDesdeEntrega(
    otId: string,
    opts?: { embarqueId?: string; userId?: string; notas?: string },
  ) {
    const ot = await this.prisma.ordenTrabajo.findFirst({
      where: { OR: [{ id: otId }, { folio: otId }] },
      include: {
        cotizacion: { include: { cliente: true, detalles: true } },
        partes: true,
      },
    });

    if (!ot) {
      throw new NotFoundException('Orden de trabajo no encontrada');
    }

    const existing = await this.prisma.factura.findFirst({
      where: {
        otId: ot.id,
        estatus: { in: ['PENDIENTE', 'PAGADA'] },
      },
      include: {
        ot: {
          select: {
            id: true,
            folio: true,
            cotizacion: { select: { id: true, folio: true } },
          },
        },
        cliente: { select: { id: true, razonSocial: true } },
        detalles: true,
        embarque: { select: { id: true, folio: true } },
      },
    });

    if (existing) {
      if (opts?.embarqueId && !existing.embarqueId) {
        return this.prisma.factura.update({
          where: { id: existing.id },
          data: { embarqueId: opts.embarqueId },
          include: {
            ot: {
              select: {
                id: true,
                folio: true,
                cotizacion: { select: { id: true, folio: true } },
              },
            },
            cliente: { select: { id: true, razonSocial: true } },
            embarque: { select: { id: true, folio: true } },
            detalles: true,
          },
        });
      }
      return existing;
    }

    const cotizacion = ot.cotizacion;
    if (!cotizacion?.clienteId) {
      throw new BadRequestException(
        'La OT no tiene cotización/cliente; no se puede encolar para CONTPAQi',
      );
    }

    const subtotal = Number(cotizacion.subtotal) || 0;
    const iva = Number(cotizacion.iva) || 0;
    const total = Number(cotizacion.total) || 0;

    const lastFactura = await this.prisma.factura.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { folio: true },
    });
    const lastNumber = lastFactura
      ? parseInt(lastFactura.folio.replace(/\D/g, ''), 10) || 0
      : 0;
    const folio = `PF-${String(lastNumber + 1).padStart(6, '0')}`;

    const lineas =
      cotizacion.detalles?.length > 0
        ? cotizacion.detalles.map((d) => ({
            descripcion: d.piezaNombre,
            cantidad: Number(d.cantidad),
            precioUnitario: Number(d.precioUnitario),
            importe:
              Number(d.subtotal) ||
              Number(d.cantidad) * Number(d.precioUnitario),
          }))
        : (ot.partes || []).map((p) => ({
            descripcion: p.piezaNombre,
            cantidad: Number(p.cantidad),
            precioUnitario: 0,
            importe: 0,
          }));

    return this.prisma.factura.create({
      data: {
        folio,
        otId: ot.id,
        clienteId: cotizacion.clienteId,
        sucursalId: ot.sucursalId,
        embarqueId: opts?.embarqueId,
        moneda: cotizacion.moneda || 'MXN',
        tipoCambio: cotizacion.tipoCambio,
        subtotal,
        iva,
        total,
        estatus: 'PENDIENTE',
        notas:
          opts?.notas ||
          `Pedido para facturar en CONTPAQi — OT ${ot.folio} / Cot ${cotizacion.folio}`,
        creadoPor: opts?.userId,
        detalles: lineas.length
          ? {
              create: lineas,
            }
          : undefined,
      },
      include: {
        ot: {
          select: {
            id: true,
            folio: true,
            cotizacion: { select: { id: true, folio: true } },
          },
        },
        cliente: { select: { id: true, razonSocial: true } },
        embarque: { select: { id: true, folio: true } },
        detalles: true,
      },
    });
  }

  /** @deprecated alias — usar crearPedidoDesdeEntrega */
  async createFromOT(otId: string, userId?: string) {
    return this.crearPedidoDesdeEntrega(otId, { userId });
  }

  async update(id: string, data: { notas?: string }) {
    const factura = await this.prisma.factura.findUnique({ where: { id } });
    if (!factura) throw new NotFoundException('Pedido no encontrado');
    return this.prisma.factura.update({
      where: { id },
      data: {
        ...(data.notas !== undefined ? { notas: data.notas } : {}),
      },
      include: {
        ot: { select: { id: true, folio: true } },
        cliente: { select: { id: true, razonSocial: true } },
      },
    });
  }

  async cambiarEstatus(id: string, estatus: string) {
    if (estatus === 'PAGADA') return this.marcarFacturadoContpaq(id);
    if (estatus === 'CANCELADA') return this.cancelar(id);
    const factura = await this.prisma.factura.findUnique({ where: { id } });
    if (!factura) throw new NotFoundException('Pedido no encontrado');
    return this.prisma.factura.update({
      where: { id },
      data: { estatus: estatus as any },
    });
  }

  /** Contabilidad ya emitió la factura en CONTPAQi */
  async marcarFacturadoContpaq(id: string) {
    const factura = await this.prisma.factura.findUnique({ where: { id } });
    if (!factura) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return this.prisma.factura.update({
      where: { id },
      data: {
        estatus: 'PAGADA',
        fechaFactura: new Date(),
        notas: factura.notas
          ? `${factura.notas}\n[Marcador CONTPAQi ${new Date().toISOString().slice(0, 10)}]`
          : `Facturado en CONTPAQi ${new Date().toISOString().slice(0, 10)}`,
      },
    });
  }

  /** alias UI legacy */
  async marcarFacturada(id: string) {
    return this.marcarFacturadoContpaq(id);
  }

  async cancelar(id: string) {
    const factura = await this.prisma.factura.findUnique({ where: { id } });
    if (!factura) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (factura.estatus === 'PAGADA') {
      throw new BadRequestException(
        'No se puede cancelar un pedido ya marcado como facturado en CONTPAQi',
      );
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
        ot: {
          select: {
            id: true,
            folio: true,
            estatus: true,
            cotizacion: { select: { id: true, folio: true } },
          },
        },
        cliente: { select: { id: true, razonSocial: true } },
        embarque: { select: { id: true, folio: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getStats() {
    const [total, pendientes, facturados, canceladas] = await Promise.all([
      this.prisma.factura.count(),
      this.prisma.factura.count({ where: { estatus: 'PENDIENTE' } }),
      this.prisma.factura.count({ where: { estatus: 'PAGADA' } }),
      this.prisma.factura.count({ where: { estatus: 'CANCELADA' } }),
    ]);

    const totalPendiente = await this.prisma.factura.aggregate({
      where: { estatus: 'PENDIENTE' },
      _sum: { total: true },
    });

    return {
      total,
      pendientes,
      facturadosContpaq: facturados,
      pagadas: facturados,
      canceladas,
      totalPendiente: totalPendiente._sum.total || 0,
    };
  }
}
