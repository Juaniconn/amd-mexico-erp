'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { get, post, put, del, ApiError } from '@/lib/api';
import type { Venta, VentaItem, VentaListResponse, Cliente, Sucursal } from '@/types';

interface VentaItemForm {
  piezaNombre: string;
  piezaDescripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  notas: string;
}

const emptyItem = (): VentaItemForm => ({
  piezaNombre: '',
  piezaDescripcion: '',
  cantidad: 1,
  unidad: 'pz',
  precioUnitario: 0,
  notas: '',
});

const IVA_RATE = 0.16;

const ESTATUS_OPTIONS = [
  { value: 'COTIZACION', label: 'Cotización' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'APROBADA', label: 'Aprobada' },
  { value: 'EN_PRODUCCION', label: 'En Producción' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [meta, setMeta] = useState<VentaListResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Venta | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [clienteId, setClienteId] = useState('');
  const [sucursalId, setSucursalId] = useState('');
  const [condicionesPago, setCondicionesPago] = useState('');
  const [notas, setNotas] = useState('');
  const [moneda, setMoneda] = useState<'MXN' | 'USD'>('MXN');
  const [tipoCambio, setTipoCambio] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [items, setItems] = useState<VentaItemForm[]>([emptyItem()]);
  const [estatus, setEstatus] = useState('COTIZACION');

  const loadVentas = useCallback(async (p = 1, s = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      const res = await get<VentaListResponse>(`/api/ventas?${q}`);
      setVentas(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVentas(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    Promise.all([
      get<Cliente[]>('/api/clientes?limit=100'),
      get<Sucursal[]>('/api/configuracion/sucursales'),
    ])
      .then(([c, s]) => {
        setClientes(c);
        setSucursales(s);
      })
      .catch(() => {});
  }, []);

  function openNew() {
    setEditing(null);
    setClienteId('');
    setSucursalId('');
    setCondicionesPago('');
    setNotas('');
    setMoneda('MXN');
    setTipoCambio('');
    setFechaEntrega('');
    setItems([emptyItem()]);
    setEstatus('COTIZACION');
    setError('');
    setShowModal(true);
  }

  function openEdit(v: Venta) {
    setEditing(v);
    setClienteId(v.clienteId);
    setSucursalId(v.sucursalId || '');
    setCondicionesPago(v.condicionesPago || '');
    setNotas(v.notas || '');
    setMoneda(v.moneda || 'MXN');
    setTipoCambio(v.tipoCambio ? String(v.tipoCambio) : '');
    setFechaEntrega(v.fechaEntrega ? v.fechaEntrega.slice(0, 10) : '');
    setEstatus(v.estatus);
    setItems(
      v.items && v.items.length > 0
        ? v.items.map((it) => ({
            piezaNombre: it.piezaNombre,
            piezaDescripcion: it.piezaDescripcion || '',
            cantidad: it.cantidad,
            unidad: it.unidad,
            precioUnitario: Number(it.precioUnitario) || 0,
            notas: it.notas || '',
          }))
        : [emptyItem()]
    );
    setError('');
    setShowModal(true);
  }

  function updateItem(idx: number, field: keyof VentaItemForm, value: string | number) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(idx: number) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function calcSubtotal() {
    return items.reduce(
      (sum, it) => sum + (Number(it.precioUnitario) || 0) * (Number(it.cantidad) || 0),
      0
    );
  }

  function calcIva() {
    return calcSubtotal() * IVA_RATE;
  }

  function calcTotal() {
    return calcSubtotal() + calcIva();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        clienteId,
        sucursalId: sucursalId || undefined,
        condicionesPago: condicionesPago || undefined,
        notas: notas || undefined,
        moneda,
        tipoCambio: tipoCambio ? Number(tipoCambio) : undefined,
        fechaEntrega: fechaEntrega || undefined,
        ...(editing ? { estatus } : {}),
        items: items
          .filter((it) => it.piezaNombre && it.cantidad > 0)
          .map((it) => ({
            piezaNombre: it.piezaNombre,
            piezaDescripcion: it.piezaDescripcion || undefined,
            cantidad: Number(it.cantidad),
            unidad: it.unidad,
            precioUnitario: Number(it.precioUnitario),
            notas: it.notas || undefined,
          })),
      };

      if (editing) {
        await put(`/api/ventas/${editing.id}`, payload);
        setSuccess('Venta actualizada correctamente');
      } else {
        await post('/api/ventas', payload);
        setSuccess('Venta creada correctamente');
      }
      setShowModal(false);
      loadVentas(page, search);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setError(
          'Error de validación: ' + (err.data?.details?.map((d: any) => d.message).join(', ') || '')
        );
      } else {
        setError(err?.message || 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar esta venta?')) return;
    try {
      setError('');
      await del(`/api/ventas/${id}`);
      setSuccess('Venta eliminada correctamente');
      loadVentas(page, search);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  function handleSearch() {
    setPage(1);
    loadVentas(1, search);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
          <p className="text-sm text-slate-600">Pedidos de venta y cotizaciones</p>
        </div>
        <button
          onClick={openNew}
          disabled={clientes.length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          Nueva Venta
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por folio o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Buscar
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
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No hay ventas registradas
                </td>
              </tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{v.folio}</td>
                  <td className="px-4 py-3">
                    {v.cliente?.razonSocial || v.clienteId}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(v.fecha).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {v.moneda === 'USD' ? '$' : '$'}
                    {Number(v.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-slate-400">{v.moneda}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge estatus={v.estatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(v)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
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

        {meta && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>
              Mostrando {ventas.length} de {meta.total} ventas
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
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {editing ? 'Editar Venta' : 'Nueva Venta'}
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
                    Sucursal
                  </label>
                  <select
                    value={sucursalId}
                    onChange={(e) => setSucursalId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Seleccionar sucursal...</option>
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.codigo} — {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Moneda
                  </label>
                  <select
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value as 'MXN' | 'USD')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Tipo de cambio
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={tipoCambio}
                    onChange={(e) => setTipoCambio(e.target.value)}
                    placeholder={moneda === 'USD' ? 'Ej: 17.50' : '1.00'}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Fecha de entrega
                </label>
                <input
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Condiciones de pago
                </label>
                <textarea
                  value={condicionesPago}
                  onChange={(e) => setCondicionesPago(e.target.value)}
                  rows={2}
                  placeholder="Ej: 30 días, 50% anticipo..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Notas
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  placeholder="Observaciones generales..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {editing && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Estatus
                  </label>
                  <select
                    value={estatus}
                    onChange={(e) => setEstatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {ESTATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Items */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">
                    Líneas de producto
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    + Agregar línea
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <label className="mb-1 block text-xs text-slate-500">
                            Descripción *
                          </label>
                          <input
                            type="text"
                            required
                            value={it.piezaNombre}
                            onChange={(e) => updateItem(idx, 'piezaNombre', e.target.value)}
                            placeholder="Nombre/descripción"
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-xs text-slate-500">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={it.cantidad}
                            onChange={(e) =>
                              updateItem(idx, 'cantidad', Number(e.target.value))
                            }
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-xs text-slate-500">
                            Unidad
                          </label>
                          <input
                            type="text"
                            value={it.unidad}
                            onChange={(e) => updateItem(idx, 'unidad', e.target.value)}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="mb-1 block text-xs text-slate-500">
                            Precio unitario
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={it.precioUnitario}
                            onChange={(e) =>
                              updateItem(idx, 'precioUnitario', Number(e.target.value))
                            }
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="mb-1 block text-xs text-slate-500">
                            &nbsp;
                          </label>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            disabled={items.length <= 1}
                            className="w-full rounded-md border border-red-300 px-2 py-1.5 text-xs text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="mb-1 block text-xs text-slate-500">
                          Notas de línea
                        </label>
                        <input
                          type="text"
                          value={it.notas}
                          onChange={(e) => updateItem(idx, 'notas', e.target.value)}
                          placeholder="Observaciones de esta línea..."
                          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-blue-700">Subtotal</p>
                    <p className="text-lg font-bold text-blue-900">
                      ${' '}
                      {calcSubtotal().toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">IVA (16%)</p>
                    <p className="text-lg font-bold text-blue-900">
                      ${' '}
                      {calcIva().toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Total</p>
                    <p className="text-lg font-bold text-blue-900">
                      ${' '}
                      {calcTotal().toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                    : 'Crear Venta'}
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
    COTIZACION: 'bg-slate-100 text-slate-700',
    PENDIENTE: 'bg-yellow-100 text-yellow-700',
    APROBADA: 'bg-green-100 text-green-700',
    EN_PRODUCCION: 'bg-blue-100 text-blue-700',
    COMPLETADA: 'bg-emerald-100 text-emerald-700',
    CANCELADA: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    COTIZACION: 'Cotización',
    PENDIENTE: 'Pendiente',
    APROBADA: 'Aprobada',
    EN_PRODUCCION: 'En Producción',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada',
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[estatus] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {labels[estatus] || estatus}
    </span>
  );
}
