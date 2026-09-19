'use client';

import { useEffect, useState, useCallback } from 'react';
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
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
  ListChecks,
  Percent,
} from 'lucide-react';
import { get, post, put, del } from '@/lib/api';

interface Operacion {
  id: string;
  nombre?: string;
  proceso?: string;
  estatus?: string;
  wo?: {
    id: string;
    piezaNombre?: string;
    codigo?: string;
  };
  maquina?: {
    nombre: string;
  };
}

interface Inspector {
  id: string;
  nombre: string;
  apellido: string;
}

interface CalidadItem {
  id: string;
  resultado: string;
  defectos?: string;
  observaciones?: string;
  operacionId: string;
  ordenTrabajoId?: string;
  operacion?: Operacion;
  inspector?: Inspector | null;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CalidadFormData {
  operacionId: string;
  ordenTrabajoId: string;
  resultado: string;
  defectos: string;
  observaciones: string;
}

const RESULTADOS = [
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'rework', label: 'Rework' },
];

const TIPOS = [
  { value: 'inspeccion_inicial', label: 'Inspección Inicial' },
  { value: 'inspeccion_final', label: 'Inspección Final' },
  { value: 'inspeccion_proceso', label: 'Inspección en Proceso' },
];

function getResultadoBadgeVariant(resultado: string): 'success' | 'destructive' | 'warning' | 'secondary' {
  switch (resultado) {
    case 'aprobado': return 'success';
    case 'rechazado': return 'destructive';
    case 'rework': return 'warning';
    default: return 'secondary';
  }
}

