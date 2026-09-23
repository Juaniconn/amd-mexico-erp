'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { get, post, patch } from '@/lib/api';
import { ArrowLeft, Save, AlertCircle, ShoppingCart, Plus, X } from 'lucide-react';

interface ProveedorOpt { id: string; razonSocial: string }
interface MaterialOpt { id: string; codigo: string; nombre?: string; descripcion?: string }

interface DetalleForm {
  materialId: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export default function NuevaOrdenCompraPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [proveedores, setProveedores] = useState<ProveedorOpt[]>([]);
  const [materiales, setMateriales] = useState<MaterialOpt[]>([]);

  const [form, setForm] = useState({
    proveedorId: '',
    moneda: 'MXN',
    condicionesPago: '',
    fechaEntrega: '',
    notas: '',
    estatus: 'BORRADOR',
  });

  const [detalles, setDetalles] = useState<DetalleForm[]>([
    { materialId: '', descripcion: '', cantidad: 1, precioUnitario: 0 },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const [prov, mats] = await Promise.all([
          get<{ data: ProveedorOpt[] }>('/api/proveedores?limit=100'),
          get<{ data: MaterialOpt[] }>('/api/inventario/materiales?limit=200'),
        ]);
        setProveedores(prov.data || (prov as any) || []);
        setMateriales(mats.data || (mats as any) || []);
      } catch {
        try {
          const mats2 = await get<{ data: MaterialOpt[] }>('/api/inventario?limit=200');
          setMateriales(mats2.data || []);
        } catch { /* ignore */ }
      }
    })();
  }, []);

  function addDetalle() {
    setDetalles([...detalles, { materialId: '', descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  }

  function removeDetalle(index: number) {
    if (detalles.length > 1) setDetalles(detalles.filter((_, i) => i !== index));
  }

  function updateDetalle(index: number, field: keyof DetalleForm, value: string | number) {
    const updated = [...detalles];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'materialId') {
      const mat = materiales.find((m) => m.id === value);
      if (mat) {
        updated[index].descripcion = mat.nombre || mat.descripcion || mat.codigo || '';
      }
    }
    setDetalles(updated);
  }

  function calculateTotals() {
    const subtotal = detalles.reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0);
    const impuestos = subtotal * 0.16;
    return { subtotal, impuestos, total: subtotal + impuestos };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    if (!form.proveedorId) {
      setError('Selecciona un proveedor');
      setSaving(false);
      return;
    }
    if (detalles.some((d) => !d.materialId)) {
      setError('Cada línea debe tener un material del inventario');
      setSaving(false);
      return;
    }
    try {
      const created = await post<any>('/api/compras/ordenes', {
        proveedorId: form.proveedorId,
        moneda: form.moneda,
        condicionesPago: form.condicionesPago || undefined,
        fechaEntrega: form.fechaEntrega || undefined,
        notas: form.notas || undefined,
        detalles: detalles.map((d) => ({
          materialId: d.materialId,
          descripcion: d.descripcion,
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
        })),
      });
      if (form.estatus && form.estatus !== 'BORRADOR' && created?.id) {
        await patch(`/api/compras/ordenes/${created.id}/estatus`, { estatus: form.estatus });
      }
      router.push('/compras');
    } catch (err: any) {
      setError(err?.message || 'Error al crear la orden de compra');
    } finally {
      setSaving(false);
    }
  }

  const { subtotal, impuestos, total } = calculateTotals();
  const provList = Array.isArray(proveedores) ? proveedores : [];
  const matList = Array.isArray(materiales) ? materiales : [];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push('/compras')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nueva Orden de Compra</h1>
            <p className="text-sm text-muted-foreground">
              Compra de materiales ligada a inventario (entrada al recibir)
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold">Información General</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Proveedor *
                </label>
                <select
                  required
                  value={form.proveedorId}
                  onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
                  className="input-base"
                >
                  <option value="">Seleccionar…</option>
                  {provList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.razonSocial}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
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
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Estatus inicial
                </label>
                <select
                  value={form.estatus}
                  onChange={(e) => setForm({ ...form, estatus: e.target.value })}
                  className="input-base"
                >
                  <option value="BORRADOR">Borrador</option>
                  <option value="ENVIADA">Enviada</option>
                  <option value="APROBADA">Aprobada</option>
                  <option value="RECIBIDA">Recibida (entra stock)</option>
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Fecha entrega
                </label>
                <input
                  type="date"
                  value={form.fechaEntrega}
                  onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
                  className="input-base"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Condiciones de pago
                </label>
                <input
                  type="text"
                  value={form.condicionesPago}
                  onChange={(e) => setForm({ ...form, condicionesPago: e.target.value })}
                  className="input-base"
                  placeholder="30 días"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Notas
                </label>
                <input
                  type="text"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  className="input-base"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Materiales</h2>
              <Button type="button" variant="outline" size="sm" onClick={addDetalle} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Línea
              </Button>
            </div>
            <div className="space-y-3">
              {detalles.map((d, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-end">
                  <div className="sm:col-span-5">
                    <label className="mb-1 block text-[10px] uppercase text-muted-foreground">Material *</label>
                    <select
                      required
                      value={d.materialId}
                      onChange={(e) => updateDetalle(i, 'materialId', e.target.value)}
                      className="input-base"
                    >
                      <option value="">Seleccionar…</option>
                      {matList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.codigo} — {m.nombre || m.descripcion || ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[10px] uppercase text-muted-foreground">Cantidad</label>
                    <input
                      type="number"
                      min={0.001}
                      step="any"
                      required
                      value={d.cantidad}
                      onChange={(e) => updateDetalle(i, 'cantidad', Number(e.target.value))}
                      className="input-base"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-[10px] uppercase text-muted-foreground">Precio unit.</label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      required
                      value={d.precioUnitario}
                      onChange={(e) => updateDetalle(i, 'precioUnitario', Number(e.target.value))}
                      className="input-base"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeDetalle(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-3 text-right text-sm">
              <p>Subtotal: <strong>{subtotal.toFixed(2)}</strong></p>
              <p>IVA 16%: <strong>{impuestos.toFixed(2)}</strong></p>
              <p className="text-base">Total: <strong>{total.toFixed(2)} {form.moneda}</strong></p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/compras')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Guardando…' : 'Crear orden'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
