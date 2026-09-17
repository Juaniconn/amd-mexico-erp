'use client';

import { useEffect, useState, FormEvent } from 'react';
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
  Pencil,
  Trash2,
  Send,
  X,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
  User,
  Calendar,
  DollarSign,
  Hash,
  Package,
  Layers,
  Timer,
  Wrench,
  StickyNote,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { get, post, put, del, ApiError } from '@/lib/api';

interface Cliente {
  id: string;
  codigo: string;
  razonSocial: string;
  rfc?: string;
  ciudad?: string;
  estado?: string;
  email?: string;
  telefono?: string;
  creditoLimite?: number | string;
  monedaPref: string;
}

interface DetalleCotizacion {
  piezaNombre: string;
  piezaDescripcion?: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  tiempoEstimado?: number;
  procesoRequerido?: string;
  notas?: string;
}

interface Cotizacion {
  id: string;
  folio: string;
  clienteId: string;
  razonSocial?: string;
  ciudad?: string;
  moneda: 'MXN' | 'USD';
  tipoCambio?: number | null;
  subtotal: number;
  iva: number;
  total: number;
  estatus: string;
  validez: number;
  detalles?: DetalleCotizacion[];
  createdAt: string;
}

const VERSION = '0.1.0';

export default function CotizacionesPage() {
  return (
    <AppLayout>
      <CotizacionesContent />
    </AppLayout>
  );
}

