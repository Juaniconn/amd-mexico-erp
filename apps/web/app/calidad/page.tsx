'use client';

import { useEffect, useState, useCallback } from 'react';
import { get, post, put, del } from '@/lib/api';

interface Operacion {
  id: string;
  nombre?: string;
  proceso?: string;
  estatus?: string;
  wo?: {
    id: string;
    piezaNombre?: string;
    codigo?: string;
  };
  maquina?: {
    nombre: string;
  };
}

interface Inspector {
  id: string;
  nombre: string;
  apellido: string;
}

interface CalidadItem {
  id: string;
  resultado: string;
  defectos?: string;
  observaciones?: string;
  operacionId: string;
  ordenTrabajoId?: string;
  operacion?: Operacion;
  inspector?: Inspector | null;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CalidadFormData {
  operacionId: string;
  ordenTrabajoId: string;
  resultado: string;
  defectos: string;
  observaciones: string;
}

const RESULTADOS = [
  { value: 'aprobado', label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  { value: 'rechazado', label: 'Rechazado', color: 'bg-red-100 text-red-800' },
  { value: 'rework', label: 'Rework', color: 'bg-yellow-100 text-yellow-800' },
];

function getResultadoBadge(resultado: string) {
  const r = RESULTADOS.find((x) => x.value === resultado);
  const color = r?.color || 'bg-slate-100 text-slate-800';
  const label = r?.label || resultado;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function CalidadPage() {
  const [items, setItems] = useState<CalidadItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [resultadoFilter, setResultadoFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CalidadItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);

  const [form, setForm] = useState<CalidadFormData>({
    operacionId: '',
    ordenTrabajoId: '',
    resultado: 'aprobado',
    defectos: '',
    observaciones: '',
  });

  const loadData = useCallback(async (p = 1, s = '', r = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', String(limit));
      if (s) q.set('search', s);
      if (r) q.set('resultado', r);
      const res = await get<{ data: CalidadItem[]; meta: Meta }>(`/api/calidad?${q}`);
      setItems(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar los registros de calidad');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadData(page, search, resultadoFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    async function loadOperaciones() {
      try {
        const q = new URLSearchParams();
        q.set('limit', '100');
        const res = await get<{ data: Operacion[] }>(`/api/operaciones?${q}`);
        setOperaciones(res.data);
      } catch {
        // silent
      }
    }
    if (showModal) {
      loadOperaciones();
    }
  }, [showModal]);

  function handleSearch() {
    setPage(1);
    loadData(1, search, resultadoFilter);
  }

  function handleResultadoChange(value: string) {
    setResultadoFilter(value);
    setPage(1);
    loadData(1, search, value);
  }

  function openNew() {
    setEditing(null);
    setForm({
      operacionId: '',
      ordenTrabajoId: '',
      resultado: 'aprobado',
      defectos: '',
      observaciones: '',
    });
    setShowModal(true);
  }

  function openEdit(item: CalidadItem) {
    setEditing(item);
    setForm({
      operacionId: item.operacionId || '',
      ordenTrabajoId: item.ordenTrabajoId || '',
      resultado: item.resultado || 'aprobado',
      defectos: item.defectos || '',
      observaciones: item.observaciones || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload: any = {
        operacionId: form.operacionId,
        resultado: form.resultado,
        defectos: form.defectos || undefined,
        observaciones: form.observaciones || undefined,
      };
      if (form.ordenTrabajoId) {
        payload.ordenTrabajoId = form.ordenTrabajoId;
      }

      if (editing) {
        await put(`/api/calidad/${editing.id}`, {
          resultado: form.resultado,
          defectos: form.defectos || undefined,
          observaciones: form.observaciones || undefined,
        });
        setSuccess('Registro actualizado correctamente');
      } else {
        await post('/api/calidad', payload);
        setSuccess('Registro creado correctamente');
      }
      setShowModal(false);
      loadData(page, search, resultadoFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el registro');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar este registro de calidad?')) return;
    try {
      setError('');
      await del(`/api/calidad/${id}`);
      setSuccess('Registro eliminado correctamente');
      loadData(page, search, resultadoFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar el registro');
    }
  }

  function getOperacionLabel(item: CalidadItem) {
    if (item.operacion) {
      const nombre = item.operacion.proceso || item.operacion.nombre || 'Sin nombre';
      const pieza = item.operacion.wo?.piezaNombre || '';
      return (
        <div>
          <div className="font-medium text-slate-900">{nombre}</div>
          {pieza && <div className="text-xs text-slate-500">{pieza}</div>}
        </div>
      );
    }
    return <span className="text-slate-400">Sin operación</span>;
  }

  function getInspectorName(item: CalidadItem) {
    if (item.inspector) {
      return `${item.inspector.nombre} ${item.inspector.apellido}`;
    }
    return '-';
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Control de Calidad</h1>
          <p className="text-sm text-slate-600">Gestión de inspecciones y resultados</p>
        </div>
        <button
          onClick={openNew}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Nuevo Registro
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar por defectos o pieza..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          value={resultadoFilter}
          onChange={(e) => handleResultadoChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos los resultados</option>
          {RESULTADOS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Buscar
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Operación</th>
                <th className="px-4 py-3">Pieza</th>
                <th className="px-4 py-3">Resultado</th>
                <th className="px-4 py-3">Defectos</th>
                <th className="px-4 py-3">Inspector</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Cargando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No hay registros de calidad
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{getOperacionLabel(item)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.operacion?.wo?.piezaNombre || '-'}
                    </td>
                    <td className="px-4 py-3">{getResultadoBadge(item.resultado)}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                      {item.defectos || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{getInspectorName(item)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Mostrando {items.length} de {meta.total} registros
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-slate-300 px-3 py-1 transition hover:bg-white disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="flex items-center px-2">
                Página {meta.page} de {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="rounded-md border border-slate-300 px-3 py-1 transition hover:bg-white disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {editing ? 'Editar Registro de Calidad' : 'Nuevo Registro de Calidad'}
            </h2>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Operación *
                  </label>
                  <select
                    required
                    value={form.operacionId}
                    onChange={(e) => setForm({ ...form, operacionId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Seleccionar operación...</option>
                    {operaciones.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.proceso || op.nombre || op.id} — {op.wo?.piezaNombre || op.maquina?.nombre || ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Resultado *
                </label>
                <select
                  required
                  value={form.resultado}
                  onChange={(e) => setForm({ ...form, resultado: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {RESULTADOS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Defectos
                </label>
                <input
                  type="text"
                  value={form.defectos}
                  onChange={(e) => setForm({ ...form, defectos: e.target.value })}
                  maxLength={500}
                  placeholder="Describa los defectos encontrados..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Observaciones
                </label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  rows={3}
                  maxLength={1000}
                  placeholder="Observaciones adicionales..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting
                    ? 'Guardando...'
                    : editing
                    ? 'Actualizar'
                    : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
