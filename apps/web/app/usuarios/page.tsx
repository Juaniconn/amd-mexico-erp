'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
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
  Shield,
  UserX,
  Clock,
  Loader2,
  ShieldAlert,
  Inbox,
  Mail,
  Calendar,
  Key,
  CheckCircle2,
  XCircle,
  Settings,
} from 'lucide-react';

type Role = 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'PRODUCCION' | 'CALIDAD' | 'COMPRAS' | 'OPERADOR';

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  username: string;
  role: Role;
  activo: boolean;
  ultimoAcceso: string | null;
  sucursalId: string | null;
  sucursal?: string;
  createdAt: string;
}

interface UsuarioFormData {
  email: string;
  nombre: string;
  apellido: string;
  username: string;
  password: string;
  role: Role;
  sucursalId: string;
}

const ROLE_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'destructive' | 'secondary'; descripcion: string }> = {
  ADMIN: { label: 'Administrador', variant: 'destructive', descripcion: 'Acceso total al sistema' },
  GERENTE: { label: 'Gerente', variant: 'success', descripcion: 'Gestión general y reportes' },
  VENDEDOR: { label: 'Vendedor', variant: 'default', descripcion: 'Clientes y cotizaciones' },
  PRODUCCION: { label: 'Producción', variant: 'warning', descripcion: 'Órdenes de trabajo y maquinaria' },
  CALIDAD: { label: 'Calidad', variant: 'default', descripcion: 'Inspecciones y control de calidad' },
  COMPRAS: { label: 'Compras', variant: 'warning', descripcion: 'Órdenes de compra y proveedores' },
  OPERADOR: { label: 'Operador', variant: 'secondary', descripcion: 'Acceso básico a producción' },
};

const ROLES_ORDER: Role[] = ['ADMIN', 'GERENTE', 'VENDEDOR', 'PRODUCCION', 'CALIDAD', 'COMPRAS', 'OPERADOR'];

function RoleBadge({ role }: { role: string }) {
  const config = ROLE_LABELS[role] || { label: role, variant: 'secondary' as const, descripcion: '' };
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
        {ROLES_ORDER.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role].label}
          </option>
        ))}
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center animate-fade-in">
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center animate-fade-in">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
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

// ─── Detail Modal ───────────────────────────────────────

