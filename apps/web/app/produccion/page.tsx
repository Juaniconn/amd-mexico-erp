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
  Search,
  Plus,
  Eye,
  X,
  ClipboardList,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Inbox,
  CalendarDays,
  Timer,
  ArrowRightLeft,
} from 'lucide-react';
import { get, post, OrdenTrabajo, ApiError } from '@/lib/api';

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
      <div className="card-premium p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por folio o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-base pl-9"
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
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha Entrega</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Tiempo Est.</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows />
            ) : ordenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              ordenes.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => router.push(`/produccion/ot/${o.id}`)}
                      className="text-primary hover:underline focus:outline-none"
                    >
                      {o.folio}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.cotizacion?.cliente?.razonSocial || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getEstatusBadgeVariant(o.estatus)}>
                      {getEstatusLabel(o.estatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o._count?.partes || 0} partes
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => router.push(`/produccion/ot/${o.id}`)}
                        title="Ver detalle"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {meta && !loading && ordenes.length > 0 && (
          <div className="flex flex-col gap-3 border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground rounded-b-xl sm:flex-row sm:items-center sm:justify-between">
            <span>
              Mostrando {ordenes.length} de {meta.total} órdenes
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-2">
                Página {meta.page} de {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </TableContainer>

      {/* Footer */}
      <footer className="border-t pt-4 text-center">
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

function StatCard({
  title,
  value,
  icon,
  variant = 'default',
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'brand';
}) {
  const variantClass =
    variant === 'success'
      ? 'bg-success-muted text-success'
      : variant === 'destructive'
      ? 'bg-danger-muted text-danger'
      : variant === 'warning'
      ? 'bg-warning-muted text-warning'
      : variant === 'brand'
      ? 'bg-brand-muted text-brand'
      : 'bg-primary/10 text-primary';

  return (
    <div className="card-premium p-5 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${variantClass}`}>
          {icon}
        </div>
        <div>
          <p className="section-title">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-1">
              <div className="h-6 w-6 animate-pulse rounded bg-muted" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
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
