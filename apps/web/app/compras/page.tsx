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
  Pencil,
  Trash2,
  ShoppingCart,
  Filter,
  Loader2,
  AlertCircle,
  Inbox,
  Calendar,
  DollarSign,
  X,
  ChevronDown,
} from 'lucide-react';
import { get, post, patch, del, ApiError } from '@/lib/api';
import type { OrdenCompra, EstatusOrdenCompra } from '@/types';

// ─── Status Config ──────────────────────────────────────────

const STATUS_CONFIG: Record<EstatusOrdenCompra, { label: string; variant: 'secondary' | 'default' | 'success' | 'destructive' }> = {
  BORRADOR: { label: 'Borrador', variant: 'secondary' },
  ENVIADA: { label: 'Enviada', variant: 'default' },
  RECIBIDA: { label: 'Recibida', variant: 'success' },
  CANCELADA: { label: 'Cancelada', variant: 'destructive' },
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los estatus' },
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'RECIBIDA', label: 'Recibida' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

// ─── Types ──────────────────────────────────────────────────

interface OrdenCompraListResponse {
  data: OrdenCompra[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface OrdenCompraFormData {
  clienteId: string;
  cotizacionId?: string;
  moneda: string;
  fechaEntrega: string;
  condicionesPago: string;
  notas: string;
  proveedores: { proveedorId: string; cantidad: number; precioUnitario: number; notas?: string }[];
}

// ─── Page ───────────────────────────────────────────────────

export default function ComprasPage() {
  return (
    <AppLayout>
      <ComprasContent />
    </AppLayout>
  );
}

function ComprasContent() {
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [meta, setMeta] = useState<OrdenCompraListResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reordenLoading, setReordenLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingOrden, setEditingOrden] = useState<OrdenCompra | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);

  const [form, setForm] = useState<OrdenCompraFormData>({
    clienteId: '',
    cotizacionId: '',
    moneda: 'MXN',
    fechaEntrega: '',
    condicionesPago: '',
    notas: '',
    proveedores: [],
  });

  const [editForm, setEditForm] = useState<OrdenCompraFormData>({
    clienteId: '',
    cotizacionId: '',
    moneda: 'MXN',
    fechaEntrega: '',
    condicionesPago: '',
    notas: '',
    proveedores: [],
  });

  const loadOrdenes = useCallback(async (p = 1, s = '', status = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      if (status) q.set('estatus', status);
      const res = await get<OrdenCompraListResponse>(`/api/compras/ordenes?${q}`);
      setOrdenes(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar órdenes de compra');
    } finally {
      setLoading(false);
    }
  }, []);

  async function generarDesdeReorden() {
    try {
      setReordenLoading(true);
      setError('');
      const filter = localStorage.getItem('sucursalFilter');
      const userSuc = localStorage.getItem('sucursalId');
      const sucursalId =
        filter && filter !== 'all' ? filter : userSuc || undefined;
      const orden = await post<OrdenCompra>('/api/compras/ordenes/desde-reorden', {
        sucursalId,
      });
      await loadOrdenes(1, search, statusFilter);
      if (orden?.id) router.push(`/compras/${orden.id}`);
    } catch (err: any) {
      setError(err?.message || 'No se pudo generar OC desde stock bajo');
    } finally {
      setReordenLoading(false);
    }
  }

  useEffect(() => {
    loadOrdenes(page, search, statusFilter);
  }, [page, loadOrdenes]);

  function handleSearch() {
    setPage(1);
    loadOrdenes(1, search, statusFilter);
  }

  function handleStatusChange(status: string) {
    setStatusFilter(status);
    setPage(1);
    loadOrdenes(1, search, status);
  }

  function openNewCompra() {
    window.location.href = '/compras/nuevo';
  }

  function openEditModal(orden: OrdenCompra) {
    setEditingOrden(orden);
    setEditForm({
      clienteId: orden.clienteId || '',
      cotizacionId: orden.cotizacionId || '',
      moneda: orden.moneda || 'MXN',
      fechaEntrega: orden.fechaEntrega || '',
      condicionesPago: orden.condicionesPago || '',
      notas: orden.notas || '',
      proveedores: orden.proveedores?.map(p => ({
        proveedorId: p.proveedorId,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario,
        notas: p.notas,
      })) || [],
    });
    setShowEditModal(true);
  }

  async function handleSubmitCompra(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await post('/api/compras/ordenes', {
        clienteId: form.clienteId,
        cotizacionId: form.cotizacionId || undefined,
        moneda: form.moneda,
        fechaEntrega: form.fechaEntrega || undefined,
        condicionesPago: form.condicionesPago || undefined,
        notas: form.notas || undefined,
        proveedores: form.proveedores.length > 0
          ? form.proveedores.map(p => ({
              proveedorId: p.proveedorId,
              cantidad: Number(p.cantidad),
              precioUnitario: Number(p.precioUnitario),
              notas: p.notas || undefined,
            }))
          : undefined,
      });
      setShowModal(false);
      loadOrdenes(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al crear la orden de compra');
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOrden) return;
    setSaving(true);
    setError('');
    try {
      await patch(`/api/compras/ordenes/${editingOrden.id}`, {
        clienteId: editForm.clienteId,
        cotizacionId: editForm.cotizacionId || undefined,
        moneda: editForm.moneda,
        fechaEntrega: editForm.fechaEntrega || undefined,
        condicionesPago: editForm.condicionesPago || undefined,
        notas: editForm.notas || undefined,
        proveedores: editForm.proveedores.length > 0
          ? editForm.proveedores.map(p => ({
              proveedorId: p.proveedorId,
              cantidad: Number(p.cantidad),
              precioUnitario: Number(p.precioUnitario),
              notas: p.notas || undefined,
            }))
          : undefined,
      });
      setShowEditModal(false);
      setEditingOrden(null);
      loadOrdenes(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la orden de compra');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOrden(id: string) {
    if (!confirm('¿Está seguro de eliminar esta orden de compra?')) return;
    try {
      setError('');
      await del(`/api/compras/ordenes/${id}`);
      loadOrdenes(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  async function handleChangeStatus(id: string, newStatus: EstatusOrdenCompra) {
    try {
      setError('');
      await patch(`/api/compras/ordenes/${id}/estatus`, { estatus: newStatus });
      setShowStatusDropdown(null);
      loadOrdenes(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar estatus');
    }
  }

  function addProveedorRow() {
    setForm({
      ...form,
      proveedores: [...form.proveedores, { proveedorId: '', cantidad: 1, precioUnitario: 0 }],
    });
  }

  function removeProveedorRow(index: number) {
    setForm({
      ...form,
      proveedores: form.proveedores.filter((_, i) => i !== index),
    });
  }

  function addEditProveedorRow() {
    setEditForm({
      ...editForm,
      proveedores: [...editForm.proveedores, { proveedorId: '', cantidad: 1, precioUnitario: 0 }],
    });
  }

  function removeEditProveedorRow(index: number) {
    setEditForm({
      ...editForm,
      proveedores: editForm.proveedores.filter((_, i) => i !== index),
    });
  }

  // Stats
  const totalOrdenes = meta?.total ?? ordenes.length;
  const borradores = ordenes.filter((o) => o.estatus === 'BORRADOR').length;
  const enviadas = ordenes.filter((o) => o.estatus === 'ENVIADA').length;
  const totalCompras = ordenes.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Compras</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de órdenes de compra
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={reordenLoading}
            onClick={generarDesdeReorden}
          >
            {reordenLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Inbox className="h-4 w-4" />
            )}
            OC desde stock bajo
          </Button>
          <Button size="sm" className="gap-2" onClick={openNewCompra}>
            <Plus className="h-4 w-4" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-muted text-brand">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Total Órdenes</p>
              <p className="text-2xl font-bold tracking-tight">{totalOrdenes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-warning/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-muted text-warning">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Borradores</p>
              <p className="text-2xl font-bold tracking-tight">{borradores}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-muted text-brand">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Enviadas</p>
              <p className="text-2xl font-bold tracking-tight">{enviadas}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-success/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-muted text-success">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Total Compras</p>
              <p className="text-2xl font-bold tracking-tight">${totalCompras.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-premium flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por folio o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-base pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="input-base sm:w-48"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button onClick={handleSearch} className="btn-outline gap-2 px-4 py-2 text-sm">
          <Filter className="h-3.5 w-3.5" />
          Filtrar
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
          <span className="ml-3 text-muted-foreground">Cargando órdenes...</span>
        </div>
      ) : ordenes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No hay órdenes de compra</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Las órdenes aparecerán aquí cuando se creen</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="space-y-3 p-3 md:hidden">
            {ordenes.map((o) => {
              const statusKey = (Object.keys(STATUS_CONFIG).includes(o.estatus) ? o.estatus : 'BORRADOR') as EstatusOrdenCompra;
              const statusCfg = STATUS_CONFIG[statusKey];
              return (
                <div key={o.id} className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{o.folio}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {o.razonSocial || o.proveedores?.[0]?.proveedorNombre || '—'}
                      </p>
                    </div>
                    <Badge variant={statusCfg.variant} className="shrink-0">{statusCfg.label}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Fecha</p>
                      <p>{new Date(o.fecha).toLocaleDateString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p>
                      <p className="font-medium">
                        ${Number(o.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/compras/${o.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(o)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStatusDropdown(showStatusDropdown === o.id ? null : o.id)}
                      >
                        Estatus <ChevronDown className="h-3.5 w-3.5 ml-1" />
                      </Button>
                      {showStatusDropdown === o.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(null)} />
                          <div className="absolute left-0 bottom-full z-50 mb-1 w-44 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                            {(Object.keys(STATUS_CONFIG) as EstatusOrdenCompra[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleChangeStatus(o.id, status)}
                                className={`flex min-h-11 w-full items-center gap-2 px-3 py-2 text-xs transition hover:bg-muted ${
                                  o.estatus === status ? 'bg-muted/50 font-medium' : ''
                                }`}
                              >
                                <Badge variant={STATUS_CONFIG[status].variant} className="text-[10px]">
                                  {STATUS_CONFIG[status].label}
                                </Badge>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteOrden(o.id)}
                      className="text-destructive"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Folio</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Proveedor</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estatus</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => {
                  const statusKey = (Object.keys(STATUS_CONFIG).includes(o.estatus) ? o.estatus : 'BORRADOR') as EstatusOrdenCompra;
                  const statusCfg = STATUS_CONFIG[statusKey];
                  return (
                    <tr key={o.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{o.folio}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.razonSocial || o.proveedores?.[0]?.proveedorNombre || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(o.fecha).toLocaleDateString('es-MX')}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        ${Number(o.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => router.push(`/compras/${o.id}`)}
                            title="Ver detalle"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEditModal(o)}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setShowStatusDropdown(showStatusDropdown === o.id ? null : o.id)}
                              title="Cambiar estatus"
                              className="text-xs"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                            {showStatusDropdown === o.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(null)} />
                                <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                                  {(Object.keys(STATUS_CONFIG) as EstatusOrdenCompra[]).map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => handleChangeStatus(o.id, status)}
                                      className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition hover:bg-muted ${
                                        o.estatus === status ? 'bg-muted/50 font-medium' : ''
                                      }`}
                                    >
                                      <Badge variant={STATUS_CONFIG[status].variant} className="text-[10px]">
                                        {STATUS_CONFIG[status].label}
                                      </Badge>
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteOrden(o.id)}
                            title="Eliminar"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta && ordenes.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Mostrando {ordenes.length} de {meta.total} órdenes
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-outline min-h-10 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="btn-outline min-h-10 px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Orden Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Nueva Orden de Compra</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCompra} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-6">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.clienteId}
                    onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                    className="input-base"
                    placeholder="ID del cliente"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Cotización (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.cotizacionId}
                    onChange={(e) => setForm({ ...form, cotizacionId: e.target.value })}
                    className="input-base"
                    placeholder="ID de cotización"
                  />
                </div>
                <div className="sm:col-span-4">
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
                <div className="sm:col-span-4">
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
                <div className="sm:col-span-4">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Condiciones de Pago
                  </label>
                  <input
                    type="text"
                    value={form.condicionesPago}
                    onChange={(e) => setForm({ ...form, condicionesPago: e.target.value })}
                    className="input-base"
                    placeholder="30 días"
                  />
                </div>
              </div>

              {/* Proveedores */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Proveedores
                  </label>
                  <Button type="button" variant="outline" size="sm" onClick={addProveedorRow} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Agregar
                  </Button>
                </div>
                {form.proveedores.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    Agregue al menos un proveedor
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.proveedores.map((p, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border p-3 space-y-2 sm:rounded-none sm:border-0 sm:p-0 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center"
                      >
                        <div className="sm:col-span-5">
                          <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">Proveedor</label>
                          <input
                            type="text"
                            placeholder="ID Proveedor"
                            value={p.proveedorId}
                            onChange={(e) => {
                              const updated = [...form.proveedores];
                              updated[i] = { ...p, proveedorId: e.target.value };
                              setForm({ ...form, proveedores: updated });
                            }}
                            className="input-base w-full"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:contents">
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">Cantidad</label>
                            <input
                              type="number"
                              placeholder="Cantidad"
                              min={1}
                              value={p.cantidad}
                              onChange={(e) => {
                                const updated = [...form.proveedores];
                                updated[i] = { ...p, cantidad: Number(e.target.value) };
                                setForm({ ...form, proveedores: updated });
                              }}
                              className="input-base w-full"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">Precio</label>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                              <input
                                type="text"
                                placeholder="0.00"
                                value={p.precioUnitario === 0 ? '' : p.precioUnitario}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, '');
                                  const updated = [...form.proveedores];
                                  updated[i] = { ...p, precioUnitario: parseFloat(val) || 0 };
                                  setForm({ ...form, proveedores: updated });
                                }}
                                className="input-base pl-7 w-full"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:col-span-2 sm:justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProveedorRow(i)}
                            className="w-full text-destructive hover:text-destructive sm:w-auto"
                          >
                            <X className="h-4 w-4" />
                            <span className="ml-1 sm:hidden">Quitar</span>
                          </Button>
                        </div>
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
                  placeholder="Observaciones de la orden"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="gap-2" disabled={saving}>
                  {saving ? 'Guardando...' : 'Crear Orden'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingOrden && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Editar Orden de Compra {editingOrden.folio}</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingOrden(null);
                }}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-6">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.clienteId}
                    onChange={(e) => setEditForm({ ...editForm, clienteId: e.target.value })}
                    className="input-base"
                    placeholder="ID del cliente"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Cotización (opcional)
                  </label>
                  <input
                    type="text"
                    value={editForm.cotizacionId}
                    onChange={(e) => setEditForm({ ...editForm, cotizacionId: e.target.value })}
                    className="input-base"
                    placeholder="ID de cotización"
                  />
                </div>
                <div className="sm:col-span-4">
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
                <div className="sm:col-span-4">
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
                <div className="sm:col-span-4">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Condiciones de Pago
                  </label>
                  <input
                    type="text"
                    value={editForm.condicionesPago}
                    onChange={(e) => setEditForm({ ...editForm, condicionesPago: e.target.value })}
                    className="input-base"
                    placeholder="30 días"
                  />
                </div>
              </div>

              {/* Proveedores */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Proveedores
                  </label>
                  <Button type="button" variant="outline" size="sm" onClick={addEditProveedorRow} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Agregar
                  </Button>
                </div>
                {editForm.proveedores.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    Agregue al menos un proveedor
                  </p>
                ) : (
                  <div className="space-y-2">
                    {editForm.proveedores.map((p, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border p-3 space-y-2 sm:rounded-none sm:border-0 sm:p-0 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center"
                      >
                        <div className="sm:col-span-5">
                          <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">Proveedor</label>
                          <input
                            type="text"
                            placeholder="ID Proveedor"
                            value={p.proveedorId}
                            onChange={(e) => {
                              const updated = [...editForm.proveedores];
                              updated[i] = { ...p, proveedorId: e.target.value };
                              setEditForm({ ...editForm, proveedores: updated });
                            }}
                            className="input-base w-full"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:contents">
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">Cantidad</label>
                            <input
                              type="number"
                              placeholder="Cantidad"
                              min={1}
                              value={p.cantidad}
                              onChange={(e) => {
                                const updated = [...editForm.proveedores];
                                updated[i] = { ...p, cantidad: Number(e.target.value) };
                                setEditForm({ ...editForm, proveedores: updated });
                              }}
                              className="input-base w-full"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">Precio</label>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                              <input
                                type="text"
                                placeholder="0.00"
                                value={p.precioUnitario === 0 ? '' : p.precioUnitario}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, '');
                                  const updated = [...editForm.proveedores];
                                  updated[i] = { ...p, precioUnitario: parseFloat(val) || 0 };
                                  setEditForm({ ...editForm, proveedores: updated });
                                }}
                                className="input-base pl-7 w-full"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:col-span-2 sm:justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEditProveedorRow(i)}
                            className="w-full text-destructive hover:text-destructive sm:w-auto"
                          >
                            <X className="h-4 w-4" />
                            <span className="ml-1 sm:hidden">Quitar</span>
                          </Button>
                        </div>
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
                  placeholder="Observaciones de la orden"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOrden(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="gap-2" disabled={saving}>
                  {saving ? 'Guardando...' : 'Actualizar Orden'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
