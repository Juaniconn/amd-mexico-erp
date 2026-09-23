'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { get, post, patch } from '@/lib/api';
import { ArrowLeftRight, Plus, RefreshCw, AlertCircle } from 'lucide-react';

interface Sucursal {
  id: string;
  codigo: string;
  nombre: string;
}
interface Material {
  id: string;
  codigo: string;
  nombre: string;
}
interface Transferencia {
  id: string;
  folio: string;
  estatus: string;
  origen: Sucursal;
  destino: Sucursal;
  detalles: Array<{ material: Material; cantidad: number }>;
}

export default function TransferenciasPage() {
  const [items, setItems] = useState<Transferencia[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    origenId: '',
    destinoId: '',
    notas: '',
    materialId: '',
    cantidad: 1,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [tr, su, mats] = await Promise.all([
        get<{ data: Transferencia[] }>('/api/transferencias?limit=50'),
        get<Sucursal[]>('/api/auth/sucursales'),
        get<{ data: Material[] }>('/api/inventario/materiales?limit=100'),
      ]);
      setItems(tr.data || []);
      setSucursales(Array.isArray(su) ? su : []);
      setMateriales(mats.data || []);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar transferencias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    try {
      await post('/api/transferencias', {
        origenId: form.origenId,
        destinoId: form.destinoId,
        notas: form.notas || undefined,
        detalles: [{ materialId: form.materialId, cantidad: Number(form.cantidad) }],
      });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear');
    }
  }

  async function setEstatus(id: string, estatus: string) {
    try {
      await patch(`/api/transferencias/${id}/estatus`, { estatus });
      load();
    } catch (err: any) {
      setError(err?.message || 'No se pudo cambiar estatus');
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transferencias</h1>
            <p className="text-sm text-muted-foreground">
              Mueve inventario entre Juárez, Guadalajara y El Paso
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Actualizar
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" /> Nueva
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={crear} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                required
                className="input-base"
                value={form.origenId}
                onChange={(e) => setForm({ ...form, origenId: e.target.value })}
              >
                <option value="">Origen…</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.codigo} — {s.nombre}
                  </option>
                ))}
              </select>
              <select
                required
                className="input-base"
                value={form.destinoId}
                onChange={(e) => setForm({ ...form, destinoId: e.target.value })}
              >
                <option value="">Destino…</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.codigo} — {s.nombre}
                  </option>
                ))}
              </select>
              <select
                required
                className="input-base"
                value={form.materialId}
                onChange={(e) => setForm({ ...form, materialId: e.target.value })}
              >
                <option value="">Material…</option>
                {materiales.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.codigo} — {m.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0.001}
                step="any"
                required
                className="input-base"
                value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear borrador</Button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <ArrowLeftRight className="mx-auto mb-2 h-10 w-10 opacity-40" />
            Sin transferencias aún
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {items.map((t) => (
              <li key={t.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {t.folio}{' '}
                    <Badge variant="secondary" className="text-[10px]">
                      {t.estatus}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.origen?.codigo} → {t.destino?.codigo} ·{' '}
                    {t.detalles?.map((d) => `${d.material?.codigo}×${d.cantidad}`).join(', ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {t.estatus === 'PENDIENTE' && (
                    <Button size="sm" variant="outline" onClick={() => setEstatus(t.id, 'ENVIADA')}>
                      Enviar
                    </Button>
                  )}
                  {(t.estatus === 'ENVIADA' || t.estatus === 'PENDIENTE') && (
                    <Button size="sm" onClick={() => setEstatus(t.id, 'RECIBIDA')}>
                      Recibir (mueve stock)
                    </Button>
                  )}
                  {t.estatus !== 'RECIBIDA' && t.estatus !== 'CANCELADA' && (
                    <Button size="sm" variant="destructive" onClick={() => setEstatus(t.id, 'CANCELADA')}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
