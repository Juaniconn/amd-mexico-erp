'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { get, put } from '@/lib/api';
import type { Material } from '@/types';
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
} from 'lucide-react';

interface MaterialFormData {
  descripcion: string;
  tipo: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  costoUnitario: number;
  moneda: string;
  notas: string;
}

export default function MaterialDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<MaterialFormData>({
    descripcion: '',
    tipo: 'Material',
    unidad: 'pieza',
    stockActual: 0,
    stockMinimo: 10,
    costoUnitario: 0,
    moneda: 'MXN',
    notas: '',
  });

  const loadMaterial = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const material = await get<Material>(`/api/inventario/materiales/${id}`);
      setMaterial(material);
      setForm({
        descripcion: material.descripcion || '',
        tipo: material.tipo || 'Material',
        unidad: material.unidad || 'pieza',
        stockActual: Number(material.stockActual ?? 0),
        stockMinimo: Number(material.stockMinimo ?? 10),
        costoUnitario: Number(material.costoUnitario ?? 0),
        moneda: material.moneda || 'MXN',
        notas: (material as any).notas || '',
      });
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
      await put(`/api/inventario/materiales/${id}`, {
        descripcion: form.descripcion,
        tipo: form.tipo,
        unidad: form.unidad,
        stockActual: Number(form.stockActual),
        stockMinimo: Number(form.stockMinimo),
        costoUnitario: Number(form.costoUnitario),
        moneda: form.moneda,
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

  function getStockStatus(stock: number, stockMinimo: number = 10) {
    if (stock === 0) return { variant: 'destructive' as const, label: 'Sin stock', icon: XCircle };
    if (stock <= stockMinimo) return { variant: 'warning' as const, label: 'Stock bajo', icon: AlertTriangle };
    return { variant: 'success' as const, label: 'Disponible', icon: Activity };
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
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
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
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
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{material.codigo}</h1>
              <p className="text-sm text-muted-foreground">{material.descripcion}</p>
            </div>
          </div>
          {!editing && (
            <Button size="sm" className="gap-2" onClick={() => setEditing(true)}>
              <Edit3 className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Info Cards */}
        {!editing ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-title">Descripción</p>
                    <p className="text-sm font-medium text-foreground">{material.descripcion}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Tags className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-title">Tipo</p>
                    <Badge variant="outline">{material.tipo}</Badge>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-title">Unidad</p>
                    <p className="text-sm font-medium text-foreground">{material.unidad}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    stockStatus.variant === 'success' ? 'bg-success/10 text-success' :
                    stockStatus.variant === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    <stockStatus.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-title">Stock</p>
                    <p className="text-2xl font-bold tracking-tight">{Number(material.stockActual ?? 0).toLocaleString('es-MX')}</p>
                    <p className="text-xs text-muted-foreground">Mín: {Number(material.stockMinimo ?? 10)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-title">Costo Unitario</p>
                    <p className="text-2xl font-bold tracking-tight">${Number(material.costoUnitario ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-muted-foreground">{material.moneda}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    stockStatus.variant === 'success' ? 'bg-success/10 text-success' :
                    stockStatus.variant === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    <stockStatus.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-title">Estatus</p>
                    <Badge variant={stockStatus.variant}>
                      <stockStatus.icon className="mr-1 h-3 w-3" />
                      {stockStatus.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(material as any).notas && (
              <Card>
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{(material as any).notas}</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Editar Material</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                      Moneda
                    </label>
                    <select
                      value={form.moneda}
                      onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                      className="input-base"
                    >
                      <option value="MXN">MXN</option>
                      <option value="USD">USD</option>
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
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Notas
                  </label>
                  <textarea
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    rows={3}
                    className="input-base resize-none"
                  />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  loadMaterial();
                }}
              >
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
      </div>
    </AppLayout>
  );
}
