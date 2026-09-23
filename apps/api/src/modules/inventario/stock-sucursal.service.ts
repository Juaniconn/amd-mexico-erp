import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

type Tx = Prisma.TransactionClient | PrismaService;

@Injectable()
export class StockSucursalService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureRow(tx: Tx, materialId: string, sucursalId: string, stockMinimo = 0) {
    const existing = await tx.stockSucursal.findUnique({
      where: { materialId_sucursalId: { materialId, sucursalId } },
    });
    if (existing) return existing;
    return tx.stockSucursal.create({
      data: {
        materialId,
        sucursalId,
        stockActual: 0,
        stockMinimo,
      },
    });
  }

  async getStock(tx: Tx, materialId: string, sucursalId: string) {
    const row = await this.ensureRow(tx, materialId, sucursalId);
    return Number(row.stockActual);
  }

  /** Sync Material.stockActual = sum of all branches (legacy compat). */
  async syncMaterialAggregate(tx: Tx, materialId: string) {
    const agg = await tx.stockSucursal.aggregate({
      where: { materialId },
      _sum: { stockActual: true },
    });
    const total = agg._sum.stockActual ?? new Prisma.Decimal(0);
    await tx.material.update({
      where: { id: materialId },
      data: { stockActual: total },
    });
    return Number(total);
  }

  async adjust(
    tx: Tx,
    opts: {
      materialId: string;
      sucursalId: string;
      cantidad: number; // positive for entrada, we'll use tipo
      tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'TRANSFERENCIA_OUT' | 'TRANSFERENCIA_IN';
      documentoRef?: string;
      notas?: string;
      userId?: string;
      allowNegative?: boolean;
    },
  ) {
    const row = await this.ensureRow(tx, opts.materialId, opts.sucursalId);
    const stockAnterior = Number(row.stockActual);
    let delta = opts.cantidad;
    if (opts.tipo === 'SALIDA' || opts.tipo === 'TRANSFERENCIA_OUT') {
      delta = -Math.abs(opts.cantidad);
    } else if (opts.tipo === 'ENTRADA' || opts.tipo === 'TRANSFERENCIA_IN') {
      delta = Math.abs(opts.cantidad);
    }
    const stockResultante = stockAnterior + delta;
    if (stockResultante < -0.0001 && !opts.allowNegative) {
      throw new BadRequestException(
        `Stock insuficiente en sucursal (material ${opts.materialId}): hay ${stockAnterior}, cambio ${delta}`,
      );
    }

    await tx.stockSucursal.update({
      where: { id: row.id },
      data: { stockActual: stockResultante },
    });

    await tx.movimientoInventario.create({
      data: {
        materialId: opts.materialId,
        sucursalId: opts.sucursalId,
        tipo: opts.tipo,
        cantidad: Math.abs(opts.cantidad),
        stockAnterior,
        stockResultante,
        documentoRef: opts.documentoRef,
        notas: opts.notas,
        realizadoPorId: opts.userId,
      },
    });

    await this.syncMaterialAggregate(tx, opts.materialId);

    return { stockAnterior, stockResultante };
  }
}
