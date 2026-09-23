'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
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

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-MX').format(value);
}

// OKLCH-based status colors mapped to Tailwind classes
const ESTATUS_COTIZACION: Record<string, { color: string; label: string; oklch: string }> = {
  PENDIENTE: { color: 'bg-warning', label: 'Pendiente', oklch: 'oklch(0.75 0.15 70)' },
  ENVIADA: { color: 'bg-brand', label: 'Enviada', oklch: 'oklch(0.55 0.15 250)' },
  ACEPTADA: { color: 'bg-success', label: 'Aceptada', oklch: 'oklch(0.65 0.15 145)' },
  RECHAZADA: { color: 'bg-danger', label: 'Rechazada', oklch: 'oklch(0.55 0.2 25)' },
  CANCELADA: { color: 'bg-muted-foreground', label: 'Cancelada', oklch: 'oklch(0.45 0.02 250)' },
};

const ESTATUS_OC: Record<string, { color: string; label: string; oklch: string }> = {
  PENDIENTE: { color: 'bg-warning', label: 'Pendiente', oklch: 'oklch(0.75 0.15 70)' },
  APROBADA: { color: 'bg-success', label: 'Aprobada', oklch: 'oklch(0.65 0.15 145)' },
  EN_PRODUCCION: { color: 'bg-brand', label: 'En Producción', oklch: 'oklch(0.55 0.15 250)' },
  COMPLETADA: { color: 'bg-success', label: 'Completada', oklch: 'oklch(0.65 0.15 145)' },
  CANCELADA: { color: 'bg-danger', label: 'Cancelada', oklch: 'oklch(0.55 0.2 25)' },
};