function getResultadoLabel(resultado: string) {
  return RESULTADOS.find((x) => x.value === resultado)?.label || resultado;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function CalidadPage() {
  return (
    <AppLayout>
      <CalidadContent />
    </AppLayout>
  );
}

function CalidadContent() {
  const [items, setItems] = useState<CalidadItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [resultadoFilter, setResultadoFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CalidadItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);

  const [form, setForm] = useState<CalidadFormData>({
    operacionId: '',
    ordenTrabajoId: '',
    resultado: 'aprobado',
    defectos: '',
    observaciones: '',
  });

  const loadData = useCallback(async (p = 1, s = '', r = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', String(limit));
      if (s) q.set('search', s);
      if (r) q.set('resultado', r);
      const res = await get<{ data: CalidadItem[]; meta: Meta }>(`/api/calidad?${q}`);
      setItems(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar los registros de calidad');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadData(page, search, resultadoFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    async function loadOperaciones() {
      try {
        const q = new URLSearchParams();
        q.set('limit', '100');
        const res = await get<{ data: Operacion[] }>(`/api/operaciones?${q}`);
        setOperaciones(res.data);
      } catch {
        // silent
      }
    }
    if (showModal) {
      loadOperaciones();
    }
  }, [showModal]);

  function handleSearch() {
    setPage(1);
    loadData(1, search, resultadoFilter);
  }

  function handleResultadoChange(value: string) {
    setResultadoFilter(value);
    setPage(1);
    loadData(1, search, value);
  }

  function openNew() {
    setEditing(null);
    setForm({
      operacionId: '',
      ordenTrabajoId: '',
      resultado: 'aprobado',
      defectos: '',
      observaciones: '',
    });
    setShowModal(true);
  }

  function openEdit(item: CalidadItem) {
    setEditing(item);
    setForm({
      operacionId: item.operacionId || '',
      ordenTrabajoId: item.ordenTrabajoId || '',
      resultado: item.resultado || 'aprobado',
      defectos: item.defectos || '',
      observaciones: item.observaciones || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload: any = {
        operacionId: form.operacionId,
        resultado: form.resultado,
        defectos: form.defectos || undefined,
        observaciones: form.observaciones || undefined,
      };
      if (form.ordenTrabajoId) {
        payload.ordenTrabajoId = form.ordenTrabajoId;
      }

      if (editing) {
        await put(`/api/calidad/${editing.id}`, {
          resultado: form.resultado,
          defectos: form.defectos || undefined,
          observaciones: form.observaciones || undefined,
        });
        setSuccess('Registro actualizado correctamente');
      } else {
        await post('/api/calidad', payload);
        setSuccess('Registro creado correctamente');
      }
      setShowModal(false);
      loadData(page, search, resultadoFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el registro');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar este registro de calidad?')) return;
    try {
      setError('');
      await del(`/api/calidad/${id}`);
      setSuccess('Registro eliminado correctamente');
      loadData(page, search, resultadoFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar el registro');
    }
  }

  function getOperacionLabel(item: CalidadItem) {
    if (item.operacion) {
      const nombre = item.operacion.proceso || item.operacion.nombre || 'Sin nombre';
      return <span className="font-medium">{nombre}</span>;
    }
    return <span className="text-muted-foreground">Sin operación</span>;
  }

  function getInspectorName(item: CalidadItem) {
    if (item.inspector) {
      return `${item.inspector.nombre} ${item.inspector.apellido}`;
    }
    return '—';
  }

  // Stats calculations
  const totalControles = meta?.total ?? items.length;
  const aprobados = items.filter((i) => i.resultado === 'aprobado').length;
  const rechazados = items.filter((i) => i.resultado === 'rechazado').length;
  const tasaAprobacion = totalControles > 0 ? Math.round((aprobados / totalControles) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Control de Calidad</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de inspecciones y resultados
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Registro
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inspecciones"
          value={totalControles}
          icon={<ListChecks className="h-4 w-4" />}
        />
        <StatCard
          title="Aprobadas"
          value={aprobados}
          icon={<CheckCircle2 className="h-4 w-4" />}
          variant="success"
        />
        <StatCard
          title="Rechazadas"
          value={rechazados}
          icon={<XCircle className="h-4 w-4" />}
          variant="destructive"
        />
        <StatCard
          title="Tasa Aprobación"
          value={`${tasaAprobacion}%`}
          icon={<Percent className="h-4 w-4" />}
          variant="brand"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="card-premium p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por observaciones o producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-base pl-9"
            />
          </div>
          <select
            value={resultadoFilter}
            onChange={(e) => handleResultadoChange(e.target.value)}
            className="input-base sm:w-48"
          >
            <option value="">Todos los resultados</option>
            {RESULTADOS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="input-base sm:w-48"
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearch}
            className="gap-2"
          >
            <Search className="h-3.5 w-3.5" />
            Buscar
          </Button>
        </div>
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
              <TableHead>Folio</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows />
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <span className="text-primary">{item.id.slice(0, 8)}</span>
                  </TableCell>
                  <TableCell>{getOperacionLabel(item)}</TableCell>
                  <TableCell className="text-muted-foreground">{getInspectorName(item)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={getResultadoBadgeVariant(item.resultado)}>
                      {getResultadoLabel(item.resultado)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {item.observaciones || item.defectos || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(item)}
                        title="Editar registro"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(item.id)}
                        title="Eliminar registro"
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
        {meta && !loading && items.length > 0 && (
          <div className="flex flex-col gap-3 border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground rounded-b-xl sm:flex-row sm:items-center sm:justify-between">
            <span>
              Mostrando {items.length} de {meta.total} registros
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
              <span className="flex items-center px-2">
                Página {meta.page} de {meta.totalPages}
              </span>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b pb-4">
              <CardTitle>
                {editing ? 'Editar Registro de Calidad' : 'Nuevo Registro de Calidad'}
              </CardTitle>
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
                {!editing && (
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Operación *
                    </label>
                    <div className="relative">
                      <ClipboardCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <select
                        required
                        value={form.operacionId}
                        onChange={(e) => setForm({ ...form, operacionId: e.target.value })}
                        className="input-base appearance-none pl-10"
                      >
                        <option value="">Seleccionar operación...</option>
                        {operaciones.map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.proceso || op.nombre || op.id} — {op.wo?.piezaNombre || op.maquina?.nombre || ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Resultado *
                  </label>
                  <div className="relative">
                    <ListChecks className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      required
                      value={form.resultado}
                      onChange={(e) => setForm({ ...form, resultado: e.target.value })}
                      className="input-base appearance-none pl-10"
                    >
                      {RESULTADOS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Defectos
                  </label>
                  <div className="relative">
                    <AlertCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.defectos}
                      onChange={(e) => setForm({ ...form, defectos: e.target.value })}
                      maxLength={500}
                      placeholder="Describa los defectos encontrados..."
                      className="input-base pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Observaciones
                  </label>
                  <textarea
                    value={form.observaciones}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                    rows={3}
                    maxLength={1000}
                    placeholder="Observaciones adicionales..."
                    className="input-base resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" loading={submitting} className="gap-2">
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
  value: number | string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'brand';
}) {
  const variantClass =
    variant === 'success'
      ? 'bg-success-muted text-success'
      : variant === 'destructive'
      ? 'bg-danger-muted text-danger'
      : variant === 'warning'
      ? 'bg-warning-muted text-warning'
      : variant === 'brand'
      ? 'bg-brand-muted text-brand'
      : 'bg-primary/10 text-primary';

  return (
    <div className="card-premium p-5 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${variantClass}`}>
          {icon}
        </div>
        <div>
          <p className="section-title">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
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
        No hay registros de calidad
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Agregue un nuevo registro para comenzar
      </p>
    </div>
  );
}
