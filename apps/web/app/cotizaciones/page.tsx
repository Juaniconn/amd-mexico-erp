'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
  Hash,
  DollarSign,
  Eye,
  X,
  Calendar,
  Loader2,
} from 'lucide-react';
import { get, put, del, post } from '@/lib/api';
import type { Cotizacion, CotizacionWithParts, DetalleCotizacion } from '@/types';

interface CotizacionFormData {
  clienteId: string;
  moneda: string;
  fechaEntrega: string;
  notas: string;
  lineas: { descripcion: string; cantidad: number; unidad: string; precioUnitario: number }[];
}

interface CotizacionListItem extends Cotizacion {
  razonSocial?: string;
  detalles?: any[];
  fechaEntrega?: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'EN_REVISION', label: 'En Revisión' },
  { value: 'ACEPTADA', label: 'Aprobada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'CONVERTIDA', label: 'Convertida' },
];

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  BORRADOR: 'secondary',
  ENVIADA: 'default',
  EN_REVISION: 'warning',
  ACEPTADA: 'success',
  RECHAZADA: 'destructive',
  CANCELADA: 'outline',
  CONVERTIDA: 'success',
};

const STATUS_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada',
  EN_REVISION: 'En Revisión',
  ACEPTADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  CONVERTIDA: 'Convertida',
};

