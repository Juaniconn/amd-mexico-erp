'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
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
} from 'lucide-react';
import { get, ApiError } from '@/lib/api';

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
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [meta, setMeta] = useState<OrdenCompraListResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Total Órdenes"
          value={totalOrdenes}
          color="brand"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Pendientes"
          value={pendientes}
          color="warning"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Aprobadas"
          value={aprobadas}
          color="success"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Total Compras"
          value={totalCompras}
          color="brand"
          isCurrency
        />
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
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-brand" />
                        {o.folio}
                      </div>
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
