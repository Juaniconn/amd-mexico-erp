'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Inbox,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { get, post, patch, Factura } from '@/lib/api';

const ESTATUS_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'FACTURADA', label: 'Facturada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const ESTATUS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  FACTURADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

const MONEDA_LABELS: Record<string, string> = {
  MXN: 'MXN',
  USD: 'USD',
};

export default function FacturacionPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailFactura, setDetailFactura] = useState<Factura | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ordenesTrabajo, setOrdenesTrabajo] = useState<any[]>([]);
  const [selectedOT, setSelectedOT] = useState('');
  const [saving, setSaving] = useState(false);

  const loadFacturas = useCallback(async (p = 1, s = '', e = '') => {
    try {
      setLoading(true);
      setError('');
      const res = await get<{ data: Factura[]; meta: { totalPages: number } }>(
        `/api/facturas?page=${p}&limit=10&search=${s}&estatus=${e}`
      );
      setFacturas(res.data);
      setTotalPages(res.meta.totalPages);
      setPage(p);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await get('/api/facturas/stats');
      setStats(res);
    } catch (err: any) {
      console.error('Error al cargar stats:', err);
    }
  }, []);

  useEffect(() => {
    loadFacturas(page, search, estatusFilter);
    loadStats();
  }, [loadFacturas, loadStats, page, search, estatusFilter]);

  function openDetailCard(f: Factura) {
    setDetailFactura(f);
    setShowDetailModal(true);
  }

  async function handleDeleteFromDetail() {
    if (!detailFactura) return;
    if (!confirm('¿Está seguro de cancelar esta factura?')) return;
    try {
      setError('');
      await patch(`/api/facturas/${detailFactura.id}/cancelar`, {});
      setShowDetailModal(false);
      setDetailFactura(null);
      loadFacturas(page, search, estatusFilter);
      loadStats();
    } catch (err: any) {
      setError(err?.message || 'Error al cancelar');
    }
  }

  async function handleMarcarFacturada() {
    if (!detailFactura) return;
    if (!confirm('¿Está seguro de marcar esta factura como facturada?')) return;
    try {
      setError('');
      await patch(`/api/facturas/${detailFactura.id}/facturada`, {});
      setShowDetailModal(false);
      setDetailFactura(null);
      loadFacturas(page, search, estatusFilter);
      loadStats();
    } catch (err: any) {
      setError(err?.message || 'Error al marcar como facturada');
    }
  }

  async function handleCreateFromOT(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOT) {
      setError('Seleccione una orden de trabajo');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await post(`/api/facturas/desde-ot/${selectedOT}`, {});
      setShowCreateModal(false);
      setSelectedOT('');
      loadFacturas(page, search, estatusFilter);
      loadStats();
    } catch (err: any) {
      setError(err?.message || 'Error al crear factura');
    } finally {
      setSaving(false);
    }
  }

  async function loadOrdenesTrabajo() {
    try {
      const res = await get<{ data: any[] }>('/api/ordenes-trabajo?limit=100&estatus=COMPLETADA');
      setOrdenesTrabajo(res.data);
    } catch (err: any) {
      console.error('Error al cargar OTs:', err);
    }
  }

  function formatCurrency(amount: number, moneda: string = 'MXN') {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda,
    }).format(amount || 0);
  }

  function formatDate(date: string) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Facturación</h1>
            <p className="text-sm text-muted-foreground">
              Gestión de facturas pendientes y facturación
            </p>
          </div>
          <Button
            onClick={() => {
              loadOrdenesTrabajo();
              setShowCreateModal(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Factura desde OT
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold text-foreground">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-yellow-100 p-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                  <p className="text-lg font-semibold text-foreground">{stats.pendientes}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-green-100 p-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Facturadas</p>
                  <p className="text-lg font-semibold text-foreground">{stats.facturadas}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-100 p-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Pendiente</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(Number(stats.totalPendiente) || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por folio, OT o cliente..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <select
            value={estatusFilter}
            onChange={(e) => {
              setEstatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">Todos los estatus</option>
            {ESTATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : facturas.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {facturas.map((f) => (
                <div
                  key={f.id}
                  onClick={() => openDetailCard(f)}
                  className="cursor-pointer rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{f.folio}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.ot?.folio || '—'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ESTATUS_COLORS[f.estatus] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {f.estatus}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Cliente</span>
                      <span className="text-sm text-foreground">
                        {f.cliente?.razonSocial || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Moneda</span>
                      <span className="text-sm text-foreground">
                        {MONEDA_LABELS[f.moneda] || f.moneda}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Total</span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(Number(f.total) || 0, f.moneda)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Fecha</span>
                      <span className="text-sm text-foreground">
                        {formatDate(f.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {showDetailModal && detailFactura && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {detailFactura.folio}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    OT: {detailFactura.ot?.folio || '—'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setDetailFactura(null);
                  }}
                  className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="section-title">Cliente</p>
                    <p className="text-sm text-foreground">
                      {detailFactura.cliente?.razonSocial || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="section-title">Estatus</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ESTATUS_COLORS[detailFactura.estatus] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {detailFactura.estatus}
                    </span>
                  </div>
                  <div>
                    <p className="section-title">Moneda</p>
                    <p className="text-sm text-foreground">
                      {MONEDA_LABELS[detailFactura.moneda] || detailFactura.moneda}
                    </p>
                  </div>
                  <div>
                    <p className="section-title">Subtotal</p>
                    <p className="text-sm text-foreground">
                      {formatCurrency(Number(detailFactura.subtotal) || 0, detailFactura.moneda)}
                    </p>
                  </div>
                  <div>
                    <p className="section-title">IVA</p>
                    <p className="text-sm text-foreground">
                      {formatCurrency(Number(detailFactura.iva) || 0, detailFactura.moneda)}
                    </p>
                  </div>
                  <div>
                    <p className="section-title">Total</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(Number(detailFactura.total) || 0, detailFactura.moneda)}
                    </p>
                  </div>
                  <div>
                    <p className="section-title">Fecha Factura</p>
                    <p className="text-sm text-foreground">
                      {detailFactura.fechaFactura
                        ? formatDate(detailFactura.fechaFactura)
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="section-title">Sucursal</p>
                    <p className="text-sm text-foreground">
                      {detailFactura.sucursal?.nombre || '—'}
                    </p>
                  </div>
                </div>

                {detailFactura.notas && (
                  <div>
                    <p className="section-title">Notas</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {detailFactura.notas}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  {detailFactura.estatus === 'PENDIENTE' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleMarcarFacturada}
                        className="gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Marcar Facturada
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteFromDetail}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Nueva Factura desde OT
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedOT('');
                    setError('');
                  }}
                  className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFromOT} className="space-y-4">
                <div>
                  <label className="section-title">Orden de Trabajo</label>
                  <select
                    value={selectedOT}
                    onChange={(e) => setSelectedOT(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    required
                  >
                    <option value="">Seleccionar OT...</option>
                    {ordenesTrabajo.map((ot) => (
                      <option key={ot.id} value={ot.id}>
                        {ot.folio} — {ot.piezaNombre || 'Sin nombre'}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedOT('');
                      setError('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={saving} className="gap-2">
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Crear Factura
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">
        No hay facturas registradas
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Cree una nueva factura desde una orden de trabajo completada
      </p>
    </div>
  );
}
