'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/Card';
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
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  AlertCircle,
  Inbox,
  Hash,
  Layers,
  Activity,
  Tags,
  X,
} from 'lucide-react';
import { get, post, ApiError } from '@/lib/api';
import type { Material } from '@/types';

interface MaterialFormData {
  codigo: string;
  descripcion: string;
  tipo: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  costoUnitario: number;
  moneda: string;
  proveedorId?: string;
  notas?: string;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'Material', label: 'Material' },
  { value: 'Producto', label: 'Producto' },
  { value: 'Servicio', label: 'Servicio' },
];

function formatCurrency(value: number | string = 0): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `$ ${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InventarioPage() {
  return (
    <AppLayout>
      <InventarioContent />
    </AppLayout>
  );
}

function InventarioContent() {
  const router = useRouter();
  const [items, setItems] = useState<Material[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<MaterialFormData>({
    codigo: '',
    descripcion: '',
    tipo: 'Material',
    unidad: 'pieza',
    stockActual: 0,
    stockMinimo: 10,
    costoUnitario: 0,
    moneda: 'MXN',
    proveedorId: '',
    notas: '',
  });

  const loadInventario = useCallback(async (p = 1, s = '', cat = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', String(limit));
      if (s) q.set('search', s);
      if (cat) q.set('tipo', cat);
      const res = await get<{ data: Material[]; meta: any }>(`/api/inventario/materiales?${q}`);
      setItems(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventario(page, search, categoryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearch() {
    setPage(1);
    loadInventario(1, search, categoryFilter);
  }

  function handleCategoryChange(value: string) {
    setCategoryFilter(value);
    setPage(1);
    loadInventario(1, search, value);
  }

  function openNewMaterial() {
    setForm({
      codigo: '',
      descripcion: '',
      tipo: 'Material',
      unidad: 'pieza',
      stockActual: 0,
      stockMinimo: 10,
      costoUnitario: 0,
      moneda: 'MXN',
      proveedorId: '',
      notas: '',
    });
    setShowModal(true);
  }

  async function handleSubmitMaterial(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await post('/api/inventario/materiales', {
        codigo: form.codigo,
        descripcion: form.descripcion,
        tipo: form.tipo,
        unidad: form.unidad,
        stockActual: Number(form.stockActual),
        stockMinimo: Number(form.stockMinimo),
        costoUnitario: Number(form.costoUnitario),
        moneda: form.moneda,
        proveedorId: form.proveedorId || undefined,
        notas: form.notas || undefined,
      });
      setShowModal(false);
      loadInventario(page, search, categoryFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al crear el material');
    } finally {
      setSaving(false);
    }
  }

  // Stats calculations
  const totalProductos = meta?.total ?? items.length;
  const stockBajo = items.filter((m) => (m.stockActual ?? 0) > 0 && (m.stockActual ?? 0) <= (m.stockMinimo || 10)).length;
  const sinStock = items.filter((m) => (m.stockActual ?? 0) === 0).length;
  const valorInventario = items.reduce((acc, m) => acc + Number(m.stockActual ?? 0) * Number(m.costoUnitario ?? 0), 0);

  function getStockStatus(stock: number, stockMinimo: number = 10) {
    if (stock === 0) return { variant: 'destructive' as const, label: 'Sin stock', icon: XCircle };
    if (stock <= stockMinimo) return { variant: 'warning' as const, label: 'Stock bajo', icon: AlertTriangle };
    return { variant: 'success' as const, label: 'Disponible', icon: Activity };
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            Materiales, productos y servicios
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={openNewMaterial}>
          <Plus className="h-4 w-4" />
          Nuevo Material
        </Button>
      </div>

      {/* Stats Cards with borders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Total Productos</p>
              <p className="text-2xl font-bold tracking-tight">{totalProductos}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-warning/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Stock Bajo</p>
              <p className="text-2xl font-bold tracking-tight">{stockBajo}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-destructive/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Sin Stock</p>
              <p className="text-2xl font-bold tracking-tight">{sinStock}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-success/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Valor Inventario</p>
              <p className="text-2xl font-bold tracking-tight">{formatCurrency(valorInventario)}</p>
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
            placeholder="Buscar por código, descripción o unidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-base pl-10"
          />
        </div>
        <div className="relative sm:w-48">
          <Tags className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input-base pl-10 appearance-none"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Precio Unitario</TableHead>
              <TableHead>Estatus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows />
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={<Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />}
                    title="No hay materiales registrados"
                    description="Agregue un nuevo material para comenzar"
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((m) => {
                const status = getStockStatus(Number(m.stockActual ?? 0), Number(m.stockMinimo ?? 10));
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => router.push(`/inventario/${m.id}`)}
                        className="flex items-center gap-1.5 text-primary hover:underline focus:outline-none"
                      >
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        {m.codigo}
                      </button>
                    </TableCell>
                    <TableCell className="text-table">{m.descripcion}</TableCell>
                    <TableCell className="text-table text-muted-foreground">{m.unidad}</TableCell>
                    <TableCell className="text-right font-semibold text-table">
                      {Number(m.stockActual ?? 0).toLocaleString('es-MX')}
                    </TableCell>
                    <TableCell className="text-right font-medium text-table">
                      {formatCurrency(m.costoUnitario ?? 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        <status.icon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {meta && !loading && items.length > 0 && (
          <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground rounded-b-xl">
            <span>
              Mostrando {items.length} de {meta.total} productos
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

      {/* New Material Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Nuevo Material</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitMaterial} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    className="input-base"
                    placeholder="MAT-001"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Tipo
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="input-base"
                  >
                    <option value="Material">Material</option>
                    <option value="Producto">Producto</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Descripción *
                </label>
                <input
                  type="text"
                  required
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="input-base"
                  placeholder="Descripción del material"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.stockActual}
                    onChange={(e) => setForm({ ...form, stockActual: Number(e.target.value) })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.stockMinimo}
                    onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })}
                    className="input-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Costo Unitario
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.costoUnitario}
                    onChange={(e) => setForm({ ...form, costoUnitario: Number(e.target.value) })}
                    className="input-base"
                  />
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
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Notas
                </label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
                  className="input-base resize-none"
                  placeholder="Observaciones del material"
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
                  {saving ? 'Guardando...' : 'Crear Material'}
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
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
  description?: string;
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
        <div className="min-w-0 flex-1">
          <p className="section-title">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{description}</p>
          )}
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
            <div className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 animate-pulse bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="ml-auto h-4 w-10 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
    </div>
  );
}