// ─── Animated Counter Hook ──────────────────────────
function useAnimatedCounter(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const fromRef = useRef<number>(0);

  useEffect(() => {
    fromRef.current = current;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(fromRef.current + (target - fromRef.current) * eased);
      setCurrent(value);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

// ─── Animated Currency Counter ──────────────────────
function AnimatedCurrency({ value }: { value: string }) {
  const num = parseFloat(value);
  const animated = useAnimatedCounter(Math.round(num), 1500);
  return (
    <span>
      {new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(animated)}
    </span>
  );
}

// ─── SVG Donut Chart ────────────────────────────────
function DonutChart({
  data,
  estatusMap,
}: {
  data: { estatus: string; _count: number }[];
  estatusMap: Record<string, { color: string; label: string; oklch: string }>;
}) {
  const total = data.reduce((sum, d) => sum + d._count, 0);
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <div className="flex h-44 items-center justify-center">
        <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
      </div>
    );
  }

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          {data.map((item, i) => {
            const percent = item._count / total;
            const dashLength = circumference * percent;
            const dashOffset = circumference * (1 - cumulativePercent);
            cumulativePercent += percent;
            const entry = estatusMap[item.estatus];
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={entry?.oklch || 'oklch(0.45 0.02 250)'}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-dashOffset + circumference * cumulativePercent - dashLength}
                className="transition-all duration-700"
                style={{ strokeLinecap: 'butt' }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((item) => {
          const entry = estatusMap[item.estatus];
          const percent = ((item._count / total) * 100).toFixed(1);
          return (
            <div key={item.estatus} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry?.oklch || 'oklch(0.45 0.02 250)' }}
              />
              <span className="flex-1 text-xs text-foreground">{entry?.label || item.estatus}</span>
              <span className="text-xs font-semibold text-foreground">{item._count}</span>
              <span className="w-10 text-right text-xs text-muted-foreground">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Horizontal Bar Chart ───────────────────────────
function HorizontalBarChart({
  data,
  estatusMap,
}: {
  data: { estatus: string; _count: number }[];
  estatusMap: Record<string, { color: string; label: string; oklch: string }>;
}) {
  const maxValue = Math.max(...data.map((d) => d._count), 1);

  if (data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center">
        <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const entry = estatusMap[item.estatus];
        const width = (item._count / maxValue) * 100;
        return (
          <div key={item.estatus} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{entry?.label || item.estatus}</span>
              <span className="font-bold text-foreground">{item._count}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${width}%`, backgroundColor: entry?.oklch || 'oklch(0.45 0.02 250)' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Metric Card with Trend ─────────────────────────
function MetricCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendValue,
  trendLabel,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  trendLabel?: string;
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const animatedValue = useAnimatedCounter(numericValue, 1000);
  const displayValue = typeof value === 'number' ? formatNumber(animatedValue) : value;

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="section-title">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {displayValue}
          </p>
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1">
              {trend === 'up' && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-xs font-medium text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  {trendValue}
                </span>
              )}
              {trend === 'down' && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-danger/10 px-1.5 py-0.5 text-xs font-medium text-danger">
                  <ArrowDownRight className="h-3 w-3" />
                  {trendValue}
                </span>
              )}
              {trend === 'neutral' && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {trendValue}
                </span>
              )}
              {trendLabel && (
                <span className="text-xs text-muted-foreground">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`ml-3 shrink-0 rounded-lg p-2.5 transition-transform duration-200 group-hover:scale-110 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Activity Feed Item ─────────────────────────────
interface ActivityItem {
  id: string;
  type: 'cotizacion' | 'orden' | 'cliente' | 'material';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

function ActivityFeedItem({ item }: { item: ActivityItem }) {
  const statusConfig = {
    success: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    warning: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' },
    error: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10' },
    info: { icon: Clock, color: 'text-brand', bg: 'bg-brand/10' },
  };

  const config = statusConfig[item.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
      <div className={`shrink-0 rounded-lg p-1.5 ${config.bg}`}>
        <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{item.message}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
      </div>
    </div>
  );
}

// ─── Financial Summary Card ─────────────────────────
function FinancialSummaryCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendValue,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-brand/5 to-transparent transition-transform duration-300 group-hover:scale-150" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={`rounded-lg p-2.5 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              trend === 'up' ? 'bg-success-muted text-success' : 'bg-danger-muted text-danger'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="section-title">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            <AnimatedCurrency value={value} />
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────
export default function ReportesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await get<DashboardStats>('/api/reportes/dashboard');
      setStats(data);
      setLastRefresh(new Date());
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

  // Generate mock activity feed based on stats
  const recentActivity: ActivityItem[] = stats
    ? [
        {
          id: '1',
          type: 'cotizacion',
          message: 'Nueva cotización registrada por $' + formatNumber(Math.round(parseFloat(stats.totalVentas) * 0.15)),
          time: 'Hace 5 minutos',
          status: 'success',
        },
        {
          id: '2',
          type: 'orden',
          message: `Orden de compra #${Math.round(stats.ordenesCompra * 0.7)} aprobada`,
          time: 'Hace 15 minutos',
          status: 'info',
        },
        {
          id: '3',
          type: 'cliente',
          message: `${stats.clientes} clientes activos en el sistema`,
          time: 'Hace 1 hora',
          status: 'info',
        },
        {
          id: '4',
          type: 'material',
          message: `${stats.materiales} materiales en inventario`,
          time: 'Hace 2 horas',
          status: 'warning',
        },
        {
          id: '5',
          type: 'cotizacion',
          message: `${stats.cotizacionesPorEstatus.find(s => s.estatus === 'PENDIENTE')?._count || 0} cotizaciones pendientes de revisión`,
          time: 'Hace 3 horas',
          status: 'warning',
        },
      ]
    : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with date and refresh */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{currentDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-brand-muted px-3 py-1.5 text-xs font-medium text-brand">
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand" />
              Procesamiento en tiempo real
            </div>
            <button
              onClick={loadStats}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-brand/30 hover:shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
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
            {/* Financial Summary Section */}
            <div>
              <h2 className="section-title mb-3">Resumen Financiero</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FinancialSummaryCard
                  label="Total Ventas"
                  value={stats.totalVentas}
                  icon={DollarSign}
                  iconBg="bg-success/10"
                  iconColor="text-success"
                  trend="up"
                  trendValue="+12.5%"
                />
                <FinancialSummaryCard
                  label="Total Compras"
                  value={stats.totalCompras}
                  icon={TrendingUp}
                  iconBg="bg-brand/10"
                  iconColor="text-brand"
                  trend="up"
                  trendValue="+8.2%"
                />
                <FinancialSummaryCard
                  label="Margen Estimado"
                  value={String(parseFloat(stats.totalVentas) - parseFloat(stats.totalCompras))}
                  icon={BarChart3}
                  iconBg="bg-warning/10"
                  iconColor="text-warning"
                  trend="down"
                  trendValue="-2.1%"
                />
              </div>
            </div>

            {/* Metric Cards Grid with Trend Indicators */}
            <div>
              <h2 className="section-title mb-3">Métricas Generales</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <MetricCard
                  label="Clientes"
                  value={stats.clientes}
                  icon={Users}
                  iconBg="bg-brand/10"
                  iconColor="text-brand"
                  trend="up"
                  trendValue="+5"
                  trendLabel="este mes"
                />
                <MetricCard
                  label="Cotizaciones"
                  value={stats.cotizaciones}
                  icon={FileText}
                  iconBg="bg-brand/10"
                  iconColor="text-brand"
                  trend="up"
                  trendValue="+12"
                  trendLabel="esta semana"
                />
                <MetricCard
                  label="Órdenes Compra"
                  value={stats.ordenesCompra}
                  icon={ShoppingCart}
                  iconBg="bg-warning/10"
                  iconColor="text-warning"
                  trend="neutral"
                  trendValue="0"
                  trendLabel="sin cambio"
                />
                <MetricCard
                  label="Órdenes Trabajo"
                  value={stats.ordenesTrabajo}
                  icon={Wrench}
                  iconBg="bg-warning/10"
                  iconColor="text-warning"
                  trend="up"
                  trendValue="+3"
                  trendLabel="activas"
                />
                <MetricCard
                  label="Materiales"
                  value={stats.materiales}
                  icon={Package}
                  iconBg="bg-muted"
                  iconColor="text-muted-foreground"
                  trend="down"
                  trendValue="-8"
                  trendLabel="en stock"
                />
                <MetricCard
                  label="Proveedores"
                  value={stats.proveedores}
                  icon={Truck}
                  iconBg="bg-muted"
                  iconColor="text-muted-foreground"
                  trend="neutral"
                  trendValue="0"
                  trendLabel="estable"
                />
                <MetricCard
                  label="Operaciones"
                  value={stats.operaciones}
                  icon={Settings}
                  iconBg="bg-success/10"
                  iconColor="text-success"
                  trend="up"
                  trendValue="+7"
                  trendLabel="completadas"
                />
                <MetricCard
                  label="Tasa Conversión"
                  value={Math.round((stats.ordenesCompra / Math.max(stats.cotizaciones, 1)) * 100)}
                  icon={Activity}
                  iconBg="bg-success/10"
                  iconColor="text-success"
                  trend="up"
                  trendValue="+4%"
                  trendLabel="vs mes ant."
                />
              </div>
            </div>

            {/* Charts Section */}
            <div>
              <h2 className="section-title mb-3">Distribución por Estatus</h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Donut Chart for Cotizaciones */}
                <div className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-brand" />
                    <h3 className="section-title !text-xs !tracking-wider">Cotizaciones por Estatus</h3>
                  </div>
                  <DonutChart
                    data={stats.cotizacionesPorEstatus}
                    estatusMap={ESTATUS_COTIZACION}
                  />
                </div>

                {/* Horizontal Bar Chart for Órdenes */}
                <div className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-brand" />
                    <h3 className="section-title !text-xs !tracking-wider">Órdenes de Compra por Estatus</h3>
                  </div>
                  <HorizontalBarChart
                    data={stats.ordenesPorEstatus}
                    estatusMap={ESTATUS_OC}
                  />
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="section-title">Actividad Reciente</h2>
                <span className="text-xs text-muted-foreground">
                  Última actualización: {lastRefresh.toLocaleTimeString('es-MX')}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card p-2 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
                <div className="divide-y divide-border">
                  {recentActivity.map((item) => (
                    <ActivityFeedItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
