'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Loader2,
  PlusCircle,
  AlertCircle,
  Factory,
  Cog,
  Wrench,
  Activity,
  TrendingUp,
  Settings,
  Hash,
  Package,
  CheckCircle2,
  XCircle,
  Edit,
  Search,
  BarChart3,
  Zap,
  Gauge,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CalendarDays,
} from 'lucide-react';
import { get, patch } from '@/lib/api';

// ─── Tipos ───────────────────────────────────────────────

interface Maquina {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  descripcion?: string;
  capacidad?: string;
  sucursalId?: string;
  notas?: string;
  activo: boolean;
  estatus: string;
  razonEstatus?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { operaciones: number; partesOT: number };
}

interface CapacidadResumen {
  total: number;
  activas: number;
  enMantenimiento: number;
  fueraServicio: number;
  retiradas: number;
  capacidadOperativa: number;
}

interface CapacidadPorTipo {
  tipo: string;
  cantidad: number;
}

interface OcupacionItem {
  maquina: Maquina;
  operacionesActivas: number;
  partesEnProceso: number;
}

// ─── Configuración de tipos y estatus ────────────────────

const TIPOS_MAQUINA = [
  { value: 'CNC', label: 'CNC / VMC', icon: Cog, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'LASER', label: 'Láser', icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10' },
  { value: 'TORNO', label: 'Torno', icon: Settings, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'PRENSA', label: 'Prensa', icon: Wrench, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'EDM', label: 'EDM', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { value: 'CONVENCIONAL', label: 'Convencional', icon: Factory, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  { value: 'RECTIFICADO', label: 'Rectificadora', icon: Gauge, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { value: 'INYECCION', label: 'Inyección', icon: Package, color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

const ESTATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  ACTIVA: { label: 'Activa', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  EN_MANTENIMIENTO: { label: 'Mantenimiento', color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  FUERA_SERVICIO: { label: 'Fuera de Servicio', color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
  RETIRADA: { label: 'Retirada', color: 'text-gray-400', bg: 'bg-gray-500/10', dot: 'bg-gray-400' },
};

const getTipoConfig = (tipo: string) => {
  return TIPOS_MAQUINA.find((t) => t.value === tipo) || { icon: Cog, color: 'text-gray-400', bg: 'bg-gray-500/10', label: tipo };
};

const getEstatusConfig = (estatus: string) => {
  return ESTATUS_CONFIG[estatus] || ESTATUS_CONFIG.ACTIVA;
};

// ─── Componente principal ───────────────────────────────

export default function MaquinariaPage() {
  return (
    <AppLayout>
      <MaquinariaModule />
    </AppLayout>
  );
}

function MaquinariaModule() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'inventario' | 'capacidad' | 'ocupacion' | 'agenda'>('inventario');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maquinaria</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de equipos, capacidad instalada y mantenimiento
          </p>
        </div>
        <Button onClick={() => router.push('/maquinaria/nueva')} className="gap-1.5">
          <PlusCircle className="h-4 w-4" />
          Nueva Máquina
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 flex-wrap">
        <button
          onClick={() => setActiveTab('inventario')}
          className={`flex-1 min-w-[100px] rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'inventario'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Factory className="mr-1.5 inline h-4 w-4" />
          Inventario
        </button>
        <button
          onClick={() => setActiveTab('capacidad')}
          className={`flex-1 min-w-[100px] rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'capacidad'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="mr-1.5 inline h-4 w-4" />
          Capacidad
        </button>
        <button
          onClick={() => setActiveTab('ocupacion')}
          className={`flex-1 min-w-[100px] rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'ocupacion'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="mr-1.5 inline h-4 w-4" />
          Ocupación
        </button>
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex-1 min-w-[100px] rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'agenda'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalendarDays className="mr-1.5 inline h-4 w-4" />
          Agenda
        </button>
      </div>

      {/* Contenido */}
      {activeTab === 'inventario' && <InventarioTab />}
      {activeTab === 'capacidad' && <CapacidadTab />}
      {activeTab === 'ocupacion' && <OcupacionTab />}
      {activeTab === 'agenda' && <AgendaTab />}
    </div>
  );
}

// ─── Tab: Inventario (Grid Visual) ───────────────────────

function InventarioTab() {
  const router = useRouter();
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('');

  const fetchMaquinas = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (tipoFilter) params.set('tipo', tipoFilter);
      if (estatusFilter) params.set('estatus', estatusFilter);
      const data = await get<{ data: Maquina[] }>(`/api/maquinaria?${params.toString()}`);
      setMaquinas(data.data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar máquinas');
    } finally {
      setLoading(false);
    }
  }, [search, tipoFilter, estatusFilter]);

  useEffect(() => {
    fetchMaquinas();
  }, [fetchMaquinas]);

  const tipos = [...new Set(maquinas.map((m) => m.tipo))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos los tipos</option>
          {tipos.map((tipo) => {
            const config = getTipoConfig(tipo);
            return (
              <option key={tipo} value={tipo}>
                {config.label}
              </option>
            );
          })}
        </select>
        <select
          value={estatusFilter}
          onChange={(e) => setEstatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos los estatus</option>
          <option value="ACTIVA">Activa</option>
          <option value="EN_MANTENIMIENTO">Mantenimiento</option>
          <option value="FUERA_SERVICIO">Fuera de Servicio</option>
          <option value="RETIRADA">Retirada</option>
        </select>
      </div>

      {/* Grid de máquinas */}
      {maquinas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Factory className="mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No hay máquinas registradas</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => router.push('/maquinaria/nueva')}
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            Agregar primera máquina
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {maquinas.map((maquina) => {
            const tipoConfig = getTipoConfig(maquina.tipo);
            const estatusConfig = getEstatusConfig(maquina.estatus);
            const TipoIcon = tipoConfig.icon;
            const ops = maquina._count?.operaciones || 0;
            const partes = maquina._count?.partesOT || 0;
            const ocupacion = Math.min(100, Math.round((Math.max(ops, partes) / 10) * 100));

            return (
              <Card
                key={maquina.id}
                className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-border/80 cursor-pointer"
                onClick={() => router.push(`/maquinaria/${maquina.id}`)}
              >
                {/* Indicador de estatus */}
                <div className={`absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 rotate-45 ${estatusConfig.bg}`} />

                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icono */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tipoConfig.bg}`}>
                      <TipoIcon className={`h-5 w-5 ${tipoConfig.color}`} />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{maquina.codigo}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${estatusConfig.bg} ${estatusConfig.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${estatusConfig.dot}`} />
                          {estatusConfig.label}
                        </span>
                      </div>
                      <h3 className="mt-1 truncate font-semibold text-sm">{maquina.nombre}</h3>
                      <p className="text-xs text-muted-foreground">{tipoConfig.label}</p>
                    </div>
                  </div>

                  {/* Barra de ocupación */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Ocupación</span>
                      <span className="font-mono">{ocupacion}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          ocupacion > 80 ? 'bg-red-400' : ocupacion > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${ocupacion}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5" />
                      <span>{ops} ops</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      <span>{partes} partes</span>
                    </div>
                    {maquina.capacidad && (
                      <div className="flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" />
                        <span>{maquina.capacidad}</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/maquinaria/${maquina.id}`);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Capacidad Instalada ────────────────────────────

function CapacidadTab() {
  const [resumen, setResumen] = useState<CapacidadResumen | null>(null);
  const [porTipo, setPorTipo] = useState<CapacidadPorTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCapacidad = async () => {
      try {
        setLoading(true);
        const data = await get<{ resumen: CapacidadResumen; porTipo: CapacidadPorTipo[] }>(
          '/api/maquinaria/capacidad'
        );
        setResumen(data.resumen);
        setPorTipo(data.porTipo);
      } catch (err: any) {
        setError(err?.message || 'Error al cargar capacidad');
      } finally {
        setLoading(false);
      }
    };
    fetchCapacidad();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen principal */}
      {resumen && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Total Equipos"
            value={resumen.total}
            icon={<Factory className="h-4 w-4" />}
          />
          <StatCard
            label="Activas"
            value={resumen.activas}
            icon={<CheckCircle2 className="h-4 w-4" />}
            trend={{ direction: 'up', text: 'Operativas' }}
            variant="success"
          />
          <StatCard
            label="Mantenimiento"
            value={resumen.enMantenimiento}
            icon={<Wrench className="h-4 w-4" />}
            trend={resumen.enMantenimiento > 0 ? { direction: 'warning', text: 'Atención' } : null}
            variant="warning"
          />
          <StatCard
            label="Fuera Servicio"
            value={resumen.fueraServicio}
            icon={<XCircle className="h-4 w-4" />}
            trend={resumen.fueraServicio > 0 ? { direction: 'down', text: 'Crítico' } : null}
            variant="destructive"
          />
          <StatCard
            label="Capacidad Operativa"
            value={`${resumen.capacidadOperativa}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{ direction: 'up', text: 'Capacidad' }}
          />
        </div>
      )}

      {/* Distribución por tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribución por Tipo de Equipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {porTipo.map((item) => {
              const config = getTipoConfig(item.tipo);
              const Icon = config.icon;
              const percentage = resumen?.total ? (item.cantidad / resumen.total) * 100 : 0;
              return (
                <div key={item.tipo} className="flex items-center gap-3">
                  <div className="flex w-28 items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-mono text-muted-foreground">
                    {item.cantidad} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Capacidad por proceso */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cog className="h-5 w-5" />
              Maquinado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {['Fresado CNC de hasta 5 ejes', 'Torneado CNC', 'Fresado convencional', 'Rectificado', 'Wire EDM', 'Router CNC'].map((proceso, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  {proceso}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Fabricación de Lámina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {['Corte láser', 'Doblez mediante prensa', 'Soldadura', 'Ensamble'].map((proceso, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  {proceso}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Procesos Especiales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {['Wire EDM para geometrías complejas', 'Inyección de plástico', 'Fabricación de piezas especiales', 'Prototipos'].map((proceso, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  {proceso}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Ocupación ──────────────────────────────────────

function OcupacionTab() {
  const [ocupacion, setOcupacion] = useState<OcupacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOcupacion = async () => {
      try {
        setLoading(true);
        const data = await get<OcupacionItem[]>('/api/maquinaria/ocupacion');
        setOcupacion(data);
      } catch (err: any) {
        setError(err?.message || 'Error al cargar ocupación');
      } finally {
        setLoading(false);
      }
    };
    fetchOcupacion();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Ocupación de Maquinaria
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ocupacion.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No hay operaciones activas</p>
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estatus</TableHead>
                  <TableHead className="text-center">Ops Activas</TableHead>
                  <TableHead className="text-center">Partes en Proceso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ocupacion.map((item) => {
                  const estatusConfig = getEstatusConfig(item.maquina.estatus);
                  const tipoConfig = getTipoConfig(item.maquina.tipo);
                  return (
                    <TableRow key={item.maquina.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tipoConfig.bg}`}>
                            <tipoConfig.icon className={`h-4 w-4 ${tipoConfig.color}`} />
                          </div>
                          <div>
                            <span className="font-medium text-sm">{item.maquina.codigo}</span>
                            <p className="text-xs text-muted-foreground">{item.maquina.nombre}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tipoConfig.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${estatusConfig.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${estatusConfig.dot}`} />
                          {estatusConfig.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono font-medium">{item.operacionesActivas}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono font-medium">{item.partesEnProceso}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Tab: Agenda semanal ─────────────────────────────────

function AgendaTab() {
  const [agenda, setAgenda] = useState<{
    semanaInicio: string;
    total: number;
    dias: Array<{
      fecha: string;
      operaciones: Array<{
        id: string;
        proceso: string;
        estatus: string;
        fechaInicioProgramada?: string;
        fechaFinProgramada?: string;
        maquina?: { codigo: string; nombre: string };
        wo?: { folio: string };
        parte?: { numeroParte?: string; piezaNombre?: string };
      }>;
    }>;
  } | null>(null);
  const [gantt, setGantt] = useState<{
    maquinas: Array<{
      maquina: { id: string; codigo: string; nombre: string };
      barras: Array<{
        id: string;
        proceso: string;
        inicio: string;
        fin: string;
        wo?: { folio: string };
      }>;
    }>;
    total: number;
  } | null>(null);
  const [conflictos, setConflictos] = useState<
    Array<{
      maquinaCodigo: string;
      a: { id: string; proceso: string; inicio: string; folio?: string };
      b: { id: string; proceso: string; inicio: string; folio?: string };
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preventivos, setPreventivos] = useState<any[]>([]);
  const [progForm, setProgForm] = useState({
    operacionId: '',
    fechaInicio: '',
    maquinaId: '',
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [ag, prev, gt, cf] = await Promise.all([
        get<any>('/api/maquinaria/agenda-semanal'),
        get<{ data: any[] }>('/api/maquinaria/preventivos-vencidos'),
        get<any>('/api/maquinaria/gantt-semanal'),
        get<{ data: any[] }>('/api/maquinaria/conflictos'),
      ]);
      setAgenda(ag);
      setPreventivos(prev.data || []);
      setGantt(gt);
      setConflictos(cf.data || []);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar agenda');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function programar(e: React.FormEvent) {
    e.preventDefault();
    if (!progForm.operacionId || !progForm.fechaInicio) return;
    try {
      setSaving(true);
      await patch(`/api/operaciones/${progForm.operacionId}/programar`, {
        fechaInicioProgramada: new Date(progForm.fechaInicio).toISOString(),
        maquinaId: progForm.maquinaId || undefined,
      });
      setProgForm({ operacionId: '', fechaInicio: '', maquinaId: '' });
      await load();
    } catch (err: any) {
      setError(err?.message || 'No se pudo programar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const diasLabel = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {preventivos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-amber-400">
              Preventivos vencidos ({preventivos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {preventivos.slice(0, 5).map((m) => (
              <div key={m.id} className="flex justify-between text-sm">
                <span>
                  {m.codigo} — {m.nombre}
                </span>
                <span className="text-muted-foreground">{m.diasVencido}d vencido</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {conflictos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-400">
              Conflictos de programación ({conflictos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conflictos.slice(0, 8).map((c, i) => (
              <div key={i} className="text-sm rounded border border-red-500/20 bg-red-500/5 px-3 py-2">
                <span className="font-medium">{c.maquinaCodigo}</span>
                {': '}
                {c.a.folio || c.a.id.slice(0, 8)} ({c.a.proceso}) ↔{' '}
                {c.b.folio || c.b.id.slice(0, 8)} ({c.b.proceso})
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Gantt semanal
            <span className="text-xs font-normal text-muted-foreground">
              {gantt?.total || 0} barras
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(gantt?.maquinas || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin operaciones con máquina programada esta semana.</p>
          ) : (
            (gantt?.maquinas || []).map((row) => (
              <div key={row.maquina.id} className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  {row.maquina.codigo} — {row.maquina.nombre}
                </p>
                <div className="relative h-8 rounded bg-muted/40 overflow-hidden">
                  {row.barras.map((b) => {
                    const weekStart = agenda?.semanaInicio
                      ? new Date(agenda.semanaInicio).getTime()
                      : Date.now();
                    const weekMs = 7 * 24 * 3600 * 1000;
                    const left = Math.max(
                      0,
                      ((new Date(b.inicio).getTime() - weekStart) / weekMs) * 100,
                    );
                    const width = Math.max(
                      2,
                      ((new Date(b.fin).getTime() - new Date(b.inicio).getTime()) / weekMs) * 100,
                    );
                    return (
                      <div
                        key={b.id}
                        title={`${b.wo?.folio || ''} ${b.proceso}`}
                        className="absolute top-1 bottom-1 rounded bg-blue-500/70 text-[9px] text-white px-1 truncate"
                        style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                      >
                        {b.wo?.folio || b.proceso}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Agenda semanal
            <span className="text-xs font-normal text-muted-foreground">
              {agenda?.total || 0} ops programadas
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {(agenda?.dias || []).map((dia, idx) => (
              <div key={dia.fecha} className="rounded-lg border border-border p-2 min-h-[120px]">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {diasLabel[idx]} {dia.fecha.slice(8)}
                </p>
                {dia.operaciones.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground/60">—</p>
                ) : (
                  <ul className="space-y-1.5">
                    {dia.operaciones.map((op) => (
                      <li
                        key={op.id}
                        className="rounded bg-blue-500/10 px-1.5 py-1 text-[11px] leading-tight"
                      >
                        <span className="font-medium">{op.maquina?.codigo || 's/m'}</span>
                        <br />
                        {op.wo?.folio} · {op.proceso}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Programar operación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={programar} className="grid gap-3 sm:grid-cols-4">
            <input
              className="input-base"
              placeholder="ID operación (UUID)"
              value={progForm.operacionId}
              onChange={(e) => setProgForm({ ...progForm, operacionId: e.target.value })}
              required
            />
            <input
              type="datetime-local"
              className="input-base"
              value={progForm.fechaInicio}
              onChange={(e) => setProgForm({ ...progForm, fechaInicio: e.target.value })}
              required
            />
            <input
              className="input-base"
              placeholder="Máquina ID (opcional)"
              value={progForm.maquinaId}
              onChange={(e) => setProgForm({ ...progForm, maquinaId: e.target.value })}
            />
            <Button type="submit" disabled={saving}>
              {saving ? '…' : 'Programar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  trend,
  variant = 'default',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { direction: 'up' | 'down' | 'warning'; text: string } | null;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-400',
    destructive: 'bg-red-500/10 text-red-400',
    warning: 'bg-amber-500/10 text-amber-400',
  };

  const trendIcon = {
    up: <ArrowUpRight className="h-3 w-3 text-emerald-400" />,
    down: <ArrowDownRight className="h-3 w-3 text-red-400" />,
    warning: <Minus className="h-3 w-3 text-amber-400" />,
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${variantStyles[variant]}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold">{value}</p>
            <p className="truncate text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {trendIcon[trend.direction]}
            <span className="text-muted-foreground">{trend.text}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
