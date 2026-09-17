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
  Eye,
  Pencil,
  Trash2,
  X,
  Building2,
  Users,
  UserCheck,
  UserX,
  FileText,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Hash,
  Receipt,
  Globe,
  Calendar,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { get } from '@/lib/api';

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
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);

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
  }, [page]);

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
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/clientes/${editing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/clientes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(payload),
        });
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/clientes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      loadClientes(page, search);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  // Stats calculations
  const totalClientes = clientes.length;
  const activos = clientes.filter((c) => c.activo !== false).length;
  const inactivos = clientes.filter((c) => c.activo === false).length;
  const conCotizaciones = clientes.filter((c) => (c._count?.cotizaciones ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de clientes del ERP AMD México
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total"
          value={meta?.total ?? totalClientes}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Activos"
          value={activos}
          icon={<UserCheck className="h-4 w-4" />}
          variant="success"
        />
        <StatCard
          title="Inactivos"
          value={inactivos}
          icon={<UserX className="h-4 w-4" />}
          variant="destructive"
        />
        <StatCard
          title="Con cotizaciones"
          value={conCotizaciones}
          icon={<FileText className="h-4 w-4" />}
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
            onKeyDown={(e) => e.key === 'Enter' && loadClientes(1, search)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadClientes(1, search)}
          className="gap-2"
        >
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Button>
      </div>

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
            ) : clientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              clientes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.codigo}</TableCell>
                  <TableCell>{c.razonSocial}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.rfc || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.email || c.contacto || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.ciudad || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.activo !== false ? 'success' : 'destructive'}>
                      {c.activo !== false ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.monedaPref || 'MXN'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(c)}
                        title="Ver cliente"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(c)}
                        title="Editar cliente"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(c.id)}
                        title="Eliminar cliente"
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
        {meta && !loading && clientes.length > 0 && (
          <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground rounded-b-xl">
            <span>
              Mostrando {clientes.length} de {meta.total} clientes
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
              <CardTitle>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</CardTitle>
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
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                      value={form.codigoPostal || ''}
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

                {/* Row 8: Crédito Límite + Días de Crédito */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Crédito Límite
                    </label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="number"
                        step="0.01"
                        value={form.creditoLimite}
                        onChange={(e) => setForm({ ...form, creditoLimite: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Días de Crédito
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="number"
                        value={form.diasCredito}
                        onChange={(e) => setForm({ ...form, diasCredito: Number(e.target.value) })}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Notas
                  </label>
                  <textarea
                    value={form.notas || ''}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none resize-none"
                  />
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
        No hay clientes registrados
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Agregue un nuevo cliente para comenzar
      </p>
    </div>
  );
}
