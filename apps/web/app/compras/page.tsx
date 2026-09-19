'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Calendar,
  FileText,
  Package,
  DollarSign,
  Filter,
  Loader2,
  AlertCircle,
  Inbox,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import { get, post, ApiError } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────

interface OrdenCompraProveedor {
  id: string;
  proveedorId: string;
  proveedorNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

interface OrdenCompra {
  id: string;
  folio: string;
  clienteId: string;
  cotizacionId?: string;
  razonSocial?: string;
  fecha: string;
  fechaEntrega?: string;
  moneda: string;
  subtotal: number;
  iva: number;
  total: number;
  estatus: string;
  condicionesPago?: string;
  notas?: string;
  proveedores?: OrdenCompraProveedor[];
  createdAt: string;
}

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

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estatus' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'rechazada', label: 'Rechazada' },
];

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<OrdenCompraFormData>({
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
      const res = await get<OrdenCompraListResponse>(`/api/ordenes-compra?${q}`);
      setOrdenes(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar órdenes de compra');
    } finally {
      setLoading(false);
    }
  }, []);

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
    setForm({
      clienteId: '',
      cotizacionId: '',
      moneda: 'MXN',
      fechaEntrega: '',
      condicionesPago: '',
      notas: '',
      proveedores: [],
    });
    setShowModal(true);
  }

  async function handleSubmitCompra(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await post('/api/ordenes-compra', {
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

  // Stats calculations
  const totalOrdenes = meta?.total ?? ordenes.length;
  const pendientes = ordenes.filter((o) => o.estatus.toLowerCase() === 'pendiente').length;
  const aprobadas = ordenes.filter((o) => o.estatus.toLowerCase() === 'aprobada').length;
  const totalCompras = ordenes.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  function getProductosCount(o: OrdenCompra): number {
    return o.proveedores?.length ?? 0;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Compras</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de órdenes de compra y proveedores
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={openNewCompra}>
          <Plus className="h-4 w-4" />
          Nueva Compra
        </Button>
      </div>

      {/* Stats Cards with borders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
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
              <p className="section-title">Aprobadas</p>
              <p className="text-2xl font-bold tracking-tight">{aprobadas}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
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
            placeholder="Buscar por folio, cliente o estatus..."
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
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-muted/30">
                <th className="border-b border-border px-4 py-3 text-left text-section-title">
                  Fecha
                </th>
                <th className="border-b border-border px-4 py-3 text-left text-section-title">
                  Folio
                </th>
                <th className="border-b border-border px-4 py-3 text-left text-section-title">
                  Proveedor
                </th>
                <th className="border-b border-border px-4 py-3 text-right text-section-title">
                  Productos
                </th>
                <th className="border-b border-border px-4 py-3 text-right text-section-title">
                  Total
                </th>
                <th className="border-b border-border px-4 py-3 text-left text-section-title">
                  Estatus
                </th>
              </tr>
            </thead>
            <tbody className="text-table">
              {loading ? (
                <LoadingRows />
              ) : ordenes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12">
                    <EmptyState
                      message="No hay órdenes de compra registradas"
                      description="Las órdenes de compra aparecerán aquí cuando se creen"
                    />
                  </td>
                </tr>
              ) : (
                ordenes.map((o, idx) => (
                  <tr
                    key={o.id}
                    className={`transition-colors hover:bg-muted/20 ${
                      idx !== ordenes.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(o.createdAt).toLocaleDateString('es-MX')}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <button
                        onClick={() => router.push(`/compras/${o.id}`)}
                        className="flex items-center gap-2 text-primary hover:underline focus:outline-none"
                      >
                        <FileText className="h-3.5 w-3.5 text-brand" />
                        {o.folio}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {o.proveedores?.[0]?.proveedorNombre || o.razonSocial || o.clienteId}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        {getProductosCount(o)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {o.moneda === 'USD' ? '$' : '$'}
                      {Number(o.total).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge estatus={o.estatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && !loading && ordenes.length > 0 && (
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <span>
              Mostrando {ordenes.length} de {meta.total} órdenes
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Compra Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
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
                <div>
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
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                <div>
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
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="ID Proveedor"
                          value={p.proveedorId}
                          onChange={(e) => {
                            const updated = [...form.proveedores];
                            updated[i] = { ...p, proveedorId: e.target.value };
                            setForm({ ...form, proveedores: updated });
                          }}
                          className="input-base flex-1"
                        />
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
                          className="input-base w-24"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Precio"
                          min={0}
                          value={p.precioUnitario}
                          onChange={(e) => {
                            const updated = [...form.proveedores];
                            updated[i] = { ...p, precioUnitario: Number(e.target.value) };
                            setForm({ ...form, proveedores: updated });
                          }}
                          className="input-base w-28"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeProveedorRow(i)}
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
                  {saving ? 'Guardando...' : 'Crear Orden'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
  isCurrency = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'brand' | 'warning' | 'success' | 'danger';
  isCurrency?: boolean;
}) {
  const colorMap = {
    brand: 'text-brand bg-brand-muted',
    warning: 'text-warning bg-warning-muted',
    success: 'text-success bg-success-muted',
    danger: 'text-danger bg-danger-muted',
  };

  return (
    <div className="card-premium p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="section-title">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {isCurrency
              ? `$ ${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
              : value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────

function StatusBadge({ estatus }: { estatus: string }) {
  const normalized = estatus.toLowerCase();
  const config: Record<string, { className: string; label: string }> = {
    pendiente: { className: 'bg-warning-muted text-warning border-warning/20', label: 'Pendiente' },
    aprobada: { className: 'bg-success-muted text-success border-success/20', label: 'Aprobada' },
    cancelada: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Cancelada' },
    rechazada: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Rechazada' },
    en_produccion: { className: 'bg-brand-muted text-brand border-brand/20', label: 'En Producción' },
    completada: { className: 'bg-success-muted text-success border-success/20', label: 'Completada' },
  };

  const { className, label } = config[normalized] || {
    className: 'bg-muted text-foreground border-border',
    label: estatus,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {normalized === 'pendiente' && <Clock className="h-3 w-3" />}
      {normalized === 'aprobada' || normalized === 'completada' ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : null}
      {normalized === 'cancelada' || normalized === 'rechazada' ? (
        <XCircle className="h-3 w-3" />
      ) : null}
      {label}
    </span>
  );
}

// ─── Loading Rows ───────────────────────────────────────────

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          <td className="px-4 py-3">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-8 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Empty State ────────────────────────────────────────────

function EmptyState({ message, description }: { message: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
      )}
    </div>
  );
}
