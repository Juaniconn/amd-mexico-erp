import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TipoReporte } from '@prisma/client';

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
      where: { estatus: { in: ['RECIBIDA'] as any } },
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

  async create(data: any) {
    return this.prisma.reporte.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo as TipoReporte,
        descripcion: data.descripcion,
        parametros: data.parametros,
        creadoPorId: data.creadoPorId,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, tipo?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (tipo) where.tipo = tipo as TipoReporte;

    const [reportes, total] = await Promise.all([
      this.prisma.reporte.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { creador: { select: { id: true, nombre: true, apellido: true } } },
      }),
      this.prisma.reporte.count({ where }),
    ]);

    return { data: reportes, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    return this.prisma.reporte.findUnique({
      where: { id },
      include: { creador: { select: { id: true, nombre: true, apellido: true } } },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.reporte.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.reporte.delete({ where: { id } });
    return { message: 'Reporte eliminado correctamente' };
  }

  async generarReporte(tipo: string, parametros?: any) {
    switch (tipo) {
      case 'VENTAS':
        return this.generarReporteVentas(parametros);
      case 'COMPRAS':
        return this.generarReporteCompras(parametros);
      case 'PRODUCCION':
        return this.generarReporteProduccion(parametros);
      case 'INVENTARIO':
        return this.generarReporteInventario();
      case 'FINANZAS':
        return this.generarReporteFinanzas(parametros);
      default:
        throw new Error('Tipo de reporte no válido');
    }
  }

  private async generarReporteVentas(parametros?: any) {
    const where: any = {};
    if (parametros?.fechaInicio) where.createdAt = { gte: new Date(parametros.fechaInicio) };
    if (parametros?.fechaFin) where.createdAt = { ...where.createdAt, lte: new Date(parametros.fechaFin) };

    const cotizaciones = await this.prisma.cotizacion.findMany({
      where,
      include: { cliente: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      tipo: 'VENTAS',
      titulo: 'Reporte de Ventas',
      fechaGeneracion: new Date(),
      datos: cotizaciones.map((c) => ({
        folio: c.folio,
        cliente: c.cliente?.razonSocial,
        fecha: c.createdAt,
        estatus: c.estatus,
        subtotal: c.subtotal,
        iva: c.iva,
        total: c.total,
      })),
      resumen: {
        totalRegistros: cotizaciones.length,
        montoTotal: cotizaciones.reduce((acc, c) => acc + Number(c.total), 0),
      },
    };
  }

  private async generarReporteCompras(parametros?: any) {
    const where: any = {};
    if (parametros?.fechaInicio) where.createdAt = { gte: new Date(parametros.fechaInicio) };
    if (parametros?.fechaFin) where.createdAt = { ...where.createdAt, lte: new Date(parametros.fechaFin) };

    const ordenes = await this.prisma.ordenCompra.findMany({
      where,
      include: { proveedor: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      tipo: 'COMPRAS',
      titulo: 'Reporte de Compras',
      fechaGeneracion: new Date(),
      datos: ordenes.map((o) => ({
        folio: o.folio,
        proveedor: o.proveedor?.razonSocial,
        fecha: o.createdAt,
        estatus: o.estatus,
        total: o.total,
      })),
      resumen: {
        totalRegistros: ordenes.length,
        montoTotal: ordenes.reduce((acc, o) => acc + Number(o.total), 0),
      },
    };
  }

  private async generarReporteProduccion(parametros?: any) {
    const where: any = {};
    if (parametros?.fechaInicio) where.createdAt = { gte: new Date(parametros.fechaInicio) };
    if (parametros?.fechaFin) where.createdAt = { ...where.createdAt, lte: new Date(parametros.fechaFin) };

    const ots = await this.prisma.ordenTrabajo.findMany({
      where,
      include: { cotizacion: { include: { cliente: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      tipo: 'PRODUCCION',
      titulo: 'Reporte de Producción',
      fechaGeneracion: new Date(),
      datos: ots.map((ot) => ({
        folio: ot.folio,
        cliente: ot.cotizacion?.cliente?.razonSocial,
        fecha: ot.createdAt,
        estatus: ot.estatus,
        piezas: (ot.cotizacion as any)?.partes?.length || 0,
      })),
      resumen: { totalRegistros: ots.length },
    };
  }

  private async generarReporteInventario() {
    const materiales = await this.prisma.material.findMany({
      orderBy: { nombre: 'asc' },
    });

    return {
      tipo: 'INVENTARIO',
      titulo: 'Reporte de Inventario',
      fechaGeneracion: new Date(),
      datos: materiales.map((m) => ({
        codigo: m.codigo,
        nombre: m.nombre,
        unidad: m.unidad,
        stockActual: m.stockActual,
        stockMinimo: m.stockMinimo,
        precioUnitario: m.precioUnitario,
      })),
      resumen: {
        totalRegistros: materiales.length,
        valorTotal: materiales.reduce((acc, m) => acc + Number(m.stockActual) * Number(m.precioUnitario || 0), 0),
      },
    };
  }

  private async generarReporteFinanzas(parametros?: any) {
    const [facturas, ordenesCompra] = await Promise.all([
      this.prisma.factura.findMany({
        include: { cliente: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ordenCompra.findMany({
        include: { proveedor: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      tipo: 'FINANZAS',
      titulo: 'Reporte Financiero',
      fechaGeneracion: new Date(),
      datos: {
        facturas: facturas.map((f) => ({
          folio: f.folio,
          cliente: f.cliente?.razonSocial,
          fecha: f.fechaFactura || f.createdAt,
          estatus: f.estatus,
          total: f.total,
        })),
        ordenesCompra: ordenesCompra.map((o) => ({
          folio: o.folio,
          proveedor: o.proveedor?.razonSocial,
          fecha: o.createdAt,
          estatus: o.estatus,
          total: o.total,
        })),
      },
      resumen: {
        totalFacturas: facturas.length,
        totalOrdenesCompra: ordenesCompra.length,
        montoFacturado: facturas.reduce((acc, f) => acc + Number(f.total), 0),
        montoComprado: ordenesCompra.reduce((acc, o) => acc + Number(o.total), 0),
      },
    };
  }

  getTipos() {
    return Object.values(TipoReporte);
  }
}
