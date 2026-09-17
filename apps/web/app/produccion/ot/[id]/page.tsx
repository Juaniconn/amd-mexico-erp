'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Inbox,
  Wrench,
  User,
  Factory,
  CalendarDays,
  ClipboardList,
  Eye,
  PlayCircle,
  PauseCircle,
  Ban,
  PackageSearch,
  FileText,
  X,
} from 'lucide-react';
import type { OrdenTrabajo, ParteOT, EstatusParteOT } from '@/types';

const ESTATUS_PARTE_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  COMPLETADA: 'Completada',
  EN_INSPECCION: 'En Inspección',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  PAUSADA: 'Pausada',
  EN_ESPERA_MATERIAL: 'En Espera Material',
};

const ESTATUS_PARTE_VARIANTS: Record<string, 'warning' | 'default' | 'success' | 'destructive' | 'secondary'> = {
  PENDIENTE: 'warning',
  EN_PROCESO: 'default',
  COMPLETADA: 'success',
  EN_INSPECCION: 'default',
  APROBADA: 'success',
  RECHAZADA: 'destructive',
  PAUSADA: 'secondary',
  EN_ESPERA_MATERIAL: 'warning',
};

const CAMBIAR_ESTATUS_OPTIONS: EstatusParteOT[] = [
  'PENDIENTE',
  'EN_PROCESO',
  'COMPLETADA',
  'EN_INSPECCION',
  'APROBADA',
  'RECHAZADA',
  'PAUSADA',
  'EN_ESPERA_MATERIAL',
];

const DEMO_OT: OrdenTrabajo = {
  id: '1',
  folio: 'OT-2026-001',
  estatus: 'EN_PRODUCCION',
  prioridad: 'ALTA',
  fechaInicio: '2026-09-10',
  fechaFinEstimada: '2026-09-25',
  cotizacionId: 'cot-1',
  notas: 'Requiere inspección dimensional final. Material ya en almacén.',
  responsableId: 'usr-1',
  createdAt: '2026-09-10',
  updatedAt: '2026-09-14',
  responsable: { id: 'usr-1', nombre: 'Carlos', apellido: 'Mendoza' },
  cotizacion: {
    id: 'cot-1',
    folio: 'COT-2026-0042',
    clienteId: 'cli-1',
    fecha: '2026-09-08',
    moneda: 'MXN',
    validez: 30,
    subtotal: 0,
    iva: 0,
    total: 0,
    estatus: 'CONVERTIDA',
    createdAt: '2026-09-08',
    cliente: {
      id: 'cli-1',
      codigo: 'CLI-001',
      razonSocial: 'Maquinados del Norte S.A.',
      contacto: 'Ing. Roberto García',
      email: 'roberto@maquinadosnorte.com',
      ciudad: 'Monterrey',
      estado: 'Nuevo León',
      activo: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-09-01',
    },
  },
};

const DEMO_PARTES: ParteOT[] = [
  {
    id: 'p1',
    otId: '1',
    numeroParte: 'COT-2026-0042-P001',
    piezaNombre: 'Soporte estructural 40x60',
    descripcion: 'Soporte principal de acero',
    cantidad: 50,
    unidad: 'PZ',
    estatus: 'EN_PROCESO',
    operadorId: 'usr-2',
    operador: { id: 'usr-2', nombre: 'Luis', apellido: 'Ramírez' },
    maquinaId: 'mq-1',
    maquina: { id: 'mq-1', codigo: 'CNC-01', nombre: 'Centro de Maquinado Haas' },
    createdAt: '2026-09-10',
    updatedAt: '2026-09-14',
  },
  {
    id: 'p2',
    otId: '1',
    numeroParte: 'COT-2026-0042-P002',
    piezaNombre: 'Eje de transmisión',
    descripcion: 'Eje cilíndrico pulido',
    cantidad: 25,
    unidad: 'PZ',
    estatus: 'COMPLETADA',
    operadorId: 'usr-3',
    operador: { id: 'usr-3', nombre: 'Ana', apellido: 'García' },
    maquinaId: 'mq-2',
    maquina: { id: 'mq-2', codigo: 'TOR-01', nombre: 'Torno CNC Mori Seiki' },
    createdAt: '2026-09-10',
    updatedAt: '2026-09-13',
  },
  {
    id: 'p3',
    otId: '1',
    numeroParte: 'COT-2026-0042-P003',
    piezaNombre: 'Cubierta aluminio CNC',
    descripcion: 'Cubierta exterior',
    cantidad: 120,
    unidad: 'PZ',
    estatus: 'PENDIENTE',
    createdAt: '2026-09-10',
    updatedAt: '2026-09-10',
  },
  {
    id: 'p4',
    otId: '1',
    numeroParte: 'COT-2026-0042-P004',
    piezaNombre: 'Placa base templada',
    descripcion: 'Placa de acero templado',
    cantidad: 80,
    unidad: 'PZ',
    estatus: 'EN_ESPERA_MATERIAL',
    createdAt: '2026-09-10',
    updatedAt: '2026-09-10',
    notas: 'Material no ha llegado al almacén',
  },
  {
    id: 'p5',
    otId: '1',
    numeroParte: 'COT-2026-0042-P005',
    piezaNombre: 'Rodillo cilíndrico',
    descripcion: 'Rodillo estándar',
    cantidad: 200,
    unidad: 'PZ',
    estatus: 'EN_INSPECCION',
    operadorId: 'usr-2',
    operador: { id: 'usr-2', nombre: 'Luis', apellido: 'Ramírez' },
    maquinaId: 'mq-2',
    maquina: { id: 'mq-2', codigo: 'TOR-01', nombre: 'Torno CNC Mori Seiki' },
    createdAt: '2026-09-10',
    updatedAt: '2026-09-15',
  },
];

