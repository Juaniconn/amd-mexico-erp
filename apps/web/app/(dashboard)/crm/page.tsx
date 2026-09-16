'use client';

import { useEffect, useState, useCallback } from 'react';
import { get, post, put, del, ApiError } from '@/lib/api';
import type { Lead, ActividadLead, LeadListResponse } from '@/types';

const ORIGEN_OPTIONS = [
  { value: 'REFERENCIA', label: 'Referencia' },
  { value: 'WEB', label: 'Web' },
  { value: 'LLAMADA', label: 'Llamada' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'FERIA', label: 'Feria' },
  { value: 'OTRO', label: 'Otro' },
];

const ESTATUS_OPTIONS = [
  { value: 'NUEVO', label: 'Nuevo' },
  { value: 'CONTACTADO', label: 'Contactado' },
  { value: 'CALIFICADO', label: 'Calificado' },
  { value: 'PROPUESTA', label: 'Propuesta' },
  { value: 'GANADO', label: 'Ganado' },
  { value: 'PERDIDO', label: 'Perdido' },
];

const TIPO_ACTIVIDAD_OPTIONS = [
  { value: 'NOTA', label: 'Nota' },
  { value: 'LLAMADA', label: 'Llamada' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'REUNION', label: 'Reunión' },
  { value: 'TAREA', label: 'Tarea' },
];

const ESTATUS_BADGE: Record<string, string> = {
  NUEVO: 'bg-blue-100 text-blue-800',
  CONTACTADO: 'bg-yellow-100 text-yellow-800',
  CALIFICADO: 'bg-purple-100 text-purple-800',
  PROPUESTA: 'bg-indigo-100 text-indigo-800',
  GANADO: 'bg-green-100 text-green-800',
  PERDIDO: 'bg-red-100 text-red-800',
};

const ORIGEN_BADGE: Record<string, string> = {
  REFERENCIA: 'bg-slate-100 text-slate-800',
  WEB: 'bg-cyan-100 text-cyan-800',
  LLAMADA: 'bg-orange-100 text-orange-800',
  EMAIL: 'bg-pink-100 text-pink-800',
  FERIA: 'bg-amber-100 text-amber-800',
  OTRO: 'bg-gray-100 text-gray-800',
};

function formatCurrency(value: number | string | null | undefined, moneda: string = 'MXN'): string {
  if (value === null || value === undefined || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda || 'MXN',
  }).format(num);
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface LeadForm {
  nombre: string;
  contactoNombre: string;
  email: string;
  telefono: string;
  origen: string;
  estatus: string;
  valorEstimado: string;
  moneda: string;
  tipoCambio: string;
  descripcion: string;
  notas: string;
  fechaSeguimiento: string;
  proximaAccion: string;
  clienteId: string;
}

