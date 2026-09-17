'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { get, post, put, del, ApiError } from '@/lib/api';
import type { Venta, VentaItem, VentaListResponse, Cliente, Sucursal } from '@/types';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Inbox,
  Loader2,
  ShoppingCart,
  TrendingUp,
  FileText,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/Card';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface VentaItemForm {
  piezaNombre: string;
  piezaDescripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  notas: string;
}

const emptyItem = (): VentaItemForm => ({
  piezaNombre: '',
  piezaDescripcion: '',
  cantidad: 1,
  unidad: 'pz',
  precioUnitario: 0,
  notas: '',
});

const IVA_RATE = 0.16;

const ESTATUS_OPTIONS = [
  { value: 'COTIZACION', label: 'Cotización' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'APROBADA', label: 'Aprobada' },
  { value: 'EN_PRODUCCION', label: 'En Producción' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

function getStatusVariant(estatus: string): 'default' | 'warning' | 'success' | 'destructive' | 'secondary' {
  switch (estatus) {
    case 'COTIZACION':
      return 'secondary';
    case 'PENDIENTE':
      return 'warning';
    case 'APROBADA':
      return 'default';
    case 'EN_PRODUCCION':
      return 'default';
    case 'COMPLETADA':
      return 'success';
    case 'CANCELADA':
      return 'destructive';
    default:
      return 'default';
  }
}

function getStatusLabel(estatus: string): string {
  const labels: Record<string, string> = {
    COTIZACION: 'Cotización',
    PENDIENTE: 'Pendiente',
    APROBADA: 'Aprobada',
    EN_PRODUCCION: 'En Producción',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada',
  };
  return labels[estatus] || estatus;
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [meta, setMeta] = useState<VentaListResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Venta | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [clienteId, setClienteId] = useState('');
  const [sucursalId, setSucursalId] = useState('');
  const [condicionesPago, setCondicionesPago] = useState('');
  const [notas, setNotas] = useState('');
  const [moneda, setMoneda] = useState<'MXN' | 'USD'>('MXN');
  const [tipoCambio, setTipoCambio] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [items, setItems] = useState<VentaItemForm[]>([emptyItem()]);
  const [estatus, setEstatus] = useState('COTIZACION');

  const loadVentas = useCallback(async (p = 1, s = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      const res = await get<VentaListResponse>(`/api/ventas?${q}`);
      setVentas(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVentas(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    Promise.all([
      get<Cliente[]>('/api/clientes?limit=100'),
      get<Sucursal[]>('/api/configuracion/sucursales'),
    ])
      .then(([c, s]) => {
        setClientes(c);
        setSucursales(s);
      })
      .catch(() => {});
  }, []);

  function openNew() {
    setEditing(null);
    setClienteId('');
    setSucursalId('');
    setCondicionesPago('');
    setNotas('');
    setMoneda('MXN');
    setTipoCambio('');
    setFechaEntrega('');
    setItems([emptyItem()]);
    setEstatus('COTIZACION');
    setError('');
    setShowModal(true);
  }

  function openEdit(v: Venta) {
    setEditing(v);
    setClienteId(v.clienteId);
    setSucursalId(v.sucursalId || '');
    setCondicionesPago(v.condicionesPago || '');
    setNotas(v.notas || '');
    setMoneda(v.moneda || 'MXN');
    setTipoCambio(v.tipoCambio ? String(v.tipoCambio) : '');
    setFechaEntrega(v.fechaEntrega ? v.fechaEntrega.slice(0, 10) : '');
    setEstatus(v.estatus);
    setItems(
      v.items && v.items.length > 0
        ? v.items.map((it) => ({
            piezaNombre: it.piezaNombre,
            piezaDescripcion: it.piezaDescripcion || '',
            cantidad: it.cantidad,
            unidad: it.unidad,
            precioUnitario: Number(it.precioUnitario) || 0,
            notas: it.notas || '',
          }))
        : [emptyItem()]
    );
    setError('');
    setShowModal(true);
  }

  function updateItem(idx: number, field: keyof VentaItemForm, value: string | number) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(idx: number) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function calcSubtotal() {
    return items.reduce(
      (sum, it) => sum + (Number(it.precioUnitario) || 0) * (Number(it.cantidad) || 0),
      0
    );
  }

  function calcIva() {
    return calcSubtotal() * IVA_RATE;
  }

  function calcTotal() {
    return calcSubtotal() + calcIva();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        clienteId,
        sucursalId: sucursalId || undefined,
        condicionesPago: condicionesPago || undefined,
        notas: notas || undefined,
        moneda,
        tipoCambio: tipoCambio ? Number(tipoCambio) : undefined,
        fechaEntrega: fechaEntrega || undefined,
        ...(editing ? { estatus } : {}),
        items: items
          .filter((it) => it.piezaNombre && it.cantidad > 0)
          .map((it) => ({
            piezaNombre: it.piezaNombre,
            piezaDescripcion: it.piezaDescripcion || undefined,
            cantidad: Number(it.cantidad),
            unidad: it.unidad,
            precioUnitario: Number(it.precioUnitario),
            notas: it.notas || undefined,
          })),
      };

      if (editing) {
        await put(`/api/ventas/${editing.id}`, payload);
        setSuccess('Venta actualizada correctamente');
      } else {
        await post('/api/ventas', payload);
        setSuccess('Venta creada correctamente');
      }
      setShowModal(false);
      loadVentas(page, search);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setError(
          'Error de validación: ' + (err.data?.details?.map((d: any) => d.message).join(', ') || '')
        );
      } else {
        setError(err?.message || 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar esta venta?')) return;
    try {
      setError('');
      await del(`/api/ventas/${id}`);
      setSuccess('Venta eliminada correctamente');
      loadVentas(page, search);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  function handleSearch() {
    setPage(1);
    loadVentas(1, search);
  }

  // Stats calculations
  const statsTotal = meta?.total ?? ventas.length;
  const statsPendientes = ventas.filter((v) => v.estatus === 'PENDIENTE').length;
  const statsCompletadas = ventas.filter((v) => v.estatus === 'COMPLETADA').length;
  const statsCanceladas = ventas.filter((v) => v.estatus === 'CANCELADA').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ventas</h1>
          <p className="text-sm text-muted-foreground">Pedidos de venta y cotizaciones</p>
        </div>
        <Button
          onClick={openNew}
          disabled={clientes.length === 0}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Venta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="card-premium">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Total
              </p>
              <p className="text-xl font-bold text-foreground">{statsTotal}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-warning-muted text-warning">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Pendientes
              </p>
              <p className="text-xl font-bold text-foreground">{statsPendientes}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-success-muted text-success">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Completadas
              </p>
              <p className="text-xl font-bold text-foreground">{statsCompletadas}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-danger-muted text-danger">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Canceladas
              </p>
              <p className="text-xl font-bold text-foreground">{statsCanceladas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive-muted px-4 py-3 text-sm text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-success animate-fade-in">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por folio o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleSearch} className="gap-2">
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Button>
      </div>

      {/* Table */}
      <TableContainer>
        {loading ? (
          <LoadingSkeleton />
        ) : ventas.length === 0 ? (
          <EmptyState onNew={openNew} hasClientes={clientes.length > 0} />
        ) : (
          <>
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
                {ventas.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-foreground">{v.folio}</TableCell>
                    <TableCell>{v.cliente?.razonSocial || v.clienteId}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(v.fecha).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${' '}
                      {Number(v.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                      <span className="text-muted-foreground">{v.moneda}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(v.estatus)}>
                        {getStatusLabel(v.estatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => openEdit(v)}
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => handleDelete(v.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {meta && (
              <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                  Mostrando {ventas.length} de {meta.total} ventas
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
      </TableContainer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-xl bg-card p-6 shadow-2xl ring-1 ring-foreground/10 max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {editing ? 'Editar Venta' : 'Nueva Venta'}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Cliente *
                  </label>
                  <select
                    required
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo} — {c.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Sucursal
                  </label>
                  <select
                    value={sucursalId}
                    onChange={(e) => setSucursalId(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="">Seleccionar sucursal...</option>
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.codigo} — {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Moneda
                  </label>
                  <select
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value as 'MXN' | 'USD')}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Tipo de cambio
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={tipoCambio}
                    onChange={(e) => setTipoCambio(e.target.value)}
                    placeholder={moneda === 'USD' ? 'Ej: 17.50' : '1.00'}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Fecha de entrega
                </label>
                <input
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Condiciones de pago
                </label>
                <textarea
                  value={condicionesPago}
                  onChange={(e) => setCondicionesPago(e.target.value)}
                  rows={2}
                  placeholder="Ej: 30 días, 50% anticipo..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Notas
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  placeholder="Observaciones generales..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              {editing && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Estatus
                  </label>
                  <select
                    value={estatus}
                    onChange={(e) => setEstatus(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    {ESTATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Items */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Líneas de producto
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Agregar línea
                  </Button>
                </div>

                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-muted/50 p-3"
                    >
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-12 sm:col-span-4">
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Descripción *
                          </label>
                          <input
                            type="text"
                            required
                            value={it.piezaNombre}
                            onChange={(e) => updateItem(idx, 'piezaNombre', e.target.value)}
                            placeholder="Nombre/descripción"
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={it.cantidad}
                            onChange={(e) =>
                              updateItem(idx, 'cantidad', Number(e.target.value))
                            }
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Unidad
                          </label>
                          <input
                            type="text"
                            value={it.unidad}
                            onChange={(e) => updateItem(idx, 'unidad', e.target.value)}
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                          />
                        </div>
                        <div className="col-span-3 sm:col-span-3">
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Precio unitario
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={it.precioUnitario}
                            onChange={(e) =>
                              updateItem(idx, 'precioUnitario', Number(e.target.value))
                            }
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="mb-1 block text-xs text-muted-foreground">
                            &nbsp;
                          </label>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => removeItem(idx)}
                            disabled={items.length <= 1}
                            title="Eliminar línea"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="mb-1 block text-xs text-muted-foreground">
                          Notas de línea
                        </label>
                        <input
                          type="text"
                          value={it.notas}
                          onChange={(e) => updateItem(idx, 'notas', e.target.value)}
                          placeholder="Observaciones de esta línea..."
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-xl border border-primary/20 bg-primary-muted p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Subtotal
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ${' '}
                      {calcSubtotal().toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      IVA (16%)
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ${' '}
                      {calcIva().toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Total
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ${' '}
                      {calcTotal().toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive-muted px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={saving}
                  className="gap-2"
                >
                  {!saving && <FileText className="h-4 w-4" />}
                  {saving
                    ? 'Guardando...'
                    : editing
                    ? 'Actualizar'
                    : 'Crear Venta'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onNew, hasClientes }: { onNew: () => void; hasClientes: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-up">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Inbox className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-foreground">No hay ventas registradas</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Crea tu primera venta para comenzar a gestionar pedidos y cotizaciones.
      </p>
      <Button onClick={onNew} disabled={!hasClientes} className="mt-4 gap-2">
        <Plus className="h-4 w-4" />
        Nueva Venta
      </Button>
    </div>
  );
}
