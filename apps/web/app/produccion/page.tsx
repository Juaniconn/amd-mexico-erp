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
  Factory,
  ClipboardList,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Inbox,
  CalendarDays,
  User,
  Wrench,
  FileText,
} from 'lucide-react';

interface OrdenProduccion {
  id: string;
  folio: string;
  cliente: string;
  pieza: string;
  cantidad: number;
  fechaInicio: string;
  fechaEntrega: string;
  estatus: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  responsable: string;
  notas?: string;
}

const ESTATUS_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PROCESO', label: 'En Proceso' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const PRIORIDAD_OPTIONS = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
];

const VERSION = '1.0.0';

// Demo data — replaces API calls until backend endpoint is ready
const DEMO_ORDENES: OrdenProduccion[] = [
  {
    id: '1',
    folio: 'OP-2026-001',
    cliente: 'Maquinados del Norte S.A.',
    pieza: 'Soporte estructural 40x60',
    cantidad: 50,
    fechaInicio: '2026-09-10',
    fechaEntrega: '2026-09-25',
    estatus: 'EN_PROCESO',
    prioridad: 'ALTA',
    responsable: 'Carlos Mendoza',
    notas: 'Requiere inspección dimensional final',
  },
  {
    id: '2',
    folio: 'OP-2026-002',
    cliente: 'Tecnología Avanzada MX',
    pieza: 'Cubierta aluminio CNC',
    cantidad: 120,
    fechaInicio: '2026-09-12',
    fechaEntrega: '2026-09-28',
    estatus: 'PENDIENTE',
    prioridad: 'MEDIA',
    responsable: 'Ana García',
  },
  {
    id: '3',
    folio: 'OP-2026-003',
    cliente: 'Industrias Ferromex',
    pieza: 'Eje de transmisión pulido',
    cantidad: 25,
    fechaInicio: '2026-09-05',
    fechaEntrega: '2026-09-20',
    estatus: 'COMPLETADA',
    prioridad: 'BAJA',
    responsable: 'Luis Ramírez',
  },
  {
    id: '4',
    folio: 'OP-2026-004',
    cliente: 'Automatización Integral',
    pieza: 'Placa base templada',
    cantidad: 80,
    fechaInicio: '2026-09-15',
    fechaEntrega: '2026-10-01',
    estatus: 'EN_PROCESO',
    prioridad: 'ALTA',
    responsable: 'Carlos Mendoza',
    notas: 'Material en tránsito — iniciar el lunes',
  },
  {
    id: '5',
    folio: 'OP-2026-005',
    cliente: 'Mecánica Progreso',
    pieza: 'Rodillo cilíndrico estándar',
    cantidad: 200,
    fechaInicio: '2026-09-08',
    fechaEntrega: '2026-09-18',
    estatus: 'COMPLETADA',
    prioridad: 'MEDIA',
    responsable: 'Ana García',
  },
];

export default function ProduccionPage() {
  return (
    <AppLayout>
      <ProduccionContent />
    </AppLayout>
  );
}

