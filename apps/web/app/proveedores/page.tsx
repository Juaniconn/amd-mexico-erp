'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import {
  Search,
  Plus,
  Factory,
  Truck,
  Package,
  Filter,
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
} from 'lucide-react';
import { get, post, patch, del, ApiError } from '@/lib/api';
import type { Proveedor } from '@/types';

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

// ─── Page ───────────────────────────────────────────────────

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
  const [statusFilter, setStatusFilter] = useState('');
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
      const filtered = status === 'activo'
        ? res.data.filter((p) => p.activo !== false)
        : status === 'inactivo'
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
    loadProveedores(page, search, statusFilter);
  }, [page, loadProveedores]);

  function flashSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  }

  function handleSearch() {
    setPage(1);
    loadProveedores(1, search, statusFilter);
  }

  function handleStatusChange(status: string) {
    setStatusFilter(status);
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
      loadProveedores(page, search, statusFilter);
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
      loadProveedores(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar el proveedor');
    }
  }

  // Stats calculations
  const totalProveedores = meta?.total ?? proveedores.length;
  const activos = proveedores.filter((p) => p.activo !== false).length;
  const conOrdenes = proveedores.filter((p) => (p._count?.ordenesCompraProveedor ?? 0) > 0).length;
  const productosSum = proveedores.reduce(
    (sum, p) => sum + (p._count?.ordenesCompraProveedor ?? 0),
    0
  );

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
        <button onClick={openNew} className="btn-primary gap-2 px-4 py-2 text-sm">
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Factory className="h-5 w-5" />}
          label="Total"
          value={totalProveedores}
          color="brand"
        />
        <StatCard
          icon={<Truck className="h-5 w-5" />}
          label="Activos"
          value={activos}
          color="success"
        />
        <StatCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Con órdenes"
          value={conOrdenes}
          color="warning"
        />
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Productos"
          value={productosSum}
          color="brand"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="card-premium flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-base pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="input-base sm:w-40"
        >
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <button onClick={handleSearch} className="btn-outline gap-2 px-4 py-2 text-sm">
          <Filter className="h-3.5 w-3.5" />
          Filtrar
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-success">
          <span className="font-medium">✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Error State */}
      {error && !showModal && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-muted/30">
                <th className="border-b border-border px-4 py-3 text-left text-section-title">
                  Nombre
                </th>
                <th className="border-b border-border px-4 py-3 text-left text-section-title">
                  Contacto
                </th>
                <th className="border-b border-border px-4 py-3 text-left text-section-title">
                  Email
                </th>
                <th className="border-b border-border px-4 py-3 text-left text-section-title">
                  Teléfono
                </th>
                <th className="border-b border-border px-4 py-3 text-right text-section-title">
                  Productos
                </th>
                <th className="border-b border-border px-4 py-3 text-right text-section-title">
                  Órdenes
                </th>
                <th className="border-b border-border px-4 py-3 text-left text-section-title">
                  Estatus
                </th>
                <th className="border-b border-border px-4 py-3 text-right text-section-title">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="text-table">
              {loading ? (
                <LoadingRows />
              ) : proveedores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12">
                    <EmptyState
                      message="No hay proveedores registrados"
                      description="Agregue un nuevo proveedor para comenzar"
                    />
                  </td>
                </tr>
              ) : (
                proveedores.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-muted/20 ${
                      idx !== proveedores.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{p.razonSocial}</div>
                      <div className="text-xs text-muted-foreground">{p.codigo}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {p.contacto || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {p.email || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {p.telefono || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {p._count?.ordenesCompraProveedor ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {p._count?.ordenesCompraProveedor ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${
                          p.activo !== false
                            ? 'bg-success-muted text-success border-success/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                      >
                        {p.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          title="Editar proveedor"
                          className="btn-ghost h-8 w-8 p-0"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          title="Eliminar proveedor"
                          className="btn-ghost h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && !loading && proveedores.length > 0 && (
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <span>
              Mostrando {proveedores.length} de {meta.total} proveedores
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="btn-ghost h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Código + RFC */}
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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

              {/* Row 6: Ciudad + Estado + Código Postal */}
              <div className="grid grid-cols-3 gap-4">
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

              {/* Row 7: País + Moneda */}
              <div className="grid grid-cols-2 gap-4">
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

              {/* Días de Crédito */}
              <div className="grid grid-cols-2 gap-4">
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
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline px-4 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary gap-2 px-4 py-2 text-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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

// ─── Stat Card ──────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'brand' | 'warning' | 'success' | 'danger';
}) {
  const colorMap = {
    brand: 'text-brand bg-brand-muted',
    warning: 'text-warning bg-warning-muted',
    success: 'text-success bg-success-muted',
    danger: 'text-danger bg-danger-muted',
  };

  return (
    <div className="card-premium p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="section-title">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Loading Rows ───────────────────────────────────────────

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          <td className="px-4 py-3">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-20 animate-pulse rounded bg-muted/70" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-8 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-8 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="flex justify-end gap-1">
              <div className="h-6 w-6 animate-pulse rounded bg-muted" />
              <div className="h-6 w-6 animate-pulse rounded bg-muted" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Empty State ────────────────────────────────────────────

function EmptyState({ message, description }: { message: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
      )}
    </div>
  );
}
