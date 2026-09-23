'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { get, patch } from '@/lib/api';
import type { OrdenCompra, EstatusOrdenCompra, DetalleOrdenCompra } from '@/types';
import {
  ArrowLeft,
  Edit3,
  ShoppingCart,
  Calendar,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Save,
  X,
  Hash,
} from 'lucide-react';

// ─── Status Config ──────────────────────────────────────────

const STATUS_CONFIG: Record<EstatusOrdenCompra, { label: string; variant: 'secondary' | 'default' | 'success' | 'destructive' }> = {
  BORRADOR: { label: 'Borrador', variant: 'secondary' },
  ENVIADA: { label: 'Enviada', variant: 'default' },
  RECIBIDA: { label: 'Recibida', variant: 'success' },
  CANCELADA: { label: 'Cancelada', variant: 'destructive' },
};

interface OrdenCompraFormData {
  moneda: string;
  fechaEntrega: string;
  condicionesPago: string;
  notas: string;
  estatus: string;
}

// ─── Page ───────────────────────────────────────────────────

export default function CompraDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [compra, setCompra] = useState<OrdenCompra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<OrdenCompraFormData>({
    moneda: 'MXN',
    fechaEntrega: '',
    condicionesPago: '',
    notas: '',
    estatus: 'BORRADOR',
  });

  const loadCompra = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await get<OrdenCompra>(`/api/compras/ordenes/${id}`);
      setCompra(data);
      setForm({
        moneda: data.moneda || 'MXN',
        fechaEntrega: data.fechaEntrega || '',
        condicionesPago: data.condicionesPago || '',
        notas: data.notas || '',
        estatus: data.estatus || 'BORRADOR',
      });
    } catch (err: any) {
      setError(err?.message || 'Error al cargar la orden de compra');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCompra();
  }, [loadCompra]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await patch(`/api/compras/ordenes/${id}`, {
        moneda: form.moneda,
        fechaEntrega: form.fechaEntrega || undefined,
        condicionesPago: form.condicionesPago || undefined,
        notas: form.notas || undefined,
      });
      if (form.estatus && form.estatus !== compra?.estatus) {
        await patch(`/api/compras/ordenes/${id}/estatus`, { estatus: form.estatus });
      }
      setEditing(false);
      loadCompra();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <span className="ml-3 text-muted-foreground">Cargando orden de compra...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !compra) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/compras')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error || 'Orden de compra no encontrada'}
          </div>
        </div>
      </AppLayout>
    );
  }

  const statusKey = (Object.keys(STATUS_CONFIG).includes(compra.estatus) ? compra.estatus : 'BORRADOR') as EstatusOrdenCompra;
  const statusCfg = STATUS_CONFIG[statusKey];
  const impuestos = compra.impuestos ?? compra.iva ?? 0;
  const detalles = compra.detalles || [];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={() => router.push('/compras')} title="Volver">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{compra.folio}</h1>
              <p className="text-sm text-muted-foreground">Orden de compra</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            {!editing && (
              <Button size="sm" className="gap-2" onClick={() => setEditing(true)}>
                <Edit3 className="h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!editing ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-title">Folio</p>
                    <p className="text-sm font-medium text-foreground">{compra.folio}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-title">Fecha</p>
                    <p className="text-sm font-medium text-foreground">{new Date(compra.fecha).toLocaleDateString('es-MX')}</p>
                    {compra.fechaEntrega && (
                      <p className="text-xs text-muted-foreground">Entrega: {new Date(compra.fechaEntrega).toLocaleDateString('es-MX')}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-title">Total</p>
                    <p className="text-2xl font-bold tracking-tight">${Number(compra.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-muted-foreground">{compra.moneda}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-title">Detalles</p>
                    <p className="text-2xl font-bold tracking-tight">{detalles.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* General Info */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="section-title mb-4">Información General</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Proveedor</p>
                  <p className="text-sm font-medium">{compra.razonSocial || compra.proveedores?.[0]?.proveedorNombre || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Condiciones de Pago</p>
                  <p className="text-sm font-medium">{compra.condicionesPago || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estatus</p>
                  <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                </div>
              </div>
              {compra.notas && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="text-sm text-table whitespace-pre-wrap">{compra.notas}</p>
                </div>
              )}
            </div>

            {/* Details Table */}
            {detalles.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="section-title mb-4">Detalles de la Orden</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Material</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Descripción</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Cantidad</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Precio Unitario</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((d, i) => (
                        <tr key={d.id || i} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 text-muted-foreground">{d.material || '—'}</td>
                          <td className="px-3 py-2 text-foreground">{d.descripcion}</td>
                          <td className="px-3 py-2 text-right text-foreground">{d.cantidad}</td>
                          <td className="px-3 py-2 text-right text-foreground">
                            ${Number(d.precioUnitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-foreground">
                            ${Number(d.importe).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="section-title mb-4">Totales</h3>
              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${Number(compra.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span className="text-foreground">${Number(impuestos).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-brand">${Number(compra.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="section-title mb-4">Editar Orden de Compra</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-4">
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
                  <div className="sm:col-span-4">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Estatus
                    </label>
                    <select
                      value={form.estatus}
                      onChange={(e) => setForm({ ...form, estatus: e.target.value })}
                      className="input-base"
                    >
                      <option value="BORRADOR">Borrador</option>
                      <option value="ENVIADA">Enviada</option>
                      <option value="RECIBIDA">Recibida</option>
                      <option value="CANCELADA">Cancelada</option>
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Fecha Entrega
                    </label>
                    <input
                      type="date"
                      value={form.fechaEntrega}
                      onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
                      className="input-base"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Condiciones de Pago
                    </label>
                    <input
                      type="text"
                      value={form.condicionesPago}
                      onChange={(e) => setForm({ ...form, condicionesPago: e.target.value })}
                      className="input-base"
                      placeholder="30 días"
                    />
                  </div>
                  <div className="sm:col-span-12">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Notas
                    </label>
                    <textarea
                      value={form.notas}
                      onChange={(e) => setForm({ ...form, notas: e.target.value })}
                      rows={3}
                      className="input-base resize-none"
                      placeholder="Observaciones de la orden"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  loadCompra();
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
