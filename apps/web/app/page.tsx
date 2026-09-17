'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
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
  TrendingUp,
  TrendingDown,
  Plus,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}

interface StatData {
  clientes: number;
  cotizaciones: number;
  ordenesCompra: number;
  ordenesTrabajo: number;
  materiales: number;
  proveedores: number;
  operaciones: number;
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

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    Promise.all([
      get<{ data: { meta: { total: number } } }>('/api/clientes?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/cotizaciones?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/ordenes-compra?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/ordenes-trabajo?limit=1'),
      get<{ data: { meta: { total: number } } }>('/api/materiales?limit=1'),
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
    { key: 'clientes' as const, title: 'Clientes', icon: Users, trend: 12, color: 'text-brand' },
    { key: 'cotizaciones' as const, title: 'Cotizaciones', icon: FileText, trend: 8, color: 'text-accent-light' },
    { key: 'ordenesCompra' as const, title: 'Órdenes Compra', icon: ShoppingCart, trend: -3, color: 'text-success' },
    { key: 'ordenesTrabajo' as const, title: 'Órdenes Trabajo', icon: Wrench, trend: 5, color: 'text-warning' },
    { key: 'materiales' as const, title: 'Materiales', icon: Package, trend: 0, color: 'text-brand' },
    { key: 'proveedores' as const, title: 'Proveedores', icon: Truck, trend: 2, color: 'text-accent-light' },
    { key: 'operaciones' as const, title: 'Operaciones', icon: Settings, trend: -1, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, <span className="text-brand">AMD México</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de operaciones • {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.key}
            title={stat.title}
            value={stats[stat.key]}
            icon={stat.icon}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
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

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend: number;
  color: string;
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <Card className="card-premium group relative overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value.toLocaleString('es-MX')}</p>
        </div>
        <div className="rounded-lg bg-muted p-2 transition-colors group-hover:bg-brand/10">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {trend !== 0 && (
          trend > 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-danger" />
          )
        )}
        <span className={`text-xs font-medium ${trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-muted-foreground'}`}>
          {trend > 0 ? '+' : ''}{trend}% vs mes anterior
        </span>
      </div>
    </Card>
  );
}

function RecentActivityCard() {
  const activities = [
    { icon: CheckCircle2, color: 'text-success bg-success-muted', text: 'Cotización #1042 aprobada', time: 'Hace 5 min' },
    { icon: Package, color: 'text-brand bg-brand-muted', text: 'Orden de trabajo #892 completada', time: 'Hace 23 min' },
    { icon: Users, color: 'text-accent-light bg-accent-muted', text: 'Nuevo cliente registrado: TechCorp', time: 'Hace 1 hora' },
    { icon: ShoppingCart, color: 'text-warning bg-warning-muted', text: 'Orden de compra #567 creada', time: 'Hace 2 horas' },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Actividad Reciente</CardTitle>
        <button className="text-xs font-medium text-brand hover:text-brand/80 transition-colors">
          Ver todo
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-lg p-1.5 ${activity.color}`}>
              <activity.icon className="h-3.5 w-3.5" />
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
      </CardContent>
    </Card>
  );
}

function AlertsCard() {
  const alerts = [
    { icon: AlertTriangle, color: 'text-warning bg-warning-muted', title: 'Stock Bajo', desc: '3 materiales por debajo del mínimo', severity: 'alta' },
    { icon: Clock, color: 'text-brand bg-brand-muted', title: 'Pendientes', desc: '5 cotizaciones esperando aprobación', severity: 'media' },
    { icon: AlertTriangle, color: 'text-danger bg-danger-muted', title: 'Vencidas', desc: '2 órdenes de trabajo vencidas', severity: 'critica' },
    { icon: CheckCircle2, color: 'text-success bg-success-muted', title: 'Completadas', desc: '8 tareas finalizadas hoy', severity: 'baja' },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Alertas y Notificaciones</CardTitle>
        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
          {alerts.filter(a => a.severity === 'critica' || a.severity === 'alta').length} activas
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-lg p-1.5 ${alert.color}`}>
              <alert.icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                {alert.severity === 'critica' && (
                  <span className="rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-danger">
                    Crítica
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{alert.desc}</p>
            </div>
            <button className="mt-0.5 text-muted-foreground hover:text-brand transition-colors">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
