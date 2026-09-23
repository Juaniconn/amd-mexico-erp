import { Injectable, NotFoundException, BadRequestException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { FacturacionService } from '../facturacion/facturacion.service';

@Injectable()
export class EmbarquesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly facturacion: FacturacionService,
  ) {}

  private async nextFolio() {
    const last = await this.prisma.embarque.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { folio: true },
    });
    const n = last ? parseInt(last.folio.replace('EMB-', ''), 10) || 0 : 0;
    return `EMB-${String(n + 1).padStart(5, '0')}`;
  }

  async findAll(page = 1, limit = 20, otId?: string, estatus?: string, sucursalId?: string) {
    const where: any = {
      ...(otId ? { otId } : {}),
      ...(estatus ? { estatus: estatus as any } : {}),
      ...(sucursalId ? { sucursalId } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.embarque.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          ot: { select: { id: true, folio: true, estatus: true } },
          detalles: true,
          sucursal: { select: { id: true, codigo: true, nombre: true } },
        },
      }),
      this.prisma.embarque.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const emb = await this.prisma.embarque.findUnique({
      where: { id },
      include: {
        ot: { include: { partes: true, cotizacion: { include: { cliente: true } } } },
        detalles: { include: { parte: true } },
        creador: { select: { id: true, nombre: true, apellido: true } },
        sucursal: true,
      },
    });
    if (!emb) throw new NotFoundException('Embarque no encontrado');
    return emb;
  }

  async create(
    data: {
      otId: string;
      sucursalId?: string;
      destinatario?: string;
      direccion?: string;
      guia?: string;
      transportista?: string;
      notas?: string;
      detalles?: Array<{ parteId?: string; descripcion: string; cantidad: number }>;
    },
    userId?: string,
  ) {
    const ot = await this.prisma.ordenTrabajo.findFirst({
      where: { OR: [{ id: data.otId }, { folio: data.otId }] },
      include: {
        partes: true,
        cotizacion: { include: { cliente: true } },
      },
    });
    if (!ot) throw new NotFoundException('Orden de trabajo no encontrada');

    let detalles = data.detalles;
    if (!detalles?.length) {
      detalles = (ot.partes || []).map((p) => ({
        parteId: p.id,
        descripcion: p.piezaNombre || p.numeroParte || 'Parte',
        cantidad: Number(p.cantidad) || 1,
      }));
    }
    if (!detalles.length) {
      throw new BadRequestException('Sin líneas de embarque (OT sin partes)');
    }

    const cliente = ot.cotizacion?.cliente;
    const folio = await this.nextFolio();

    return this.prisma.embarque.create({
      data: {
        folio,
        otId: ot.id,
        sucursalId: data.sucursalId || ot.sucursalId,
        destinatario:
          data.destinatario || cliente?.razonSocial || undefined,
        direccion: data.direccion || cliente?.direccion || undefined,
        guia: data.guia,
        transportista: data.transportista,
        notas: data.notas,
        creadoPor: userId,
        detalles: {
          create: detalles.map((d) => ({
            parteId: d.parteId,
            descripcion: d.descripcion,
            cantidad: d.cantidad,
          })),
        },
      },
      include: { detalles: true, ot: { select: { id: true, folio: true } } },
    });
  }

  async update(
    id: string,
    data: {
      destinatario?: string;
      direccion?: string;
      guia?: string;
      transportista?: string;
      notas?: string;
    },
  ) {
    const emb = await this.findOne(id);
    if (emb.estatus !== 'BORRADOR') {
      throw new BadRequestException('Solo se editan embarques en BORRADOR');
    }
    return this.prisma.embarque.update({
      where: { id },
      data,
      include: { detalles: true },
    });
  }

  async enviar(id: string) {
    const emb = await this.findOne(id);
    if (emb.estatus !== 'BORRADOR') {
      throw new BadRequestException({
        message: 'El embarque ya no está en BORRADOR',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const updated = await this.prisma.embarque.update({
      where: { id },
      data: { estatus: 'ENVIADO', enviadoAt: new Date() },
      include: { detalles: true, ot: { select: { id: true, folio: true } } },
    });

    // Al finalizar entrega → pedido en cola CONTPAQi (Facturación)
    let pedidoFacturacion: any = null;
    try {
      pedidoFacturacion = await this.facturacion.crearPedidoDesdeEntrega(
        updated.otId,
        {
          embarqueId: updated.id,
          notas: `Auto al enviar embarque ${updated.folio}`,
        },
      );
    } catch (err: any) {
      // No bloquea el embarque si falta cotización; se reporta en respuesta
      pedidoFacturacion = {
        error: err?.message || 'No se pudo encolar pedido CONTPAQi',
      };
    }

    return { ...updated, pedidoFacturacion };
  }

  async cancelar(id: string) {
    const emb = await this.findOne(id);
    if (emb.estatus === 'ENTREGADO') {
      throw new BadRequestException('No se puede cancelar un embarque ENTREGADO');
    }
    return this.prisma.embarque.update({
      where: { id },
      data: { estatus: 'CANCELADO' },
    });
  }
}
