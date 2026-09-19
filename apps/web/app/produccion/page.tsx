'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Eye,
  X,
  ClipboardList,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Inbox,
  CalendarDays,
  Timer,
  FileText,
} from 'lucide-react';
import { get, post, OrdenTrabajo } from '@/lib/api';

const ESTATUS_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PRODUCCION', label: 'En Producción' },
  { value: 'CALIDAD', label: 'En Calidad' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

interface OrdenTrabajoFormData {
  piezaNombre: string;
  piezaDescripcion: string;
  cantidad: number;
  unidad: string;
  fechaInicio: string;
  fechaFinEstimada: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  notas: string;
  responsableId?: string;
  cotizacionId?: string;
}

const VERSION = '1.0.0';

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getEstatusBadgeVariant(estatus: string): 'warning' | 'default' | 'success' | 'destructive' | 'secondary' {
  switch (estatus) {
    case 'PENDIENTE': return 'warning';
    case 'EN_PRODUCCION': return 'default';
    case 'CALIDAD': return 'default';
    case 'COMPLETADA': return 'success';
    case 'CANCELADA': return 'destructive';
    default: return 'secondary';
  }
}

function getEstatusLabel(estatus: string) {
  return ESTATUS_OPTIONS.find((x) => x.value === estatus)?.label || estatus;
}

function getPrioridadBadgeVariant(prioridad: string): 'destructive' | 'warning' | 'secondary' {
  switch (prioridad) {
    case 'ALTA': return 'destructive';
    case 'MEDIA': return 'warning';
    case 'BAJA': return 'secondary';
    default: return 'secondary';
  }
}

function getPrioridadLabel(prioridad: string) {
  switch (prioridad) {
    case 'ALTA': return 'Alta';
    case 'MEDIA': return 'Media';
    case 'BAJA': return 'Baja';
    default: return prioridad;
  }
}

export default function ProduccionPage() {
  return (
    <AppLayout>
      <ProduccionContent />
    </AppLayout>
  );
}

function ProduccionContent() {
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<OrdenTrabajoFormData>({
    piezaNombre: '',
    piezaDescripcion: '',
    cantidad: 1,
    unidad: 'pieza',
    fechaInicio: '',
    fechaFinEstimada: '',
    prioridad: 'MEDIA',
    notas: '',
  });

  const loadOrdenes = useCallback(async (p = 1, s = '', e = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', String(limit));
      if (s) q.set('search', s);
      if (e) q.set('estatus', e);
      const res = await get<{ data: OrdenTrabajo[]; meta: any }>(`/api/ordenes-trabajo?${q}`);
      setOrdenes(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar las órdenes de trabajo');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadOrdenes(page, search, estatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearch() {
    setPage(1);
    loadOrdenes(1, search, estatusFilter);
  }

  function handleEstatusChange(value: string) {
    setEstatusFilter(value);
    setPage(1);
    loadOrdenes(1, search, value);
  }

  function openNewOT() {
    setForm({
      piezaNombre: '',
      piezaDescripcion: '',
      cantidad: 1,
      unidad: 'pieza',
      fechaInicio: '',
      fechaFinEstimada: '',
      prioridad: 'MEDIA',
      notas: '',
    });
    setShowModal(true);
  }

  async function handleSubmitOT(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await post('/api/ordenes-trabajo', {
        piezaNombre: form.piezaNombre,
        piezaDescripcion: form.piezaDescripcion || undefined,
        cantidad: Number(form.cantidad),
        unidad: form.unidad,
        fechaInicio: form.fechaInicio || undefined,
        fechaFinEstimada: form.fechaFinEstimada || undefined,
        prioridad: form.prioridad,
        notas: form.notas || undefined,
      });
      setShowModal(false);
      loadOrdenes(page, search, estatusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al crear la orden de trabajo');
    } finally {
      setSaving(false);
    }
  }

  // Stats calculations
  const totalOrdenes = meta?.total ?? ordenes.length;
  const enProduccion = ordenes.filter((o) => o.estatus === 'EN_PRODUCCION' || o.estatus === 'CALIDAD').length;
  const completadas = ordenes.filter((o) => o.estatus === 'COMPLETADA').length;
  const tiempoProm = ordenes.length > 0
    ? Math.round(ordenes.reduce((sum, o) => sum + (o._count?.partes || 0), 0) / ordenes.length * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Producción</h1>
          <p className="text-sm text-muted-foreground">
            Órdenes de trabajo, operaciones y control de calidad
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-2" onClick={openNewOT}>
            <Plus className="h-4 w-4" />
            Nueva OT
          </Button>
        </div>
      </div>

      {/* Stats Cards with borders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Total Órdenes</p>
              <p className="text-2xl font-bold tracking-tight">{totalOrdenes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Loader2 className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">En Producción</p>
              <p className="text-2xl font-bold tracking-tight">{enProduccion}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Completadas</p>
              <p className="text-2xl font-bold tracking-tight">{completadas}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Tiempo prom.</p>
              <p className="text-2xl font-bold tracking-tight">{tiempoProm} h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por folio o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-base pl-10"
          />
        </div>
        <select
          value={estatusFilter}
          onChange={(e) => handleEstatusChange(e.target.value)}
          className="input-base sm:w-48"
        >
          <option value="">Todos los estatus</option>
          {ESTATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSearch}
          className="gap-2"
        >
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Client Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : ordenes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordenes.map((o) => (
            <div
              key={o.id}
              className="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    o.estatus === 'COMPLETADA' ? 'bg-success/10 text-success' :
                    o.estatus === 'CANCELADA' ? 'bg-muted text-muted-foreground' :
                    'bg-brand/10 text-brand'
                  }`}>
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <button
                      onClick={() => router.push(`/produccion/ot/${o.id}`)}
                      className="block truncate text-sm font-semibold text-foreground hover:text-primary focus:outline-none"
                    >
                      {o.folio}
                    </button>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.cotizacion?.cliente?.razonSocial || '—'}
                    </p>
                  </div>
                </div>
                <Badge variant={getEstatusBadgeVariant(o.estatus)}>
                  {getEstatusLabel(o.estatus)}
                </Badge>
              </div>

              {/* Card Body */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">Prioridad:</span>
                  <Badge variant={getPrioridadBadgeVariant(o.prioridad)} className="text-xs">
                    {getPrioridadLabel(o.prioridad)}
                  </Badge>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatDate(o.createdAt)}</span>
                </p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span>{o._count?.partes ?? 0} partes</span>
                </p>
                {o.notas && (
                  <p className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="shrink-0">📝</span>
                    <span className="line-clamp-2">{o.notas}</span>
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ClipboardList className="h-3 w-3" />
                    OT
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(o.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => router.push(`/produccion/ot/${o.id}`)}
                    title="Ver detalle"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} AMD México Operations ERP &middot; v{VERSION}
        </p>
      </footer>

      {/* New OT Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Nueva Orden de Trabajo</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitOT} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Pieza / Producto *
                </label>
                <input
                  type="text"
                  required
                  value={form.piezaNombre}
                  onChange={(e) => setForm({ ...form, piezaNombre: e.target.value })}
                  className="input-base"
                  placeholder="Nombre de la pieza"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Descripción
                </label>
                <textarea
                  value={form.piezaDescripcion}
                  onChange={(e) => setForm({ ...form, piezaDescripcion: e.target.value })}
                  rows={2}
                  className="input-base resize-none"
                  placeholder="Descripción de la pieza"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Unidad
                  </label>
                  <select
                    value={form.unidad}
                    onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                    className="input-base"
                  >
                    <option value="pieza">Pieza</option>
                    <option value="kg">Kg</option>
                    <option value="m">Metro</option>
                    <option value="litro">Litro</option>
                    <option value="set">Set</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Prioridad
                  </label>
                  <select
                    value={form.prioridad}
                    onChange={(e) => setForm({ ...form, prioridad: e.target.value as 'ALTA' | 'MEDIA' | 'BAJA' })}
                    className="input-base"
                  >
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Fecha Fin Estimada
                  </label>
                  <input
                    type="date"
                    value={form.fechaFinEstimada}
                    onChange={(e) => setForm({ ...form, fechaFinEstimada: e.target.value })}
                    className="input-base"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Notas
                </label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
                  className="input-base resize-none"
                  placeholder="Observaciones de la orden"
                />
              </div>
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="gap-2" disabled={saving}>
                  {saving ? 'Guardando...' : 'Crear OT'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">
        No hay órdenes de trabajo
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Cree una nueva orden de trabajo para comenzar
      </p>
    </div>
  );
}
