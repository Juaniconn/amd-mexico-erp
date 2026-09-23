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
  FileCheck,
  UserPlus,
  Box,
  Receipt,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';

interface StatData {
  clientes: number;
  cotizaciones: number;
  ordenesCompra: number;
  ordenesTrabajo: number;
  materiales: number;
  proveedores: number;
  operaciones: number;
  facturas: number;
  empleados: number;
}

interface ActivityItem {
  id: string;
  type: string;
  text: string;
  time: string;
  url: string;
}

interface AlertItem {
  id: string;
  type: string;
  title: string;
  desc: string;
  severity: 'critica' | 'alta' | 'media' | 'baja';
  url: string;
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
    facturas: 0,
    empleados: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [greeting, setGreeting] = useState('Buenos días');
  const [userName, setUserName] = useState('AMD México');

  // Filtro general por área del negocio
  const [areaFilter, setAreaFilter] = useState<string>('general');
  const [showAreaFilters, setShowAreaFilters] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

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

    // Fetch dashboard stats
    get<StatData>('/api/dashboard/stats')
      .then(setStats)
      .catch(console.error);

    // Fetch alerts (sin filtro)
    get<AlertItem[]>('/api/dashboard/alerts')
      .then(setAlerts)
      .catch(console.error);
  }, []);

  // Fetch activity con filtros de fecha
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    get<ActivityItem[]>(`/api/dashboard/activity`)
      .then(setActivities)
      .catch(console.error);
  }, []);

  // Filtrar actividades por área
  const filteredActivities = areaFilter === 'general'
    ? activities
    : activities.filter((a: any) => {
        const typeMap: Record<string, string> = {
          cotizacion: 'cotizaciones',
          'orden-trabajo': 'produccion',
          'orden-compra': 'compras',
          factura: 'facturacion',
          cliente: 'clientes',
        };
        return typeMap[a.type] === areaFilter;
      });

  // Filtrar alertas por área
  const filteredAlerts = areaFilter === 'general'
    ? alerts
    : alerts.filter((a: any) => {
        const typeMap: Record<string, string> = {
          cotizacion: 'cotizaciones',
          'orden-trabajo': 'produccion',
          ordencompra: 'compras',
          inventario: 'inventario',
          factura: 'facturacion',
          'orden-compra': 'compras',
        };
        return typeMap[a.type] === areaFilter;
      });

  const statCards = [
    { key: 'clientes' as const, title: 'Clientes', icon: Users, variant: 'brand' as const },
    { key: 'cotizaciones' as const, title: 'Cotizaciones', icon: FileText, variant: 'default' as const },
    { key: 'ordenesCompra' as const, title: 'Órdenes Compra', icon: ShoppingCart, variant: 'success' as const },
    { key: 'ordenesTrabajo' as const, title: 'Órdenes Trabajo', icon: Wrench, variant: 'warning' as const },
    { key: 'materiales' as const, title: 'Materiales', icon: Package, variant: 'default' as const },
    { key: 'proveedores' as const, title: 'Proveedores', icon: Truck, variant: 'default' as const },
    { key: 'operaciones' as const, title: 'Operaciones', icon: Settings, variant: 'success' as const },
    { key: 'facturas' as const, title: 'Facturas', icon: Receipt, variant: 'default' as const },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cotizacion': return { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'orden-trabajo': return { icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'orden-compra': return { icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'factura': return { icon: Receipt, color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'cliente': return { icon: UserPlus, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
      default: return { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'cotizacion': return { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'orden-trabajo': return { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' };
      case 'inventario': return { icon: Package, color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'factura': return { icon: Receipt, color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'orden-compra': return { icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      default: return { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const activeCount = filteredAlerts.filter(
    (a: any) => a.severity === 'critica' || a.severity === 'alta'
  ).length;

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
          onClick={() => router.push('/cotizaciones')}
          className="brand-gradient flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand/25 transition-all duration-200 hover:shadow-xl hover:shadow-brand/30 hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nueva Cotización
        </button>
      </div>

      {/* KPI Grid */}
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
                  stat.variant === 'brand' ? 'bg-brand-muted text-brand' :
                  stat.variant === 'success' ? 'bg-success-muted text-success' :
                  stat.variant === 'warning' ? 'bg-warning-muted text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtro General por Área del Negocio */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAreaFilters(!showAreaFilters)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Filtro General
            <ChevronDown className={`h-3 w-3 transition-transform ${showAreaFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'general', label: 'General', icon: LayoutGrid },
              { key: 'clientes', label: 'Clientes', icon: Users },
              { key: 'cotizaciones', label: 'Cotizaciones', icon: FileText },
              { key: 'produccion', label: 'Producción', icon: Wrench },
              { key: 'compras', label: 'Compras', icon: ShoppingCart },
              { key: 'inventario', label: 'Inventario', icon: Package },
              { key: 'facturacion', label: 'Facturación', icon: Receipt },
              { key: 'proveedores', label: 'Proveedores', icon: Truck },
            ].map((area) => (
              <button
                key={area.key}
                onClick={() => setAreaFilter(area.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  areaFilter === area.key
                    ? 'bg-brand text-white'
                    : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <area.icon className="h-3 w-3" />
                {area.label}
              </button>
            ))}
          </div>
        </div>

        {showAreaFilters && (
          <div className="mt-3 rounded-lg border border-border bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">
              Filtrando por: <span className="font-semibold text-foreground">{areaFilter === 'general' ? 'General' : areaFilter.charAt(0).toUpperCase() + areaFilter.slice(1)}</span>
              <span className="ml-2 text-muted-foreground/70">— Las actividades y alertas se actualizan según el área seleccionada.</span>
            </p>
          </div>
        )}
      </div>

      {/* Activity & Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand" />
              <CardTitle>Actividad Reciente</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">{filteredActivities.length} registros</span>
          </CardHeader>
          <CardContent>
            {filteredActivities.length === 0 ? (
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
              <div className="space-y-3">
                {filteredActivities.slice(0, 8).map((activity) => {
                  const iconData = getActivityIcon(activity.type);
                  return (
                    <button
                      key={activity.id}
                      onClick={() => router.push(activity.url)}
                      className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/10"
                    >
                      <div className={`mt-0.5 rounded-lg p-1.5 ${iconData.bg}`}>
                        <iconData.icon className={`h-3.5 w-3.5 ${iconData.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{activity.text}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(activity.time)}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50" />
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
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
            {filteredAlerts.length === 0 ? (
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
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const iconData = getAlertIcon(alert.type);
                  return (
                    <button
                      key={alert.id}
                      onClick={() => router.push(alert.url)}
                      className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/10"
                    >
                      <div className={`mt-0.5 rounded-lg p-1.5 ${iconData.bg}`}>
                        <iconData.icon className={`h-3.5 w-3.5 ${iconData.color}`} />
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
                          {alert.severity === 'alta' && (
                            <span className="rounded bg-warning-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-warning">
                              Alta
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {alert.desc}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50" />
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
