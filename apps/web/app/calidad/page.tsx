'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Eye,
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
  Calendar,
  FileText,
  Loader2,
  ShieldAlert,
  User,
  ClipboardList,
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

function EmptyState({ message = 'No hay registros de calidad', submessage = 'Agregue un nuevo registro para comenzar' }: { message?: string; submessage?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{submessage}</p>
    </div>
  );
}

function DetailModal({
  item,
  onClose,
  onEdit,
  onDelete,
}: {
  item: CalidadItem;
  onClose: () => void;
  onEdit: (item: CalidadItem) => void;
  onDelete: (id: string) => void;
}) {
  function getInspectorName(i: CalidadItem) {
    if (i.inspector) {
      return `${i.inspector.nombre} ${i.inspector.apellido}`;
    }
    return '—';
  }

  function getOperacionProceso(i: CalidadItem) {
    if (i.operacion) {
      return i.operacion.proceso || i.operacion.nombre || 'Sin nombre';
    }
    return 'Sin operación';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              item.resultado === 'aprobado' ? 'bg-success/10 text-success' :
              item.resultado === 'rechazado' ? 'bg-destructive/10 text-destructive' :
              item.resultado === 'rework' ? 'bg-warning/10 text-warning' :
              'bg-muted text-muted-foreground'
            }`}>
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{item.ordenTrabajoId || 'Sin orden'}</h2>
              <p className="text-xs text-muted-foreground">ID: {item.id.slice(0, 8)}</p>
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
          {/* Orden de Trabajo */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">Orden de Trabajo</p>
            <p className="flex items-center gap-2 text-sm text-foreground">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              {item.ordenTrabajoId || '—'}
            </p>
          </div>

          {/* Inspector */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">Inspector</p>
            <p className="flex items-center gap-2 text-sm text-foreground">
              <User className="h-4 w-4 text-muted-foreground" />
              {getInspectorName(item)}
            </p>
          </div>

          {/* Resultado */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">Resultado</p>
            <div className="mt-1">
              <Badge variant={getResultadoBadgeVariant(item.resultado)}>
                {getResultadoLabel(item.resultado)}
              </Badge>
            </div>
          </div>

          {/* Defectos */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">Defectos</p>
            <p className="flex items-start gap-2 text-sm text-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              {item.defectos || 'Sin defectos registrados'}
            </p>
          </div>

          {/* Observaciones */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">Observaciones</p>
            <p className="flex items-start gap-2 text-sm text-foreground">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              {item.observaciones || 'Sin observaciones'}
            </p>
          </div>

          {/* Operación / Proceso */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">Operación / Proceso</p>
            <p className="flex items-center gap-2 text-sm text-foreground">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              {getOperacionProceso(item)}
            </p>
          </div>

          {/* Fecha */}
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">Fecha</p>
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatDate(item.createdAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="gap-2"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="gap-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────

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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editing, setEditing] = useState<CalidadItem | null>(null);
  const [detailItem, setDetailItem] = useState<CalidadItem | null>(null);
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

  function openDetailCard(item: CalidadItem) {
    setDetailItem(item);
    setShowDetailModal(true);
  }

  async function handleDeleteFromDetail() {
    if (!detailItem) return;
    if (!confirm('¿Está seguro de eliminar este registro de calidad?')) return;
    try {
      setError('');
      await del(`/api/calidad/${detailItem.id}`);
      setShowDetailModal(false);
      setDetailItem(null);
      loadData(page, search, resultadoFilter);
      setSuccess('Registro eliminado correctamente');
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar el registro');
    }
  }

  function openEditFromDetail() {
    if (!detailItem) return;
    setEditing(detailItem);
    setForm({
      operacionId: detailItem.operacionId || '',
      ordenTrabajoId: detailItem.ordenTrabajoId || '',
      resultado: detailItem.resultado || 'aprobado',
      defectos: detailItem.defectos || '',
      observaciones: detailItem.observaciones || '',
    });
    setShowDetailModal(false);
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
      return item.operacion.proceso || item.operacion.nombre || 'Sin nombre';
    }
    return 'Sin operación';
  }

  function getInspectorName(item: CalidadItem) {
    if (item.inspector) {
      return `${item.inspector.nombre} ${item.inspector.apellido}`;
    }
    return '—';
  }

  function getCardTitle(item: CalidadItem) {
    if (item.ordenTrabajoId) {
      return item.ordenTrabajoId;
    }
    if (item.operacion) {
      return item.operacion.proceso || item.operacion.nombre || 'Sin nombre';
    }
    return item.id.slice(0, 8);
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Control de Calidad</h1>
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
      {success && !showModal && !showDetailModal && (
        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats Cards with borders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <ListChecks className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Total Inspecciones</p>
              <p className="text-2xl font-bold tracking-tight">{totalControles}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-success/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Aprobadas</p>
              <p className="text-2xl font-bold tracking-tight">{aprobados}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-destructive/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Rechazadas</p>
              <p className="text-2xl font-bold tracking-tight">{rechazados}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-warning/30 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <p className="section-title">Tasa Aprobación</p>
              <p className="text-2xl font-bold tracking-tight">{tasaAprobacion}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search/Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por observaciones o producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-base pl-10"
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
        <Button variant="outline" size="sm" onClick={handleSearch} className="gap-2">
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Button>
      </div>

      {/* Error State */}
      {error && !showModal && !showDetailModal && (
        <ErrorState message={error} onRetry={() => loadData(page, search, resultadoFilter)} />
      )}

      {/* Quality Cards Grid */}
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
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => openDetailCard(item)}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-brand/30 hover:shadow-lg"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    item.resultado === 'aprobado' ? 'bg-success/10 text-success' :
                    item.resultado === 'rechazado' ? 'bg-destructive/10 text-destructive' :
                    item.resultado === 'rework' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">{getCardTitle(item)}</h3>
                    <p className="text-xs text-muted-foreground">{item.id.slice(0, 8)}</p>
                  </div>
                </div>
                <Badge variant={getResultadoBadgeVariant(item.resultado)}>
                  {getResultadoLabel(item.resultado)}
                </Badge>
              </div>

              {/* Card Body */}
              <div className="mt-4 space-y-2">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{getInspectorName(item)}</span>
                </p>
                {item.defectos && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.defectos}</span>
                  </p>
                )}
                {item.observaciones && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.observaciones}</span>
                  </p>
                )}
                {item.operacion && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ListChecks className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.operacion.proceso || item.operacion.nombre || 'Operación'}</span>
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
                    onClick={(e) => { e.stopPropagation(); openDetailCard(item); }}
                    title="Ver detalle"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                    title="Editar registro"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    title="Eliminar registro"
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
      {meta && !loading && items.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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

      {/* Footer */}
      <footer className="border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} AMD México Operations ERP · v{VERSION}
        </p>
      </footer>

      {/* Detail Modal */}
      {showDetailModal && detailItem && (
        <DetailModal
          item={detailItem}
          onClose={() => setShowDetailModal(false)}
          onEdit={openEditFromDetail}
          onDelete={handleDeleteFromDetail}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {editing ? 'Editar Registro de Calidad' : 'Nuevo Registro de Calidad'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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
          </div>
        </div>
      )}
    </div>
  );
}
