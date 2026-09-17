'use client';

import { useEffect, useState, useCallback } from 'react';
import { get, post, put, del, ApiError } from '@/lib/api';
import type { Lead, ActividadLead, LeadListResponse } from '@/types';
import {
  Users,
  UserPlus,
  UserCheck,
  DollarSign,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Calendar,
  FileText,
  X,
  Loader2,
  ClipboardList,
  TrendingUp,
  Target,
  Briefcase,
  MessageSquare,
  PhoneCall,
  MailOpen,
  HandshakeIcon,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

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
  NUEVO: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  CONTACTADO: 'bg-warning/10 text-warning ring-1 ring-warning/20',
  CALIFICADO: 'bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20',
  PROPUESTA: 'bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20',
  GANADO: 'bg-success/10 text-success ring-1 ring-success/20',
  PERDIDO: 'bg-danger/10 text-danger ring-1 ring-danger/20',
};

const ORIGEN_BADGE: Record<string, string> = {
  REFERENCIA: 'bg-muted text-foreground ring-1 ring-border',
  WEB: 'bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20',
  LLAMADA: 'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20',
  EMAIL: 'bg-pink-500/10 text-pink-500 ring-1 ring-pink-500/20',
  FERIA: 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20',
  OTRO: 'bg-muted text-muted-foreground ring-1 ring-border',
};

