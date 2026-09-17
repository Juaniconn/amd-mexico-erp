'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
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
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Factory,
  Truck,
  TruckIcon,
  Inbox,
  Hash,
  Receipt,
  Users,
  Phone,
  Mail,
  MapPin,
  Globe,
  Calendar,
  CreditCard,
  AlertCircle,
  Package,
} from 'lucide-react';
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

const VERSION = '0.1.0';

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
          <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de proveedores del ERP AMD México
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total"
          value={totalProveedores}
          icon={<Factory className="h-4 w-4" />}
        />
        <StatCard
          title="Activos"
          value={activos}
          icon={<Truck className="h-4 w-4" />}
          variant="success"
        />
        <StatCard
          title="Inactivos"
          value={inactivos}
          icon={<TruckIcon className="h-4 w-4" />}
          variant="destructive"
        />
        <StatCard
          title="Con órdenes"
          value={conOrdenes}
          icon={<Package className="h-4 w-4" />}
          variant="warning"
        />
      </div>

      {/* Search/Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPage(1);
            loadProveedores(1, search);
          }}
          className="gap-2"
        >
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-success">
          <Badge variant="success" className="shrink-0">
            ✓
          </Badge>
          <span>{success}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Razón Social</TableHead>
              <TableHead>RFC</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows />
            ) : proveedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              proveedores.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.codigo}</TableCell>
                  <TableCell>{p.razonSocial}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.rfc || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.email || p.contacto || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.ciudad || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.activo !== false ? 'success' : 'destructive'}>
                      {p.activo !== false ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.monedaPref || 'MXN'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(p)}
                        title="Editar proveedor"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(p.id)}
                        title="Eliminar proveedor"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {meta && !loading && proveedores.length > 0 && (
          <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground rounded-b-xl">
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
      </TableContainer>

      {/* Footer */}
      <footer className="border-t pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} AMD México Operations ERP · v{VERSION}
        </p>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b pb-4">
              <CardTitle>{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</CardTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Código + RFC */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Código *
                    </label>
                    <div className="relative">
                      <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={form.codigo}
                        onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      RFC
                    </label>
                    <div className="relative">
                      <Receipt className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={form.rfc}
                        onChange={(e) => setForm({ ...form, rfc: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Razón Social */}
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Razón Social *
                  </label>
                  <div className="relative">
                    <Factory className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={form.razonSocial}
                      onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 3: Contacto + Teléfono */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Contacto
                    </label>
                    <div className="relative">
                      <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={form.contacto}
                        onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Dirección
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.direccion}
                      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 6: Ciudad + Estado + Código Postal */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={form.ciudad}
                      onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={form.codigoPostal}
                      onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 7: País + Moneda */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      País
                    </label>
                    <div className="relative">
                      <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={form.pais}
                        onChange={(e) => setForm({ ...form, pais: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Moneda Preferida
                    </label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <select
                        value={form.monedaPref}
                        onChange={(e) => setForm({ ...form, monedaPref: e.target.value })}
                        className="w-full appearance-none rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      >
                        <option value="MXN">MXN - Peso Mexicano</option>
                        <option value="USD">USD - Dólar Americano</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 8: Días de Crédito */}
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Días de Crédito
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="number"
                      min={0}
                      value={form.diasCredito}
                      onChange={(e) => setForm({ ...form, diasCredito: Number(e.target.value) })}
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t pt-4">
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
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  variant = 'default',
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}) {
  return (
    <Card className="card-premium transition-all duration-200 hover:shadow-lg">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            variant === 'success'
              ? 'bg-success-muted text-success'
              : variant === 'destructive'
              ? 'bg-destructive/10 text-destructive'
              : variant === 'warning'
              ? 'bg-warning-muted text-warning'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-1">
              <div className="h-6 w-6 animate-pulse rounded bg-muted" />
              <div className="h-6 w-6 animate-pulse rounded bg-muted" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">
        No hay proveedores registrados
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Agregue un nuevo proveedor para comenzar
      </p>
    </div>
  );
}
