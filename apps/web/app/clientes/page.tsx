'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatCard, StatGrid } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { get, post, patch, del } from '@/lib/api';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Users,
  UserCheck,
  UserX,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Inbox,
  Loader2,
  ShieldAlert,
  Edit3,
  Building2,
} from 'lucide-react';

interface Cliente {
  id: string;
  codigo: string;
  razonSocial: string;
  rfc?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  pais?: string;
  creditoLimite?: number;
  diasCredito?: number;
  monedaPref?: string;
  notas?: string;
  activo?: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    cotizaciones: number;
    ordenesCompra: number;
  };
}

const VERSION = '0.1.0';

// ─── Inline OKLCH Design Components ────────────────────

function LoadingInline() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-danger/20 bg-danger-muted px-6 py-12 text-center">
      <ShieldAlert className="mb-3 h-10 w-10 text-danger" />
      <p className="text-sm font-medium text-danger">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Reintentar
        </Button>
      )}
    </div>
  );
}

function EmptyState({ message = 'No hay clientes registrados', submessage = 'Agregue un nuevo cliente para comenzar' }: { message?: string; submessage?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{submessage}</p>
    </div>
  );
}

function SearchFilterBar({
  search,
  onSearchChange,
  onSearch,
  filterStatus,
  onFilterChange,
  placeholder = 'Buscar...',
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onSearch: () => void;
  filterStatus: string;
  onFilterChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="input-base pl-10"
        />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => onFilterChange(e.target.value)}
        className="input-base sm:w-40"
      >
        <option value="todos">Todos</option>
        <option value="activos">Activos</option>
        <option value="inactivos">Inactivos</option>
      </select>
      <Button variant="outline" size="sm" onClick={onSearch} className="gap-2">
        <Search className="h-3.5 w-3.5" />
        Buscar
      </Button>
    </div>
  );
}

