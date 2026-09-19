'use client';

import { useEffect, useState, useCallback } from 'react';
import { get } from '@/lib/api';
import { AppLayout } from '@/components/AppLayout';
import { StatCard, StatGrid } from '@/components/StatCard';
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
            {/* Financial KPIs */}
            <div>
              <h2 className="section-title mb-3">Indicadores Financieros</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                  title="Total Ventas"
                  value={formatCurrency(stats.totalVentas)}
                  icon={<DollarSign className="h-5 w-5" />}
                  variant="success"
                  trend={12}
                  trendLabel="vs mes anterior"
                />
                <StatCard
                  title="Total Compras"
                  value={formatCurrency(stats.totalCompras)}
                  icon={<TrendingUp className="h-5 w-5" />}
                  variant="brand"
                  trend={8}
                  trendLabel="vs mes anterior"
                />
              </div>
            </div>

            {/* Main KPIs Grid */}
            <div>
              <h2 className="section-title mb-3">Métricas Generales</h2>
              <StatGrid cols={4}>
                <StatCard
                  title="Clientes"
                  value={stats.clientes}
                  icon={<Users className="h-5 w-5" />}
                  variant="default"
                />
                <StatCard
                  title="Cotizaciones"
                  value={stats.cotizaciones}
                  icon={<FileText className="h-5 w-5" />}
                  variant="brand"
                />
                <StatCard
                  title="Órdenes Compra"
                  value={stats.ordenesCompra}
                  icon={<ShoppingCart className="h-5 w-5" />}
                  variant="default"
                />
                <StatCard
                  title="Órdenes Trabajo"
                  value={stats.ordenesTrabajo}
                  icon={<Wrench className="h-5 w-5" />}
                  variant="warning"
                />
                <StatCard
                  title="Materiales"
                  value={stats.materiales}
                  icon={<Package className="h-5 w-5" />}
                  variant="default"
                />
                <StatCard
                  title="Proveedores"
                  value={stats.proveedores}
                  icon={<Truck className="h-5 w-5" />}
                  variant="default"
                />
                <StatCard
                  title="Operaciones"
                  value={stats.operaciones}
                  icon={<Settings className="h-5 w-5" />}
                  variant="success"
                />
              </StatGrid>
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
