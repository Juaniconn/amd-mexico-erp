'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { get, post, del, ApiError } from '@/lib/api';

interface Cliente {
  id: string;
  codigo: string;
  razonSocial: string;
  rfc?: string;
  ciudad?: string;
  monedaPref?: string;
}

interface Proveedor {
  id: string;
  codigo: string;
  razonSocial: string;
  rfc?: string;
  ciudad?: string;
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

interface OrdenCompraProveedor {
  id: string;
  proveedorId: string;
  proveedorNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

interface ProveedorLinea {
  proveedorId: string;
  cantidad: number;
  precioUnitario: number;
  notas: string;
}

export default function ComprasPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<OrdenCompra | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [clienteId, setClienteId] = useState('');
  const [cotizacionId, setCotizacionId] = useState('');
  const [condicionesPago, setCondicionesPago] = useState('');
  const [notas, setNotas] = useState('');
  const [lineas, setLineas] = useState<ProveedorLinea[]>([
    { proveedorId: '', cantidad: 1, precioUnitario: 0, notas: '' },
  ]);

  async function loadOrdenes(p = 1, s = '') {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      const res = await get<{ data: OrdenCompra[]; meta: any }>(
        `/api/ordenes-compra?${q}`
      );
      setOrdenes(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar órdenes de compra');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrdenes(page, search);
    // Load clientes and proveedores for dropdowns
    get<{ data: Cliente[] }>('/api/clientes?limit=100')
      .then((res) => setClientes(res.data))
      .catch(() => {});
    get<{ data: Proveedor[] }>('/api/proveedores?limit=100')
      .then((res) => setProveedores(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const calcularTotales = useCallback(() => {
    const subtotal = lineas.reduce(
      (sum, l) => sum + (Number(l.precioUnitario) || 0) * (Number(l.cantidad) || 0),
      0
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  }, [lineas]);

  function openNew() {
    setEditing(null);
    setClienteId('');
    setCotizacionId('');
    setCondicionesPago('');
    setNotas('');
    setLineas([{ proveedorId: '', cantidad: 1, precioUnitario: 0, notas: '' }]);
    setError('');
    setShowModal(true);
  }

  function openEdit(o: OrdenCompra) {
    setEditing(o);
    setClienteId(o.clienteId);
    setCotizacionId(o.cotizacionId || '');
    setCondicionesPago(o.condicionesPago || '');
    setNotas(o.notas || '');
    if (o.proveedores && o.proveedores.length > 0) {
      setLineas(
        o.proveedores.map((p) => ({
          proveedorId: p.proveedorId,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          notas: p.notas || '',
        }))
      );
    } else {
      setLineas([{ proveedorId: '', cantidad: 1, precioUnitario: 0, notas: '' }]);
    }
    setError('');
    setShowModal(true);
  }

  function updateLinea(idx: number, field: keyof ProveedorLinea, value: any) {
    setLineas((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  }

  function addLinea() {
    setLineas((prev) => [
      ...prev,
      { proveedorId: '', cantidad: 1, precioUnitario: 0, notas: '' },
    ]);
  }

  function removeLinea(idx: number) {
    setLineas((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        clienteId,
        cotizacionId: cotizacionId || undefined,
        condicionesPago: condicionesPago || undefined,
        notas: notas || undefined,
        proveedores: lineas
          .filter((l) => l.proveedorId && l.cantidad > 0)
          .map((l) => ({
            proveedorId: l.proveedorId,
            cantidad: Number(l.cantidad),
            precioUnitario: Number(l.precioUnitario),
            notas: l.notas || undefined,
          })),
      };
      if (editing) {
        // Note: PUT endpoint may not exist yet, but we include the logic
        await post(`/api/ordenes-compra/${editing.id}`, payload);
      } else {
        await post('/api/ordenes-compra', payload);
      }
      setShowModal(false);
      loadOrdenes(page, search);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setError(
          'Error de validación: ' +
            (err.data?.details?.map((d: any) => d.message).join(', ') ||
              err.message)
        );
      } else {
        setError(err?.message || 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar esta orden de compra?')) return;
    try {
      setError('');
      await del(`/api/ordenes-compra/${id}`);
      loadOrdenes(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  function getProveedorNombre(proveedorId: string): string {
    const p = proveedores.find((pr) => pr.id === proveedorId);
    return p ? `${p.codigo} — ${p.razonSocial}` : proveedorId;
  }

  const { subtotal, iva, total } = calcularTotales();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compras</h1>
          <p className="text-sm text-slate-600">
            Órdenes de compra y proveedores
          </p>
        </div>
        <button
          onClick={openNew}
          disabled={clientes.length === 0 || proveedores.length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          Nueva Orden de Compra
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por folio, cliente o estatus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadOrdenes(1, search)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() => loadOrdenes(1, search)}
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
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Estatus</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            ) : ordenes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No hay órdenes de compra registradas
                </td>
              </tr>
            ) : (
              ordenes.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {o.folio}
                  </td>
                  <td className="px-4 py-3">
                    {o.razonSocial || o.clienteId}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {o.moneda === 'USD' ? '$' : '$'}
                    {Number(o.total).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge estatus={o.estatus} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button
                      onClick={() => openEdit(o)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(o.id)}
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
              Mostrando {ordenes.length} de {meta.total} órdenes
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
                onClick={() =>
                  setPage((p) => Math.min(meta.totalPages, p + 1))
                }
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
              {editing ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Cliente *
                  </label>
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
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Cotización (opcional)
                  </label>
                  <input
                    type="text"
                    value={cotizacionId}
                    onChange={(e) => setCotizacionId(e.target.value)}
                    placeholder="ID de cotización relacionada"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Condiciones de pago
                </label>
                <input
                  type="text"
                  value={condicionesPago}
                  onChange={(e) => setCondicionesPago(e.target.value)}
                  placeholder="Ej: 30 días, Contra entrega..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">
                    Líneas de proveedores *
                  </label>
                  <button
                    type="button"
                    onClick={addLinea}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    + Agregar línea
                  </button>
                </div>

                <div className="space-y-2">
                  {lineas.map((l, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <label className="mb-1 block text-xs text-slate-500">
                            Proveedor *
                          </label>
                          <select
                            required
                            value={l.proveedorId}
                            onChange={(e) =>
                              updateLinea(idx, 'proveedorId', e.target.value)
                            }
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Seleccionar proveedor...</option>
                            {proveedores.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.codigo} — {p.razonSocial}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-xs text-slate-500">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={l.cantidad}
                            onChange={(e) =>
                              updateLinea(idx, 'cantidad', Number(e.target.value))
                            }
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-xs text-slate-500">
                            Precio unitario
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={l.precioUnitario}
                            onChange={(e) =>
                              updateLinea(
                                idx,
                                'precioUnitario',
                                Number(e.target.value)
                              )
                            }
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-xs text-slate-500">
                            Subtotal
                          </label>
                          <p className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1.5 text-sm font-medium text-slate-700">
                            ${' '}
                            {(
                              (Number(l.precioUnitario) || 0) *
                              (Number(l.cantidad) || 0)
                            ).toLocaleString('es-MX', {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <label className="mb-1 block text-xs text-slate-500">
                            &nbsp;
                          </label>
                          <button
                            type="button"
                            onClick={() => removeLinea(idx)}
                            disabled={lineas.length <= 1}
                            className="w-full rounded-md border border-red-300 px-2 py-1.5 text-xs text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="mb-1 block text-xs text-slate-500">
                          Notas (opcional)
                        </label>
                        <input
                          type="text"
                          value={l.notas}
                          onChange={(e) =>
                            updateLinea(idx, 'notas', e.target.value)
                          }
                          placeholder="Observaciones de la línea..."
                          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-900">Subtotal</p>
                  <p className="text-lg font-bold text-blue-900">
                    $ {subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-900">IVA (16%)</p>
                  <p className="text-lg font-bold text-blue-900">
                    $ {iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-900">Total</p>
                  <p className="text-lg font-bold text-blue-900">
                    $ {total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Notas generales
                </label>
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
                  {saving
                    ? 'Guardando...'
                    : editing
                    ? 'Actualizar'
                    : 'Crear Orden'}
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
    pendiente: 'bg-yellow-100 text-yellow-700',
    aprobada: 'bg-blue-100 text-blue-700',
    en_produccion: 'bg-purple-100 text-purple-700',
    completada: 'bg-green-100 text-green-700',
    cancelada: 'bg-red-100 text-red-700',
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[estatus] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {estatus}
    </span>
  );
}