const ESTATUS_ICONS: Record<string, any> = {
  NUEVO: Sparkles,
  CONTACTADO: Phone,
  CALIFICADO: UserCheck,
  PROPUESTA: FileText,
  GANADO: CheckCircle2,
  PERDIDO: AlertCircle,
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

function InputField({
  label,
  icon: Icon,
  children,
  required = false,
}: {
  label: string;
  icon?: any;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  loading = false,
}: {
  title: string;
  value: string | number;
  icon: any;
  iconColor: string;
  loading?: boolean;
}) {
  return (
    <div className="card-premium group relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-all duration-200 hover:ring-brand/20">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{value}</p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconColor} transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-brand/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-medium ring-1 ${className}`}
    >
      {children}
    </span>
  );
}

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
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">CRM — Oportunidades / Leads</h1>
            <p className="text-sm text-muted-foreground">Gestión de oportunidades de venta</p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <Plus className="h-4 w-4" />
          Nuevo Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          iconColor="bg-primary/10 text-primary"
          loading={loading}
        />
        <StatCard
          title="Nuevos"
          value={nuevos}
          icon={UserPlus}
          iconColor="bg-warning/10 text-warning"
          loading={loading}
        />
        <StatCard
          title="Calificados"
          value={calificados}
          icon={UserCheck}
          iconColor="bg-purple-500/10 text-purple-500"
          loading={loading}
        />
        <StatCard
          title="Valor Pipeline"
          value={formatCurrency(valorPipeline, 'MXN')}
          icon={DollarSign}
          iconColor="bg-success/10 text-success"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="card-premium rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={estatusFilter}
              onChange={(e) => setEstatusFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
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
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
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
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <Search className="h-3.5 w-3.5" />
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-danger-muted px-4 py-3 text-sm text-danger animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-success-muted px-4 py-3 text-sm text-success animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Table */}
      <div className="card-premium overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground">No hay leads registrados</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Comienza agregando tu primer lead para gestionar oportunidades de venta.
            </p>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
            >
              <Plus className="h-4 w-4" />
              Nuevo Lead
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Folio</th>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Contacto</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Teléfono</th>
                  <th className="px-4 py-3 text-left">Origen</th>
                  <th className="px-4 py-3 text-left">Estatus</th>
                  <th className="px-4 py-3 text-left">Valor Est.</th>
                  <th className="px-4 py-3 text-left">Vendedor</th>
                  <th className="px-4 py-3 text-left">Fecha Seg.</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => {
                  const EstatusIcon = ESTATUS_ICONS[lead.estatus] || Target;
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{lead.folio}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(lead)}
                          className="font-medium text-primary hover:underline"
                        >
                          {lead.nombre}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.contactoNombre || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.email || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.telefono || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge className={ORIGEN_BADGE[lead.origen] || 'bg-muted text-muted-foreground ring-1 ring-border'}>
                          {ORIGEN_OPTIONS.find((o) => o.value === lead.origen)?.label || lead.origen}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={ESTATUS_BADGE[lead.estatus] || 'bg-muted text-muted-foreground ring-1 ring-border'}>
                          <EstatusIcon className="h-3 w-3" />
                          {ESTATUS_OPTIONS.find((e) => e.value === lead.estatus)?.label || lead.estatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {formatCurrency(lead.valorEstimado, lead.moneda)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {lead.vendedor
                          ? `${lead.vendedor.nombre} ${lead.vendedor.apellido}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(lead.fechaSeguimiento)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openDetail(lead)}
                            className="rounded-md border border-border bg-background p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            title="Ver detalle"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(lead)}
                            className="rounded-md border border-border bg-background p-1.5 text-muted-foreground transition hover:bg-primary-muted hover:text-primary"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openActividad(lead.id)}
                            className="rounded-md border border-border bg-background p-1.5 text-muted-foreground transition hover:bg-success-muted hover:text-success"
                            title="Agregar actividad"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="rounded-md border border-border bg-background p-1.5 text-muted-foreground transition hover:bg-danger-muted hover:text-danger"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            <span>
              Mostrando {leads.length} de {meta.total} leads
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition hover:bg-muted disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <span className="px-2 text-sm text-foreground">
                Página {page} de {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition hover:bg-muted disabled:opacity-50"
              >
                Siguiente
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Lead */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-2xl ring-1 ring-foreground/10 max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  {editing ? 'Editar Lead' : 'Nuevo Lead'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-danger-muted px-4 py-3 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <InputField label="Nombre" icon={UserPlus} required>
                    <input
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </InputField>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField label="Contacto" icon={Users}>
                  <input
                    type="text"
                    value={form.contactoNombre}
                    onChange={(e) => setForm({ ...form, contactoNombre: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </InputField>
                <InputField label="Teléfono" icon={Phone}>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </InputField>
              </div>

              <InputField label="Email" icon={Mail}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </InputField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField label="Origen" icon={TrendingUp}>
                  <select
                    value={form.origen}
                    onChange={(e) => setForm({ ...form, origen: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    {ORIGEN_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </InputField>
                <InputField label="Estatus" icon={Target}>
                  <select
                    value={form.estatus}
                    onChange={(e) => setForm({ ...form, estatus: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    {ESTATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </InputField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InputField label="Valor Estimado" icon={DollarSign}>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valorEstimado}
                    onChange={(e) => setForm({ ...form, valorEstimado: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </InputField>
                <InputField label="Moneda" icon={DollarSign}>
                  <select
                    value={form.moneda}
                    onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar Americano</option>
                  </select>
                </InputField>
                <InputField label="Tipo Cambio" icon={TrendingUp}>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.tipoCambio}
                    onChange={(e) => setForm({ ...form, tipoCambio: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </InputField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField label="Fecha Seguimiento" icon={Calendar}>
                  <input
                    type="date"
                    value={form.fechaSeguimiento}
                    onChange={(e) => setForm({ ...form, fechaSeguimiento: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </InputField>
                <InputField label="Próxima Acción" icon={Calendar}>
                  <input
                    type="date"
                    value={form.proximaAccion}
                    onChange={(e) => setForm({ ...form, proximaAccion: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </InputField>
              </div>

              <InputField label="Descripción" icon={FileText}>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                />
              </InputField>

              <InputField label="Notas" icon={FileText}>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                />
              </InputField>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/80 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-xl bg-card p-6 shadow-2xl ring-1 ring-foreground/10 max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Detalle del Lead</h2>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">Cargando detalle...</p>
              </div>
            ) : detailLead ? (
              <div className="space-y-6">
                {/* Info principal */}
                <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Folio</p>
                    <p className="font-medium text-foreground">{detailLead.folio}</p>
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Nombre</p>
                    <p className="font-medium text-foreground">{detailLead.nombre}</p>
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Contacto</p>
                    <p className="font-medium text-foreground">{detailLead.contactoNombre || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{detailLead.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Teléfono</p>
                    <p className="font-medium text-foreground">{detailLead.telefono || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Origen</p>
                    <p className="font-medium text-foreground">
                      {ORIGEN_OPTIONS.find((o) => o.value === detailLead.origen)?.label ||
                        detailLead.origen}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Estatus</p>
                    <Badge className={ESTATUS_BADGE[detailLead.estatus] || 'bg-muted text-muted-foreground ring-1 ring-border'}>
                      {ESTATUS_OPTIONS.find((e) => e.value === detailLead.estatus)?.label ||
                        detailLead.estatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Valor Estimado</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(detailLead.valorEstimado, detailLead.moneda)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Vendedor</p>
                    <p className="font-medium text-foreground">
                      {detailLead.vendedor
                        ? `${detailLead.vendedor.nombre} ${detailLead.vendedor.apellido}`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Fecha Seguimiento</p>
                    <p className="font-medium text-foreground">{formatDate(detailLead.fechaSeguimiento)}</p>
                  </div>
                  {detailLead.descripcion && (
                    <div className="sm:col-span-2">
                      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Descripción</p>
                      <p className="font-medium text-foreground">{detailLead.descripcion}</p>
                    </div>
                  )}
                  {detailLead.notas && (
                    <div className="sm:col-span-2">
                      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">Notas</p>
                      <p className="font-medium text-foreground">{detailLead.notas}</p>
                    </div>
                  )}
                </div>

                {/* Intereses */}
                {detailLead.intereses && detailLead.intereses.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                      <HandshakeIcon className="h-4 w-4 text-primary" />
                      Intereses
                    </h3>
                    <div className="space-y-2">
                      {detailLead.intereses.map((int) => (
                        <div
                          key={int.id}
                          className="rounded-lg border border-border bg-background p-3"
                        >
                          <p className="text-sm font-medium text-foreground">{int.descripcion}</p>
                          {int.cantidad && (
                            <p className="text-xs text-muted-foreground">Cantidad: {int.cantidad}</p>
                          )}
                          {int.notas && (
                            <p className="text-xs text-muted-foreground">{int.notas}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline de actividades */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Actividades
                    </h3>
                    <button
                      onClick={() => openActividad(detailLead.id)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition hover:bg-success/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar Actividad
                    </button>
                  </div>
                  {detailLead.actividades && detailLead.actividades.length > 0 ? (
                    <div className="relative space-y-3 border-l-2 border-border pl-4">
                      {detailLead.actividades.map((act) => (
                        <div key={act.id} className="relative">
                          <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
                          <div className="rounded-lg border border-border bg-background p-3">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-widest text-primary">
                                {act.tipo === 'LLAMADA' && <PhoneCall className="h-3 w-3" />}
                                {act.tipo === 'EMAIL' && <MailOpen className="h-3 w-3" />}
                                {act.tipo === 'REUNION' && <Users className="h-3 w-3" />}
                                {act.tipo === 'NOTA' && <FileText className="h-3 w-3" />}
                                {act.tipo === 'TAREA' && <CheckCircle2 className="h-3 w-3" />}
                                {act.tipo}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(act.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-foreground">{act.descripcion}</p>
                            {act.usuario && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Por: {act.usuario.nombre} {act.usuario.apellido}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-8 text-center">
                      <MessageSquare className="mb-2 h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No hay actividades registradas</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal Agregar Actividad */}
      {showActividad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-2xl ring-1 ring-foreground/10 animate-fade-up">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Plus className="h-5 w-5 text-success" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Nueva Actividad</h2>
              </div>
              <button
                onClick={() => setShowActividad(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-danger-muted px-4 py-3 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleActividadSubmit} className="space-y-4">
              <InputField label="Tipo" icon={FileText}>
                <select
                  value={actividadForm.tipo}
                  onChange={(e) =>
                    setActividadForm({ ...actividadForm, tipo: e.target.value })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {TIPO_ACTIVIDAD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </InputField>

              <InputField label="Descripción" icon={FileText} required>
                <textarea
                  required
                  value={actividadForm.descripcion}
                  onChange={(e) =>
                    setActividadForm({ ...actividadForm, descripcion: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                />
              </InputField>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowActividad(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actividadSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition hover:bg-success/80 disabled:opacity-50"
                >
                  {actividadSaving && <Loader2 className="h-4 w-4 animate-spin" />}
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
