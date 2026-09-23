'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { createIngenieriaProyecto, get } from '@/lib/api';
import { ArrowLeft, Save, AlertCircle, Wrench } from 'lucide-react';

interface ClienteOpt {
  id: string;
  codigo: string;
  razonSocial: string;
}
interface SucursalOpt {
  id: string;
  codigo: string;
  nombre: string;
}

export default function NuevoProyectoIngenieriaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [clientes, setClientes] = useState<ClienteOpt[]>([]);
  const [sucursales, setSucursales] = useState<SucursalOpt[]>([]);
  const [form, setForm] = useState({
    clienteId: '',
    sucursalId: '',
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaEstimada: '',
    notas: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const [cli, su] = await Promise.all([
          get<{ data: ClienteOpt[] }>('/api/clientes?limit=100'),
          get<SucursalOpt[]>('/api/auth/sucursales'),
        ]);
        setClientes(cli.data || []);
        setSucursales(Array.isArray(su) ? su : []);
        const filter = localStorage.getItem('sucursalFilter');
        const userSuc = localStorage.getItem('sucursalId');
        if (filter && filter !== 'all') {
          setForm((f) => ({ ...f, sucursalId: filter }));
        } else if (userSuc) {
          setForm((f) => ({ ...f, sucursalId: userSuc }));
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const proyecto = await createIngenieriaProyecto({
        clienteId: form.clienteId,
        sucursalId: form.sucursalId || undefined,
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        fechaInicio: form.fechaInicio || undefined,
        fechaEstimada: form.fechaEstimada || undefined,
        notas: form.notas || undefined,
      });
      router.push(`/ingenieria/${proyecto.id}`);
    } catch (err: any) {
      setError(err?.message || 'Error al crear el proyecto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push('/ingenieria')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nuevo Proyecto de Ingeniería</h1>
            <p className="text-sm text-muted-foreground">Alta de proyecto para diseño y cotización</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold">Datos del proyecto</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Cliente *
                </label>
                <select
                  required
                  className="input-base"
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                >
                  <option value="">Seleccionar…</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} — {c.razonSocial}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Sucursal
                </label>
                <select
                  className="input-base"
                  value={form.sucursalId}
                  onChange={(e) => setForm({ ...form, sucursalId: e.target.value })}
                >
                  <option value="">—</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.codigo} — {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-12">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Nombre *
                </label>
                <input
                  required
                  className="input-base"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre del proyecto"
                />
              </div>
              <div className="sm:col-span-12">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  className="input-base resize-none"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  className="input-base"
                  value={form.fechaInicio}
                  onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                />
              </div>
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Fecha estimada
                </label>
                <input
                  type="date"
                  className="input-base"
                  value={form.fechaEstimada}
                  onChange={(e) => setForm({ ...form, fechaEstimada: e.target.value })}
                />
              </div>
              <div className="sm:col-span-12">
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Notas
                </label>
                <textarea
                  rows={2}
                  className="input-base resize-none"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/ingenieria')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Guardando…' : 'Crear proyecto'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