function ProduccionContent() {
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
  const [meta, setMeta] = useState<{ total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<OrdenProduccion | null>(null);

  const [form, setForm] = useState({
    folio: '',
    cliente: '',
    pieza: '',
    cantidad: 1,
    fechaInicio: '',
    fechaEntrega: '',
    estatus: 'PENDIENTE' as OrdenProduccion['estatus'],
    prioridad: 'MEDIA' as OrdenProduccion['prioridad'],
    responsable: '',
    notas: '',
  });

  useEffect(() => {
    // Simulate API load with demo data
    const timer = setTimeout(() => {
      setOrdenes(DEMO_ORDENES);
      setMeta({ total: DEMO_ORDENES.length });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  function loadOrdenes() {
    setLoading(true);
    setTimeout(() => {
      let filtered = DEMO_ORDENES;
      if (search) {
        const q = search.toLowerCase();
        filtered = DEMO_ORDENES.filter(
          (o) =>
            o.folio.toLowerCase().includes(q) ||
            o.cliente.toLowerCase().includes(q) ||
            o.pieza.toLowerCase().includes(q) ||
            o.responsable.toLowerCase().includes(q)
        );
      }
      setOrdenes(filtered);
      setMeta({ total: filtered.length });
      setLoading(false);
    }, 400);
  }

  function openNew() {
    setEditing(null);
    setForm({
      folio: `OP-2026-${String(DEMO_ORDENES.length + 1).padStart(3, '0')}`,
      cliente: '',
      pieza: '',
      cantidad: 1,
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaEntrega: '',
      estatus: 'PENDIENTE',
      prioridad: 'MEDIA',
      responsable: '',
      notas: '',
    });
    setShowModal(true);
  }

  function openEdit(o: OrdenProduccion) {
    setEditing(o);
    setForm({
      folio: o.folio,
      cliente: o.cliente,
      pieza: o.pieza,
      cantidad: o.cantidad,
      fechaInicio: o.fechaInicio,
      fechaEntrega: o.fechaEntrega,
      estatus: o.estatus,
      prioridad: o.prioridad,
      responsable: o.responsable,
      notas: o.notas || '',
    });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const payload: OrdenProduccion = {
      id: editing?.id ?? crypto.randomUUID(),
      ...form,
      cantidad: Number(form.cantidad),
    };

    if (editing) {
      // Update existing
      const idx = DEMO_ORDENES.findIndex((o) => o.id === editing.id);
      if (idx !== -1) {
        DEMO_ORDENES[idx] = payload;
      }
    } else {
      // Create new
      DEMO_ORDENES.unshift(payload);
    }

    setShowModal(false);
    loadOrdenes();
  }

  function handleDelete(id: string) {
    if (!confirm('¿Está seguro de eliminar esta orden de producción?')) return;
    const idx = DEMO_ORDENES.findIndex((o) => o.id === id);
    if (idx !== -1) {
      DEMO_ORDENES.splice(idx, 1);
      loadOrdenes();
    }
  }

  function handleSearch() {
    loadOrdenes();
  }

  // Stats calculations
  const ordenesActivas = ordenes.filter(
    (o) => o.estatus !== 'CANCELADA'
  ).length;
  const pendientes = ordenes.filter((o) => o.estatus === 'PENDIENTE').length;
  const enProceso = ordenes.filter((o) => o.estatus === 'EN_PROCESO').length;
  const completadas = ordenes.filter((o) => o.estatus === 'COMPLETADA').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Producción</h1>
          <p className="text-sm text-muted-foreground">
            Órdenes de trabajo, operaciones y control de calidad
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Orden
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Órdenes activas"
          value={ordenesActivas}
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          title="Pendientes"
          value={pendientes}
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
        />
        <StatCard
          title="En proceso"
          value={enProceso}
          icon={<Loader2 className="h-4 w-4" />}
          variant="default"
        />
        <StatCard
          title="Completadas"
          value={completadas}
          icon={<CheckCircle2 className="h-4 w-4" />}
          variant="success"
        />
      </div>

      {/* Search/Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por folio, cliente, pieza o responsable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
          />
        </div>
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
              <TableHead>Pieza</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Fecha inicio</TableHead>
              <TableHead>Fecha entrega</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows colCount={10} />
            ) : ordenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              ordenes.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.folio}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.cliente}
                  </TableCell>
                  <TableCell>{o.pieza}</TableCell>
                  <TableCell>{o.cantidad}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(o.fechaInicio + 'T00:00:00').toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(o.fechaEntrega + 'T00:00:00').toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell>
                    <PrioridadBadge prioridad={o.prioridad} />
                  </TableCell>
                  <TableCell>
                    <EstatusBadge estatus={o.estatus} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.responsable}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(o)}
                        title="Ver orden"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(o)}
                        title="Editar orden"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(o.id)}
                        title="Eliminar orden"
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
        {meta && !loading && ordenes.length > 0 && (
          <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground rounded-b-xl">
            <span>
              Mostrando {ordenes.length} de {meta.total} órdenes
            </span>
          </div>
        )}
      </TableContainer>

      {/* Footer */}
      <footer className="border-t pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} AMD México Operations ERP &middot; v{VERSION}
        </p>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b pb-4">
              <CardTitle>
                {editing ? 'Editar Orden de Producción' : 'Nueva Orden de Producción'}
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
                {/* Folio + Responsable */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Folio *
                    </label>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={form.folio}
                        onChange={(e) => setForm({ ...form, folio: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Responsable *
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={form.responsable}
                        onChange={(e) =>
                          setForm({ ...form, responsable: e.target.value })
                        }
                        placeholder="Nombre del responsable"
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Cliente */}
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Cliente *
                  </label>
                  <div className="relative">
                    <Factory className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={form.cliente}
                      onChange={(e) =>
                        setForm({ ...form, cliente: e.target.value })
                      }
                      placeholder="Nombre del cliente"
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pieza */}
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Pieza / Descripción *
                  </label>
                  <div className="relative">
                    <Wrench className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={form.pieza}
                      onChange={(e) =>
                        setForm({ ...form, pieza: e.target.value })
                      }
                      placeholder="Descripción de la pieza"
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cantidad + Prioridad */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={form.cantidad}
                      onChange={(e) =>
                        setForm({ ...form, cantidad: Number(e.target.value) })
                      }
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Prioridad
                    </label>
                    <select
                      value={form.prioridad}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          prioridad: e.target.value as OrdenProduccion['prioridad'],
                        })
                      }
                      className="w-full appearance-none rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    >
                      {PRIORIDAD_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fecha inicio + Fecha entrega */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Fecha inicio *
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        required
                        value={form.fechaInicio}
                        onChange={(e) =>
                          setForm({ ...form, fechaInicio: e.target.value })
                        }
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Fecha entrega *
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        required
                        value={form.fechaEntrega}
                        onChange={(e) =>
                          setForm({ ...form, fechaEntrega: e.target.value })
                        }
                        className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Estatus (only when editing) */}
                {editing && (
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Estatus
                    </label>
                    <select
                      value={form.estatus}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          estatus: e.target.value as OrdenProduccion['estatus'],
                        })
                      }
                      className="w-full appearance-none rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    >
                      {ESTATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notas */}
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Notas
                  </label>
                  <textarea
                    value={form.notas}
                    onChange={(e) =>
                      setForm({ ...form, notas: e.target.value })
                    }
                    rows={3}
                    placeholder="Observaciones, instrucciones especiales..."
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
                    {editing ? 'Actualizar' : 'Crear Orden'}
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

function EstatusBadge({ estatus }: { estatus: string }) {
  const variantMap: Record<string, 'warning' | 'default' | 'success' | 'destructive'> = {
    PENDIENTE: 'warning',
    EN_PROCESO: 'default',
    COMPLETADA: 'success',
    CANCELADA: 'destructive',
  };
  const labelMap: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    EN_PROCESO: 'En Proceso',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada',
  };
  return (
    <Badge variant={variantMap[estatus] || 'default'}>
      {labelMap[estatus] || estatus}
    </Badge>
  );
}

function PrioridadBadge({ prioridad }: { prioridad: string }) {
  const variantMap: Record<string, 'destructive' | 'warning' | 'success'> = {
    ALTA: 'destructive',
    MEDIA: 'warning',
    BAJA: 'success',
  };
  return (
    <Badge variant={variantMap[prioridad] || 'default'}>
      {prioridad}
    </Badge>
  );
}

function TableSkeletonRows({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: colCount }).map((_, j) => (
            <TableCell key={j}>
              <div
                className={`h-4 animate-pulse rounded bg-muted ${
                  j === 0
                    ? 'w-20'
                    : j === colCount - 1
                    ? 'w-16'
                    : 'w-24'
                }`}
              />
            </TableCell>
          ))}
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
        No hay órdenes de producción
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Cree una nueva orden para comenzar
      </p>
    </div>
  );
}
