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
import { get, post, patch } from '@/lib/api';
import {
  Search,
  Plus,
  Pencil,
  X,
  Users,
  UserCheck,
  Shield,
  UserX,
  Clock,
  Loader2,
  ShieldAlert,
  Inbox,
} from 'lucide-react';

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  username: string;
  role: 'ADMIN' | 'OPERADOR' | 'SUPERVISOR';
  activo: boolean;
  ultimoAcceso: string | null;
  sucursalId: string | null;
  createdAt: string;
}

interface UsuarioFormData {
  email: string;
  nombre: string;
  apellido: string;
  username: string;
  password: string;
  role: 'ADMIN' | 'OPERADOR' | 'SUPERVISOR';
  sucursalId: string;
}

const ROLE_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  ADMIN: { label: 'Administrador', variant: 'success' },
  SUPERVISOR: { label: 'Supervisor', variant: 'warning' },
  OPERADOR: { label: 'Operador', variant: 'secondary' },
};

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_LABELS[role] || { label: role, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'success' : 'destructive'}>
      {active ? 'Activo' : 'Inactivo'}
    </Badge>
  );
}

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

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

function EmptyState({ message = 'No se encontraron usuarios', submessage = 'Cree un nuevo usuario para comenzar' }: { message?: string; submessage?: string }) {
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
  filterRole,
  onFilterChange,
  placeholder = 'Buscar...',
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onSearch: () => void;
  filterRole: string;
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
        value={filterRole}
        onChange={(e) => onFilterChange(e.target.value)}
        className="input-base sm:w-40"
      >
        <option value="">Todos los roles</option>
        <option value="ADMIN">Administrador</option>
        <option value="SUPERVISOR">Supervisor</option>
        <option value="OPERADOR">Operador</option>
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
  loading = false,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card-premium w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
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
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card-premium w-full max-w-sm p-6">
        <p className="text-sm text-foreground">{message}</p>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="default" size="sm" onClick={onConfirm}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<{ user: Usuario; action: 'activar' | 'desactivar' } | null>(null);
  const [formData, setFormData] = useState<UsuarioFormData>({
    email: '',
    nombre: '',
    apellido: '',
    username: '',
    password: '',
    role: 'OPERADOR',
    sucursalId: '',
  });

  async function loadUsuarios(p = 1, s = '', r = '') {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', '10');
      if (s) q.set('search', s);
      if (r) q.set('role', r);
      const response = await get<{ data: Usuario[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/api/usuarios?${q}`);
      setUsuarios(response.data || []);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsuarios(1, search, filterRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setFormData({ email: '', nombre: '', apellido: '', username: '', password: '', role: 'OPERADOR', sucursalId: '' });
    setEditingUser(null);
    setShowForm(false);
  }

  function startEdit(user: Usuario) {
    setEditingUser(user);
    setFormData({
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      username: user.username,
      password: '',
      role: user.role,
      sucursalId: user.sucursalId || '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      if (editingUser) {
        const { password, ...updateData } = formData;
        const updated = await patch<Usuario>(`/api/usuarios/${editingUser.id}`, { ...updateData, ...(password ? { password } : {}) });
        setUsuarios(usuarios.map(u => u.id === editingUser.id ? updated : u));
        setSuccess('Usuario actualizado correctamente');
      } else {
        const created = await post<Usuario>('/api/usuarios', formData);
        setUsuarios([...usuarios, created]);
        setSuccess('Usuario creado correctamente');
      }
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function confirmToggleActive() {
    if (!confirmToggle) return;
    const user = confirmToggle.user;
    try {
      await patch(`/api/usuarios/${user.id}`, { activo: !user.activo });
      setUsuarios(usuarios.map(u => u.id === user.id ? { ...u, activo: !u.activo } : u));
      setSuccess(`Usuario ${user.activo ? 'desactivado' : 'activado'}`);
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar estado');
    } finally {
      setConfirmToggle(null);
    }
  }

  function requestToggleActive(user: Usuario) {
    setConfirmToggle({ user, action: user.activo ? 'desactivar' : 'activar' });
  }

  const filtered = usuarios.filter(u => {
    const matchSearch = !search || `${u.nombre} ${u.apellido} ${u.email} ${u.username}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  // Stats
  const totalUsuarios = meta?.total ?? usuarios.length;
  const activos = usuarios.filter(u => u.activo).length;
  const admins = usuarios.filter(u => u.role === 'ADMIN').length;
  const inactivos = usuarios.filter(u => !u.activo).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Usuarios</h1>
            <p className="text-sm text-muted-foreground">Gestión de usuarios, roles y acceso al sistema</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success-muted px-4 py-3 text-sm text-success">
            <UserCheck className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && !showForm && (
          <ErrorState message={error} onRetry={() => loadUsuarios(meta?.page ?? 1, search, filterRole)} />
        )}

        {/* Search & Filter */}
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          onSearch={() => loadUsuarios(1, search, filterRole)}
          filterRole={filterRole}
          onFilterChange={setFilterRole}
          placeholder="Buscar por nombre, email o usuario..."
        />

        {/* Stats Row */}
        <StatGrid cols={4}>
          <StatCard
            title="Total"
            value={totalUsuarios}
            icon={<Users className="h-4 w-4" />}
            variant="default"
          />
          <StatCard
            title="Activos"
            value={activos}
            icon={<UserCheck className="h-4 w-4" />}
            variant="success"
          />
          <StatCard
            title="Admins"
            value={admins}
            icon={<Shield className="h-4 w-4" />}
            variant="brand"
          />
          <StatCard
            title="Inactivos"
            value={inactivos}
            icon={<UserX className="h-4 w-4" />}
            variant="danger"
          />
        </StatGrid>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <LoadingInline />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{user.nombre} {user.apellido}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{user.email}</TableCell>
                    <TableCell><RoleBadge role={user.role} /></TableCell>
                    <TableCell><StatusBadge active={user.activo} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(user.ultimoAcceso)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Editar"
                          onClick={() => startEdit(user)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title={user.activo ? 'Desactivar' : 'Activar'}
                          onClick={() => requestToggleActive(user)}
                          className={user.activo ? 'text-warning hover:text-warning' : 'text-success hover:text-success'}
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          {meta && !loading && usuarios.length > 0 && (
            <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground rounded-b-xl">
              <span>
                Mostrando {usuarios.length} de {meta.total} usuarios
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadUsuarios(meta.page - 1, search, filterRole)}
                  disabled={meta.page <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadUsuarios(meta.page + 1, search, filterRole)}
                  disabled={meta.page >= meta.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </TableContainer>

        {/* Modal Form */}
        {showForm && (
          <FormModal
            title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            onClose={resetForm}
            onSubmit={handleSubmit}
            loading={saving}
          >
            {/* Nombre + Apellido */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-base"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Apellido *</label>
                <input
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                  className="input-base"
                  placeholder="Pérez"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="input-base"
                placeholder="juan@amd-mexico.com"
              />
              {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                <p className="mt-1 text-xs text-danger">Ingrese un email válido</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Username *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="input-base"
                placeholder="juanperez"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="input-base"
                placeholder="••••••••"
              />
              {formData.password && formData.password.length < 8 && (
                <p className="mt-1 text-xs text-warning">La contraseña debe tener al menos 8 caracteres</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Rol *</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as Usuario['role'] })}
                className="input-base"
              >
                <option value="OPERADOR">Operador</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </FormModal>
        )}

        {/* Toggle Confirm Dialog */}
        {confirmToggle && (
          <ConfirmDialog
            message={`¿Está seguro de ${confirmToggle.action} al usuario ${confirmToggle.user.nombre} ${confirmToggle.user.apellido}?`}
            onConfirm={confirmToggleActive}
            onCancel={() => setConfirmToggle(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
