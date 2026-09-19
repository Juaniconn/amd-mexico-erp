'use client';

import { useEffect, useState } from 'react';
import { get, post, patch } from '@/lib/api';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';

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
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${config.variant}/10 text-${config.variant}`}>
      {config.label}
    </span>
  );
}

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UsuarioFormData>({
    email: '',
    nombre: '',
    apellido: '',
    username: '',
    password: '',
    role: 'OPERADOR',
    sucursalId: '',
  });

  async function loadUsuarios() {
    try {
      setLoading(true);
      setError('');
      const data = await get<Usuario[]>('/api/usuarios');
      setUsuarios(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsuarios();
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

  async function toggleActive(user: Usuario) {
    try {
      await patch(`/api/usuarios/${user.id}`, { activo: !user.activo });
      setUsuarios(usuarios.map(u => u.id === user.id ? { ...u, activo: !u.activo } : u));
      setSuccess(`Usuario ${user.activo ? 'desactivado' : 'activado'}`);
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar estado');
    }
  }

  const filtered = usuarios.filter(u => {
    const matchSearch = !search || `${u.nombre} ${u.apellido} ${u.email} ${u.username}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-sm text-muted-foreground">Gestión de usuarios, roles y acceso al sistema</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>Nuevo Usuario</Button>
        </div>

        {/* Search & Filter */}
        <div className="card-premium p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre, email o usuario..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base pl-9"
              />
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="input-base sm:w-40">
              <option value="">Todos los roles</option>
              <option value="ADMIN">Administrador</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="OPERADOR">Operador</option>
            </select>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && <div className="rounded-lg border border-success/20 bg-success-muted px-4 py-3 text-sm text-success">{success}</div>}
        {error && <div className="rounded-lg border border-destructive/20 bg-destructive-muted px-4 py-3 text-sm text-destructive">{error}</div>}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="card-premium p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{usuarios.length}</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Activos</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-success">{usuarios.filter(u => u.activo).length}</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Admins</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-brand">{usuarios.filter(u => u.role === 'ADMIN').length}</p>
          </div>
          <div className="card-premium p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Inactivos</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-muted-foreground">{usuarios.filter(u => !u.activo).length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-muted text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Rol</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Último Acceso</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Cargando usuarios...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No se encontraron usuarios</td></tr>
                ) : (
                  filtered.map(user => (
                    <tr key={user.id} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{user.nombre} {user.apellido}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{user.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.activo ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(user.ultimoAcceso)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" title="Editar" onClick={() => startEdit(user)}>
                            ✏️
                          </Button>
                          <Button variant="ghost" size="icon-sm" title={user.activo ? 'Desactivar' : 'Activar'} onClick={() => toggleActive(user)}>
                            {user.activo ? '🚫' : '✅'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="card-premium w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Nombre *</label>
                    <input type="text" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="input-base" placeholder="Juan" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Apellido *</label>
                    <input type="text" required value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} className="input-base" placeholder="Ponce" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Email *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-base" placeholder="juan@amd-mexico.com" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Username *</label>
                  <input type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="input-base" placeholder="juanponce" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
                  </label>
                  <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="input-base" placeholder="••••••••" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Rol *</label>
                  <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })} className="input-base">
                    <option value="OPERADOR">Operador</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" size="sm" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" size="sm" loading={saving}>
                    {editingUser ? 'Guardar' : 'Crear Usuario'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
