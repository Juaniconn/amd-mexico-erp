'use client';

import { useEffect, useState } from 'react';
import { get } from '@/lib/api';
import { AppLayout } from '@/components/AppLayout';
import { Loader2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

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

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
}

function KpiCard({ title, value, icon, trend }: KpiCardProps) {
  return (
    <div className="card-premium p-5 transition hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {trend !== undefined && (
            <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend >= 0 ? '+' : ''}{trend}% vs mes anterior
            </p>
          )}
        </div>
        <div className="rounded-lg bg-brand/10 p-2 text-brand">{icon}</div>
      </div>
    </div>
  );
}

function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num);
}

const ESTATUS_COTIZACION: Record<string, { color: string; label: string }> = {
  PENDIENTE: { color: 'bg-warning', label: 'Pendiente' },
  ENVIADA: { color: 'bg-brand', label: 'Enviada' },
  ACEPTADA: { color: 'bg-success', label: 'Aceptada' },
  RECHAZADA: { color: 'bg-destructive', label: 'Rechazada' },
  CANCELADA: { color: 'bg-muted', label: 'Cancelada' },
};

const ESTATUS_OC: Record<string, { color: string; label: string }> = {
  PENDIENTE: { color: 'bg-warning', label: 'Pendiente' },
  APROBADA: { color: 'bg-success', label: 'Aprobada' },
  EN_PRODUCCION: { color: 'bg-brand', label: 'En Producción' },
  COMPLETADA: { color: 'bg-success', label: 'Completada' },
  CANCELADA: { color: 'bg-destructive', label: 'Cancelada' },
};

export default function ReportesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
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
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
            <p className="text-sm text-muted-foreground">Indicadores y dashboard general del ERP</p>
          </div>
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
            <p className="text-sm text-muted-foreground">Indicadores y dashboard general del ERP</p>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!stats) return null;

  const cotizacionesData = stats.cotizacionesPorEstatus.map((item) => ({
    label: ESTATUS_COTIZACION[item.estatus]?.label || item.estatus,
    value: item._count,
    color: ESTATUS_COTIZACION[item.estatus]?.color || 'bg-muted',
  }));

  const ordenesData = stats.ordenesPorEstatus.map((item) => ({
    label: ESTATUS_OC[item.estatus]?.label || item.estatus,
    value: item._count,
    color: ESTATUS_OC[item.estatus]?.color || 'bg-muted',
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">Indicadores y dashboard general del ERP — {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card-premium border-success/20 bg-gradient-to-br from-success/5 to-transparent p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Total Ventas</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(stats.totalVentas)}</p>
                <p className="text-xs text-muted-foreground">Cotizaciones aceptadas</p>
              </div>
            </div>
          </div>
          <div className="card-premium border-brand/20 bg-gradient-to-br from-brand/5 to-transparent p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Total Compras</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(stats.totalCompras)}</p>
                <p className="text-xs text-muted-foreground">Órdenes completadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main KPIs Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <KpiCard title="Clientes" value={stats.clientes} icon={<span className="text-xl">👥</span>} trend={12} />
          <KpiCard title="Cotizaciones" value={stats.cotizaciones} icon={<span className="text-xl">📋</span>} trend={8} />
          <KpiCard title="Órdenes Compra" value={stats.ordenesCompra} icon={<span className="text-xl">🛒</span>} trend={-3} />
          <KpiCard title="Órdenes Trabajo" value={stats.ordenesTrabajo} icon={<span className="text-xl">🔧</span>} trend={5} />
          <KpiCard title="Materiales" value={stats.materiales} icon={<span className="text-xl">📦</span>} trend={0} />
          <KpiCard title="Proveedores" value={stats.proveedores} icon={<span className="text-xl">🏭</span>} trend={2} />
          <KpiCard title="Operaciones" value={stats.operaciones} icon={<span className="text-xl">⚙️</span>} trend={-1} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="card-premium p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground">Cotizaciones por Estatus</h3>
            <div className="space-y-3">
              {cotizacionesData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos</p>
              ) : (
                cotizacionesData.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="font-bold text-foreground">{item.value}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${item.color}`}
                        style={{ width: `${(item.value / Math.max(...cotizacionesData.map(d => d.value), 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="card-premium p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground">Órdenes de Compra por Estatus</h3>
            <div className="space-y-3">
              {ordenesData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos</p>
              ) : (
                ordenesData.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="font-bold text-foreground">{item.value}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${item.color}`}
                        style={{ width: `${(item.value / Math.max(...ordenesData.map(d => d.value), 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
