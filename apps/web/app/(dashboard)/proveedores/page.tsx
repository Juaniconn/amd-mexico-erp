'use client';

import { useEffect, useState } from 'react';
import { get, post, put, del } from '@/lib/api';
import type { Proveedor } from '@/types';

interface ProveedorListResponse {
  data: Proveedor[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ProveedorForm {
  codigo: string;
  razonSocial: string;
  rfc: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
  diasCredito: number;
  monedaPref: string;
}

const emptyForm: ProveedorForm = {
  codigo: '',
  razonSocial: '',
  rfc: '',
  contacto: '',
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  estado: '',
  codigoPostal: '',
  pais: 'México',
  diasCredito: 30,
  monedaPref: 'MXN',
};

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [meta, setMeta] = useState<ProveedorListResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);

  const [form, setForm] = useState<ProveedorForm>(emptyForm);

  async function loadProveedores(p = 1, s = '') {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      const res = await get<ProveedorListResponse>(`/api/proveedores?${q}`);
      setProveedores(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProveedores(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function flashSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(p: Proveedor) {
    setEditing(p);
    setForm({
      codigo: p.codigo,
      razonSocial: p.razonSocial,
      rfc: p.rfc || '',
      contacto: p.contacto || '',
      email: p.email || '',
      telefono: p.telefono || '',
      direccion: p.direccion || '',
      ciudad: p.ciudad || '',
      estado: p.estado || '',
      codigoPostal: p.codigoPostal || '',
      pais: p.pais || 'México',
      diasCredito: p.diasCredito || 30,
      monedaPref: p.monedaPref || 'MXN',
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { ...form };
      if (editing) {
        await put(`/api/proveedores/${editing.id}`, payload);
        flashSuccess('Proveedor actualizado correctamente');
      } else {
        await post('/api/proveedores', payload);
        flashSuccess('Proveedor creado correctamente');
      }
      setShowModal(false);
      loadProveedores(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el proveedor');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) return;
    try {
      setError('');
      setSuccess('');
      await del(`/api/proveedores/${id}`);
      flashSuccess('Proveedor eliminado correctamente');
      loadProveedores(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar el proveedor');
    }
  }

  const estatusBadge = (activo?: boolean) => (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        activo === false
          ? 'bg-red-100 text-red-700'
          : 'bg-green-100 text-green-700'
      }`}
    >
      {activo === false ? 'Inactivo' : 'Activo'}
    </span>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-sm text-slate-600">Gestión de proveedores del ERP</p>
        </div>
        <button
          onClick={openNew}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Nuevo Proveedor
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por código, razón social o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage(1);
              loadProveedores(1, search);
            }
          }}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={() => {
            setPage(1);
            loadProveedores(1, search);
          }}
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

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Razón Social</th>
                <th className="px-4 py-3">RFC</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Ciudad</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Estatus</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    Cargando...
                  </td>
                </tr>
              ) : proveedores.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    No hay proveedores registrados
                  </td>
                </tr>
              ) : (
                proveedores.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.codigo}</td>
                    <td className="px-4 py-3">{p.razonSocial}</td>
                    <td className="px-4 py-3 text-slate-500">{p.rfc || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{p.contacto || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{p.email || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{p.telefono || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{p.ciudad || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{p.estado || '-'}</td>
                    <td className="px-4 py-3">{estatusBadge(p.activo)}</td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>
              Mostrando {proveedores.length} de {meta.total} proveedores
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Código *</label>
                  <input
                    type="text"
                    required
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">RFC</label>
                  <input
                    type="text"
                    value={form.rfc}
                    onChange={(e) => setForm({ ...form, rfc: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Razón Social *</label>
                <input
                  type="text"
                  required
                  value={form.razonSocial}
                  onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Contacto</label>
                  <input
                    type="text"
                    value={form.contacto}
                    onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Teléfono</label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Dirección</label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Ciudad</label>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Estado</label>
                  <input
                    type="text"
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">C.P.</label>
                  <input
                    type="text"
                    value={form.codigoPostal}
                    onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">País</label>
                  <input
                    type="text"
                    value={form.pais}
                    onChange={(e) => setForm({ ...form, pais: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Días Crédito</label>
                  <input
                    type="number"
                    min={0}
                    value={form.diasCredito}
                    onChange={(e) => setForm({ ...form, diasCredito: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Moneda</label>
                  <select
                    value={form.monedaPref}
                    onChange={(e) => setForm({ ...form, monedaPref: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar</option>
                  </select>
                </div>
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
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  {editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
