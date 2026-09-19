'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { StatCard, StatGrid } from '@/components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { get } from '@/lib/api';
import {
  Users,
  FileText,
  ShoppingCart,
  Wrench,
  Package,
  Truck,
  Settings,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Bell,
} from 'lucide-react';

interface StatData {
  clientes: number;
  cotizaciones: number;
  ordenesCompra: number;
  ordenesTrabajo: number;
  materiales: number;
  proveedores: number;
  operaciones: number;
}

interface ActivityItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  text: string;
  time: string;
}

interface AlertItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  severity: 'critica' | 'alta' | 'media' | 'baja';
}

export default function Home() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState<StatData>({
    clientes: 0,
    cotizaciones: 0,
    ordenesCompra: 0,
    ordenesTrabajo: 0,
    materiales: 0,
    proveedores: 0,
    operaciones: 0,
  });
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('AMD México');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    // Load user name from localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const name = user?.name || user?.nombre || user?.email || 'AMD México';
        setUserName(name);
      }
    } catch {
      // use default
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    Promise.all([
      get<{ data: { meta: { total: number } } }>('/api/clientes?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/cotizaciones?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/ordenes-compra?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/ordenes-trabajo?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/inventario/materiales?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/proveedores?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/operaciones?limit=1'),
    ])
      .then(([cli, cot, oc, ot, mat, prov, op]) => {
        setStats({
          clientes: cli?.data?.meta?.total || 0,
          cotizaciones: cot?.data?.meta?.total || 0,
          ordenesCompra: oc?.data?.meta?.total || 0,
          ordenesTrabajo: ot?.data?.meta?.total || 0,
          materiales: mat?.data?.meta?.total || 0,
          proveedores: prov?.data?.meta?.total || 0,
          operaciones: op?.data?.meta?.total || 0,
        });
      })
      .catch(console.error);
  }, []);

  const statCards = [
    { key: 'clientes' as const, title: 'Clientes', icon: Users, variant: 'brand' as const },
    { key: 'cotizaciones' as const, title: 'Cotizaciones', icon: FileText, variant: 'default' as const },
    { key: 'ordenesCompra' as const, title: 'Órdenes Compra', icon: ShoppingCart, variant: 'success' as const },
    { key: 'ordenesTrabajo' as const, title: 'Órdenes Trabajo', icon: Wrench, variant: 'warning' as const },
    { key: 'materiales' as const, title: 'Materiales', icon: Package, variant: 'default' as const },
    { key: 'proveedores' as const, title: 'Proveedores', icon: Truck, variant: 'default' as const },
    { key: 'operaciones' as const, title: 'Operaciones', icon: Settings, variant: 'success' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting},{' '}
            <span className="text-brand">{userName}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de operaciones •{' '}
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => router.push('/cotizaciones/new')}
          className="brand-gradient flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand/25 transition-all duration-200 hover:shadow-xl hover:shadow-brand/30 hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nueva Cotización
        </button>
      </div>

      {/* KPI Grid — card grid matching Clientes pattern */}
      <div>
        <h2 className="section-title mb-3">Métricas Principales</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.key}
              className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="section-title truncate">{stat.title}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {stats[stat.key]}
                  </p>
                </div>
                <div className={`ml-3 shrink-0 rounded-lg p-2 ${
                  stat.variant === 'brand' ? 'bg-brand/10 text-brand' :
                  stat.variant === 'success' ? 'bg-success/10 text-success' :
                  stat.variant === 'warning' ? 'bg-warning/10 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity & Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <RecentActivityCard />

        {/* Alerts */}
        <AlertsCard />
      </div>
    </div>
  );
}

function RecentActivityCard() {
  // Try to load recent activities from localStorage
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentActivities');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActivities(parsed);
          return;
        }
      }
    } catch {
      // fall through to empty
    }
    // Show empty state when no real data exists
    setActivities([]);
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand" />
          <CardTitle>Actividad Reciente</CardTitle>
        </div>
        <button className="text-xs font-medium text-brand transition-colors hover:text-brand/80">
          Ver todo
        </button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Sin actividad reciente
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Las acciones aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-lg p-1.5 ${activity.iconBg}`}>
                  <activity.icon className={`h-3.5 w-3.5 ${activity.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{activity.text}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AlertsCard() {
  // Try to load alerts from localStorage
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('alerts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAlerts(parsed);
          return;
        }
      }
    } catch {
      // fall through to empty
    }
    // Show empty state when no real data exists
    setAlerts([]);
  }, []);

  const activeCount = alerts.filter(
    (a) => a.severity === 'critica' || a.severity === 'alta'
  ).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-brand" />
          <CardTitle>Alertas y Notificaciones</CardTitle>
        </div>
        {activeCount > 0 && (
          <span className="rounded-full bg-danger-muted px-2 py-0.5 text-xs font-medium text-danger">
            {activeCount} activas
          </span>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="mb-2 h-8 w-8 text-success/50" />
            <p className="text-sm text-muted-foreground">
              Sin alertas activas
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Todo está en orden
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-lg p-1.5 ${alert.iconBg}`}>
                  <alert.icon className={`h-3.5 w-3.5 ${alert.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {alert.title}
                    </p>
                    {alert.severity === 'critica' && (
                      <span className="rounded bg-danger-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-danger">
                        Crítica
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {alert.desc}
                  </p>
                </div>
                <button className="mt-0.5 text-muted-foreground transition-colors hover:text-brand">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
