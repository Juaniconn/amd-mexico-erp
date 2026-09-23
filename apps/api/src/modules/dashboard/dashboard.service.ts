import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  EstatusCotizacion,
  EstatusWO,
  EstatusFactura,
  EstatusOrdenCompra,
} from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      clientes,
      cotizaciones,
      ordenesCompra,
      ordenesTrabajo,
      materiales,
      proveedores,
      operaciones,
      facturas,
      empleados,
    ] = await Promise.all([
      this.prisma.cliente.count(),
      this.prisma.cotizacion.count(),
      this.prisma.ordenCompra.count(),
      this.prisma.ordenTrabajo.count(),
      this.prisma.material.count(),
      this.prisma.proveedor.count(),
      this.prisma.operacion.count(),
      this.prisma.factura.count(),
      this.prisma.empleado.count(),
    ]);

    return {
      clientes,
      cotizaciones,
      ordenesCompra,
      ordenesTrabajo,
      materiales,
      proveedores,
      operaciones,
      facturas,
      empleados,
    };
  }

  async getRecentActivity(from?: string, to?: string) {
    const activities: Array<{
      id: string;
      type: string;
      text: string;
      time: string;
      url: string;
    }> = [];

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    // Si 'to' es un día (sin hora), incluir todo el día
    if (toDate && to && to.length <= 10) {
      toDate.setHours(23, 59, 59, 999);
    }

    const dateFilter = (field: string) => {
      const filter: any = {};
      if (fromDate) filter.gte = fromDate;
      if (toDate) filter.lte = toDate;
      return Object.keys(filter).length > 0 ? filter : undefined;
    };

    // Últimas cotizaciones
    const cotizaciones = await this.prisma.cotizacion.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { cliente: true },
      where: dateFilter('createdAt'),
    });
    cotizaciones.forEach((c: any) => {
      activities.push({
        id: `cot-${c.id}`,
        type: 'cotizacion',
        text: `Cotización ${c.folio} para ${c.cliente.razonSocial} — $${c.total}`,
        time: c.createdAt.toISOString(),
        url: `/cotizaciones/${c.id}`,
      });
    });

    // Últimas órdenes de trabajo
    const ordenesTrabajo = await this.prisma.ordenTrabajo.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { responsable: true },
      where: dateFilter('createdAt'),
    });
    ordenesTrabajo.forEach((ot: any) => {
      activities.push({
        id: `ot-${ot.id}`,
        type: 'orden-trabajo',
        text: `Orden de trabajo ${ot.folio}${ot.responsable ? ` — ${ot.responsable.nombre} ${ot.responsable.apellido}` : ''} [${ot.estatus}]`,
        time: ot.createdAt.toISOString(),
        url: `/produccion/ordenes/${ot.id}`,
      });
    });

    // Últimas órdenes de compra
    const ordenesCompra = await this.prisma.ordenCompra.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { proveedor: true },
      where: dateFilter('createdAt'),
    });
    ordenesCompra.forEach((oc: any) => {
      activities.push({
        id: `oc-${oc.id}`,
        type: 'orden-compra',
        text: `Orden de compra ${oc.folio}${oc.proveedor ? ` — ${oc.proveedor.razonSocial}` : ''} — $${oc.total}`,
        time: oc.createdAt.toISOString(),
        url: `/compras/ordenes/${oc.id}`,
      });
    });

    // Últimas facturas
    const facturas = await this.prisma.factura.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { cliente: true },
      where: dateFilter('createdAt'),
    });
    facturas.forEach((f: any) => {
      activities.push({
        id: `fac-${f.id}`,
        type: 'factura',
        text: `Factura ${f.folio} para ${f.cliente.razonSocial} — $${f.total} [${f.estatus}]`,
        time: f.createdAt.toISOString(),
        url: `/facturacion/${f.id}`,
      });
    });

    // Últimos clientes
    const clientes = await this.prisma.cliente.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      where: dateFilter('createdAt'),
    });
    clientes.forEach((c: any) => {
      activities.push({
        id: `cli-${c.id}`,
        type: 'cliente',
        text: `Cliente ${c.razonSocial} (${c.codigo})`,
        time: c.createdAt.toISOString(),
        url: `/clientes/${c.id}`,
      });
    });

    // Ordenar por fecha descendente
    return activities.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
  }

  async getAlerts() {
    const alerts: Array<{
      id: string;
      type: string;
      title: string;
      desc: string;
      severity: 'critica' | 'alta' | 'media' | 'baja';
      url: string;
    }> = [];

    // Cotizaciones vencidas (más de 30 días desde creación, estatus BORRADOR)
    const cotizacionesVencidas = await this.prisma.cotizacion.findMany({
      where: {
        estatus: { in: [EstatusCotizacion.BORRADOR] },
        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      include: { cliente: true },
    });
    if (cotizacionesVencidas.length > 0) {
      alerts.push({
        id: 'cot-vencidas',
        type: 'cotizacion',
        title: `${cotizacionesVencidas.length} cotizaciones vencidas`,
        desc: `La más antigua es ${cotizacionesVencidas[0].folio} de ${cotizacionesVencidas[0].cliente.razonSocial}`,
        severity: 'alta',
        url: '/cotizaciones',
      });
    }

    // Órdenes de trabajo pendientes con fecha estimada pasada
    const ordenesVencidas = await this.prisma.ordenTrabajo.findMany({
      where: {
        estatus: { in: [EstatusWO.PENDIENTE, EstatusWO.EN_PRODUCCION] },
        fechaFinEstimada: { lt: new Date() },
      },
      include: { responsable: true },
    });
    if (ordenesVencidas.length > 0) {
      alerts.push({
        id: 'ot-vencidas',
        type: 'orden-trabajo',
        title: `${ordenesVencidas.length} órdenes de trabajo vencidas`,
        desc: `La más antigua es ${ordenesVencidas[0].folio}`,
        severity: 'critica',
        url: '/produccion',
      });
    }

    // Materiales con stock bajo (filtrado en JS porque Prisma no permite comparar campos en where)
    const materiales = await this.prisma.material.findMany({
      where: { activo: true },
    });
    const materialesStockBajo = materiales.filter(
      (m: any) => Number(m.stockActual) <= Number(m.stockMinimo),
    );
    if (materialesStockBajo.length > 0) {
      alerts.push({
        id: 'stock-bajo',
        type: 'inventario',
        title: `${materialesStockBajo.length} materiales con stock bajo`,
        desc: `${materialesStockBajo[0].codigo} — ${materialesStockBajo[0].descripcion} (${materialesStockBajo[0].stockActual} ${materialesStockBajo[0].unidad})`,
        severity: 'media',
        url: '/inventario',
      });
    }

    // Facturas pendientes de pago
    const facturasPendientes = await this.prisma.factura.findMany({
      where: {
        estatus: EstatusFactura.PENDIENTE,
      },
      include: { cliente: true },
    });
    if (facturasPendientes.length > 0) {
      alerts.push({
        id: 'facturas-pendientes',
        type: 'factura',
        title: `${facturasPendientes.length} facturas pendientes de pago`,
        desc: `Total: $${facturasPendientes.reduce((sum: number, f: any) => sum + Number(f.total), 0).toFixed(2)}`,
        severity: 'alta',
        url: '/facturacion',
      });
    }

    // Órdenes de compra pendientes
    const ordenesCompraPendientes = await this.prisma.ordenCompra.findMany({
      where: {
        estatus: EstatusOrdenCompra.BORRADOR,
      },
    });
    if (ordenesCompraPendientes.length > 0) {
      alerts.push({
        id: 'oc-pendientes',
        type: 'orden-compra',
        title: `${ordenesCompraPendientes.length} órdenes de compra pendientes`,
        desc: `Total: $${ordenesCompraPendientes.reduce((sum: number, oc: any) => sum + Number(oc.total), 0).toFixed(2)}`,
        severity: 'baja',
        url: '/compras',
      });
    }

    // Preventivos vencidos
    const conIntervalo = await this.prisma.maquina.findMany({
      where: {
        activo: true,
        intervaloDiasPreventivo: { not: null },
        estatus: { not: 'RETIRADA' as any },
      },
      select: {
        id: true,
        codigo: true,
        intervaloDiasPreventivo: true,
        ultimoPreventivo: true,
      },
    });
    const now = Date.now();
    const preventivosVencidos = conIntervalo.filter((m) => {
      const intervalo = m.intervaloDiasPreventivo || 0;
      const base = m.ultimoPreventivo
        ? new Date(m.ultimoPreventivo).getTime()
        : 0;
      return now >= base + intervalo * 24 * 3600 * 1000;
    });
    if (preventivosVencidos.length > 0) {
      alerts.push({
        id: 'preventivos-vencidos',
        type: 'mantenimiento',
        title: `${preventivosVencidos.length} máquinas con preventivo vencido`,
        desc: `Ej. ${preventivosVencidos[0].codigo}`,
        severity: 'media',
        url: '/maquinaria',
      });
    }

    return alerts;
  }
}
