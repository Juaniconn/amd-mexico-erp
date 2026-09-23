'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { get, post, patch } from '@/lib/api';
import { Truck, Plus, RefreshCw, AlertCircle, Send } from 'lucide-react';

interface Embarque {
  id: string;
  folio: string;
  estatus: string;
  destinatario?: string;
  guia?: string;
  transportista?: string;
  ot?: { id: string; folio: string };
  detalles?: Array<{ descripcion: string; cantidad: number }>;
  createdAt: string;
}

export default function EmbarquesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Embarque[]>([]);
  const [ots, setOts] = useState<Array<{ id: string; folio: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    otId: '',
    destinatario: '',
    direccion: '',
    guia: '',
    transportista: '',
    notas: '',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [emb, otRes] = await Promise.all([
        get<{ data: Embarque[] }>('/api/embarques?limit=50'),
        get<{ data: Array<{ id: string; folio: string }> }>('/api/ordenes-trabajo?limit=50'),
      ]);
      setItems(emb.data || []);
      setOts(otRes.data || []);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar embarques');
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
      setSaving(true);
      setError('');
      await post('/api/embarques', {
        otId: form.otId,
        destinatario: form.destinatario || undefined,
        direccion: form.direccion || undefined,
        guia: form.guia || undefined,
        transportista: form.transportista || undefined,
        notas: form.notas || undefined,
      });
      setShowForm(false);
      setForm({
        otId: '',
        destinatario: '',
        direccion: '',
        guia: '',
        transportista: '',
        notas: '',
      });
      await load();
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear embarque');
    } finally {
      setSaving(false);
    }
  }

  async function enviar(id: string) {
    try {
      await post(`/api/embarques/${id}/enviar`);
      await load();
    } catch (err: any) {
      setError(err?.message || 'No se pudo enviar');
    }
  }

  const statusVariant = (s: string) => {
    if (s === 'ENVIADO') return 'default' as const;
    if (s === 'ENTREGADO') return 'success' as const;
    if (s === 'CANCELADO') return 'destructive' as const;
    return 'secondary' as const;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Truck className="h-6 w-6" /> Embarques
            </h1>
            <p className="text-sm text-muted-foreground">Envíos ligados a órdenes de trabajo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4 mr-1" /> Actualizar
            </Button>
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4 mr-1" /> Nuevo
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={crear} className="rounded-xl border p-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Orden de trabajo</label>
              <select
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.otId}
                onChange={(e) => setForm((f) => ({ ...f, otId: e.target.value }))}
                required
              >
                <option value="">Seleccionar OT…</option>
                {ots.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.folio}
                  </option>
                ))}
              </select>
            </div>
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Destinatario"
              value={form.destinatario}
              onChange={(e) => setForm((f) => ({ ...f, destinatario: e.target.value }))}
            />
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Transportista"
              value={form.transportista}
              onChange={(e) => setForm((f) => ({ ...f, transportista: e.target.value }))}
            />
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm sm:col-span-2"
              placeholder="Dirección"
              value={form.direccion}
              onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
            />
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Guía"
              value={form.guia}
              onChange={(e) => setForm((f) => ({ ...f, guia: e.target.value }))}
            />
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Notas"
              value={form.notas}
              onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
            />
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? '…' : 'Crear embarque'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay embarques.</p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {items.map((e) => (
                <div key={e.id} className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{e.folio}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {e.destinatario || 'Sin destinatario'}
                      </p>
                    </div>
                    <Badge variant={statusVariant(e.estatus)} className="shrink-0">
                      {e.estatus}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">OT</p>
                      {e.ot ? (
                        <button
                          className="text-primary font-medium"
                          onClick={() => router.push(`/produccion/ot/${e.ot!.id}`)}
                        >
                          {e.ot.folio}
                        </button>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Guía</p>
                      <p className="truncate">{e.guia || '—'}</p>
                    </div>
                  </div>
                  {e.estatus === 'BORRADOR' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1"
                      onClick={() => enviar(e.id)}
                    >
                      <Send className="h-3.5 w-3.5" /> Enviar (genera pedido CONTPAQi)
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Folio</th>
                    <th className="px-3 py-2">OT</th>
                    <th className="px-3 py-2">Destinatario</th>
                    <th className="px-3 py-2">Estatus</th>
                    <th className="px-3 py-2">Guía</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{e.folio}</td>
                      <td className="px-3 py-2">
                        {e.ot ? (
                          <button
                            className="text-primary hover:underline"
                            onClick={() => router.push(`/produccion/ot/${e.ot!.id}`)}
                          >
                            {e.ot.folio}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2">{e.destinatario || '—'}</td>
                      <td className="px-3 py-2">
                        <Badge variant={statusVariant(e.estatus)}>{e.estatus}</Badge>
                      </td>
                      <td className="px-3 py-2">{e.guia || '—'}</td>
                      <td className="px-3 py-2 text-right">
                        {e.estatus === 'BORRADOR' && (
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => enviar(e.id)}>
                            <Send className="h-3.5 w-3.5" /> Enviar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
