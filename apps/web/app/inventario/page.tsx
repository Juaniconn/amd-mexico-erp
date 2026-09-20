'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Eye,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react';
import { get, post, put, del } from '@/lib/api';
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
  const [items, setItems] = useState<Material[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

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

  const [editForm, setEditForm] = useState<MaterialFormData>({
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

  function openDetailMaterial(m: Material) {
    setDetailMaterial(m);
    setShowDetailModal(true);
  }

  async function handleDeleteFromDetail() {
    if (!detailMaterial) return;
    if (!confirm('¿Está seguro de eliminar este material?')) return;
    try {
      setError('');
      await del(`/api/inventario/materiales/${detailMaterial.id}`);
      setShowDetailModal(false);
      setDetailMaterial(null);
      loadInventario(page, search, categoryFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  function openEditFromDetail() {
    if (!detailMaterial) return;
    setEditingMaterial(detailMaterial);
    setEditForm({
      codigo: detailMaterial.codigo,
      descripcion: detailMaterial.descripcion,
      tipo: detailMaterial.tipo,
      unidad: detailMaterial.unidad,
      stockActual: Number(detailMaterial.stockActual ?? 0),
      stockMinimo: Number(detailMaterial.stockMinimo ?? 10),
      costoUnitario: Number(detailMaterial.costoUnitario ?? 0),
      moneda: detailMaterial.moneda,
      proveedorId: '',
      notas: '',
    });
    setShowDetailModal(false);
    setShowEditModal(true);
  }

  function openEditFromDetailCard(m: Material) {
    setEditingMaterial(m);
    setEditForm({
      codigo: m.codigo,
      descripcion: m.descripcion,
      tipo: m.tipo,
      unidad: m.unidad,
      stockActual: Number(m.stockActual ?? 0),
      stockMinimo: Number(m.stockMinimo ?? 10),
      costoUnitario: Number(m.costoUnitario ?? 0),
      moneda: m.moneda,
      proveedorId: '',
      notas: '',
    });
    setShowEditModal(true);
  }

  async function handleDeleteCard(id: string) {
    if (!confirm('¿Está seguro de eliminar este material?')) return;
    try {
      setError('');
      await del(`/api/inventario/materiales/${id}`);
      loadInventario(page, search, categoryFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMaterial) return;
    setSaving(true);
    setError('');
    try {
      await put(`/api/inventario/materiales/${editingMaterial.id}`, {
        descripcion: editForm.descripcion,
        tipo: editForm.tipo,
        unidad: editForm.unidad,
        stockActual: Number(editForm.stockActual),
        stockMinimo: Number(editForm.stockMinimo),
        costoUnitario: Number(editForm.costoUnitario),
        moneda: editForm.moneda,
        notas: editForm.notas || undefined,
      });
      setShowEditModal(false);
      setEditingMaterial(null);
      loadInventario(page, search, categoryFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el material');
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
      {error && !showModal && !showEditModal && !showDetailModal && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Material Cards Grid */}
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
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No hay materiales registrados</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Agregue un nuevo material para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => {
            const status = getStockStatus(Number(m.stockActual ?? 0), Number(m.stockMinimo ?? 10));
            return (
              <div
                key={m.id}
                onClick={() => openDetailMaterial(m)}
                className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      (m.stockActual ?? 0) === 0
                        ? 'bg-destructive/10 text-destructive'
                        : (m.stockActual ?? 0) <= (m.stockMinimo || 10)
                        ? 'bg-warning/10 text-warning'
                        : 'bg-brand/10 text-brand'
                    }`}>
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">{m.descripcion}</h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        {m.codigo}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.variant}>
                    <status.icon className="mr-1 h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>

                {/* Card Body */}
                <div className="mt-4 space-y-2">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium">Tipo:</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{m.tipo}</Badge>
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Hash className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium">Unidad:</span>
                    <span>{m.unidad}</span>
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium">Stock:</span>
                    <span className="font-semibold text-foreground">{Number(m.stockActual ?? 0).toLocaleString('es-MX')}</span>
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium">Costo Unitario:</span>
                    <span>{formatCurrency(m.costoUnitario ?? 0)}</span>
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Clic para ver detalle</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => { e.stopPropagation(); openDetailMaterial(m); }}
                      title="Ver detalle"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => { e.stopPropagation(); openEditFromDetailCard(m); }}
                      title="Editar material"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCard(m.id); }}
                      title="Eliminar material"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {meta && !loading && items.length > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
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

      {/* Footer */}
      <footer className="border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} AMD México Operations ERP
        </p>
      </footer>

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

      {/* Edit Material Modal */}
      {showEditModal && editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Editar Material {editingMaterial.codigo}</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingMaterial(null); }}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Descripción *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                  className="input-base"
                  placeholder="Descripción del material"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Tipo
                  </label>
                  <select
                    value={editForm.tipo}
                    onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                    className="input-base"
                  >
                    <option value="Material">Material</option>
                    <option value="Producto">Producto</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Unidad
                  </label>
                  <select
                    value={editForm.unidad}
                    onChange={(e) => setEditForm({ ...editForm, unidad: e.target.value })}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.stockActual}
                    onChange={(e) => setEditForm({ ...editForm, stockActual: Number(e.target.value) })}
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
                    value={editForm.stockMinimo}
                    onChange={(e) => setEditForm({ ...editForm, stockMinimo: Number(e.target.value) })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Costo Unitario
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={editForm.costoUnitario}
                    onChange={(e) => setEditForm({ ...editForm, costoUnitario: Number(e.target.value) })}
                    className="input-base"
                  />
                </div>
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
                  onClick={() => { setShowEditModal(false); setEditingMaterial(null); }}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="gap-2" disabled={saving}>
                  {saving ? 'Guardando...' : 'Actualizar Material'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{detailMaterial.codigo}</h2>
                <p className="text-xs text-muted-foreground">{detailMaterial.descripcion}</p>
              </div>
              <button
                onClick={() => { setShowDetailModal(false); setDetailMaterial(null); }}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <p className="section-title">Código</p>
                  <p className="text-sm text-foreground">{detailMaterial.codigo}</p>
                </div>
                <div>
                  <p className="section-title">Descripción</p>
                  <p className="text-sm text-foreground">{detailMaterial.descripcion}</p>
                </div>
                <div>
                  <p className="section-title">Tipo</p>
                  <Badge variant="outline">{detailMaterial.tipo}</Badge>
                </div>
                <div>
                  <p className="section-title">Unidad</p>
                  <p className="text-sm text-foreground">{detailMaterial.unidad}</p>
                </div>
                <div>
                  <p className="section-title">Stock</p>
                  <p className="text-sm font-semibold text-foreground">{Number(detailMaterial.stockActual ?? 0).toLocaleString('es-MX')}</p>
                </div>
                <div>
                  <p className="section-title">Stock Mínimo</p>
                  <p className="text-sm text-foreground">{Number(detailMaterial.stockMinimo ?? 10).toLocaleString('es-MX')}</p>
                </div>
                <div>
                  <p className="section-title">Costo Unitario</p>
                  <p className="text-sm text-foreground">{formatCurrency(detailMaterial.costoUnitario ?? 0)}</p>
                </div>
                <div>
                  <p className="section-title">Moneda</p>
                  <p className="text-sm text-foreground">{detailMaterial.moneda}</p>
                </div>
                <div>
                  <p className="section-title">Estatus</p>
                  {(() => {
                    const status = getStockStatus(Number(detailMaterial.stockActual ?? 0), Number(detailMaterial.stockMinimo ?? 10));
                    return (
                      <Badge variant={status.variant}>
                        <status.icon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
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