function FormModal({
  title,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
        </form>
      </div>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────

export default function ClientesPage() {
  return (
    <AppLayout>
      <ClientesContent />
    </AppLayout>
  );
}

function ClientesContent() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [detailCliente, setDetailCliente] = useState<Cliente | null>(null);

  const [form, setForm] = useState({
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
    creditoLimite: '',
    diasCredito: 30,
    monedaPref: 'MXN',
    notas: '',
  });

  async function loadClientes(p = 1, s = '') {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      if (filterStatus === 'activos') q.set('activo', 'true');
      if (filterStatus === 'inactivos') q.set('activo', 'false');
      const res = await get<{ data: Cliente[]; meta: any }>(`/api/clientes?${q}`);
      setClientes(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClientes(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatus]);

  function openNew() {
    setEditing(null);
    setForm({
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
      creditoLimite: '',
      diasCredito: 30,
      monedaPref: 'MXN',
      notas: '',
    });
    setShowModal(true);
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({
      codigo: c.codigo,
      razonSocial: c.razonSocial,
      rfc: c.rfc || '',
      contacto: c.contacto || '',
      email: c.email || '',
      telefono: c.telefono || '',
      direccion: c.direccion || '',
      ciudad: c.ciudad || '',
      estado: c.estado || '',
      codigoPostal: c.codigoPostal || '',
      pais: c.pais || 'México',
      creditoLimite: c.creditoLimite ? String(c.creditoLimite) : '',
      diasCredito: c.diasCredito || 30,
      monedaPref: c.monedaPref || 'MXN',
      notas: c.notas || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        codigoPostal: form.codigoPostal || undefined,
        monedaPref: form.monedaPref as 'MXN' | 'USD',
        notas: form.notas || undefined,
        creditoLimite: form.creditoLimite ? Number(form.creditoLimite) : null,
      };
      if (editing) {
        await patch(`/api/clientes/${editing.id}`, payload);
      } else {
        await post('/api/clientes', payload);
      }
      setShowModal(false);
      loadClientes(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    try {
      setError('');
      await del(`/api/clientes/${id}`);
      loadClientes(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  function openDetailCard(c: Cliente) {
    setDetailCliente(c);
    setShowDetailModal(true);
  }

  async function handleDeleteFromDetail() {
    if (!detailCliente) return;
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    try {
      setError('');
      await del(`/api/clientes/${detailCliente.id}`);
      setShowDetailModal(false);
      setDetailCliente(null);
      loadClientes(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  function openEditFromDetail() {
    if (!detailCliente) return;
    setEditing(detailCliente);
    setForm({
      codigo: detailCliente.codigo,
      razonSocial: detailCliente.razonSocial,
      rfc: detailCliente.rfc || '',
      contacto: detailCliente.contacto || '',
      email: detailCliente.email || '',
      telefono: detailCliente.telefono || '',
      direccion: detailCliente.direccion || '',
      ciudad: detailCliente.ciudad || '',
      estado: detailCliente.estado || '',
      codigoPostal: detailCliente.codigoPostal || '',
      pais: detailCliente.pais || 'México',
      creditoLimite: detailCliente.creditoLimite ? String(detailCliente.creditoLimite) : '',
      diasCredito: detailCliente.diasCredito || 30,
      monedaPref: detailCliente.monedaPref || 'MXN',
      notas: detailCliente.notas || '',
    });
    setShowDetailModal(false);
    setShowModal(true);
  }

  // Stats calculations
  const totalClientes = meta?.total ?? clientes.length;
  const activos = clientes.filter((c) => c.activo !== false).length;
  const inactivos = clientes.filter((c) => c.activo === false).length;
  const conCotizaciones = clientes.filter((c) => (c._count?.cotizaciones ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de clientes del ERP AMD México
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats Cards with borders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Total</p>
              <p className="text-2xl font-bold tracking-tight">{totalClientes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-success/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Activos</p>
              <p className="text-2xl font-bold tracking-tight">{activos}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-destructive/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Inactivos</p>
              <p className="text-2xl font-bold tracking-tight">{inactivos}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-warning/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Con cotizaciones</p>
              <p className="text-2xl font-bold tracking-tight">{conCotizaciones}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search/Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        onSearch={() => loadClientes(1, search)}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        placeholder="Buscar por código, razón social o ciudad..."
      />

      {/* Error State */}
      {error && !showModal && (
        <ErrorState message={error} onRetry={() => loadClientes(page, search)} />
      )}

      {/* Client Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : clientes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <div
              key={c.id}
              onClick={() => openDetailCard(c)}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    c.activo !== false ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">{c.razonSocial}</h3>
                    <p className="text-xs text-muted-foreground">{c.codigo}</p>
                  </div>
                </div>
                <Badge variant={c.activo !== false ? 'success' : 'destructive'}>
                  {c.activo !== false ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* Card Body */}
              <div className="mt-4 space-y-2">
                {c.contacto && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.contacto}</span>
                  </p>
                )}
                {c.email && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </p>
                )}
                {c.telefono && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{c.telefono}</span>
                  </p>
                )}
                {c.ciudad && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.ciudad}{c.estado ? `, ${c.estado}` : ''}</span>
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Clic para ver detalle</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); openDetailCard(c); }}
                    title="Ver detalle"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); openEditFromDetail(); }}
                    title="Editar cliente"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                    title="Eliminar cliente"
                    className="text-danger hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} AMD México Operations ERP · v{VERSION}
        </p>
      </footer>

      {/* Modal */}
      {showModal && (
        <FormModal
          title={editing ? 'Editar Cliente' : 'Nuevo Cliente'}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        >
          {/* Row 1: Código + RFC */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Código *
              </label>
              <input
                type="text"
                required
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                className="input-base"
                placeholder="CLI-001"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                RFC
              </label>
              <input
                type="text"
                value={form.rfc}
                onChange={(e) => setForm({ ...form, rfc: e.target.value })}
                className="input-base"
                placeholder="XAXX010101000"
              />
            </div>
          </div>

          {/* Razón Social */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Razón Social *
            </label>
            <input
              type="text"
              required
              value={form.razonSocial}
              onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
              className="input-base"
              placeholder="Empresa S.A. de C.V."
            />
          </div>

          {/* Contacto + Teléfono */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Contacto
              </label>
              <input
                type="text"
                value={form.contacto}
                onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                className="input-base"
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Teléfono
              </label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="input-base"
                placeholder="+52 55 1234 5678"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-base"
              placeholder="contacto@empresa.com"
            />
            {form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
              <p className="mt-1 text-xs text-danger">Ingrese un email válido</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Dirección
            </label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="input-base"
              placeholder="Calle, número, colonia"
            />
          </div>

          {/* Ciudad + Estado + Código Postal */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Ciudad
              </label>
              <input
                type="text"
                value={form.ciudad}
                onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Estado
              </label>
              <input
                type="text"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Código Postal
              </label>
              <input
                type="text"
                value={form.codigoPostal || ''}
                onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
                className="input-base"
              />
            </div>
          </div>

          {/* País + Moneda */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                País
              </label>
              <input
                type="text"
                value={form.pais}
                onChange={(e) => setForm({ ...form, pais: e.target.value })}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Moneda Preferida
              </label>
              <select
                value={form.monedaPref}
                onChange={(e) => setForm({ ...form, monedaPref: e.target.value })}
                className="input-base"
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dólar Americano</option>
              </select>
            </div>
          </div>

          {/* Crédito Límite + Días de Crédito */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Crédito Límite
              </label>
              <input
                type="number"
                step="0.01"
                value={form.creditoLimite}
                onChange={(e) => setForm({ ...form, creditoLimite: e.target.value })}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Días de Crédito
              </label>
              <input
                type="number"
                value={form.diasCredito}
                onChange={(e) => setForm({ ...form, diasCredito: Number(e.target.value) })}
                className="input-base"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Notas
            </label>
            <textarea
              value={form.notas || ''}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              rows={3}
              className="input-base resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="gap-2">
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </FormModal>
      )}
    </div>
  );
}