function DetailModal({
  usuario,
  onClose,
  onEdit,
  onDelete,
  onPermisos,
}: {
  usuario: Usuario;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPermisos: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              usuario.activo ? 'bg-brand-muted text-brand' : 'bg-muted text-muted-foreground'
            }`}>
              <span className="text-sm font-bold">
                {usuario.nombre?.[0]}{usuario.apellido?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {usuario.nombre} {usuario.apellido}
              </h2>
              <p className="text-sm text-muted-foreground">@{usuario.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Detail Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Nombre</p>
              <p className="mt-1 text-sm text-foreground">{usuario.nombre}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Apellido</p>
              <p className="mt-1 text-sm text-foreground">{usuario.apellido}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Username</p>
            <p className="mt-1 text-sm text-foreground">@{usuario.username}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {usuario.email}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Rol</p>
              <div className="mt-1">
                <RoleBadge role={usuario.role} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Estado</p>
              <div className="mt-1">
                <StatusBadge active={usuario.activo} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Último Acceso</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {formatDate(usuario.ultimoAcceso)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Sucursal</p>
            <p className="mt-1 text-sm text-foreground">
              {usuario.sucursal || usuario.sucursalId || '—'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPermisos}
            className="gap-2"
          >
            <Key className="h-3.5 w-3.5" />
            Permisos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="gap-2 text-danger hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Permisos ──────────────────────────────────

interface PermisoItem {
  modulo: string;
  accion: string;
  permitido: boolean;
}

interface PermisoCatalogoItem {
  modulo: string;
  descripcion: string;
  acciones: string[];
}

function PermisosModal({ usuario, onClose }: { usuario: Usuario; onClose: () => void }) {
  const [permisos, setPermisos] = useState<PermisoItem[]>([]);
  const [catalogo, setCatalogo] = useState<PermisoCatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [permisosData, catalogoData] = await Promise.all([
          get<PermisoItem[]>(`/api/permisos/usuario/${usuario.id}`),
          get<PermisoCatalogoItem[]>('/api/permisos/catalogo'),
        ]);
        setPermisos(permisosData);
        setCatalogo(catalogoData);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuario.id]);

  const togglePermiso = async (modulo: string, accion: string, permitido: boolean) => {
    setSaving(true);
    try {
      await post(`/api/permisos/usuario/${usuario.id}`, { modulo, accion, permitido });
      setPermisos((prev) =>
        prev.map((p) => (p.modulo === modulo && p.accion === accion ? { ...p, permitido } : p))
      );
    } catch (err: any) {
      alert(err?.message || 'Error al actualizar permiso');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center">
        <div className="rounded-xl border border-border bg-card p-6 shadow-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const modulosUnicos = [...new Set(catalogo.map((c) => c.modulo))];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center animate-fade-in">
      <div className="my-auto flex max-h-[min(90vh,calc(100dvh-2rem))] w-full max-w-4xl flex-col rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-lg font-semibold">Permisos de {usuario.nombre} {usuario.apellido}</h2>
            <p className="text-sm text-muted-foreground">Rol: {ROLE_LABELS[usuario.role]?.label || usuario.role}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {usuario.role === 'ADMIN' ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-primary">
                <Shield className="h-4 w-4" />
                Administrador del sistema
              </div>
              <p className="mt-1 text-muted-foreground">
                Los administradores tienen acceso total a todos los módulos y acciones.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {modulosUnicos.map((modulo) => {
                const moduloInfo = catalogo.find((c) => c.modulo === modulo);
                const acciones = moduloInfo?.acciones || [];
                const permisosModulo = permisos.filter((p) => p.modulo === modulo);

                return (
                  <div key={modulo} className="rounded-lg border border-border">
                    <div className="border-b border-border bg-muted/50 px-4 py-2">
                      <h3 className="text-sm font-semibold capitalize">{moduloInfo?.descripcion || modulo}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {acciones.map((accion) => {
                        const permiso = permisosModulo.find((p) => p.accion === accion);
                        const permitido = permiso?.permitido ?? false;

                        return (
                          <button
                            key={accion}
                            onClick={() => !saving && togglePermiso(modulo, accion, !permitido)}
                            disabled={saving}
                            className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                              permitido
                                ? 'border-success/30 bg-success/5 text-success'
                                : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {permitido ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            <span className="capitalize">{accion.replace(/_/g, ' ')}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────

export default function UsuariosPage() {
  return (
    <AppLayout>
      <UsuariosContent />
    </AppLayout>
  );
}

function UsuariosContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [detailUsuario, setDetailUsuario] = useState<Usuario | null>(null);
  const [permisosUsuario, setPermisosUsuario] = useState<Usuario | null>(null);
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

  // ─── Detail Modal Handlers ─────────────────────────────

  function openDetailCard(u: Usuario) {
    setDetailUsuario(u);
    setShowDetailModal(true);
  }

  function openPermisosModal(u: Usuario) {
    setPermisosUsuario(u);
    setShowPermisosModal(true);
    setShowDetailModal(false);
  }

  async function handleDeleteFromDetail() {
    if (!detailUsuario) return;
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      setError('');
      await del(`/api/usuarios/${detailUsuario.id}`);
      setShowDetailModal(false);
      setDetailUsuario(null);
      loadUsuarios(meta?.page ?? 1, search, filterRole);
      setSuccess('Usuario eliminado correctamente');
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  function openEditFromDetail() {
    if (!detailUsuario) return;
    setEditingUser(detailUsuario);
    setFormData({
      email: detailUsuario.email,
      nombre: detailUsuario.nombre,
      apellido: detailUsuario.apellido,
      username: detailUsuario.username,
      password: '',
      role: detailUsuario.role,
      sucursalId: detailUsuario.sucursalId || '',
    });
    setShowDetailModal(false);
    setShowForm(true);
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

      {/* Stats Row — card grid matching Clientes pattern */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="section-title">Total</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{totalUsuarios}</p>
            </div>
            <div className="ml-3 shrink-0 rounded-lg p-2 bg-brand-muted text-brand">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-success/30 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="section-title">Activos</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{activos}</p>
            </div>
            <div className="ml-3 shrink-0 rounded-lg p-2 bg-success-muted text-success">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="section-title">Admins</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{admins}</p>
            </div>
            <div className="ml-3 shrink-0 rounded-lg p-2 bg-brand-muted text-brand">
              <Shield className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-destructive/30 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="section-title">Inactivos</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{inactivos}</p>
            </div>
            <div className="ml-3 shrink-0 rounded-lg p-2 bg-destructive/10 text-destructive">
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* User Cards Grid — matching Clientes pattern with onClick */}
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
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(user => (
            <div
              key={user.id}
              onClick={() => openDetailCard(user)}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    user.activo ? 'bg-brand-muted text-brand' : 'bg-muted text-muted-foreground'
                  }`}>
                    <span className="text-sm font-bold">
                      {user.nombre?.[0]}{user.apellido?.[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {user.nombre} {user.apellido}
                    </h3>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <StatusBadge active={user.activo} />
              </div>

              {/* Card Body */}
              <div className="mt-4 space-y-2">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
                <div className="flex items-center gap-2">
                  <RoleBadge role={user.role} />
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>Último acceso: {formatDate(user.ultimoAcceso)}</span>
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Clic para ver detalle</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); openDetailCard(user); }}
                    title="Ver detalle"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); startEdit(user); }}
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); requestToggleActive(user); }}
                    title={user.activo ? 'Desactivar' : 'Activar'}
                    className={user.activo ? 'text-warning hover:text-warning' : 'text-success hover:text-success'}
                  >
                    {user.activo ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {meta && !loading && filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
          <span>
            Mostrando {filtered.length} de {meta.total} usuarios
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

      {/* Footer */}
      <footer className="border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} AMD México Operations ERP
        </p>
      </footer>

      {/* Detail Modal */}
      {showDetailModal && detailUsuario && (
        <DetailModal
          usuario={detailUsuario}
          onClose={() => { setShowDetailModal(false); setDetailUsuario(null); }}
          onEdit={openEditFromDetail}
          onDelete={handleDeleteFromDetail}
          onPermisos={() => openPermisosModal(detailUsuario)}
        />
      )}

      {showPermisosModal && permisosUsuario && (
        <PermisosModal
          usuario={permisosUsuario}
          onClose={() => { setShowPermisosModal(false); setPermisosUsuario(null); }}
        />
      )}

      {/* Form Modal */}
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
              onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
              className="input-base"
            >
              {ROLES_ORDER.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role].label} — {ROLE_LABELS[role].descripcion}
                </option>
              ))}
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
  );
}
