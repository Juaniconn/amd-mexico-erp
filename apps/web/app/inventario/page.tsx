'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  MapPin,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';
import { get, post, del } from '@/lib/api';
import type { Material } from '@/types';

const CATEGORIAS = ['Materia Prima', 'Herramienta', 'Consumible', 'Refacción', 'Producto Terminado'];
const UNIDADES = ['pieza', 'kg', 'm', 'litro', 'set', 'caja', 'par'];

function getStockStatus(stock: number, minimo: number) {
  if (stock === 0) return { variant: 'destructive' as const, label: 'Sin stock', color: 'text-red-400' };
  if (stock < minimo) return { variant: 'warning' as const, label: 'Stock bajo', color: 'text-amber-400' };
  return { variant: 'success' as const, label: 'Disponible', color: 'text-emerald-400' };
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
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'codigo' | 'nombre' | 'stockActual'>('codigo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const limit = 10;
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: CATEGORIAS[0],
    unidad: 'pieza',
    stockActual: 0,
    stockMinimo: 10,
    ubicacion: '',
    precioUnitario: 0,
    notas: '',
  });

  const loadItems = useCallback(async (p = 1, s = '', cat = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', String(limit));
      if (s) q.set('search', s);
      if (cat) q.set('categoria', cat);
      const res = await get<{ data: Material[]; meta: any }>(`/api/inventario/materiales?${q}`);
      setItems(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return;
      }
      setError(err?.message || 'Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems(page, search, categoriaFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearch() {
    setPage(1);
    loadItems(1, search, categoriaFilter);
  }

  function handleCategoriaChange(value: string) {
    setCategoriaFilter(value);
    setPage(1);
    loadItems(1, search, value);
  }

  function toggleSort(field: 'codigo' | 'nombre' | 'stockActual') {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const aVal = a[sortField] ?? '';
    const bVal = b[sortField] ?? '';
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await post('/api/inventario/materiales', {
        codigo: form.codigo,
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        categoria: form.categoria,
        unidad: form.unidad,
        stockActual: Number(form.stockActual),
        stockMinimo: Number(form.stockMinimo),
        ubicacion: form.ubicacion || undefined,
        precioUnitario: Number(form.precioUnitario),
        notas: form.notas || undefined,
      });
      setShowModal(false);
      loadItems(page, search, categoriaFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al crear el material');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar este material?')) return;
    try {
      setError('');
      await del(`/api/inventario/materiales/${id}`);
      loadItems(page, search, categoriaFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  const totalProductos = meta?.total ?? items.length;
  const stockBajo = items.filter((m) => Number(m.stockActual) > 0 && Number(m.stockActual) < Number(m.stockMinimo)).length;
  const sinStock = items.filter((m) => Number(m.stockActual) === 0).length;
  const valorTotal = items.reduce((acc, m) => acc + Number(m.stockActual) * Number(m.precioUnitario ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground">Materiales, herramientas y productos</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Nuevo Material
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Total Materiales</p>
              <p className="text-2xl font-bold tracking-tight">{totalProductos}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Stock Bajo</p>
              <p className="text-2xl font-bold tracking-tight">{stockBajo}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Sin Stock</p>
              <p className="text-2xl font-bold tracking-tight">{sinStock}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold tracking-tight">${valorTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-base pl-10"
          />
        </div>
        <select
          value={categoriaFilter}
          onChange={(e) => handleCategoriaChange(e.target.value)}
          className="input-base sm:w-48"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={handleSearch} className="gap-2">
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No hay materiales registrados</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Crea un nuevo material para comenzar</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {sortedItems.map((m) => {
              const status = getStockStatus(Number(m.stockActual), Number(m.stockMinimo));
              return (
                <div key={m.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted-foreground">{m.codigo}</p>
                      <p className="font-semibold truncate">{m.nombre}</p>
                    </div>
                    <Badge variant={status.variant} className="shrink-0 text-[10px]">
                      {Number(m.stockActual) < Number(m.stockMinimo) && (
                        <AlertTriangle className="mr-1 h-3 w-3" />
                      )}
                      {status.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Stock</p>
                      <p className={`font-semibold ${status.color}`}>
                        {Number(m.stockActual).toLocaleString('es-MX')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Mínimo</p>
                      <p>{Number(m.stockMinimo).toLocaleString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Categoría</p>
                      <p className="truncate">{m.categoria}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Ubicación</p>
                      <p className="truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {m.ubicacion || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/inventario/${m.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                    </Button>
                    <Link href={`/inventario/${m.id}?edit=1`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-red-400"
                      onClick={() => handleDelete(m.id)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort('codigo')} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                      Código <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort('nombre')} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                      Nombre <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoría</th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => toggleSort('stockActual')} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground ml-auto">
                      Stock Actual <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Mínimo</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ubicación</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estatus</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((m) => {
                  const status = getStockStatus(Number(m.stockActual), Number(m.stockMinimo));
                  return (
                    <tr key={m.id} className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-foreground">{m.codigo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{m.nombre}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px]">{m.categoria}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${status.color}`}>{Number(m.stockActual).toLocaleString('es-MX')}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{Number(m.stockMinimo).toLocaleString('es-MX')}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {m.ubicacion || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={status.variant} className="text-[10px]">
                          {Number(m.stockActual) < Number(m.stockMinimo) && (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          )}
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon-sm" title="Ver detalle" onClick={() => router.push(`/inventario/${m.id}`)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Link href={`/inventario/${m.id}?edit=1`}>
                            <Button variant="ghost" size="icon-sm" title="Editar">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon-sm" title="Eliminar" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(m.id)}>
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
        </>
      )}

      {/* Pagination */}
      {meta && !loading && sortedItems.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Mostrando {sortedItems.length} de {meta.total} materiales</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* New Material Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center">
          <div className="my-auto w-full max-w-2xl max-h-[min(90vh,calc(100dvh-2rem))] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-semibold">Nuevo Material</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Código *</label>
                  <input type="text" required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="input-base" placeholder="MAT-001" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Categoría *</label>
                  <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="input-base">
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Nombre *</label>
                <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-base" placeholder="Nombre del material" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className="input-base resize-none" placeholder="Descripción detallada" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Unidad</label>
                  <select value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} className="input-base">
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Stock Actual</label>
                  <input type="number" min={0} value={form.stockActual} onChange={(e) => setForm({ ...form, stockActual: Number(e.target.value) })} className="input-base" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Stock Mínimo</label>
                  <input type="number" min={0} value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })} className="input-base" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Ubicación</label>
                  <input type="text" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} className="input-base" placeholder="Almacén A, Estante 3" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Precio Unitario</label>
                  <input type="text" value={form.precioUnitario || ''} onChange={(e) => setForm({ ...form, precioUnitario: parseFloat(e.target.value) || 0 })} className="input-base" placeholder="$ 0.00" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Notas</label>
                <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={2} className="input-base resize-none" placeholder="Observaciones" />
              </div>
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancelar</Button>
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
