'use client';

import { useEffect, useState, useCallback } from 'react';
import { get } from '@/lib/api';
import { AppLayout } from '@/components/AppLayout';
import { LoadingState, ErrorState } from '@/components/States';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import {
  Users,
  FileText,
  ShoppingCart,
  Wrench,
  Package,
  Truck,
  Settings,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DashboardStats {
  clientes: number;
  cotizaciones: number;
  ordenesCompra: number;
  ordenesTrabajo: number;
  materiales: number;
  proveedores: number;
  operaciones: number;
  cotizacionesPorEstatus: { estatus: string; _count: number }[];
  ordenesPorEstatus: { estatus: string; _count: number }[];
  totalVentas: string;
  totalCompras: string;
}

function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num);
}

// OKLCH-based status colors mapped to Tailwind classes
const ESTATUS_COTIZACION: Record<string, { barColor: string; label: string }> = {
  PENDIENTE: { barColor: 'bg-warning', label: 'Pendiente' },
  ENVIADA: { barColor: 'bg-brand', label: 'Enviada' },
  ACEPTADA: { barColor: 'bg-success', label: 'Aceptada' },
  RECHAZADA: { barColor: 'bg-danger', label: 'Rechazada' },
  CANCELADA: { barColor: 'bg-muted-foreground', label: 'Cancelada' },
};

const ESTATUS_OC: Record<string, { barColor: string; label: string }> = {
  PENDIENTE: { barColor: 'bg-warning', label: 'Pendiente' },
  APROBADA: { barColor: 'bg-success', label: 'Aprobada' },
  EN_PRODUCCION: { barColor: 'bg-brand', label: 'En Producción' },
  COMPLETADA: { barColor: 'bg-success', label: 'Completada' },
  CANCELADA: { barColor: 'bg-danger', label: 'Cancelada' },
};

function BarChartPanel({
  title,
  data,
  estatusMap,
}: {
  title: string;
  data: { estatus: string; _count: number }[];
  estatusMap: Record<string, { barColor: string; label: string }>;
}) {
  const chartData = data.map((item) => ({
    label: estatusMap[item.estatus]?.label || item.estatus,
    value: item._count,
    color: estatusMap[item.estatus]?.barColor || 'bg-muted-foreground',
  }));

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div className="card-premium p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-brand" />
        <h3 className="section-title !text-xs !tracking-wider">{title}</h3>
      </div>
      {chartData.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Sin datos disponibles
        </p>
      ) : (
        <div className="space-y-3">
          {chartData.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="font-bold text-foreground">{item.value}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Metric card configuration
interface MetricCardConfig {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export default function ReportesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await get<DashboardStats>('/api/reportes/dashboard');
      setStats(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const currentDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const financialKPIs: MetricCardConfig[] = stats
    ? [
        {
          label: 'Total Ventas',
          value: formatCurrency(stats.totalVentas),
          icon: DollarSign,
          iconBg: 'bg-success/10',
          iconColor: 'text-success',
        },
        {
          label: 'Total Compras',
          value: formatCurrency(stats.totalCompras),
          icon: TrendingUp,
          iconBg: 'bg-brand/10',
          iconColor: 'text-brand',
        },
      ]
    : [];

  const generalMetrics: MetricCardConfig[] = stats
    ? [
        {
          label: 'Clientes',
          value: stats.clientes,
          icon: Users,
          iconBg: 'bg-brand/10',
          iconColor: 'text-brand',
        },
        {
          label: 'Cotizaciones',
          value: stats.cotizaciones,
          icon: FileText,
          iconBg: 'bg-brand/10',
          iconColor: 'text-brand',
        },
        {
          label: 'Órdenes Compra',
          value: stats.ordenesCompra,
          icon: ShoppingCart,
          iconBg: 'bg-warning/10',
          iconColor: 'text-warning',
        },
        {
          label: 'Órdenes Trabajo',
          value: stats.ordenesTrabajo,
          icon: Wrench,
          iconBg: 'bg-warning/10',
          iconColor: 'text-warning',
        },
        {
          label: 'Materiales',
          value: stats.materiales,
          icon: Package,
          iconBg: 'bg-muted',
          iconColor: 'text-muted-foreground',
        },
        {
          label: 'Proveedores',
          value: stats.proveedores,
          icon: Truck,
          iconBg: 'bg-muted',
          iconColor: 'text-muted-foreground',
        },
        {
          label: 'Operaciones',
          value: stats.operaciones,
          icon: Settings,
          iconBg: 'bg-success/10',
          iconColor: 'text-success',
        },
      ]
    : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with date */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{currentDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-brand-muted px-3 py-1.5 text-xs font-medium text-brand">
            <div className="h-2 w-2 animate-pulse rounded-full bg-brand" />
            Procesamiento de datos en tiempo real
          </div>
        </div>

        {/* Search / Filter Bar */}
        <SearchFilterBar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Buscar en reportes..."
        />

        {/* Loading State */}
        {loading && (
          <LoadingState message="Procesando datos del dashboard..." />
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorState message={error} onRetry={loadStats} />
        )}

        {/* Dashboard Content */}
        {!loading && !error && stats && (
          <>
            {/* Financial KPIs — card grid matching Clientes pattern */}
            <div>
              <h2 className="section-title mb-3">Indicadores Financieros</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {financialKPIs.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="section-title">{kpi.label}</p>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                          {kpi.value}
                        </p>
                      </div>
                      <div className={`ml-3 shrink-0 rounded-lg p-2 ${kpi.iconBg}`}>
                        <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main KPIs Grid — card grid matching Clientes pattern */}
            <div>
              <h2 className="section-title mb-3">Métricas Generales</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {generalMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="section-title">{metric.label}</p>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                          {metric.value}
                        </p>
                      </div>
                      <div className={`ml-3 shrink-0 rounded-lg p-2 ${metric.iconBg}`}>
                        <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div>
              <h2 className="section-title mb-3">Distribución por Estatus</h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <BarChartPanel
                  title="Cotizaciones por Estatus"
                  data={stats.cotizacionesPorEstatus}
                  estatusMap={ESTATUS_COTIZACION}
                />
                <BarChartPanel
                  title="Órdenes de Compra por Estatus"
                  data={stats.ordenesPorEstatus}
                  estatusMap={ESTATUS_OC}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