function formatCurrency(value: number | string, moneda: string = 'MXN'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const symbol = moneda === 'USD' ? 'US$' : '$';
  return `${symbol} ${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CotizacionesPage() {
  return (
    <AppLayout>
      <CotizacionesContent />
    </AppLayout>
  );
}

function CotizacionesContent() {
  const router = useRouter();
  const [cotizaciones, setCotizaciones] = useState<CotizacionListItem[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState<{ id: string; razonSocial: string; monedaPref: string }[]>([]);
  const [editingCotizacion, setEditingCotizacion] = useState<CotizacionListItem | null>(null);
  const [detailCotizacion, setDetailCotizacion] = useState<CotizacionWithParts | null>(null);

  const [form, setForm] = useState<CotizacionFormData>({
    clienteId: '',
    moneda: 'MXN',
    fechaEntrega: '',
    notas: '',
    lineas: [],
  });

  const [editForm, setEditForm] = useState<CotizacionFormData>({
    clienteId: '',
    moneda: 'MXN',
    fechaEntrega: '',
    notas: '',
    lineas: [],
  });

  const loadCotizaciones = useCallback(async (p = 1, s = '', status = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', String(limit));
      if (s) q.set('search', s);
      if (status) q.set('estatus', status);
      const res = await get<{ data: CotizacionListItem[]; meta: any }>(`/api/cotizaciones?${q}`);
      setCotizaciones(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCotizaciones(page, search, statusFilter);
  }, [page, loadCotizaciones, search, statusFilter]);

  function handleSearch() {
    setPage(1);
    loadCotizaciones(1, search, statusFilter);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
    loadCotizaciones(1, search, value);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar esta cotización?')) return;
    try {
      setError('');
      await del(`/api/cotizaciones/${id}`);
      loadCotizaciones(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  async function handleSend(id: string) {
    try {
      setError('');
      await put(`/api/cotizaciones/${id}`, { estatus: 'ENVIADA' });
      loadCotizaciones(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al enviar cotización');
    }
  }

  function openNewCotizacion() {
    setForm({
      clienteId: '',
      moneda: 'MXN',
      fechaEntrega: '',
      notas: '',
      lineas: [],
    });
    setShowModal(true);
    get<{ data: { id: string; razonSocial: string; monedaPref: string }[] }>('/api/clientes?limit=100')
      .then((res) => setClientes(res.data))
      .catch(() => {});
  }

  function openEditCotizacion(c: CotizacionListItem) {
    setEditingCotizacion(c);
    setEditForm({
      clienteId: c.clienteId || '',
      moneda: c.moneda || 'MXN',
      fechaEntrega: (c as any).fechaEntrega || '',
      notas: c.notas || '',
      lineas: (c as any).detalles?.map((l: any) => ({
        descripcion: l.descripcion || l.piezaNombre || '',
        cantidad: l.cantidad || 1,
        unidad: l.unidad || 'PZA',
        precioUnitario: l.precioUnitario || 0,
      })) || [],
    });
    setShowEditModal(true);
    get<{ data: { id: string; razonSocial: string; monedaPref: string }[] }>('/api/clientes?limit=100')
      .then((res) => setClientes(res.data))
      .catch(() => {});
  }

  async function openDetailCard(c: CotizacionListItem) {
    setDetailCotizacion(null);
    setShowDetailModal(true);
    try {
      const res = await get<CotizacionWithParts>(`/api/cotizaciones/${c.id}`);
      setDetailCotizacion(res);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar cotización');
      setShowDetailModal(false);
    }
  }

  async function handleDeleteFromDetail() {
    if (!detailCotizacion) return;
    if (!confirm('¿Está seguro de eliminar esta cotización?')) return;
    try {
      setError('');
      await del(`/api/cotizaciones/${detailCotizacion.id}`);
      setShowDetailModal(false);
      setDetailCotizacion(null);
      loadCotizaciones(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  async function handleAprobar() {
    if (!detailCotizacion) return;
    if (!confirm('¿Está seguro de aprobar esta cotización? Se convertirá en una Orden de Trabajo.')) return;
    try {
      setError('');
      await post(`/api/cotizaciones/${detailCotizacion.id}/aprobar`, {});
      setShowDetailModal(false);
      setDetailCotizacion(null);
      loadCotizaciones(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al aprobar');
    }
  }

  function openEditFromDetail() {
    if (!detailCotizacion) return;
    setEditingCotizacion(detailCotizacion);
    setEditForm({
      clienteId: detailCotizacion.clienteId || '',
      moneda: detailCotizacion.moneda || 'MXN',
      fechaEntrega: (detailCotizacion as any).fechaEntrega || '',
      notas: detailCotizacion.notas || '',
      lineas: (detailCotizacion.detalles || []).map((d: DetalleCotizacion) => ({
        descripcion: d.piezaNombre || '',
        cantidad: d.cantidad || 1,
        unidad: d.unidad || 'PZA',
        precioUnitario: Number(d.precioUnitario) || 0,
      })),
    });
    setShowDetailModal(false);
    setShowEditModal(true);
    get<{ data: { id: string; razonSocial: string; monedaPref: string }[] }>('/api/clientes?limit=100')
      .then((res) => setClientes(res.data))
      .catch(() => {});
  }

  async function handleSubmitCotizacion(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await post('/api/cotizaciones', {
        clienteId: form.clienteId,
        moneda: form.moneda,
        notas: form.notas || undefined,
        detalles: form.lineas.length > 0
          ? form.lineas.map(l => ({
              piezaNombre: l.descripcion,
              piezaDescripcion: undefined,
              cantidad: Number(l.cantidad),
              unidad: l.unidad,
              precioUnitario: Number(l.precioUnitario),
              tiempoEstimado: undefined,
              procesoRequerido: undefined,
              notas: undefined,
            }))
          : undefined,
      });
      setShowModal(false);
      loadCotizaciones(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al crear la cotización');
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCotizacion) return;
    setSaving(true);
    setError('');
    try {
      await put(`/api/cotizaciones/${editingCotizacion.id}`, {
        clienteId: editForm.clienteId,
        moneda: editForm.moneda,
        notas: editForm.notas || undefined,
        estatus: editingCotizacion.estatus,
        detalles: editForm.lineas.length > 0
          ? editForm.lineas.map(l => ({
              piezaNombre: l.descripcion,
              piezaDescripcion: undefined,
              cantidad: Number(l.cantidad),
              unidad: l.unidad,
              precioUnitario: Number(l.precioUnitario),
              tiempoEstimado: undefined,
              procesoRequerido: undefined,
              notas: undefined,
            }))
          : undefined,
      });
      setShowEditModal(false);
      setEditingCotizacion(null);
      loadCotizaciones(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la cotización');
    } finally {
      setSaving(false);
    }
  }

  function addLinea() {
    setForm({
      ...form,
      lineas: [...form.lineas, { descripcion: '', cantidad: 1, unidad: 'PZA', precioUnitario: 0 }],
    });
  }

  function removeLinea(index: number) {
    setForm({
      ...form,
      lineas: form.lineas.filter((_, i) => i !== index),
    });
  }

  function addEditLinea() {
    setEditForm({
      ...editForm,
      lineas: [...editForm.lineas, { descripcion: '', cantidad: 1, unidad: 'PZA', precioUnitario: 0 }],
    });
  }

  function removeEditLinea(index: number) {
    setEditForm({
      ...editForm,
      lineas: editForm.lineas.filter((_, i) => i !== index),
    });
  }

  const totalCotizaciones = meta?.total ?? cotizaciones.length;
  const pendientes = cotizaciones.filter((c) => c.estatus === 'BORRADOR' || c.estatus === 'EN_REVISION').length;
  const aceptadas = cotizaciones.filter((c) => c.estatus === 'ACEPTADA' || c.estatus === 'CONVERTIDA').length;
  const rechazadas = cotizaciones.filter((c) => c.estatus === 'RECHAZADA' || c.estatus === 'CANCELADA').length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de RFQ y cotizaciones de manufactura
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={openNewCotizacion}>
          <Plus className="h-4 w-4" />
          Nueva Cotización
        </Button>
      </div>

      {/* Stats Cards with borders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Total</p>
              <p className="text-2xl font-bold tracking-tight">{totalCotizaciones}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-warning/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Pendientes</p>
              <p className="text-2xl font-bold tracking-tight">{pendientes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-success/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Aceptadas</p>
              <p className="text-2xl font-bold tracking-tight">{aceptadas}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-destructive/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Rechazadas</p>
              <p className="text-2xl font-bold tracking-tight">{rechazadas}</p>
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
            placeholder="Buscar por cliente o folio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-base pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="input-base sm:w-44"
        >
          {STATUS_OPTIONS.map((opt) => (
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

      {/* Cards Grid */}
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
      ) : cotizaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No hay cotizaciones registradas</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Cree una nueva cotización para comenzar</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cotizaciones.map((c) => (
              <div
                key={c.id}
                onClick={() => openDetailCard(c)}
                className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <Hash className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">{c.folio}</h3>
                      <p className="text-xs text-muted-foreground truncate">{c.razonSocial || '—'}</p>
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANTS[c.estatus] || 'secondary'}>
                    {STATUS_LABELS[c.estatus] || c.estatus}
                  </Badge>
                </div>

                {/* Card Body */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <DollarSign className="h-3.5 w-3.5 shrink-0 text-success" />
                      {formatCurrency(c.total, c.moneda)}
                    </p>
                    <span className="text-xs text-muted-foreground">{c.moneda}</span>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {formatDate(c.fecha)}
                  </p>
                  {c.notas && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 pt-1">
                      {c.notas}
                    </p>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Clic para ver detalle</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => { e.stopPropagation(); openDetailCard(c); }}
                      title="Ver detalle"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => { e.stopPropagation(); openEditCotizacion(c); }}
                      title="Editar cotización"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      title="Eliminar cotización"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          {meta && !loading && cotizaciones.length > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
              <span>
                Mostrando {cotizaciones.length} de {meta.total} cotizaciones
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
        </>
      )}

      {/* New Cotización Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Nueva Cotización</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCotizacion} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Cliente *
                  </label>
                  <select
                    required
                    value={form.clienteId}
                    onChange={(e) => {
                      const cliente = clientes.find((c) => c.id === e.target.value);
                      setForm({
                        ...form,
                        clienteId: e.target.value,
                        moneda: cliente?.monedaPref === 'USD' ? 'USD' : 'MXN',
                      });
                    }}
                    className="input-base"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Moneda
                  </label>
                  <select
                    value={form.moneda}
                    onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                    className="input-base"
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar Americano</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Fecha Entrega
                  </label>
                  <input
                    type="date"
                    value={form.fechaEntrega}
                    onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
                    className="input-base"
                  />
                </div>
              </div>

              {/* Lineas */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Partidas
                  </label>
                  <Button type="button" variant="outline" size="sm" onClick={addLinea} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Agregar Partida
                  </Button>
                </div>
                {form.lineas.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    Agregue al menos una partida
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.lineas.map((l, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Descripción"
                          value={l.descripcion}
                          onChange={(e) => {
                            const updated = [...form.lineas];
                            updated[i] = { ...l, descripcion: e.target.value };
                            setForm({ ...form, lineas: updated });
                          }}
                          className="input-base flex-1"
                        />
                        <input
                          type="number"
                          placeholder="Cant."
                          min={1}
                          value={l.cantidad}
                          onChange={(e) => {
                            const updated = [...form.lineas];
                            updated[i] = { ...l, cantidad: Number(e.target.value) };
                            setForm({ ...form, lineas: updated });
                          }}
                          className="input-base w-20"
                        />
                        <select
                          value={l.unidad}
                          onChange={(e) => {
                            const updated = [...form.lineas];
                            updated[i] = { ...l, unidad: e.target.value };
                            setForm({ ...form, lineas: updated });
                          }}
                          className="input-base w-24"
                        >
                          <option value="PZA">PZA</option>
                          <option value="KG">KG</option>
                          <option value="M">M</option>
                          <option value="M²">M²</option>
                          <option value="M³">M³</option>
                          <option value="LT">LT</option>
                          <option value="HR">HR</option>
                          <option value="JGO">JGO</option>
                          <option value="PAR">PAR</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Precio"
                          min={0}
                          value={l.precioUnitario}
                          onChange={(e) => {
                            const updated = [...form.lineas];
                            updated[i] = { ...l, precioUnitario: Number(e.target.value) };
                            setForm({ ...form, lineas: updated });
                          }}
                          className="input-base w-28"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeLinea(i)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                  placeholder="Observaciones de la cotización"
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
                  {saving ? 'Guardando...' : 'Crear Cotización'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Cotización Modal */}
      {showEditModal && editingCotizacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Editar Cotización {editingCotizacion.folio}</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCotizacion(null);
                }}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Cliente *
                  </label>
                  <select
                    required
                    value={editForm.clienteId}
                    onChange={(e) => {
                      const cliente = clientes.find((c) => c.id === e.target.value);
                      setEditForm({
                        ...editForm,
                        clienteId: e.target.value,
                        moneda: cliente?.monedaPref === 'USD' ? 'USD' : 'MXN',
                      });
                    }}
                    className="input-base"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Moneda
                  </label>
                  <select
                    value={editForm.moneda}
                    onChange={(e) => setEditForm({ ...editForm, moneda: e.target.value })}
                    className="input-base"
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar Americano</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Fecha Entrega
                  </label>
                  <input
                    type="date"
                    value={editForm.fechaEntrega}
                    onChange={(e) => setEditForm({ ...editForm, fechaEntrega: e.target.value })}
                    className="input-base"
                  />
                </div>
              </div>

              {/* Lineas */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Partidas
                  </label>
                  <Button type="button" variant="outline" size="sm" onClick={addEditLinea} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Agregar Partida
                  </Button>
                </div>
                {editForm.lineas.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    Agregue al menos una partida
                  </p>
                ) : (
                  <div className="space-y-2">
                    {editForm.lineas.map((l, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Descripción"
                          value={l.descripcion}
                          onChange={(e) => {
                            const updated = [...editForm.lineas];
                            updated[i] = { ...l, descripcion: e.target.value };
                            setEditForm({ ...editForm, lineas: updated });
                          }}
                          className="input-base flex-1"
                        />
                        <input
                          type="number"
                          placeholder="Cant."
                          min={1}
                          value={l.cantidad}
                          onChange={(e) => {
                            const updated = [...editForm.lineas];
                            updated[i] = { ...l, cantidad: Number(e.target.value) };
                            setEditForm({ ...editForm, lineas: updated });
                          }}
                          className="input-base w-20"
                        />
                        <select
                          value={l.unidad}
                          onChange={(e) => {
                            const updated = [...editForm.lineas];
                            updated[i] = { ...l, unidad: e.target.value };
                            setEditForm({ ...editForm, lineas: updated });
                          }}
                          className="input-base w-24"
                        >
                          <option value="PZA">PZA</option>
                          <option value="KG">KG</option>
                          <option value="M">M</option>
                          <option value="M²">M²</option>
                          <option value="M³">M³</option>
                          <option value="LT">LT</option>
                          <option value="HR">HR</option>
                          <option value="JGO">JGO</option>
                          <option value="PAR">PAR</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Precio"
                          min={0}
                          value={l.precioUnitario}
                          onChange={(e) => {
                            const updated = [...editForm.lineas];
                            updated[i] = { ...l, precioUnitario: Number(e.target.value) };
                            setEditForm({ ...editForm, lineas: updated });
                          }}
                          className="input-base w-28"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeEditLinea(i)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Notas
                </label>
                <textarea
                  value={editForm.notas}
                  onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })}
                  rows={2}
                  className="input-base resize-none"
                  placeholder="Observaciones de la cotización"
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
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCotizacion(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="gap-2" disabled={saving}>
                  {saving ? 'Guardando...' : 'Actualizar Cotización'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal — shows full cotizacion info with actions */}
      {showDetailModal && detailCotizacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{detailCotizacion.folio}</h2>
                <p className="text-xs text-muted-foreground">{detailCotizacion.cliente?.razonSocial || '—'}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailCotizacion(null);
                }}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <p className="section-title">Cliente</p>
                  <p className="text-sm text-foreground">{detailCotizacion.cliente?.razonSocial || '—'}</p>
                </div>
                <div>
                  <p className="section-title">Moneda</p>
                  <p className="text-sm text-foreground">{detailCotizacion.moneda}</p>
                </div>
                <div>
                  <p className="section-title">Estatus</p>
                  <Badge variant={STATUS_VARIANTS[detailCotizacion.estatus] || 'secondary'}>
                    {STATUS_LABELS[detailCotizacion.estatus] || detailCotizacion.estatus}
                  </Badge>
                </div>
                <div>
                  <p className="section-title">Fecha</p>
                  <p className="text-sm text-foreground">{formatDate(detailCotizacion.createdAt || (detailCotizacion as any).fecha)}</p>
                </div>
                <div>
                  <p className="section-title">Validez</p>
                  <p className="text-sm text-foreground">{detailCotizacion.validez} días</p>
                </div>
                {detailCotizacion.tipoCambio && Number(detailCotizacion.tipoCambio) > 0 && (
                  <div>
                    <p className="section-title">Tipo Cambio</p>
                    <p className="text-sm text-foreground">{Number(detailCotizacion.tipoCambio).toFixed(4)}</p>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="section-title">Subtotal</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(Number(detailCotizacion.subtotal) || 0, detailCotizacion.moneda)}
                    </p>
                  </div>
                  <div>
                    <p className="section-title">IVA</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(Number(detailCotizacion.iva) || 0, detailCotizacion.moneda)}
                    </p>
                  </div>
                  <div>
                    <p className="section-title">Total</p>
                    <p className="text-lg font-bold text-brand">
                      {formatCurrency(Number(detailCotizacion.total) || 0, detailCotizacion.moneda)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles/Partidas */}
              {detailCotizacion.detalles && detailCotizacion.detalles.length > 0 && (
                <div>
                  <p className="section-title mb-2">Partidas ({detailCotizacion.detalles.length})</p>
                  <div className="space-y-2">
                    {detailCotizacion.detalles.map((d: DetalleCotizacion, i: number) => (
                      <div key={d.id || i} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{d.piezaNombre}</p>
                          {d.piezaDescripcion && (
                            <p className="text-xs text-muted-foreground truncate">{d.piezaDescripcion}</p>
                          )}
                          {d.procesoRequerido && (
                            <p className="text-xs text-muted-foreground">⚙ {d.procesoRequerido}</p>
                          )}
                        </div>
                        <div className="ml-3 text-right shrink-0">
                          <p className="text-xs text-muted-foreground">{d.cantidad} {d.unidad}</p>
                          <p className="text-sm font-medium text-foreground">
                            {formatCurrency(Number(d.subtotal) || 0, detailCotizacion.moneda)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {detailCotizacion.notas && (
                <div>
                  <p className="section-title">Notas</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detailCotizacion.notas}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                {detailCotizacion.estatus === 'ENVIADA' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAprobar}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Aprobar y Convertir a OT
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openEditFromDetail}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteFromDetail}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