export default function OrdenTrabajoDetailPage() {
  return (
    <AppLayout>
      <OrdenTrabajoDetail />
    </AppLayout>
  );
}

function OrdenTrabajoDetail() {
  const params = useParams();
  const router = useRouter();
  const otId = params.id as string;

  const [ot, setOt] = useState<OrdenTrabajo | null>(null);
  const [partes, setPartes] = useState<ParteOT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showEstatusModal, setShowEstatusModal] = useState(false);
  const [parteSeleccionada, setParteSeleccionada] = useState<ParteOT | null>(null);
  const [nuevoEstatus, setNuevoEstatus] = useState<EstatusParteOT>('PENDIENTE');
  const [actualizandoEstatus, setActualizandoEstatus] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOt(DEMO_OT);
      setPartes(DEMO_PARTES);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [otId]);

  const getEstatusIcon = useCallback((estatus: string) => {
    switch (estatus) {
      case 'PENDIENTE':
        return <Clock className="h-4 w-4" />;
      case 'EN_PROCESO':
        return <PlayCircle className="h-4 w-4" />;
      case 'COMPLETADA':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'EN_INSPECCION':
        return <Eye className="h-4 w-4" />;
      case 'APROBADA':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'RECHAZADA':
        return <Ban className="h-4 w-4" />;
      case 'PAUSADA':
        return <PauseCircle className="h-4 w-4" />;
      case 'EN_ESPERA_MATERIAL':
        return <PackageSearch className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  }, []);

  function abrirModalEstatus(parte: ParteOT) {
    setParteSeleccionada(parte);
    setNuevoEstatus(parte.estatus as EstatusParteOT);
    setShowEstatusModal(true);
  }

  function handleActualizarEstatus(e: React.FormEvent) {
    e.preventDefault();
    if (!parteSeleccionada) return;

    setActualizandoEstatus(true);
    setTimeout(() => {
      setPartes((prev) =>
        prev.map((p) =>
          p.id === parteSeleccionada.id ? { ...p, estatus: nuevoEstatus } : p
        )
      );
      setShowEstatusModal(false);
      setParteSeleccionada(null);
      setActualizandoEstatus(false);
    }, 500);
  }

  const totalPartes = partes.length;
  const partesPendientes = partes.filter((p) => p.estatus === 'PENDIENTE').length;
  const partesEnProceso = partes.filter((p) => p.estatus === 'EN_PROCESO').length;
  const partesCompletadas = partes.filter(
    (p) => p.estatus === 'COMPLETADA' || p.estatus === 'APROBADA'
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!ot) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">
          Orden de trabajo no encontrada
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push('/produccion')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{ot.folio}</h1>
          <p className="text-sm text-muted-foreground">
            Detalle de orden de trabajo y partes
          </p>
        </div>
      </div>

      {/* Información General */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <InfoField
              icon={<FileText className="h-4 w-4" />}
              label="Folio"
              value={ot.folio}
            />
            <InfoField
              icon={<CalendarDays className="h-4 w-4" />}
              label="Fecha Inicio"
              value={
                ot.fechaInicio
                  ? new Date(ot.fechaInicio).toLocaleDateString('es-MX')
                  : '—'
              }
            />
            <InfoField
              icon={<CalendarDays className="h-4 w-4" />}
              label="Fecha Fin Estimada"
              value={
                ot.fechaFinEstimada
                  ? new Date(ot.fechaFinEstimada).toLocaleDateString('es-MX')
                  : '—'
              }
            />
            <InfoField
              icon={<BadgeIcon estatus={ot.estatus} />}
              label="Estatus"
              value={ot.estatus}
            />
            <InfoField
              icon={<AlertCircle className="h-4 w-4" />}
              label="Prioridad"
              value={ot.prioridad}
            />
            <InfoField
              icon={<Factory className="h-4 w-4" />}
              label="Cliente"
              value={ot.cotizacion?.cliente?.razonSocial || '—'}
            />
            <InfoField
              icon={<User className="h-4 w-4" />}
              label="Responsable"
              value={
                ot.responsable
                  ? `${ot.responsable.nombre} ${ot.responsable.apellido}`
                  : '—'
              }
            />
            <InfoField
              icon={<FileText className="h-4 w-4" />}
              label="Cotización Origen"
              value={ot.cotizacion?.folio || '—'}
            />
          </div>

          {ot.notas && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                Notas
              </p>
              <p className="text-sm">{ot.notas}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas de Partes */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Partes" value={totalPartes} />
        <StatCard label="Pendientes" value={partesPendientes} variant="warning" />
        <StatCard label="En Proceso" value={partesEnProceso} variant="default" />
        <StatCard label="Completadas" value={partesCompletadas} variant="success" />
      </div>

      {/* Tabla de Partes */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Números de Partes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Parte</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Estatus</TableHead>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Inbox className="mb-2 h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          No hay partes en esta orden de trabajo
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  partes.map((parte) => (
                    <TableRow key={parte.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {parte.numeroParte}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{parte.piezaNombre}</p>
                          {parte.descripcion && (
                            <p className="text-xs text-muted-foreground">
                              {parte.descripcion}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {parte.cantidad} {parte.unidad}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ESTATUS_PARTE_VARIANTS[parte.estatus] || 'default'
                          }
                          className="gap-1.5"
                        >
                          {getEstatusIcon(parte.estatus)}
                          {ESTATUS_PARTE_LABELS[parte.estatus] || parte.estatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {parte.maquina ? (
                          <span className="text-xs">
                            <span className="font-medium">
                              {parte.maquina.codigo}
                            </span>
                            <span className="text-muted-foreground">
                              {' '}
                              — {parte.maquina.nombre}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {parte.operador
                          ? `${parte.operador.nombre} ${parte.operador.apellido}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => abrirModalEstatus(parte)}
                            title="Cambiar estatus"
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal Cambiar Estatus */}
      {showEstatusModal && parteSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b pb-4">
              <CardTitle>Cambiar Estatus de Parte</CardTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowEstatusModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleActualizarEstatus} className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Parte seleccionada:</p>
                  <p className="font-mono text-xs font-medium">
                    {parteSeleccionada.numeroParte}
                  </p>
                  <p className="text-sm font-medium">
                    {parteSeleccionada.piezaNombre}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Nuevo Estatus
                  </label>
                  <select
                    value={nuevoEstatus}
                    onChange={(e) =>
                      setNuevoEstatus(e.target.value as EstatusParteOT)
                    }
                    className="w-full appearance-none rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  >
                    {CAMBIAR_ESTATUS_OPTIONS.map((estatus) => (
                      <option key={estatus} value={estatus}>
                        {ESTATUS_PARTE_LABELS[estatus]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEstatusModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={actualizandoEstatus}>
                    {actualizandoEstatus && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Actualizar Estatus
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

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function BadgeIcon({ estatus }: { estatus: string }) {
  switch (estatus) {
    case 'PENDIENTE':
      return <Clock className="h-4 w-4" />;
    case 'EN_PRODUCCION':
    case 'CALIDAD':
      return <PlayCircle className="h-4 w-4" />;
    case 'COMPLETADA':
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function StatCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}) {
  return (
    <Card className="card-premium">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            variant === 'success'
              ? 'bg-success-muted text-success'
              : variant === 'destructive'
              ? 'bg-destructive/10 text-destructive'
              : variant === 'warning'
              ? 'bg-warning-muted text-warning'
              : 'bg-primary/10 text-primary'
          }`}
        >
          <span className="text-sm font-bold">{value}</span>
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}
