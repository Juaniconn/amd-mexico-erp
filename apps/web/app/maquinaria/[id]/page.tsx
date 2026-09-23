'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gauge, MiniBar } from '@/components/Gauge';
import {
  Loader2,
  AlertCircle,
  Factory,
  Cog,
  Wrench,
  Activity,
  Settings,
  Package,
  CheckCircle2,
  XCircle,
  Edit,
  ArrowLeft,
  Gauge as GaugeIcon,
  CalendarDays,
  Hash,
  Clock,
  BarChart3,
  FileText,
  History,
  Zap,
  X,
} from 'lucide-react';
import { get, patch, post } from '@/lib/api';

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
  intervaloDiasPreventivo?: number | null;
  ultimoPreventivo?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { operaciones: number; partesOT: number; mantenimientos: number };
}

interface Mantenimiento {
  id: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  costo?: number;
  realizadoPor?: string;
  createdAt: string;
}

interface Operacion {
  id: string;
  nombre: string;
  secuencia: number;
  tiempoEstimado?: number;
  estatus: string;
  ordenTrabajo?: { id: string; folio: string };
  parte?: { id: string; numeroParte: string };
}

const TIPOS_MAQUINA = [
  { value: 'CNC', label: 'CNC / VMC', icon: Cog, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'LASER', label: 'Láser', icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10' },
  { value: 'TORNO', label: 'Torno', icon: Settings, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'PRENSA', label: 'Prensa', icon: Wrench, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'EDM', label: 'EDM', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { value: 'CONVENCIONAL', label: 'Convencional', icon: Factory, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  { value: 'RECTIFICADO', label: 'Rectificadora', icon: GaugeIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
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

export default function MaquinaDetallePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const [maquina, setMaquina] = useState<Maquina | null>(null);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMantModal, setShowMantModal] = useState(false);
  const [mantDefaultTipo, setMantDefaultTipo] = useState('PREVENTIVO');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [maq, mant, opsRes] = await Promise.all([
          get<Maquina>(`/api/maquinaria/${id}`),
          get<Mantenimiento[]>(`/api/maquinaria/${id}/mantenimientos`),
          get<{ data: Operacion[]; meta: any }>(`/api/maquinaria/${id}/historial-operaciones`),
        ]);
        setMaquina(maq);
        setMantenimientos(mant);
        setOperaciones(opsRes.data || []);
      } catch (err: any) {
        setError(err?.message || 'Error al cargar máquina');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChangeStatus = async (newStatus: string) => {
    if (!maquina) return;
    try {
      setChangingStatus(true);
      await patch(`/api/maquinaria/${id}/estatus`, { estatus: newStatus });
      setMaquina({ ...maquina, estatus: newStatus });
    } catch (err: any) {
      alert(err?.message || 'Error al cambiar estatus');
    } finally {
      setChangingStatus(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const updated = await patch<Maquina>(`/api/maquinaria/${id}`, {
        nombre: formData.get('nombre') as string,
        tipo: formData.get('tipo') as string,
        descripcion: formData.get('descripcion') as string,
        capacidad: formData.get('capacidad') as string,
        notas: formData.get('notas') as string,
        intervaloDiasPreventivo: formData.get('intervaloDiasPreventivo')
          ? Number(formData.get('intervaloDiasPreventivo'))
          : undefined,
      });
      // API may wrap in data
      setMaquina((updated as any).data || updated);
      setShowEditModal(false);
    } catch (err: any) {
      alert(err?.message || 'Error al actualizar máquina');
    }
  };

  const handleMantenimiento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await post(`/api/maquinaria/${id}/mantenimientos`, {
        tipo: formData.get('tipo') as string,
        descripcion: formData.get('descripcion') as string,
        costo: formData.get('costo') ? parseFloat(formData.get('costo') as string) : undefined,
      });
      setShowMantModal(false);
      // Refresh data
      const [maq, mant] = await Promise.all([
        get<Maquina>(`/api/maquinaria/${id}`),
        get<Mantenimiento[]>(`/api/maquinaria/${id}/mantenimientos`),
      ]);
      setMaquina(maq);
      setMantenimientos(mant);
    } catch (err: any) {
      alert(err?.message || 'Error al registrar mantenimiento');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error || !maquina) {
    return (
      <AppLayout>
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error || 'Máquina no encontrada'}</span>
        </div>
      </AppLayout>
    );
  }

  const tipoConfig = getTipoConfig(maquina.tipo);
  const estatusConfig = getEstatusConfig(maquina.estatus);
  const TipoIcon = tipoConfig.icon;
  const ops = maquina._count?.operaciones || 0;
  const partes = maquina._count?.partesOT || 0;
  const mant = maquina._count?.mantenimientos || 0;
  const ocupacion = Math.min(100, Math.round((Math.max(ops, partes) / 10) * 100));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/maquinaria')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{maquina.nombre}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${estatusConfig.bg} ${estatusConfig.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${estatusConfig.dot} animate-pulse`} />
                {estatusConfig.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {maquina.codigo} · {tipoConfig.label} · Registrada {new Date(maquina.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Panel de Estado Actual */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 lg:flex-row">
              {/* Gauge de ocupación */}
              <div className="flex flex-col items-center gap-2">
                <Gauge
                  value={ocupacion}
                  size={140}
                  strokeWidth={10}
                  color={ocupacion > 80 ? '#ef4444' : ocupacion > 50 ? '#f59e0b' : '#10b981'}
                  label="Ocupación"
                />
                <p className="text-xs text-muted-foreground">Actividad actual</p>
              </div>

              {/* Métricas */}
              <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-widest">Operaciones</span>
                  </div>
                  <p className="text-3xl font-bold">{ops}</p>
                  <p className="text-xs text-muted-foreground mt-1">Asignadas</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Package className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-widest">Partes</span>
                  </div>
                  <p className="text-3xl font-bold">{partes}</p>
                  <p className="text-xs text-muted-foreground mt-1">En proceso</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Wrench className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-widest">Mantenimiento</span>
                  </div>
                  <p className="text-3xl font-bold">{mant}</p>
                  <p className="text-xs text-muted-foreground mt-1">Registrados</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Información Técnica */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Especificaciones Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" />
                    Código
                  </div>
                  <p className="font-mono text-sm">{maquina.codigo}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    <Cog className="h-3.5 w-3.5" />
                    Tipo
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded ${tipoConfig.bg}`}>
                      <TipoIcon className={`h-3.5 w-3.5 ${tipoConfig.color}`} />
                    </div>
                    <span className="text-sm">{tipoConfig.label}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    <GaugeIcon className="h-3.5 w-3.5" />
                    Capacidad
                  </div>
                  <p className="text-sm">{maquina.capacidad || '—'}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Última Actualización
                  </div>
                  <p className="text-sm">{new Date(maquina.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Intervalo preventivo
                  </div>
                  <p className="text-sm">
                    {maquina.intervaloDiasPreventivo
                      ? `Cada ${maquina.intervaloDiasPreventivo} días`
                      : 'Sin agenda'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    <Wrench className="h-3.5 w-3.5" />
                    Último preventivo
                  </div>
                  <p className="text-sm">
                    {maquina.ultimoPreventivo
                      ? new Date(maquina.ultimoPreventivo).toLocaleDateString('es-MX')
                      : 'Nunca'}
                  </p>
                </div>
                {maquina.descripcion && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Descripción
                    </div>
                    <p className="text-sm">{maquina.descripcion}</p>
                  </div>
                )}
                {maquina.notas && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Notas
                    </div>
                    <p className="text-sm">{maquina.notas}</p>
                  </div>
                )}
              </div>

              {/* Acciones de estatus */}
              <div className="mt-6 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                  <Activity className="h-3.5 w-3.5" />
                  Cambiar Estatus
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ESTATUS_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleChangeStatus(key)}
                      disabled={changingStatus || maquina.estatus === key}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        maquina.estatus === key
                          ? `${config.bg} ${config.color} border-current`
                          : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline de Mantenimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mantenimientos.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <Wrench className="mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Sin mantenimientos</p>
                </div>
              ) : (
                <div className="relative space-y-4 pl-4">
                  {/* Línea vertical */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
                  {mantenimientos.slice(0, 6).map((m) => (
                    <div key={m.id} className="relative pl-4">
                      {/* Punto */}
                      <div className="absolute -left-4 top-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-background" />
                      <div className="text-xs text-muted-foreground">
                        {new Date(m.fecha).toLocaleDateString()}
                      </div>
                      <p className="mt-0.5 text-sm font-medium">{m.tipo}</p>
                      <p className="text-xs text-muted-foreground">{m.descripcion}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Operaciones Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Operaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {operaciones.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Activity className="mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Sin operaciones registradas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {operaciones.slice(0, 8).map((op) => (
                  <div key={op.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-muted/50 transition">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-mono font-bold">
                        {op.secuencia}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{op.nombre}</p>
                        {op.ordenTrabajo && (
                          <p className="text-xs text-muted-foreground">
                            OT: {op.ordenTrabajo.folio}
                            {op.parte && ` · ${op.parte.numeroParte}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {op.tiempoEstimado && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {op.tiempoEstimado}h
                        </span>
                      )}
                      <Badge variant={op.estatus === 'COMPLETADA' ? 'success' : op.estatus === 'EN_PROCESO' ? 'warning' : 'secondary'}>
                        {op.estatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end gap-2 flex-wrap">
          <Button variant="outline" className="gap-1.5" onClick={() => setShowEditModal(true)}>
            <Edit className="h-4 w-4" />
            Editar Máquina
          </Button>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              setMantDefaultTipo('PREVENTIVO');
              setShowMantModal(true);
            }}
          >
            <Clock className="h-4 w-4" />
            Registrar preventivo
          </Button>
          <Button
            variant="default"
            className="gap-1.5"
            onClick={() => {
              setMantDefaultTipo('CORRECTIVO');
              setShowMantModal(true);
            }}
          >
            <Wrench className="h-4 w-4" />
            Registrar Mantenimiento
          </Button>
        </div>

        {/* Modal: Editar Máquina */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center" onClick={() => setShowEditModal(false)}>
            <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Editar Máquina</h2>
                <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Nombre</label>
                  <input name="nombre" defaultValue={maquina.nombre} required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Tipo</label>
                  <select name="tipo" defaultValue={maquina.tipo} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {TIPOS_MAQUINA.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Capacidad</label>
                  <input name="capacidad" defaultValue={maquina.capacidad || ''} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Descripción</label>
                  <input name="descripcion" defaultValue={maquina.descripcion || ''} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Notas</label>
                  <textarea name="notas" defaultValue={maquina.notas || ''} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Intervalo preventivo (días)
                  </label>
                  <input
                    name="intervaloDiasPreventivo"
                    type="number"
                    min={1}
                    defaultValue={maquina.intervaloDiasPreventivo || ''}
                    placeholder="ej. 90"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                  <Button type="submit">Guardar Cambios</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Registrar Mantenimiento */}
        {showMantModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center" onClick={() => setShowMantModal(false)}>
            <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Registrar Mantenimiento</h2>
                <button onClick={() => setShowMantModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleMantenimiento} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Tipo</label>
                  <select
                    name="tipo"
                    required
                    defaultValue={mantDefaultTipo}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="PREVENTIVO">Preventivo</option>
                    <option value="CORRECTIVO">Correctivo</option>
                    <option value="PREDICTIVO">Predictivo</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Descripción</label>
                  <textarea name="descripcion" required rows={3} placeholder="Describe el mantenimiento realizado..." className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Costo (MXN)</label>
                  <input name="costo" type="number" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowMantModal(false)}>Cancelar</Button>
                  <Button type="submit">Registrar</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
