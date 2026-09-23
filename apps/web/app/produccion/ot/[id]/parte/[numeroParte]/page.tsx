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
  TrendingUp,
  PlusCircle,
} from 'lucide-react';
import type { ParteOT, EstatusParteOT, EstatusOperacion } from '@/types';
import { get, post, ApiError } from '@/lib/api';

const ESTATUS_OPERACION_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  COMPLETADA: 'Completada',
  RECHAZADA: 'Rechazada',
};

const ESTATUS_OPERACION_VARIANTS: Record<string, 'warning' | 'default' | 'success' | 'destructive' | 'secondary'> = {
  PENDIENTE: 'warning',
  EN_PROCESO: 'default',
  COMPLETADA: 'success',
  RECHAZADA: 'destructive',
};

const ESTATUS_CALIDAD_LABELS: Record<string, string> = {
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  REWORK: 'Rework',
};

const ESTATUS_CALIDAD_VARIANTS: Record<string, 'success' | 'destructive' | 'warning'> = {
  APROBADO: 'success',
  RECHAZADO: 'destructive',
  REWORK: 'warning',
};

interface Operacion {
  id: string;
  secuencia: number;
  proceso: string;
  maquina?: { id: string; codigo: string; nombre: string } | null;
  operador?: { id: string; nombre: string; apellido: string } | null;
  tiempoEstimado?: number;
  tiempoReal?: number;
  estatus: EstatusOperacion;
  notas?: string;
  inspecciones?: any[];
}

interface Inspeccion {
  id: string;
  inspector?: { id: string; nombre: string; apellido: string } | null;
  fecha: string;
  resultado: string;
  defectos?: string;
  observaciones?: string;
}

interface Maquina {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
}

interface Operador {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  role: string;
}

interface ParteDetalle extends ParteOT {
  operaciones: Operacion[];
  inspecciones: Inspeccion[];
  material?: {
    id: string;
    codigo: string;
    descripcion: string;
    stockActual: number;
  } | null;
}

export default function ParteOTDetailPage() {
  return (
    <AppLayout>
      <ParteOTDetail />
    </AppLayout>
  );
}

