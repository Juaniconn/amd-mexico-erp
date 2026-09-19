'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { get, put } from '@/lib/api';
import {
  ArrowLeft,
  Edit3,
  ShoppingCart,
  Hash,
  Calendar,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Save,
  X,
} from 'lucide-react';

interface OrdenCompraProveedor {
  id: string;
  proveedorId: string;
  proveedorNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
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

interface OrdenCompraFormData {
  moneda: string;
  fechaEntrega: string;
  condicionesPago: string;
  notas: string;
  estatus: string;
}

export default function CompraDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

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
    estatus: 'pendiente',
  });

  const loadCompra = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const compra = await get<OrdenCompra>(`/api/ordenes-compra/${id}`);
      setCompra(compra);
      setForm({
        moneda: compra.moneda || 'MXN',
        fechaEntrega: compra.fechaEntrega || '',
        condicionesPago: compra.condicionesPago || '',
        notas: compra.notas || '',
        estatus: compra.estatus || 'pendiente',
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
      await put(`/api/ordenes-compra/${id}`, {
        moneda: form.moneda,
        fechaEntrega: form.fechaEntrega || undefined,
        condicionesPago: form.condicionesPago || undefined,
        notas: form.notas || undefined,
        estatus: form.estatus,
      });
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

  const estatusConfig: Record<string, { variant: string; icon: React.ReactNode; label: string }> = {
    pendiente: { variant: 'warning', icon: <Clock className="h-4 w-4" />, label: 'Pendiente' },
    aprobada: { variant: 'success', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Aprobada' },
    cancelada: { variant: 'destructive', icon: <XCircle className="h-4 w-4" />, label: 'Cancelada' },
    rechazada: { variant: 'destructive', icon: <XCircle className="h-4 w-4" />, label: 'Rechazada' },
    en_produccion: { variant: 'brand', icon: <Clock className="h-4 w-4" />, label: 'En Producción' },
    completada: { variant: 'success', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Completada' },
  };

  const statusConfig = estatusConfig[compra.estatus.toLowerCase()] || { variant: 'default', icon: <ShoppingCart className="h-4 w-4" />, label: compra.estatus };

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
            <Badge variant={statusConfig.variant as any}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
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
                    <p className="text-sm font-medium text-foreground">{new Date(compra.createdAt).toLocaleDateString('es-MX')}</p>
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
                    <p className="section-title">Proveedores</p>
                    <p className="text-2xl font-bold tracking-tight">{compra.proveedores?.length ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="section-title mb-4">Detalles de la Orden</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Subtotal</p>
                  <p className="text-sm font-medium">${Number(compra.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IVA</p>
                  <p className="text-sm font-medium">${Number(compra.iva).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Condiciones de Pago</p>
                  <p className="text-sm font-medium">{compra.condicionesPago || '—'}</p>
                </div>
              </div>
              {compra.notas && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="text-sm text-table">{compra.notas}</p>
                </div>
              )}
            </div>

            {/* Proveedores */}
            {compra.proveedores && compra.proveedores.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="section-title mb-4">Proveedores</h3>
                <div className="space-y-3">
                  {compra.proveedores.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.proveedorNombre || p.proveedorId}</p>
                          <p className="text-xs text-muted-foreground">Cantidad: {p.cantidad}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">${Number(p.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="section-title mb-4">Editar Orden de Compra</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Estatus
                    </label>
                    <select
                      value={form.estatus}
                      onChange={(e) => setForm({ ...form, estatus: e.target.value })}
                      className="input-base"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobada">Aprobada</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="rechazada">Rechazada</option>
                      <option value="en_produccion">En Producción</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>
                </div>
                <div>
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
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Condiciones de Pago
                  </label>
                  <input
                    type="text"
                    value={form.condicionesPago}
                    onChange={(e) => setForm({ ...form, condicionesPago: e.target.value })}
                    className="input-base"
                  />
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
