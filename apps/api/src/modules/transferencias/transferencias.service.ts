import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StockSucursalService } from '../inventario/stock-sucursal.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransferenciasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockSvc: StockSucursalService,
  ) {}

  private async generateFolio() {
    const year = new Date().getFullYear();
    const prefix = `TR-${year}-`;
    const last = await this.prisma.transferencia.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { folio: 'desc' },
    });
    let n = 1;
    if (last) {
      const parts = last.folio.split('-');
      n = (parseInt(parts[parts.length - 1], 10) || 0) + 1;
    }
    return `${prefix}${String(n).padStart(4, '0')}`;
  }

  async findAll(page = 1, limit = 20, sucursalId?: string) {
    const where: Prisma.TransferenciaWhereInput = sucursalId
      ? { OR: [{ origenId: sucursalId }, { destinoId: sucursalId }] }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.transferencia.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          origen: { select: { id: true, codigo: true, nombre: true } },
          destino: { select: { id: true, codigo: true, nombre: true } },
          detalles: { include: { material: { select: { id: true, codigo: true, nombre: true } } } },
        },
      }),
      this.prisma.transferencia.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const t = await this.prisma.transferencia.findUnique({
      where: { id },
      include: {
        origen: true,
        destino: true,
        detalles: { include: { material: true } },
      },
    });
    if (!t) throw new NotFoundException('Transferencia no encontrada');
    return t;
  }

  async create(
    data: {
      origenId: string;
      destinoId: string;
      notas?: string;
      detalles: Array<{ materialId: string; cantidad: number }>;
    },
    userId?: string,
  ) {
    if (data.origenId === data.destinoId) {
      throw new BadRequestException('Origen y destino deben ser distintos');
    }
    if (!data.detalles?.length) {
      throw new BadRequestException('Agrega al menos un material');
    }
    const folio = await this.generateFolio();
    return this.prisma.transferencia.create({
      data: {
        folio,
        origenId: data.origenId,
        destinoId: data.destinoId,
        notas: data.notas,
        creadoPorId: userId,
        estatus: 'PENDIENTE',
        detalles: {
          create: data.detalles.map((d) => ({
            materialId: d.materialId,
            cantidad: d.cantidad,
          })),
        },
      },
      include: {
        origen: true,
        destino: true,
        detalles: { include: { material: true } },
      },
    });
  }

  async cambiarEstatus(id: string, estatus: string, userId?: string) {
    const t = await this.findOne(id);
    if (estatus === 'CANCELADA') {
      if (t.estatus === 'RECIBIDA') {
        throw new BadRequestException('No se puede cancelar una transferencia ya recibida');
      }
      return this.prisma.transferencia.update({
        where: { id },
        data: { estatus: 'CANCELADA' },
      });
    }

    if (estatus === 'ENVIADA') {
      if (t.estatus !== 'PENDIENTE') {
        throw new BadRequestException('Solo PENDIENTE puede enviarse');
      }
      return this.prisma.transferencia.update({
        where: { id },
        data: { estatus: 'ENVIADA' },
      });
    }

    if (estatus === 'RECIBIDA') {
      if (t.estatus !== 'ENVIADA' && t.estatus !== 'PENDIENTE') {
        throw new BadRequestException('Estado inválido para recibir');
      }
      return this.prisma.$transaction(async (tx) => {
        for (const det of t.detalles) {
          await this.stockSvc.adjust(tx, {
            materialId: det.materialId,
            sucursalId: t.origenId,
            cantidad: Number(det.cantidad),
            tipo: 'TRANSFERENCIA_OUT',
            documentoRef: t.folio,
            notas: `Salida transferencia ${t.folio}`,
            userId,
          });
          await this.stockSvc.adjust(tx, {
            materialId: det.materialId,
            sucursalId: t.destinoId,
            cantidad: Number(det.cantidad),
            tipo: 'TRANSFERENCIA_IN',
            documentoRef: t.folio,
            notas: `Entrada transferencia ${t.folio}`,
            userId,
          });
        }
        return tx.transferencia.update({
          where: { id },
          data: { estatus: 'RECIBIDA' },
          include: {
            origen: true,
            destino: true,
            detalles: { include: { material: true } },
          },
        });
      });
    }

    throw new BadRequestException(`Estatus no soportado: ${estatus}`);
  }
}
