import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [clientes, cotizaciones, ordenesCompra, ordenesTrabajo, materiales, proveedores, operaciones] = await Promise.all([
      this.prisma.cliente.count(),
      this.prisma.cotizacion.count(),
      this.prisma.ordenCompra.count(),
      this.prisma.ordenTrabajo.count(),
      this.prisma.material.count(),
      this.prisma.proveedor.count(),
      this.prisma.operacion.count(),
    ]);

    const cotizacionesPorEstatus = await this.prisma.cotizacion.groupBy({
      by: ['estatus'],
      _count: true,
    });

    const ordenesPorEstatus = await this.prisma.ordenCompra.groupBy({
      by: ['estatus'],
      _count: true,
    });

    const totalVentas = await this.prisma.cotizacion.aggregate({
      _sum: { total: true },
      where: { estatus: 'ACEPTADA' },
    });

    const totalCompras = await this.prisma.ordenCompra.aggregate({
      _sum: { total: true },
      where: { estatus: { in: ['APROBADA', 'EN_PRODUCCION', 'COMPLETADA'] } },
    });

    return {
      clientes,
      cotizaciones,
      ordenesCompra,
      ordenesTrabajo,
      materiales,
      proveedores,
      operaciones,
      cotizacionesPorEstatus,
      ordenesPorEstatus,
      totalVentas: totalVentas._sum.total?.toString() || '0',
      totalCompras: totalCompras._sum.total?.toString() || '0',
    };
  }
}