const emptyForm: LeadForm = {
  nombre: '',
  contactoNombre: '',
  email: '',
  telefono: '',
  origen: 'REFERENCIA',
  estatus: 'NUEVO',
  valorEstimado: '',
  moneda: 'MXN',
  tipoCambio: '',
  descripcion: '',
  notas: '',
  fechaSeguimiento: '',
  proximaAccion: '',
  clienteId: '',
};

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<LeadListResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [estatusFilter, setEstatusFilter] = useState('');
  const [origenFilter, setOrigenFilter] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showActividad, setShowActividad] = useState(false);
  const [actividadLeadId, setActividadLeadId] = useState('');
  const [actividadSaving, setActividadSaving] = useState(false);

  // Form state
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [actividadForm, setActividadForm] = useState({ tipo: 'NOTA', descripcion: '' });

  const loadLeads = useCallback(async (p = 1, s = '', estatus = '', origen = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      if (estatus) q.set('estatus', estatus);
      if (origen) q.set('origen', origen);
      const res = await get<LeadListResponse>(`/api/leads?${q}`);
      setLeads(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads(page, search, estatusFilter, origenFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearch() {
    setPage(1);
    loadLeads(1, search, estatusFilter, origenFilter);
  }

  function handleFilterChange() {
    setPage(1);
    loadLeads(1, search, estatusFilter, origenFilter);
  }

  useEffect(() => {
    handleFilterChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estatusFilter, origenFilter]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  }

  function openEdit(lead: Lead) {
    setEditing(lead);
    setForm({
      nombre: lead.nombre,
      contactoNombre: lead.contactoNombre || '',
      email: lead.email || '',
      telefono: lead.telefono || '',
      origen: lead.origen,
      estatus: lead.estatus,
      valorEstimado: lead.valorEstimado ? String(lead.valorEstimado) : '',
      moneda: lead.moneda || 'MXN',
      tipoCambio: lead.tipoCambio ? String(lead.tipoCambio) : '',
      descripcion: lead.descripcion || '',
      notas: lead.notas || '',
      fechaSeguimiento: lead.fechaSeguimiento ? lead.fechaSeguimiento.slice(0, 10) : '',
      proximaAccion: lead.proximaAccion ? lead.proximaAccion.slice(0, 10) : '',
      clienteId: lead.clienteId || '',
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload: any = {
        nombre: form.nombre,
        contactoNombre: form.contactoNombre || undefined,
        email: form.email || undefined,
        telefono: form.telefono || undefined,
        origen: form.origen,
        estatus: form.estatus,
        valorEstimado: form.valorEstimado ? Number(form.valorEstimado) : undefined,
        moneda: form.moneda,
        tipoCambio: form.tipoCambio ? Number(form.tipoCambio) : undefined,
        descripcion: form.descripcion || undefined,
        notas: form.notas || undefined,
        fechaSeguimiento: form.fechaSeguimiento || undefined,
        proximaAccion: form.proximaAccion || undefined,
        clienteId: form.clienteId || undefined,
      };

      if (editing) {
        await put(`/api/leads/${editing.id}`, payload);
        setSuccess('Lead actualizado correctamente');
      } else {
        await post('/api/leads', payload);
        setSuccess('Lead creado correctamente');
      }
      setShowModal(false);
      loadLeads(page, search, estatusFilter, origenFilter);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar este lead?')) return;
    try {
      setError('');
      await del(`/api/leads/${id}`);
      setSuccess('Lead eliminado correctamente');
      loadLeads(page, search, estatusFilter, origenFilter);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  async function openDetail(lead: Lead) {
    setLoadingDetail(true);
    setShowDetail(true);
    try {
      const detail = await get<Lead>(`/api/leads/${lead.id}`);
      setDetailLead(detail);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar detalle');
      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  }

  function openActividad(leadId: string) {
    setActividadLeadId(leadId);
    setActividadForm({ tipo: 'NOTA', descripcion: '' });
    setError('');
    setShowActividad(true);
  }

  async function handleActividadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setActividadSaving(true);
    try {
      await post(`/api/leads/${actividadLeadId}/actividades`, actividadForm);
      setSuccess('Actividad agregada correctamente');
      setShowActividad(false);
      // Refresh detail if open
      if (showDetail && detailLead?.id === actividadLeadId) {
        const detail = await get<Lead>(`/api/leads/${actividadLeadId}`);
        setDetailLead(detail);
      }
      loadLeads(page, search, estatusFilter, origenFilter);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error al agregar actividad');
    } finally {
      setActividadSaving(false);
    }
  }

  // KPIs
  const totalLeads = meta?.total || 0;
  const nuevos = leads.filter((l) => l.estatus === 'NUEVO').length;
  const calificados = leads.filter((l) => l.estatus === 'CALIFICADO').length;
  const valorPipeline = leads
    .filter((l) => !['GANADO', 'PERDIDO'].includes(l.estatus))
    .reduce((sum, l) => sum + (Number(l.valorEstimado) || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM — Oportunidades / Leads</h1>
          <p className="text-sm text-slate-600">Gestión de oportunidades de venta</p>
        </div>
        <button
          onClick={openNew}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Nuevo Lead
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Leads</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalLeads}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Nuevos</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{nuevos}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Calificados</p>
          <p className="mt-1 text-2xl font-bold text-purple-600">{calificados}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Valor Pipeline</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {formatCurrency(valorPipeline, 'MXN')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          value={estatusFilter}
          onChange={(e) => setEstatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos los estatus</option>
          {ESTATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={origenFilter}
          onChange={(e) => setOrigenFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos los orígenes</option>
          {ORIGEN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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

      {/* Alerts */}
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Estatus</th>
                <th className="px-4 py-3">Valor Est.</th>
                <th className="px-4 py-3">Vendedor</th>
                <th className="px-4 py-3">Fecha Seg.</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                    Cargando...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                    No hay leads registrados
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{lead.folio}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(lead)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {lead.nombre}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{lead.contactoNombre || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{lead.email || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{lead.telefono || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          ORIGEN_BADGE[lead.origen] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ORIGEN_OPTIONS.find((o) => o.value === lead.origen)?.label || lead.origen}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          ESTATUS_BADGE[lead.estatus] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ESTATUS_OPTIONS.find((e) => e.value === lead.estatus)?.label || lead.estatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {formatCurrency(lead.valorEstimado, lead.moneda)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {lead.vendedor
                        ? `${lead.vendedor.nombre} ${lead.vendedor.apellido}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(lead.fechaSeguimiento)}</td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openDetail(lead)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => openEdit(lead)}
                        className="rounded-md border border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openActividad(lead.id)}
                        className="rounded-md border border-green-300 px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50"
                      >
                        + Actividad
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
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
        </div>

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>
              Mostrando {leads.length} de {meta.total} leads
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
                Página {page} de {meta.totalPages}
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

      {/* Modal Crear/Editar Lead */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {editing ? 'Editar Lead' : 'Nuevo Lead'}
            </h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-700">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Contacto</label>
                  <input
                    type="text"
                    value={form.contactoNombre}
                    onChange={(e) => setForm({ ...form, contactoNombre: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Origen</label>
                  <select
                    value={form.origen}
                    onChange={(e) => setForm({ ...form, origen: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {ORIGEN_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Estatus</label>
                  <select
                    value={form.estatus}
                    onChange={(e) => setForm({ ...form, estatus: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {ESTATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Valor Estimado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valorEstimado}
                    onChange={(e) => setForm({ ...form, valorEstimado: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Moneda</label>
                  <select
                    value={form.moneda}
                    onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar Americano</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Tipo Cambio</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.tipoCambio}
                    onChange={(e) => setForm({ ...form, tipoCambio: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Fecha Seguimiento
                  </label>
                  <input
                    type="date"
                    value={form.fechaSeguimiento}
                    onChange={(e) => setForm({ ...form, fechaSeguimiento: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Próxima Acción
                  </label>
                  <input
                    type="date"
                    value={form.proximaAccion}
                    onChange={(e) => setForm({ ...form, proximaAccion: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
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
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving
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

      {/* Modal Detalle Lead */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Detalle del Lead</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-8 text-center text-slate-500">Cargando detalle...</div>
            ) : detailLead ? (
              <div className="space-y-6">
                {/* Info principal */}
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
                  <div>
                    <p className="text-xs text-slate-500">Folio</p>
                    <p className="font-medium">{detailLead.folio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Nombre</p>
                    <p className="font-medium">{detailLead.nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Contacto</p>
                    <p className="font-medium">{detailLead.contactoNombre || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium">{detailLead.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Teléfono</p>
                    <p className="font-medium">{detailLead.telefono || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Origen</p>
                    <p className="font-medium">
                      {ORIGEN_OPTIONS.find((o) => o.value === detailLead.origen)?.label ||
                        detailLead.origen}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Estatus</p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        ESTATUS_BADGE[detailLead.estatus] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ESTATUS_OPTIONS.find((e) => e.value === detailLead.estatus)?.label ||
                        detailLead.estatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Valor Estimado</p>
                    <p className="font-medium">
                      {formatCurrency(detailLead.valorEstimado, detailLead.moneda)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Vendedor</p>
                    <p className="font-medium">
                      {detailLead.vendedor
                        ? `${detailLead.vendedor.nombre} ${detailLead.vendedor.apellido}`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Fecha Seguimiento</p>
                    <p className="font-medium">{formatDate(detailLead.fechaSeguimiento)}</p>
                  </div>
                  {detailLead.descripcion && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500">Descripción</p>
                      <p className="font-medium">{detailLead.descripcion}</p>
                    </div>
                  )}
                  {detailLead.notas && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500">Notas</p>
                      <p className="font-medium">{detailLead.notas}</p>
                    </div>
                  )}
                </div>

                {/* Intereses */}
                {detailLead.intereses && detailLead.intereses.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-slate-900">Intereses</h3>
                    <div className="space-y-2">
                      {detailLead.intereses.map((int) => (
                        <div
                          key={int.id}
                          className="rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <p className="text-sm font-medium">{int.descripcion}</p>
                          {int.cantidad && (
                            <p className="text-xs text-slate-500">Cantidad: {int.cantidad}</p>
                          )}
                          {int.notas && (
                            <p className="text-xs text-slate-500">{int.notas}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline de actividades */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Actividades</h3>
                    <button
                      onClick={() => openActividad(detailLead.id)}
                      className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-500"
                    >
                      + Agregar Actividad
                    </button>
                  </div>
                  {detailLead.actividades && detailLead.actividades.length > 0 ? (
                    <div className="relative space-y-3 border-l-2 border-slate-200 pl-4">
                      {detailLead.actividades.map((act) => (
                        <div key={act.id} className="relative">
                          <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white" />
                          <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-blue-600 uppercase">
                                {act.tipo}
                              </span>
                              <span className="text-xs text-slate-400">
                                {formatDate(act.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-700">{act.descripcion}</p>
                            {act.usuario && (
                              <p className="mt-1 text-xs text-slate-500">
                                Por: {act.usuario.nombre} {act.usuario.apellido}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No hay actividades registradas</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal Agregar Actividad */}
      {showActividad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Nueva Actividad</h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleActividadSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Tipo</label>
                <select
                  value={actividadForm.tipo}
                  onChange={(e) =>
                    setActividadForm({ ...actividadForm, tipo: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {TIPO_ACTIVIDAD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Descripción *
                </label>
                <textarea
                  required
                  value={actividadForm.descripcion}
                  onChange={(e) =>
                    setActividadForm({ ...actividadForm, descripcion: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowActividad(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actividadSaving}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
                >
                  {actividadSaving ? 'Guardando...' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
