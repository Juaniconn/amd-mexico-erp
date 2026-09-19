'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/Card';
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
  Send,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
  Hash,
  DollarSign,
  Eye,
} from 'lucide-react';
import { get, put, del, ApiError } from '@/lib/api';
import type { Cotizacion } from '@/types';

// Extended type to match API response which includes denormalizada fields
interface CotizacionListItem extends Cotizacion {
  razonSocial?: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'EN_REVISION', label: 'En Revisión' },
  { value: 'ACEPTADA', label: 'Aprobada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'CONVERTIDA', label: 'Convertida' },
];

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  BORRADOR: 'secondary',
  ENVIADA: 'default',
  EN_REVISION: 'warning',
  ACEPTADA: 'success',
  RECHAZADA: 'destructive',
  CANCELADA: 'outline',
  CONVERTIDA: 'success',
};

const STATUS_LABELS: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada',
  EN_REVISION: 'En Revisión',
  ACEPTADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  CONVERTIDA: 'Convertida',
};

function formatCurrency(value: number | string, moneda: string = 'MXN'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const symbol = moneda === 'USD' ? 'US$' : '$';
  return `${symbol} ${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CotizacionesPage() {
  return (
    <AppLayout>
      <CotizacionesContent />
    </AppLayout>
  );
}

function CotizacionesContent() {
  const router = useRouter();
  const [cotizaciones, setCotizaciones] = useState<CotizacionListItem[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const loadCotizaciones = useCallback(async (p = 1, s = '', status = '') => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams();
      q.set('page', String(p));
      q.set('limit', String(limit));
      if (s) q.set('search', s);
      if (status) q.set('estatus', status);
      const res = await get<{ data: CotizacionListItem[]; meta: any }>(`/api/cotizaciones?${q}`);
      setCotizaciones(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCotizaciones(page, search, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearch() {
    setPage(1);
    loadCotizaciones(1, search, statusFilter);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
    loadCotizaciones(1, search, value);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar esta cotización?')) return;
    try {
      setError('');
      await del(`/api/cotizaciones/${id}`);
      loadCotizaciones(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar');
    }
  }

  async function handleSend(id: string) {
    try {
      setError('');
      await put(`/api/cotizaciones/${id}`, { estatus: 'ENVIADA' });
      loadCotizaciones(page, search, statusFilter);
    } catch (err: any) {
      setError(err?.message || 'Error al enviar cotización');
    }
  }

  // Stats calculations
  const totalCotizaciones = meta?.total ?? cotizaciones.length;
  const pendientes = cotizaciones.filter((c) => c.estatus === 'BORRADOR' || c.estatus === 'EN_REVISION').length;
  const aceptadas = cotizaciones.filter((c) => c.estatus === 'ACEPTADA' || c.estatus === 'CONVERTIDA').length;
  const rechazadas = cotizaciones.filter((c) => c.estatus === 'RECHAZADA' || c.estatus === 'CANCELADA').length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de RFQ y cotizaciones de manufactura
          </p>
        </div>
        <Link href="/cotizaciones/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Cotización
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total"
          value={totalCotizaciones}
          icon={<FileText className="h-4 w-4" />}
          description="Cotizaciones registradas"
        />
        <StatCard
          title="Pendientes"
          value={pendientes}
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
          description="Borrador / En revisión"
        />
        <StatCard
          title="Aceptadas"
          value={aceptadas}
          icon={<CheckCircle2 className="h-4 w-4" />}
          variant="success"
          description="Aprobadas / Convertidas"
        />
        <StatCard
          title="Rechazadas"
          value={rechazadas}
          icon={<XCircle className="h-4 w-4" />}
          variant="destructive"
          description="Rechazadas / Canceladas"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente o folio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-base pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="input-base sm:w-44"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows />
            ) : cotizaciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={<Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />}
                    title="No hay cotizaciones registradas"
                    description="Cree una nueva cotización para comenzar"
                  />
                </TableCell>
              </TableRow>
            ) : (
              cotizaciones.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => router.push(`/cotizaciones/${c.id}`)}
                      className="text-primary hover:underline font-medium flex items-center gap-1.5"
                    >
                      <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                      {c.folio}
                    </button>
                  </TableCell>
                  <TableCell className="text-table">{c.razonSocial || '—'}</TableCell>
                  <TableCell className="text-table text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-table">
                    {formatCurrency(c.total, c.moneda)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[c.estatus] || 'secondary'}>
                      {STATUS_LABELS[c.estatus] || c.estatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => router.push(`/cotizaciones/${c.id}`)}
                        title="Ver detalle"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => router.push(`/cotizaciones/${c.id}/edit`)}
                        title="Editar cotización"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {(c.estatus === 'BORRADOR' || c.estatus === 'EN_REVISION') && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleSend(c.id)}
                          title="Enviar cotización"
                          className="text-success hover:text-success"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(c.id)}
                        title="Eliminar cotización"
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
        {meta && !loading && cotizaciones.length > 0 && (
          <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground rounded-b-xl">
            <span>
              Mostrando {cotizaciones.length} de {meta.total} cotizaciones
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
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  variant = 'default',
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
  description?: string;
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
        <div className="min-w-0 flex-1">
          <p className="section-title">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{description}</p>
          )}
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
            <div className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 animate-pulse bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          </TableCell>
          <TableCell>
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
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

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
    </div>
  );
}