function CotizacionesContent() {
  const router = useRouter();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cotizacion | null>(null);

  // Form state for cotización
  const [clienteId, setClienteId] = useState('');
  const [validez, setValidez] = useState(30);
  const [tipoCambio, setTipoCambio] = useState('');
  const [notas, setNotas] = useState('');
  const [detalles, setDetalles] = useState<DetalleCotizacion[]>([
    { piezaNombre: '', cantidad: 1, unidad: 'pz', precioUnitario: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  async function loadCotizaciones(p = 1, s = '') {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      const res = await get<{ data: Cotizacion[]; meta: any }>(`/api/cotizaciones?${q}`);
      setCotizaciones(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCotizaciones(page, search);
    get<{ data: Cliente[] }>('/api/clientes?limit=100')
      .then((res) => setClientes(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function openNew() {
    setEditing(null);
    setClienteId('');
    setValidez(30);
    setTipoCambio('');
    setNotas('');
    setDetalles([{ piezaNombre: '', cantidad: 1, unidad: 'pz', precioUnitario: 0 }]);
    setError('');
    setShowModal(true);
  }

  function openEdit(c: Cotizacion) {
    setEditing(c);
    setClienteId(c.clienteId);
    setValidez(c.validez);
    setTipoCambio(c.tipoCambio ? String(c.tipoCambio) : '');
    setNotas('');
    setDetalles(c.detalles && c.detalles.length > 0
      ? c.detalles.map((d) => ({ ...d }))
      : [{ piezaNombre: '', cantidad: 1, unidad: 'pz', precioUnitario: 0 }]);
    setError('');
    setShowModal(true);
  }

  function updateDetalle(idx: number, field: keyof DetalleCotizacion, value: any) {
    setDetalles((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  }

  function addDetalle() {
    setDetalles((prev) => [...prev, { piezaNombre: '', cantidad: 1, unidad: 'pz', precioUnitario: 0 }]);
  }

  function removeDetalle(idx: number) {
    setDetalles((prev) => prev.filter((_, i) => i !== idx));
  }

  function calcSubtotal() {
    return detalles.reduce((sum, d) => sum + (Number(d.precioUnitario) || 0) * (Number(d.cantidad) || 0), 0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        clienteId,
        validez: Number(validez),
        tipoCambio: tipoCambio ? Number(tipoCambio) : null,
        notas: notas || undefined,
        detalles: detalles
          .filter((d) => d.piezaNombre && d.cantidad > 0)
          .map((d) => ({
            ...d,
            cantidad: Number(d.cantidad),
            precioUnitario: Number(d.precioUnitario),
            tiempoEstimado: d.tiempoEstimado ? Number(d.tiempoEstimado) : undefined,
          })),
      };
      if (editing) {
        await put(`/api/cotizaciones/${editing.id}`, payload);
      } else {
        await post('/api/cotizaciones', payload);
      }
      setShowModal(false);
      loadCotizaciones(page, search);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setError('Error de validación: ' + err.data?.details?.map((d: any) => d.message).join(', '));
      } else {
        setError(err?.message || 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar esta cotización?')) return;
    try {
      setError('');
      await del(`/api/cotizaciones/${id}`);
      loadCotizaciones(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  async function handleStatus(id: string, estatus: string) {
    try {
      setError('');
      await put(`/api/cotizaciones/${id}`, { estatus });
      loadCotizaciones(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar estatus');
    }
  }

  const ivaRate = 0.16;

  // Stats calculations
  const totalCotizaciones = cotizaciones.length;
  const pendientes = cotizaciones.filter((c) => c.estatus === 'borrador').length;
  const aprobadas = cotizaciones.filter((c) => c.estatus === 'enviada' || c.estatus === 'aceptada').length;
  const rechazadas = cotizaciones.filter((c) => c.estatus === 'rechazada' || c.estatus === 'cancelada').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de RFQ y cotizaciones de manufactura
          </p>
        </div>
        <Button
          onClick={openNew}
          size="sm"
          className="gap-2"
          disabled={clientes.length === 0}
        >
          <Plus className="h-4 w-4" />
          Nueva Cotización
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total"
          value={meta?.total ?? totalCotizaciones}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Pendientes"
          value={pendientes}
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
        />
        <StatCard
          title="Aprobadas"
          value={aprobadas}
          icon={<CheckCircle2 className="h-4 w-4" />}
          variant="success"
        />
        <StatCard
          title="Rechazadas"
          value={rechazadas}
          icon={<XCircle className="h-4 w-4" />}
          variant="destructive"
        />
      </div>

      {/* Search/Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por folio, cliente o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadCotizaciones(1, search)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadCotizaciones(1, search)}
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

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows />
            ) : cotizaciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              cotizaciones.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => router.push(`/cotizaciones/${c.id}`)}
                      className="text-primary hover:underline font-medium"
                    >
                      {c.folio}
                    </button>
                  </TableCell>
                  <TableCell>{c.razonSocial || c.clienteId}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.moneda}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {c.moneda === 'USD' ? '$' : '$'}
                    {Number(c.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge estatus={c.estatus} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(c)}
                        title="Editar cotización"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {c.estatus === 'borrador' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleStatus(c.id, 'enviada')}
                          title="Enviar cotización"
                          className="text-success hover:text-success"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(c.id)}
                        title="Eliminar cotización"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {meta && !loading && cotizaciones.length > 0 && (
          <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground rounded-b-xl">
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
      </TableContainer>

      {/* Footer */}
      <footer className="border-t pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} AMD México Operations ERP · v{VERSION}
        </p>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b pb-4">
              <CardTitle>
                {editing ? 'Editar Cotización' : 'Nueva Cotización'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Cliente + Validez */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Cliente *
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <select
                        required
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      >
                        <option value="">Seleccionar cliente...</option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.codigo} — {c.razonSocial}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Validez (días)
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={validez}
                        onChange={(e) => setValidez(Number(e.target.value))}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo de cambio */}
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Tipo de cambio (opcional, para USD)
                  </label>
                  <div className="relative">
                    <TrendingUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={tipoCambio}
                      onChange={(e) => setTipoCambio(e.target.value)}
                      placeholder="Ej: 17.50"
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Detalle de piezas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Detalle de piezas
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDetalle}
                      className="gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar línea
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {detalles.map((d, idx) => (
                      <div key={idx} className="rounded-lg border border-border bg-muted/30 p-4">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-12 sm:col-span-5">
                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Pieza *
                            </label>
                            <div className="relative">
                              <Package className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                              <input
                                type="text"
                                required
                                value={d.piezaNombre}
                                onChange={(e) => updateDetalle(idx, 'piezaNombre', e.target.value)}
                                placeholder="Nombre de la pieza"
                                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="col-span-4 sm:col-span-2">
                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Cantidad
                            </label>
                            <div className="relative">
                              <Layers className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                              <input
                                type="number"
                                min="1"
                                value={d.cantidad}
                                onChange={(e) => updateDetalle(idx, 'cantidad', Number(e.target.value))}
                                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="col-span-4 sm:col-span-1">
                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Unidad
                            </label>
                            <input
                              type="text"
                              value={d.unidad}
                              onChange={(e) => updateDetalle(idx, 'unidad', e.target.value)}
                              className="w-full rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                            />
                          </div>
                          <div className="col-span-4 sm:col-span-3">
                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Precio unitario
                            </label>
                            <div className="relative">
                              <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={d.precioUnitario}
                                onChange={(e) => updateDetalle(idx, 'precioUnitario', Number(e.target.value))}
                                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="col-span-12 sm:col-span-1">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => removeDetalle(idx)}
                              disabled={detalles.length <= 1}
                              title="Eliminar línea"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Tiempo estimado (hrs)
                            </label>
                            <div className="relative">
                              <Timer className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={d.tiempoEstimado || ''}
                                onChange={(e) => updateDetalle(idx, 'tiempoEstimado', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                              Proceso requerido
                            </label>
                            <div className="relative">
                              <Wrench className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                              <input
                                type="text"
                                value={d.procesoRequerido || ''}
                                onChange={(e) => updateDetalle(idx, 'procesoRequerido', e.target.value)}
                                placeholder="CNC, láser, torno..."
                                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        Subtotal
                      </div>
                      <p className="mt-1 text-lg font-bold">
                        $ {calcSubtotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        <Percent className="h-3.5 w-3.5" />
                        IVA (16%)
                      </div>
                      <p className="mt-1 text-lg font-bold">
                        $ {(calcSubtotal() * ivaRate).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        <Hash className="h-3.5 w-3.5" />
                        Total
                      </div>
                      <p className="mt-1 text-lg font-bold">
                        $ {(calcSubtotal() * (1 + ivaRate)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Notas
                  </label>
                  <div className="relative">
                    <StickyNote className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none resize-none"
                      placeholder="Condiciones, observaciones..."
                    />
                  </div>
                </div>

                {/* Form Error */}
                {error && (
                  <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" loading={saving} className="gap-2">
                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ estatus }: { estatus: string }) {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
    borrador: 'secondary',
    enviada: 'default',
    aceptada: 'success',
    rechazada: 'destructive',
    cancelada: 'outline',
  };
  return (
    <Badge variant={variantMap[estatus] || 'secondary'}>
      {estatus}
    </Badge>
  );
}

function StatCard({
  title,
  value,
  icon,
  variant = 'default',
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}) {
  return (
    <Card className="card-premium transition-all duration-200 hover:shadow-lg">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            variant === 'success'
              ? 'bg-success-muted text-success'
              : variant === 'destructive'
              ? 'bg-destructive/10 text-destructive'
              : variant === 'warning'
              ? 'bg-warning-muted text-warning'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-1">
              <div className="h-6 w-6 animate-pulse rounded bg-muted" />
              <div className="h-6 w-6 animate-pulse rounded bg-muted" />
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
        No hay cotizaciones registradas
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Agregue una nueva cotización para comenzar
      </p>
    </div>
  );
}
