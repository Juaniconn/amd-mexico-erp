'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit3,
  Package,
  Hash,
  Tags,
  DollarSign,
  AlertTriangle,
  XCircle,
  Activity,
  Save,
  X,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  MapPin,
  FileText,
  Calendar,
} from 'lucide-react';
import { get, post, patch } from '@/lib/api';
import type { Material, MovimientoMaterial, TipoMovimiento } from '@/types';

const TIPOS_MOVIMIENTO: { value: TipoMovimiento; label: string; icon: typeof ArrowUpCircle; color: string }[] = [
  { value: 'ENTRADA', label: 'Entrada', icon: ArrowUpCircle, color: 'text-emerald-400' },
  { value: 'SALIDA', label: 'Salida', icon: ArrowDownCircle, color: 'text-red-400' },
  { value: 'AJUSTE', label: 'Ajuste', icon: RefreshCw, color: 'text-amber-400' },
];

export default function MaterialDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [material, setMaterial] = useState<Material | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [savingMovimiento, setSavingMovimiento] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    unidad: 'pieza',
    stockActual: 0,
    stockMinimo: 10,
    ubicacion: '',
    precioUnitario: 0,
    notas: '',
  });

  const [movimientoForm, setMovimientoForm] = useState({
    tipo: 'ENTRADA' as TipoMovimiento,
    cantidad: 0,
    documento: '',
    notas: '',
  });

  const loadMaterial = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const mat = await get<Material>(`/api/inventario/materiales/${id}`);
      setMaterial(mat);
      setForm({
        nombre: mat.nombre || '',
        descripcion: mat.descripcion || '',
        categoria: mat.categoria || '',
        unidad: mat.unidad || 'pieza',
        stockActual: Number(mat.stockActual ?? 0),
        stockMinimo: Number(mat.stockMinimo ?? 10),
        ubicacion: mat.ubicacion || '',
        precioUnitario: Number(mat.precioUnitario ?? 0),
        notas: (mat as any).notas || '',
      });

      // Load movements
      try {
        const movs = await get<MovimientoMaterial[]>(`/api/inventario/materiales/${id}/movimientos`);
        setMovimientos(movs);
      } catch {
        // Movements endpoint may not exist yet
        setMovimientos([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al cargar el material');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMaterial();
  }, [loadMaterial]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await patch(`/api/inventario/materiales/${id}`, {
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
      setEditing(false);
      loadMaterial();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleRegistrarMovimiento(e: React.FormEvent) {
    e.preventDefault();
    setSavingMovimiento(true);
    setError('');
    try {
      await post(`/api/inventario/materiales/${id}/movimientos`, {
        tipo: movimientoForm.tipo,
        cantidad: Number(movimientoForm.cantidad),
        documento: movimientoForm.documento || undefined,
        notas: movimientoForm.notas || undefined,
      });
      setShowMovimientoModal(false);
      setMovimientoForm({ tipo: 'ENTRADA', cantidad: 0, documento: '', notas: '' });
      loadMaterial();
    } catch (err: any) {
      setError(err?.message || 'Error al registrar movimiento');
    } finally {
      setSavingMovimiento(false);
    }
  }

  function getStockStatus(stock: number, minimo: number) {
    if (stock === 0) return { variant: 'destructive' as const, label: 'Sin stock', icon: XCircle, color: 'text-red-400' };
    if (stock < minimo) return { variant: 'warning' as const, label: 'Stock bajo', icon: AlertTriangle, color: 'text-amber-400' };
    return { variant: 'success' as const, label: 'Disponible', icon: Activity, color: 'text-emerald-400' };
  }

  function getMovimientoIcon(tipo: TipoMovimiento) {
    return TIPOS_MOVIMIENTO.find((t) => t.value === tipo);
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <span className="ml-3 text-muted-foreground">Cargando material...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !material) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/inventario')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error || 'Material no encontrado'}
          </div>
        </div>
      </AppLayout>
    );
  }

  const stockStatus = getStockStatus(Number(material.stockActual ?? 0), Number(material.stockMinimo ?? 10));

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={() => router.push('/inventario')} title="Volver">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{material.codigo}</h1>
              <p className="text-sm text-muted-foreground">{material.nombre}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="gap-2" onClick={() => setShowMovimientoModal(true)}>
              <Plus className="h-4 w-4" />
              Registrar Movimiento
            </Button>
            {!editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Edit3 className="h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!editing ? (
          <>
            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Nombre</p>
                    <p className="text-sm font-medium text-foreground">{material.nombre}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Tags className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Categoría</p>
                    <Badge variant="outline">{material.categoria}</Badge>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Unidad</p>
                    <p className="text-sm font-medium text-foreground">{material.unidad}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    stockStatus.variant === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                    stockStatus.variant === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    <stockStatus.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Stock</p>
                    <p className="text-2xl font-bold tracking-tight">{Number(material.stockActual ?? 0).toLocaleString('es-MX')}</p>
                    <p className="text-xs text-muted-foreground">Mín: {Number(material.stockMinimo ?? 10)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Detail Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-semibold">Stock Actual vs Mínimo</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Stock Actual</p>
                  <p className={`text-3xl font-bold ${stockStatus.color}`}>{material.stockActual.toLocaleString('es-MX')}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Stock Mínimo</p>
                  <p className="text-3xl font-bold text-muted-foreground">{material.stockMinimo.toLocaleString('es-MX')}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Estatus</p>
                  <Badge variant={stockStatus.variant} className="mt-1">
                    <stockStatus.icon className="mr-1 h-3 w-3" />
                    {stockStatus.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-semibold">Información del Material</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Código</p>
                  <p className="text-sm font-mono text-foreground">{material.codigo}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Ubicación</p>
                  <p className="flex items-center gap-1 text-sm text-foreground">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {material.ubicacion || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Precio Unitario</p>
                  <p className="text-sm text-foreground">${Number(material.precioUnitario ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                </div>
                {material.descripcion && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Descripción</p>
                    <p className="text-sm text-muted-foreground">{material.descripcion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Movements History */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-semibold">Historial de Movimientos</h2>
              {movimientos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No hay movimientos registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cantidad</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Documento</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientos.map((mov) => {
                        const tipoInfo = getMovimientoIcon(mov.tipo);
                        return (
                          <tr key={mov.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(mov.createdAt)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-[10px]">
                                {tipoInfo && <tipoInfo.icon className={`mr-1 h-3 w-3 ${tipoInfo.color}`} />}
                                {tipoInfo?.label || mov.tipo}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-semibold ${tipoInfo?.color || 'text-foreground'}`}>
                                {mov.tipo === 'SALIDA' ? '-' : '+'}{mov.cantidad.toLocaleString('es-MX')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{mov.documento || '—'}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {mov.usuario ? `${mov.usuario.nombre} ${mov.usuario.apellido}` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-sm font-semibold">Editar Material</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Nombre *</label>
                    <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-base" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Categoría</label>
                    <input type="text" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="input-base" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Descripción</label>
                  <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} className="input-base resize-none" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Unidad</label>
                    <input type="text" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} className="input-base" />
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
                    <input type="text" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} className="input-base" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Precio Unitario</label>
                    <input type="text" value={form.precioUnitario || ''} onChange={(e) => setForm({ ...form, precioUnitario: parseFloat(e.target.value) || 0 })} className="input-base" placeholder="$ 0.00" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Notas</label>
                  <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={3} className="input-base resize-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditing(false); loadMaterial(); }}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="gap-2" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        )}

        {/* Movimiento Modal */}
        {showMovimientoModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-lg font-semibold">Registrar Movimiento</h2>
                <button onClick={() => setShowMovimientoModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleRegistrarMovimiento} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Tipo de Movimiento *</label>
                  <select value={movimientoForm.tipo} onChange={(e) => setMovimientoForm({ ...movimientoForm, tipo: e.target.value as TipoMovimiento })} className="input-base">
                    {TIPOS_MOVIMIENTO.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Cantidad *</label>
                  <input type="number" required min={1} value={movimientoForm.cantidad} onChange={(e) => setMovimientoForm({ ...movimientoForm, cantidad: Number(e.target.value) })} className="input-base" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Documento</label>
                  <input type="text" value={movimientoForm.documento} onChange={(e) => setMovimientoForm({ ...movimientoForm, documento: e.target.value })} className="input-base" placeholder="Folio de orden, factura, etc." />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Notas</label>
                  <textarea value={movimientoForm.notas} onChange={(e) => setMovimientoForm({ ...movimientoForm, notas: e.target.value })} rows={2} className="input-base resize-none" placeholder="Observaciones" />
                </div>
                <div className="flex justify-end gap-3 border-t border-border pt-4">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowMovimientoModal(false)}>Cancelar</Button>
                  <Button type="submit" size="sm" className="gap-2" disabled={savingMovimiento}>
                    {savingMovimiento ? 'Guardando...' : 'Registrar'}
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
