'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { get, post, del, ApiError } from '@/lib/api';
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Edit3,
  Trash2,
  FileText,
  Users,
  Package,
  DollarSign,
  Calendar,
  MessageSquare,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface Cliente {
  id: string;
  codigo: string;
  razonSocial: string;
  rfc?: string;
  ciudad?: string;
  monedaPref?: string;
}

interface Proveedor {
  id: string;
  codigo: string;
  razonSocial: string;
  rfc?: string;
  ciudad?: string;
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

interface OrdenCompraProveedor {
  id: string;
  proveedorId: string;
  proveedorNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

interface ProveedorLinea {
  proveedorId: string;
  cantidad: number;
  precioUnitario: number;
  notas: string;
}

export default function ComprasPage() {
  return (
    <AppLayout>
      <ComprasContent />
    </AppLayout>
  );
}

function ComprasContent() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<OrdenCompra | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [clienteId, setClienteId] = useState('');
  const [cotizacionId, setCotizacionId] = useState('');
  const [condicionesPago, setCondicionesPago] = useState('');
  const [notas, setNotas] = useState('');
  const [lineas, setLineas] = useState<ProveedorLinea[]>([
    { proveedorId: '', cantidad: 1, precioUnitario: 0, notas: '' },
  ]);

  async function loadOrdenes(p = 1, s = '') {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      const res = await get<{ data: OrdenCompra[]; meta: any }>(
        `/api/ordenes-compra?${q}`
      );
      setOrdenes(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar órdenes de compra');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrdenes(page, search);
    // Load clientes and proveedores for dropdowns
    get<{ data: Cliente[] }>('/api/clientes?limit=100')
      .then((res) => setClientes(res.data))
      .catch(() => {});
    get<{ data: Proveedor[] }>('/api/proveedores?limit=100')
      .then((res) => setProveedores(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const calcularTotales = useCallback(() => {
    const subtotal = lineas.reduce(
      (sum, l) => sum + (Number(l.precioUnitario) || 0) * (Number(l.cantidad) || 0),
      0
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  }, [lineas]);

  function openNew() {
    setEditing(null);
    setClienteId('');
    setCotizacionId('');
    setCondicionesPago('');
    setNotas('');
    setLineas([{ proveedorId: '', cantidad: 1, precioUnitario: 0, notas: '' }]);
    setError('');
    setShowModal(true);
  }

  function openEdit(o: OrdenCompra) {
    setEditing(o);
    setClienteId(o.clienteId);
    setCotizacionId(o.cotizacionId || '');
    setCondicionesPago(o.condicionesPago || '');
    setNotas(o.notas || '');
    if (o.proveedores && o.proveedores.length > 0) {
      setLineas(
        o.proveedores.map((p) => ({
          proveedorId: p.proveedorId,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          notas: p.notas || '',
        }))
      );
    } else {
      setLineas([{ proveedorId: '', cantidad: 1, precioUnitario: 0, notas: '' }]);
    }
    setError('');
    setShowModal(true);
  }

  function updateLinea(idx: number, field: keyof ProveedorLinea, value: any) {
    setLineas((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  }

  function addLinea() {
    setLineas((prev) => [
      ...prev,
      { proveedorId: '', cantidad: 1, precioUnitario: 0, notas: '' },
    ]);
  }

  function removeLinea(idx: number) {
    setLineas((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        clienteId,
        cotizacionId: cotizacionId || undefined,
        condicionesPago: condicionesPago || undefined,
        notas: notas || undefined,
        proveedores: lineas
          .filter((l) => l.proveedorId && l.cantidad > 0)
          .map((l) => ({
            proveedorId: l.proveedorId,
            cantidad: Number(l.cantidad),
            precioUnitario: Number(l.precioUnitario),
            notas: l.notas || undefined,
          })),
      };
      if (editing) {
        await post(`/api/ordenes-compra/${editing.id}`, payload);
      } else {
        await post('/api/ordenes-compra', payload);
      }
      setShowModal(false);
      loadOrdenes(page, search);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setError(
          'Error de validación: ' +
            (err.data?.details?.map((d: any) => d.message).join(', ') ||
              err.message)
        );
      } else {
        setError(err?.message || 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar esta orden de compra?')) return;
    try {
      setError('');
      await del(`/api/ordenes-compra/${id}`);
      loadOrdenes(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  function getProveedorNombre(proveedorId: string): string {
    const p = proveedores.find((pr) => pr.id === proveedorId);
    return p ? `${p.codigo} — ${p.razonSocial}` : proveedorId;
  }

  function handleSearch() {
    setPage(1);
    loadOrdenes(1, search);
  }

  const { subtotal, iva, total } = calcularTotales();

  // Stats
  const totalOrdenes = ordenes.length;
  const pendientes = ordenes.filter((o) => o.estatus === 'pendiente' || o.estatus === 'PENDIENTE').length;
  const aprobadas = ordenes.filter((o) => o.estatus === 'aprobada' || o.estatus === 'APROBADA').length;
  const rechazadas = ordenes.filter((o) => o.estatus === 'rechazada' || o.estatus === 'cancelada' || o.estatus === 'CANCELADA').length;

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compras</h1>
          <p className="text-sm text-muted-foreground">
            Órdenes de compra y proveedores
          </p>
        </div>
        <Button
          onClick={openNew}
          disabled={clientes.length === 0 || proveedores.length === 0}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Orden de Compra
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Total"
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
          icon={<XCircle className="h-5 w-5" />}
          label="Rechazadas"
          value={rechazadas}
          color="danger"
        />
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por folio, cliente o estatus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-ring/30 focus:outline-none"
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive-muted px-4 py-3 text-sm text-destructive">
          {error}
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
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <p className="text-sm text-muted-foreground">Cargando órdenes de compra...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : ordenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No hay órdenes de compra registradas</p>
                    <p className="text-xs text-muted-foreground">Crea tu primera orden de compra para comenzar</p>
                    <Button variant="outline" size="sm" onClick={openNew}>
                      <Plus className="mr-2 h-3 w-3" />
                      Nueva Orden
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              ordenes.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium text-foreground">
                    {o.folio}
                  </TableCell>
                  <TableCell>
                    {o.razonSocial || o.clienteId}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {o.moneda === 'USD' ? '$' : '$'}
                    {Number(o.total).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge estatus={o.estatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(o)}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(o.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(meta.totalPages, p + 1))
                }
                disabled={page >= meta.totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </TableContainer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-2xl ring-1 ring-foreground/10 max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg brand-gradient">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  {editing ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
                </h2>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Cliente *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      required
                      value={clienteId}
                      onChange={(e) => setClienteId(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-ring/30 focus:outline-none"
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
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Cotización (opcional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={cotizacionId}
                      onChange={(e) => setCotizacionId(e.target.value)}
                      placeholder="ID de cotización relacionada"
                      className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Condiciones de pago
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={condicionesPago}
                    onChange={(e) => setCondicionesPago(e.target.value)}
                    placeholder="Ej: 30 días, Contra entrega..."
                    className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Líneas de proveedores *
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLinea}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Agregar línea
                  </Button>
                </div>

                <div className="space-y-2">
                  {lineas.map((l, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-muted/50 p-3"
                    >
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Proveedor *
                          </label>
                          <select
                            required
                            value={l.proveedorId}
                            onChange={(e) =>
                              updateLinea(idx, 'proveedorId', e.target.value)
                            }
                            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:ring-2 focus:ring-ring/30 focus:outline-none"
                          >
                            <option value="">Seleccionar proveedor...</option>
                            {proveedores.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.codigo} — {p.razonSocial}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={l.cantidad}
                            onChange={(e) =>
                              updateLinea(idx, 'cantidad', Number(e.target.value))
                            }
                            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:ring-2 focus:ring-ring/30 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Precio unitario
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={l.precioUnitario}
                            onChange={(e) =>
                              updateLinea(
                                idx,
                                'precioUnitario',
                                Number(e.target.value)
                              )
                            }
                            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:ring-2 focus:ring-ring/30 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Subtotal
                          </label>
                          <p className="rounded-md border border-border bg-muted px-2 py-1.5 text-sm font-medium text-foreground">
                            ${' '}
                            {(
                              (Number(l.precioUnitario) || 0) *
                              (Number(l.cantidad) || 0)
                            ).toLocaleString('es-MX', {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            &nbsp;
                          </label>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => removeLinea(idx)}
                            disabled={lineas.length <= 1}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Notas (opcional)
                        </label>
                        <input
                          type="text"
                          value={l.notas}
                          onChange={(e) =>
                            updateLinea(idx, 'notas', e.target.value)
                          }
                          placeholder="Observaciones de la línea..."
                          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:ring-2 focus:ring-ring/30 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="rounded-lg border border-brand/20 bg-brand-muted p-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Subtotal</p>
                    <p className="text-lg font-bold text-foreground">
                      $ {subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">IVA (16%)</p>
                    <p className="text-lg font-bold text-foreground">
                      $ {iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-brand">
                      $ {total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Notas generales
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    placeholder="Condiciones, observaciones..."
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive-muted px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  loading={saving}
                >
                  {editing ? 'Actualizar' : 'Crear Orden'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: 'brand' | 'warning' | 'success' | 'danger' }) {
  const colorMap = {
    brand: 'text-brand bg-brand-muted',
    warning: 'text-warning bg-warning-muted',
    success: 'text-success bg-success-muted',
    danger: 'text-danger bg-danger-muted',
  };

  return (
    <Card className="card-premium">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ estatus }: { estatus: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; label: string }> = {
    pendiente: { variant: 'warning', label: 'Pendiente' },
    PENDIENTE: { variant: 'warning', label: 'Pendiente' },
    aprobada: { variant: 'default', label: 'Aprobada' },
    APROBADA: { variant: 'default', label: 'Aprobada' },
    en_produccion: { variant: 'secondary', label: 'En Producción' },
    completada: { variant: 'success', label: 'Completada' },
    cancelada: { variant: 'destructive', label: 'Cancelada' },
    rechazada: { variant: 'destructive', label: 'Rechazada' },
  };

  const { variant, label } = config[estatus] || { variant: 'outline' as const, label: estatus };

  return <Badge variant={variant}>{label}</Badge>;
}
