'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { post } from '@/lib/api';
import { ArrowLeft, Save, AlertCircle, Package } from 'lucide-react';

const CATEGORIAS = ['Materia Prima', 'Herramienta', 'Consumible', 'Refacción', 'Producto Terminado'];
const UNIDADES = ['pieza', 'kg', 'm', 'litro', 'set', 'caja', 'par'];

export default function NuevoMaterialPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: CATEGORIAS[0],
    tipo: 'Material',
    unidad: 'pieza',
    stockActual: 0,
    stockMinimo: 10,
    ubicacion: '',
    costoUnitario: 0,
    moneda: 'MXN',
    notas: '',
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
        tipo: form.tipo,
        unidad: form.unidad,
        stockActual: Number(form.stockActual),
        stockMinimo: Number(form.stockMinimo),
        ubicacion: form.ubicacion || undefined,
        costoUnitario: Number(form.costoUnitario),
        moneda: form.moneda,
        notas: form.notas || undefined,
      });
      router.push('/inventario');
    } catch (err: any) {
      setError(err?.message || 'Error al crear el material');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push('/inventario')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nuevo Material</h1>
            <p className="text-sm text-muted-foreground">Complete los datos del material</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold">Información General</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Código *</label>
                <input type="text" required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="input-base" placeholder="MAT-001" />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Categoría *</label>
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="input-base">
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Tipo</label>
                <input type="text" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="input-base" placeholder="Material" />
              </div>
              <div className="sm:col-span-12">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Nombre *</label>
                <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-base" placeholder="Nombre del material" />
              </div>
              <div className="sm:col-span-12">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="input-base resize-none" placeholder="Descripción detallada del material" />
              </div>
            </div>
          </div>

          {/* Stock y Ubicación */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold">Stock y Ubicación</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Stock Actual</label>
                <input type="number" min={0} value={form.stockActual} onChange={(e) => setForm({ ...form, stockActual: Number(e.target.value) })} className="input-base" />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Stock Mínimo</label>
                <input type="number" min={0} value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })} className="input-base" />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Unidad</label>
                <select value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} className="input-base">
                  {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Ubicación</label>
                <input type="text" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} className="input-base" placeholder="Almacén A, Estante 3" />
              </div>
            </div>
          </div>

          {/* Costos */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold">Costos</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Costo Unitario</label>
                <input type="text" value={form.costoUnitario || ''} onChange={(e) => setForm({ ...form, costoUnitario: parseFloat(e.target.value) || 0 })} className="input-base" placeholder="$ 0.00" />
              </div>
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Moneda</label>
                <select value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })} className="input-base">
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="USD">USD - Dólar Americano</option>
                </select>
              </div>
              <div className="sm:col-span-12">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Notas</label>
                <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={3} className="input-base resize-none" placeholder="Observaciones adicionales" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => router.push('/inventario')}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="gap-2" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Crear Material'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
