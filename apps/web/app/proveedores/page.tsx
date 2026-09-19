'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { get, post, patch, del, ApiError } from '@/lib/api';
import type { Proveedor } from '@/types';
import {
  Search,
  Plus,
  Factory,
  Truck,
  Package,
  AlertCircle,
  Inbox,
  Edit3,
  Trash2,
  X,
  Users,
  Phone,
  Mail,
  MapPin,
  Loader2,
  ShoppingCart,
  FileText,
  Calendar,
  Building2,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────

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
  activo: boolean;
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
  activo: true,
};

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
      <AlertCircle className="mb-3 h-10 w-10 text-danger" />
      <p className="text-sm font-medium text-danger">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Reintentar
        </Button>
      )}
    </div>
  );
}

function EmptyState({ message = 'No hay proveedores registrados', submessage = 'Agregue un nuevo proveedor para comenzar' }: { message?: string; submessage?: string }) {
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

export default function ProveedoresPage() {
  return (
    <AppLayout>
      <ProveedoresContent />
    </AppLayout>
  );
}

function ProveedoresContent() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [meta, setMeta] = useState<ProveedorListResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [page, setPage] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [form, setForm] = useState<ProveedorForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadProveedores = useCallback(async (p = 1, s = '', status = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      const res = await get<ProveedorListResponse>(`/api/proveedores?${q}`);
      const filtered = status === 'activos'
        ? res.data.filter((p) => p.activo !== false)
        : status === 'inactivos'
        ? res.data.filter((p) => p.activo === false)
        : res.data;
      setProveedores(filtered);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProveedores(page, search, filterStatus);
  }, [page, loadProveedores]);

  function flashSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(msg), 3000);
  }

  function handleSearch() {
    setPage(1);
    loadProveedores(1, search, filterStatus);
  }

  function handleFilterChange(status: string) {
    setFilterStatus(status);
    setPage(1);
    loadProveedores(1, search, status);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
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
      activo: p.activo !== false,
    });
    setError('');
    setShowModal(true);
  }

  function updateForm(field: keyof ProveedorForm, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing) {
        await patch(`/api/proveedores/${editing.id}`, payload);
        flashSuccess('Proveedor actualizado correctamente');
      } else {
        await post('/api/proveedores', payload);
        flashSuccess('Proveedor creado correctamente');
      }
      setShowModal(false);
      loadProveedores(page, search, filterStatus);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 422) {
        setError(
          'Error de validación: ' +
            (err.data?.details?.map((d: any) => d.message).join(', ') || err.message)
        );
      } else {
        setError(err?.message || 'Error al guardar el proveedor');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) return;
    try {
      setError('');
      await del(`/api/proveedores/${id}`);
      flashSuccess('Proveedor eliminado correctamente');
      loadProveedores(page, search, filterStatus);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar el proveedor');
    }
  }

  // Stats calculations
  const totalProveedores = meta?.total ?? proveedores.length;
  const activos = proveedores.filter((p) => p.activo !== false).length;
  const inactivos = proveedores.filter((p) => p.activo === false).length;
  const conOrdenes = proveedores.filter((p) => (p._count?.ordenesCompraProveedor ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de proveedores del ERP AMD México
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Stats Cards with borders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Total</p>
              <p className="text-2xl font-bold tracking-tight">{totalProveedores}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-success/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <Truck className="h-5 w-5" />
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
              <ShoppingCart className="h-5 w-5" />
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
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Con órdenes</p>
              <p className="text-2xl font-bold tracking-tight">{conOrdenes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search/Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        onSearch={handleSearch}
        filterStatus={filterStatus}
        onFilterChange={handleFilterChange}
        placeholder="Buscar por código, razón social o ciudad..."
      />

      {/* Success Message */}
      {success && !showModal && (
        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-success">
          <span className="font-medium">✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Error State */}
      {error && !showModal && (
        <ErrorState message={error} onRetry={() => loadProveedores(page, search, filterStatus)} />
      )}

      {/* Provider Cards Grid */}
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
      ) : proveedores.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proveedores.map((p) => (
            <div
              key={p.id}
              className="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    p.activo !== false ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Factory className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <button
                      onClick={() => openEdit(p)}
                      className="truncate text-sm font-semibold text-foreground hover:text-brand transition-colors text-left"
                      title="Editar proveedor"
                    >
                      {p.razonSocial}
                    </button>
                    <p className="text-xs text-muted-foreground">{p.codigo}</p>
                  </div>
                </div>
                <Badge variant={p.activo !== false ? 'success' : 'destructive'}>
                  {p.activo !== false ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* Card Body */}
              <div className="mt-4 space-y-2">
                {p.contacto && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{p.contacto}</span>
                  </p>
                )}
                {p.email && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{p.email}</span>
                  </p>
                )}
                {p.telefono && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{p.telefono}</span>
                  </p>
                )}
                {p.ciudad && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{p.ciudad}{p.estado ? `, ${p.estado}` : ''}</span>
                  </p>
                )}
                {p.monedaPref && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="shrink-0">💰</span>
                    <Badge variant="outline" className="text-xs">
                      {p.monedaPref}
                    </Badge>
                  </p>
                )}
                {p.notas && (
                  <p className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
                    <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{p.notas}</span>
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    {p._count?.ordenesCompraProveedor ?? 0} ord.
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(p.createdAt).toLocaleDateString('es-MX')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(p)}
                    title="Editar proveedor"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(p.id)}
                    title="Eliminar proveedor"
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

      {/* Pagination Footer */}
      {meta && !loading && proveedores.length > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
          <span>
            Mostrando {proveedores.length} de {meta.total} proveedores
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
            >
              Siguiente
            </Button>
          </div>
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
          title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                onChange={(e) => updateForm('codigo', e.target.value)}
                className="input-base"
                placeholder="PROV-2026-0001"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                RFC
              </label>
              <input
                type="text"
                value={form.rfc}
                onChange={(e) => updateForm('rfc', e.target.value)}
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
              onChange={(e) => updateForm('razonSocial', e.target.value)}
              className="input-base"
              placeholder="Nombre del proveedor"
            />
          </div>

          {/* Row 3: Contacto + Teléfono */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Contacto
              </label>
              <input
                type="text"
                value={form.contacto}
                onChange={(e) => updateForm('contacto', e.target.value)}
                className="input-base"
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Teléfono
              </label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => updateForm('telefono', e.target.value)}
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
              onChange={(e) => updateForm('email', e.target.value)}
              className="input-base"
              placeholder="contacto@proveedor.com"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Dirección
            </label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => updateForm('direccion', e.target.value)}
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
                onChange={(e) => updateForm('ciudad', e.target.value)}
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
                onChange={(e) => updateForm('estado', e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                C.P.
              </label>
              <input
                type="text"
                value={form.codigoPostal}
                onChange={(e) => updateForm('codigoPostal', e.target.value)}
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
                onChange={(e) => updateForm('pais', e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Moneda
              </label>
              <select
                value={form.monedaPref}
                onChange={(e) => updateForm('monedaPref', e.target.value)}
                className="input-base"
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dólar Americano</option>
              </select>
            </div>
          </div>

          {/* Días de Crédito + Activo */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Días de Crédito
              </label>
              <input
                type="number"
                min={0}
                value={form.diasCredito}
                onChange={(e) => updateForm('diasCredito', Number(e.target.value))}
                className="input-base"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => updateForm('activo', e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm font-medium text-foreground">Activo</span>
              </label>
            </div>
          </div>

          {/* Form Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
            <Button type="submit" size="sm" className="gap-2" disabled={saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </FormModal>
      )}
    </div>
  );
}