function ParteOTDetail() {
  const params = useParams();
  const router = useRouter();
  const otId = params.id as string;
  const numeroParte = params.numeroParte as string;

  const [parte, setParte] = useState<ParteDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modal de agregar proceso
  const [showAddModal, setShowAddModal] = useState(false);
  const [proceso, setProceso] = useState('');
  const [procesoError, setProcesoError] = useState('');
  const [maquinaId, setMaquinaId] = useState('');
  const [operadorId, setOperadorId] = useState('');
  const [tiempoEstimado, setTiempoEstimado] = useState('');
  const [notas, setNotas] = useState('');
  const [secuencia, setSecuencia] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Datos para selects
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);

  const fetchParte = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await get<ParteDetalle>(
        `/api/partes-ot/orden-trabajo/${otId}/parte/${encodeURIComponent(numeroParte)}`
      );
      setParte(data);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        setError('Parte no encontrada');
      } else {
        setError(err?.message || 'Error al cargar la parte');
      }
    } finally {
      setLoading(false);
    }
  }, [otId, numeroParte]);

  const fetchMaquinasYOperadores = useCallback(async () => {
    try {
      const [maquinasData, operadoresData] = await Promise.all([
        get<Maquina[]>('/api/maquinas'),
        get<Operador[]>('/api/usuarios/operadores'),
      ]);
      setMaquinas(maquinasData);
      setOperadores(operadoresData);
    } catch (err) {
      console.error('Error cargando máquinas/operadores:', err);
    }
  }, []);

  useEffect(() => {
    fetchParte();
    fetchMaquinasYOperadores();
  }, [fetchParte, fetchMaquinasYOperadores]);

  const openAddModal = () => {
    setProceso('');
    setProcesoError('');
    setMaquinaId('');
    setOperadorId('');
    setTiempoEstimado('');
    setNotas('');
    setSecuencia('');
    setSaveError('');
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddProceso = async () => {
    if (!proceso.trim()) {
      setProcesoError('El nombre del proceso es obligatorio');
      return;
    }
    if (!parte) return;

    setSaving(true);
    setSaveError('');
    setProcesoError('');

    try {
      await post(`/api/partes-ot/${parte.id}/operaciones`, {
        proceso: proceso.trim(),
        maquinaId: maquinaId || undefined,
        operadorId: operadorId || undefined,
        tiempoEstimado: tiempoEstimado ? parseFloat(tiempoEstimado) : undefined,
        notas: notas.trim() || undefined,
        secuencia: secuencia ? parseInt(secuencia, 10) : undefined,
      });
      await fetchParte();
      closeAddModal();
    } catch (err: any) {
      setSaveError(err?.message || 'Error al guardar el proceso');
    } finally {
      setSaving(false);
    }
  };

  const getEstatusIcon = (estatus: string) => {
    switch (estatus) {
      case 'PENDIENTE':
        return <Clock className="h-4 w-4" />;
      case 'EN_PROCESO':
        return <PlayCircle className="h-4 w-4" />;
      case 'COMPLETADA':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'RECHAZADA':
        return <Ban className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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

  if (!parte) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">
          Parte no encontrada
        </p>
      </div>
    );
  }

  const totalOperaciones = parte.operaciones.length;
  const completadas = parte.operaciones.filter((o) => o.estatus === 'COMPLETADA').length;
  const enProceso = parte.operaciones.filter((o) => o.estatus === 'EN_PROCESO').length;
  const pendientes = parte.operaciones.filter((o) => o.estatus === 'PENDIENTE').length;
  const calidadAprobada = parte.inspecciones.filter((i) => i.resultado === 'APROBADO').length;
  const calidadRechazada = parte.inspecciones.filter((i) => i.resultado === 'RECHAZADO').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push(`/produccion/ot/${otId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{parte.numeroParte}</h1>
          <p className="text-sm text-muted-foreground">
            {parte.piezaNombre}
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField
              icon={<FileText className="h-4 w-4" />}
              label="No. Parte"
              value={parte.numeroParte || '—'}
            />
            <InfoField
              icon={<PackageSearch className="h-4 w-4" />}
              label="Pieza"
              value={parte.piezaNombre}
            />
            <InfoField
              icon={<Hash className="h-4 w-4" />}
              label="Cantidad"
              value={`${parte.cantidad} ${parte.unidad}`}
            />
            <InfoField
              icon={<User className="h-4 w-4" />}
              label="Operador"
              value={parte.operador ? `${parte.operador.nombre} ${parte.operador.apellido}` : '—'}
            />
            <InfoField
              icon={<Factory className="h-4 w-4" />}
              label="Máquina"
              value={parte.maquina ? `${parte.maquina.codigo} — ${parte.maquina.nombre}` : '—'}
            />
            <InfoField
              icon={<CalendarDays className="h-4 w-4" />}
              label="Fecha Creación"
              value={new Date(parte.createdAt).toLocaleDateString('es-MX')}
            />
          </div>

          {parte.descripcion && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                Descripción
              </p>
              <p className="text-sm">{parte.descripcion}</p>
            </div>
          )}

          {parte.notas && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                Notas
              </p>
              <p className="text-sm">{parte.notas}</p>
            </div>
          )}

          {parte.material && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                Material
              </p>
              <p className="text-sm">
                <span className="font-mono font-medium">{parte.material.codigo}</span>
                <span className="text-muted-foreground"> — {parte.material.descripcion}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Stock actual: {parte.material.stockActual}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas de Procesos */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Procesos" value={totalOperaciones} />
        <StatCard label="Pendientes" value={pendientes} variant="warning" />
        <StatCard label="En Proceso" value={enProceso} variant="default" />
        <StatCard label="Completados" value={completadas} variant="success" />
      </div>

      {/* Procesos */}
      <Card className="card-premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Procesos
            </CardTitle>
            <Button
              size="sm"
              onClick={openAddModal}
              className="gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              Agregar Proceso
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {parte.operaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No hay procesos registrados para esta parte
              </p>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Sec.</TableHead>
                    <TableHead>Proceso</TableHead>
                    <TableHead>Máquina</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead className="text-right">Tiempo Est.</TableHead>
                    <TableHead className="text-right">Tiempo Real</TableHead>
                    <TableHead>Estatus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parte.operaciones.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {op.secuencia}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{op.proceso}</span>
                        {op.notas && (
                          <p className="text-xs text-muted-foreground mt-0.5">{op.notas}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {op.maquina ? (
                          <span className="text-xs">
                            <span className="font-medium">{op.maquina.codigo}</span>
                            <span className="text-muted-foreground"> — {op.maquina.nombre}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {op.operador
                          ? `${op.operador.nombre} ${op.operador.apellido}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {op.tiempoEstimado ? `${op.tiempoEstimado}h` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {op.tiempoReal ? `${op.tiempoReal}h` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={ESTATUS_OPERACION_VARIANTS[op.estatus] || 'default'}
                          className="gap-1.5"
                        >
                          {getEstatusIcon(op.estatus)}
                          {ESTATUS_OPERACION_LABELS[op.estatus] || op.estatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Inspecciones de Calidad */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Inspecciones de Calidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          {parte.inspecciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No hay inspecciones registradas para esta parte
              </p>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Defectos</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parte.inspecciones.map((insp) => (
                    <TableRow key={insp.id}>
                      <TableCell>
                        {insp.inspector
                          ? `${insp.inspector.nombre} ${insp.inspector.apellido}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {new Date(insp.fecha).toLocaleDateString('es-MX')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={ESTATUS_CALIDAD_VARIANTS[insp.resultado] || 'default'}
                          className="gap-1.5"
                        >
                          {insp.resultado === 'APROBADO' && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {insp.resultado === 'RECHAZADO' && <Ban className="h-3.5 w-3.5" />}
                          {insp.resultado === 'REWORK' && <PauseCircle className="h-3.5 w-3.5" />}
                          {ESTATUS_CALIDAD_LABELS[insp.resultado] || insp.resultado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {insp.defectos || '—'}
                      </TableCell>
                      <TableCell>
                        {insp.observaciones || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal Agregar Proceso */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={closeAddModal}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-lg font-bold">Agregar Proceso</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Proceso <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={proceso}
                  onChange={(e) => { setProceso(e.target.value); setProcesoError(''); }}
                  placeholder="ej. Corte, Soldadura, Ensamble..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {procesoError && <p className="mt-1 text-xs text-destructive">{procesoError}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Secuencia</label>
                  <input
                    type="number"
                    value={secuencia}
                    onChange={(e) => setSecuencia(e.target.value)}
                    placeholder="Auto"
                    min="1"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Dejar vacío para asignar automáticamente</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Tiempo Estimado (hrs)</label>
                  <input
                    type="number"
                    value={tiempoEstimado}
                    onChange={(e) => setTiempoEstimado(e.target.value)}
                    placeholder="ej. 2.5"
                    min="0"
                    step="0.1"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Máquina</label>
                <select
                  value={maquinaId}
                  onChange={(e) => setMaquinaId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">— Sin asignar —</option>
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.codigo} — {m.nombre} ({m.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Operador</label>
                <select
                  value={operadorId}
                  onChange={(e) => setOperadorId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">— Sin asignar —</option>
                  {operadores.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre} {op.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Notas</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {saveError && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {saveError}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={closeAddModal}
                className="flex-1"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddProceso}
                className="flex-1"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Agregar Proceso'}
              </Button>
            </div>
          </div>
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

function Hash({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
