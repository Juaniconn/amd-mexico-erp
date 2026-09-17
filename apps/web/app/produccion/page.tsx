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
  X,
  ClipboardList,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Inbox,
  CalendarDays,
  User,
  FileText,
  ArrowRightLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrdenTrabajo {
  id: string;
  folio: string;
  estatus: string;
  prioridad: string;
  fecha: string;
  responsable?: string;
  cliente?: string;
  cotizacionId?: string;
  _count?: { partes: number };
}

const ESTATUS_OPTIONS = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PRODUCCION', label: 'En Producción' },
  { value: 'CALIDAD', label: 'En Calidad' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const PRIORIDAD_OPTIONS = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

const VERSION = '1.0.0';

const DEMO_ORDENES: OrdenTrabajo[] = [
  {
    id: '1',
    folio: 'OT-2026-001',
    estatus: 'EN_PRODUCCION',
    prioridad: 'ALTA',
    fecha: '2026-09-10',
    responsable: 'Carlos Mendoza',
    cliente: 'Maquinados del Norte S.A.',
    _count: { partes: 5 },
  },
  {
    id: '2',
    folio: 'OT-2026-002',
    estatus: 'PENDIENTE',
    prioridad: 'MEDIA',
    fecha: '2026-09-12',
    responsable: 'Ana García',
    cliente: 'Tecnología Avanzada MX',
    _count: { partes: 3 },
  },
  {
    id: '3',
    folio: 'OT-2026-003',
    estatus: 'COMPLETADA',
    prioridad: 'BAJA',
    fecha: '2026-09-05',
    responsable: 'Luis Ramírez',
    cliente: 'Industrias Ferromex',
    _count: { partes: 12 },
  },
  {
    id: '4',
    folio: 'OT-2026-004',
    estatus: 'CALIDAD',
    prioridad: 'ALTA',
    fecha: '2026-09-15',
    responsable: 'Carlos Mendoza',
    cliente: 'Automatización Integral',
    _count: { partes: 8 },
  },
  {
    id: '5',
    folio: 'OT-2026-005',
    estatus: 'PENDIENTE',
    prioridad: 'MEDIA',
    fecha: '2026-09-08',
    responsable: 'Ana García',
    cliente: 'Mecánica Progreso',
    _count: { partes: 6 },
  },
];

const DEMO_COTIZACIONES_APROBADAS = [
  { id: 'cot-1', folio: 'COT-2026-0042', cliente: 'Industrias Beta', total: 45000 },
  { id: 'cot-2', folio: 'COT-2026-0043', cliente: 'Metalúrgica del Sur', total: 128000 },
  { id: 'cot-3', folio: 'COT-2026-0044', cliente: 'Mecanizados Precisión', total: 32000 },
];

export default function ProduccionPage() {
  return (
    <AppLayout>
      <ProduccionContent />
    </AppLayout>
  );
}

function ProduccionContent() {
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [meta, setMeta] = useState<{ total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showConvertirModal, setShowConvertirModal] = useState(false);

  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState('');
  const [responsableConvertir, setResponsableConvertir] = useState('');
  const [convertirLoading, setConvertirLoading] = useState(false);
  const [convertirError, setConvertirError] = useState('');

  useEffect(() => {
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
            o.cliente?.toLowerCase().includes(q) ||
            o.responsable?.toLowerCase().includes(q)
        );
      }
      setOrdenes(filtered);
      setMeta({ total: filtered.length });
      setLoading(false);
    }, 400);
  }

  function handleConvertirCotizacion(e: React.FormEvent) {
    e.preventDefault();
    setConvertirError('');

    if (!cotizacionSeleccionada) {
      setConvertirError('Seleccione una cotización');
      return;
    }

    setConvertirLoading(true);
    setTimeout(() => {
      setConvertirLoading(false);
      setShowConvertirModal(false);
      setCotizacionSeleccionada('');
      setResponsableConvertir('');
    }, 1000);
  }

  function handleFolioClick(id: string) {
    router.push(`/produccion/ot/${id}`);
  }

  const ordenesActivas = ordenes.filter(
    (o) => o.estatus !== 'CANCELADA'
  ).length;
  const pendientes = ordenes.filter((o) => o.estatus === 'PENDIENTE').length;
  const enProceso = ordenes.filter((o) => o.estatus === 'EN_PRODUCCION' || o.estatus === 'CALIDAD').length;
  const completadas = ordenes.filter((o) => o.estatus === 'COMPLETADA').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Producción</h1>
          <p className="text-sm text-muted-foreground">
            Órdenes de trabajo, operaciones y control de calidad
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowConvertirModal(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Convertir Cotización
          </Button>
          <Button size="sm" className="gap-2" disabled>
            <Plus className="h-4 w-4" />
            Nueva OT
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Órdenes activas" value={ordenesActivas} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard title="Pendientes" value={pendientes} icon={<Clock className="h-4 w-4" />} variant="warning" />
        <StatCard title="En proceso" value={enProceso} icon={<Loader2 className="h-4 w-4" />} variant="default" />
        <StatCard title="Completadas" value={completadas} icon={<CheckCircle2 className="h-4 w-4" />} variant="success" />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por folio, cliente o responsable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrdenes()}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
          />
        </div>
        <Button variant="outline" size="sm" onClick={loadOrdenes} className="gap-2">
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folio</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Partes</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows colCount={8} />
            ) : ordenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              ordenes.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => handleFolioClick(o.id)}
                      className="text-primary hover:underline focus:outline-none"
                    >
                      {o.folio}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.cliente || '—'}
                  </TableCell>
                  <TableCell>{o._count?.partes || 0}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(o.fecha + 'T00:00:00').toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell>
                    <PrioridadBadge prioridad={o.prioridad} />
                  </TableCell>
                  <TableCell>
                    <EstatusBadge estatus={o.estatus} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.responsable || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleFolioClick(o.id)}
                        title="Ver detalle"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          {meta && !loading && ordenes.length > 0 && (
            <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3 text-sm text-muted-foreground rounded-b-xl">
              <span>
                Mostrando {ordenes.length} de {meta.total} órdenes
              </span>
            </div>
          )}
        </Table>
      </TableContainer>

      <footer className="border-t pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} AMD México Operations ERP &middot; v{VERSION}
        </p>
      </footer>

      {/* Modal Convertir Cotización a OT */}
      {showConvertirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b pb-4">
              <CardTitle>Convertir Cotización a OT</CardTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setShowConvertirModal(false);
                  setConvertirError('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleConvertirCotizacion} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Cotización Aprobada *
                  </label>
                  <select
                    value={cotizacionSeleccionada}
                    onChange={(e) => setCotizacionSeleccionada(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    required
                  >
                    <option value="">Seleccionar cotización...</option>
                    {DEMO_COTIZACIONES_APROBADAS.map((cot) => (
                      <option key={cot.id} value={cot.id}>
                        {cot.folio} — {cot.cliente} (${cot.total.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Responsable (Manager)
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={responsableConvertir}
                      onChange={(e) => setResponsableConvertir(e.target.value)}
                      placeholder="Nombre del responsable"
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>

                {convertirError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {convertirError}
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowConvertirModal(false);
                      setConvertirError('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="gap-2" disabled={convertirLoading}>
                    {convertirLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <ArrowRightLeft className="h-4 w-4" />
                    Convertir a OT
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
    EN_PRODUCCION: 'default',
    CALIDAD: 'default',
    COMPLETADA: 'success',
    CANCELADA: 'destructive',
  };
  const labelMap: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    EN_PRODUCCION: 'En Producción',
    CALIDAD: 'En Calidad',
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
        No hay órdenes de trabajo
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Convierta una cotización aprobada para comenzar
      </p>
    </div>
  );
}
