'use client';

import { useEffect, useState, FormEvent } from 'react';
import { get, post, put, del, ApiError } from '@/lib/api';

interface Cliente {
  id: string;
  codigo: string;
  razonSocial: string;
  rfc?: string;
  ciudad?: string;
  estado?: string;
  email?: string;
  telefono?: string;
  creditoLimite?: number | string;
  monedaPref: string;
}

interface DetalleCotizacion {
  piezaNombre: string;
  piezaDescripcion?: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  tiempoEstimado?: number;
  procesoRequerido?: string;
  notas?: string;
}

interface Cotizacion {
  id: string;
  folio: string;
  clienteId: string;
  razonSocial?: string;
  ciudad?: string;
  moneda: 'MXN' | 'USD';
  tipoCambio?: number | null;
  subtotal: number;
  iva: number;
  total: number;
  estatus: string;
  validez: number;
  detalles?: DetalleCotizacion[];
  createdAt: string;
}

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cotizacion | null>(null);

  // Form state for cotización
  const [clienteId, setClienteId] = useState('');
  const [validez, setValidez] = useState(30);
  const [tipoCambio, setTipoCambio] = useState('');
  const [notas, setNotas] = useState('');
  const [detalles, setDetalles] = useState<DetalleCotizacion[]>([
    { piezaNombre: '', cantidad: 1, unidad: 'pz', precioUnitario: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  async function loadCotizaciones(p = 1, s = '') {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      const res = await get<{ data: Cotizacion[]; meta: any }>(`/api/cotizaciones?${q}`);
      setCotizaciones(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCotizaciones(page, search);
    get<{ data: Cliente[] }>('/api/clientes?limit=100')
      .then((res) => setClientes(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function openNew() {
    setEditing(null);
    setClienteId('');
    setValidez(30);
    setTipoCambio('');
    setNotas('');
    setDetalles([{ piezaNombre: '', cantidad: 1, unidad: 'pz', precioUnitario: 0 }]);
    setError('');
    setShowModal(true);
  }

  function openEdit(c: Cotizacion) {
    setEditing(c);
    setClienteId(c.clienteId);
    setValidez(c.validez);
    setTipoCambio(c.tipoCambio ? String(c.tipoCambio) : '');
    setNotas('');
    setDetalles(c.detalles && c.detalles.length > 0
      ? c.detalles.map((d) => ({ ...d }))
      : [{ piezaNombre: '', cantidad: 1, unidad: 'pz', precioUnitario: 0 }]);
    setError('');
    setShowModal(true);
  }

  function updateDetalle(idx: number, field: keyof DetalleCotizacion, value: any) {
    setDetalles((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  }

  function addDetalle() {
    setDetalles((prev) => [...prev, { piezaNombre: '', cantidad: 1, unidad: 'pz', precioUnitario: 0 }]);
  }

  function removeDetalle(idx: number) {
    setDetalles((prev) => prev.filter((_, i) => i !== idx));
  }

  function calcSubtotal() {
    return detalles.reduce((sum, d) => sum + (Number(d.precioUnitario) || 0) * (Number(d.cantidad) || 0), 0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        clienteId,
        validez: Number(validez),
        tipoCambio: tipoCambio ? Number(tipoCambio) : null,
        notas: notas || undefined,
        detalles: detalles
          .filter((d) => d.piezaNombre && d.cantidad > 0)
          .map((d) => ({
            ...d,
            cantidad: Number(d.cantidad),
            precioUnitario: Number(d.precioUnitario),
            tiempoEstimado: d.tiempoEstimado ? Number(d.tiempoEstimado) : undefined,
          })),
      };
      if (editing) {
        await put(`/api/cotizaciones/${editing.id}`, payload);
      } else {
        await post('/api/cotizaciones', payload);
      }
      setShowModal(false);
      loadCotizaciones(page, search);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setError('Error de validación: ' + err.data?.details?.map((d: any) => d.message).join(', '));
      } else {
        setError(err?.message || 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar esta cotización?')) return;
    try {
      setError('');
      await del(`/api/cotizaciones/${id}`);
      loadCotizaciones(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  async function handleStatus(id: string, estatus: string) {
    try {
      setError('');
      await put(`/api/cotizaciones/${id}`, { estatus });
      loadCotizaciones(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar estatus');
    }
  }

  const ivaRate = 0.16;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cotizaciones</h1>
          <p className="text-sm text-slate-600">Gestión de RFQ y cotizaciones de manufactura</p>
        </div>
        <button
          onClick={openNew}
          disabled={clientes.length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          Nueva Cotización
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por folio, cliente o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadCotizaciones(1, search)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() => loadCotizaciones(1, search)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Buscar
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Moneda</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Estatus</th>
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
            ) : cotizaciones.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No hay cotizaciones registradas
                </td>
              </tr>
            ) : (
              cotizaciones.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.folio}</td>
                  <td className="px-4 py-3">{c.razonSocial || c.clienteId}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{c.moneda}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {c.moneda === 'USD' ? '$' : '$'}
                    {Number(c.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge estatus={c.estatus} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Editar
                    </button>
                    {c.estatus === 'borrador' && (
                      <button
                        onClick={() => handleStatus(c.id, 'enviada')}
                        className="rounded-md border border-green-300 px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50"
                      >
                        Enviar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {meta && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>
              Mostrando {cotizaciones.length} de {meta.total} cotizaciones
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-slate-300 px-3 py-1 transition hover:bg-white disabled:opacity-50"
              >
                Anterior
              </button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {editing ? 'Editar Cotización' : 'Nueva Cotización'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Cliente *</label>
                  <select
                    required
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo} — {c.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Validez (días)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={validez}
                    onChange={(e) => setValidez(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tipo de cambio (opcional, para USD)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={tipoCambio}
                  onChange={(e) => setTipoCambio(e.target.value)}
                  placeholder="Ej: 17.50"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">Detalle de piezas</label>
                  <button
                    type="button"
                    onClick={addDetalle}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    + Agregar línea
                  </button>
                </div>

                <div className="space-y-2">
                  {detalles.map((d, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <label className="mb-1 block text-xs text-slate-500">Pieza *</label>
                          <input
                            type="text"
                            required
                            value={d.piezaNombre}
                            onChange={(e) => updateDetalle(idx, 'piezaNombre', e.target.value)}
                            placeholder="Nombre de la pieza"
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-xs text-slate-500">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={d.cantidad}
                            onChange={(e) => updateDetalle(idx, 'cantidad', Number(e.target.value))}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="mb-1 block text-xs text-slate-500">Unidad</label>
                          <input
                            type="text"
                            value={d.unidad}
                            onChange={(e) => updateDetalle(idx, 'unidad', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="mb-1 block text-xs text-slate-500">Precio unitario</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={d.precioUnitario}
                            onChange={(e) => updateDetalle(idx, 'precioUnitario', Number(e.target.value))}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="mb-1 block text-xs text-slate-500">&nbsp;</label>
                          <button
                            type="button"
                            onClick={() => removeDetalle(idx)}
                            disabled={detalles.length <= 1}
                            className="w-full rounded-md border border-red-300 px-2 py-1.5 text-xs text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs text-slate-500">Tiempo estimado (hrs)</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={d.tiempoEstimado || ''}
                            onChange={(e) => updateDetalle(idx, 'tiempoEstimado', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-slate-500">Proceso requerido</label>
                          <input
                            type="text"
                            value={d.procesoRequerido || ''}
                            onChange={(e) => updateDetalle(idx, 'procesoRequerido', e.target.value)}
                            placeholder="CNC, láser, torno..."
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-900">Subtotal</p>
                  <p className="text-lg font-bold text-blue-900">
                    $ {calcSubtotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-900">IVA (16%)</p>
                  <p className="text-lg font-bold text-blue-900">
                    $ {(calcSubtotal() * ivaRate).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-900">Total</p>
                  <p className="text-lg font-bold text-blue-900">
                    $ {(calcSubtotal() * (1 + ivaRate)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Notas</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Condiciones, observaciones..."
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

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
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ estatus }: { estatus: string }) {
  const styles: Record<string, string> = {
    borrador: 'bg-slate-100 text-slate-700',
    enviada: 'bg-blue-100 text-blue-700',
    aceptada: 'bg-green-100 text-green-700',
    rechazada: 'bg-red-100 text-red-700',
    cancelada: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[estatus] || 'bg-slate-100 text-slate-700'}`}>
      {estatus}
    </span>
  );
}
