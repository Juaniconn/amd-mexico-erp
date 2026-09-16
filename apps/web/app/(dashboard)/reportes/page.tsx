'use client';

import { useEffect, useState } from 'react';
import { get } from '@/lib/api';

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
  icon: string;
  color: string;
}

function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface BarChartProps {
  title: string;
  data: { label: string; value: number; color: string }[];
}

function BarChart({ title, data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">Sin datos</p>
        ) : (
          data.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${item.color}`}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const ESTATUS_COTIZACION_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-400',
  ENVIADA: 'bg-blue-400',
  ACEPTADA: 'bg-green-500',
  RECHAZADA: 'bg-red-400',
  CANCELADA: 'bg-slate-400',
};

const ESTATUS_OC_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-400',
  APROBADA: 'bg-blue-500',
  EN_PRODUCCION: 'bg-indigo-500',
  COMPLETADA: 'bg-green-500',
  CANCELADA: 'bg-red-400',
};

function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num);
}

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
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-600">Indicadores y dashboard general</p>
        </div>
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-sm text-slate-500">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-600">Indicadores y dashboard general</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cotizacionesData = stats.cotizacionesPorEstatus.map((item) => ({
    label: item.estatus,
    value: item._count,
    color: ESTATUS_COTIZACION_COLORS[item.estatus] || 'bg-slate-400',
  }));

  const ordenesData = stats.ordenesPorEstatus.map((item) => ({
    label: item.estatus,
    value: item._count,
    color: ESTATUS_OC_COLORS[item.estatus] || 'bg-slate-400',
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
        <p className="text-sm text-slate-600">Indicadores y dashboard general del ERP</p>
      </div>

      {/* Financial KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-xl text-white">
              $
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Ventas (Cotizaciones Aceptadas)</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalVentas)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-xl text-white">
              Q
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Compras (OC Aprobadas+)</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalCompras)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPIs Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard title="Clientes" value={stats.clientes} icon="👥" color="bg-blue-100" />
        <KpiCard title="Cotizaciones" value={stats.cotizaciones} icon="📋" color="bg-purple-100" />
        <KpiCard title="Ordenes Compra" value={stats.ordenesCompra} icon="🛒" color="bg-orange-100" />
        <KpiCard title="Work Orders" value={stats.ordenesTrabajo} icon="🔧" color="bg-indigo-100" />
        <KpiCard title="Materiales" value={stats.materiales} icon="📦" color="bg-teal-100" />
        <KpiCard title="Proveedores" value={stats.proveedores} icon="🚚" color="bg-yellow-100" />
        <KpiCard title="Operaciones" value={stats.operaciones} icon="⚙️" color="bg-cyan-100" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChart title="Cotizaciones por Estatus" data={cotizacionesData} />
        <BarChart title="Ordenes de Compra por Estatus" data={ordenesData} />
      </div>
    </div>
  );
}
