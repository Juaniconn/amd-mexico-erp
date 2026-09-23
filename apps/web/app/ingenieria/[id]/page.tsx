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
  FileText,
  Upload,
  Settings,
  Wrench,
  CheckCircle,
  Clock,
  DollarSign,
  Layers,
  ArrowLeft,
  Calendar,
  User,
  StickyNote,
  Loader2,
  Hash,
  AlertCircle,
  History,
} from 'lucide-react';
import { IngenieriaProyecto, EnumIngenieriaEstatus } from '@/types';
import { UploadPlanoModal } from '../components/UploadPlanoModal';
import { resolveApiUrl } from '@/lib/api';

function getBadgeVariant(status: EnumIngenieriaEstatus): string {
  const variants: Record<EnumIngenieriaEstatus, string> = {
    PENDIENTE_PLANOS: 'secondary',
    EN_DISENO: 'warning',
    LISTO_COTIZAR: 'default',
    COTIZADO: 'default',
    EN_PRODUCCION: 'default',
    LIBERADO: 'success',
    OBSOLETO: 'destructive',
  };
  return variants[status] || 'secondary';
}

function getStatusLabel(status: EnumIngenieriaEstatus): string {
  const labels: Record<EnumIngenieriaEstatus, string> = {
    PENDIENTE_PLANOS: 'Pendiente de Planos',
    EN_DISENO: 'En Diseño',
    LISTO_COTIZAR: 'Listo para Cotizar',
    COTIZADO: 'Cotizado',
    EN_PRODUCCION: 'En Producción',
    LIBERADO: 'Liberado',
    OBSOLETO: 'Obsoleto',
  };
  return labels[status] || status;
}

export default function IngenieriaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [proyecto, setProyecto] = useState<IngenieriaProyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const fetchProyecto = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(resolveApiUrl(`/api/ingenieria/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProyecto(data);
      } else if (res.status === 404) {
        setError('Proyecto no encontrado');
      } else {
        setError('Error al cargar proyecto');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProyecto();
  }, [fetchProyecto]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const token = localStorage.getItem('accessToken');
      let url = resolveApiUrl(`/api/ingenieria/${id}`);
      
      if (action === 'iniciar_diseno') {
        url += '';
        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'EN_DISENO' }),
        });
        if (!res.ok) throw new Error();
      } else if (action === 'listo_cotizar') {
        url += '';
        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'LISTO_COTIZAR' }),
        });
        if (!res.ok) throw new Error();
      } else if (action === 'cotizar') {
        url += '/cotizar';
        const res = await fetch(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Error al cotizar');
        }
        const data = await res.json();
        if (data?.cotizacion?.id) {
          router.push(`/cotizaciones/${data.cotizacion.id}`);
          return;
        }
      } else if (action === 'liberar') {
        url += '/liberar';
        const res = await fetch(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
      }
      await fetchProyecto();
    } catch (err: any) {
      setError(err?.message || 'Error al realizar acción');
    } finally {
      setActionLoading('');
    }
  };

  const canStartDesign = proyecto?.status === 'PENDIENTE_PLANOS';
  const canMarkReadyToQuote = proyecto?.status === 'EN_DISENO';
  const canCotizar =
    proyecto?.status === 'LISTO_COTIZAR' ||
    proyecto?.status === 'EN_DISENO' ||
    proyecto?.status === 'PENDIENTE_PLANOS';
  const canRelease = proyecto?.status === 'LISTO_COTIZAR' || proyecto?.status === 'COTIZADO';

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Regresar
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!proyecto) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{proyecto.codigo}</h1>
                <Badge variant={getBadgeVariant(proyecto.status) as any}>
                  {getStatusLabel(proyecto.status)}
                </Badge>
              </div>
              <p className="text-muted-foreground">{proyecto.nombre}</p>
            </div>
          </div>
        </div>

        {/* General Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="card-premium lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="w-5 h-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Código:</span>
                  <span>{proyecto.codigo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Cliente:</span>
                  <span>{proyecto.cliente?.razonSocial}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Fecha Inicio:</span>
                  <span>{proyecto.fechaInicio ? new Date(proyecto.fechaInicio).toLocaleDateString('es-MX') : 'No definida'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Fecha Estimada:</span>
                  <span>{proyecto.fechaEstimada ? new Date(proyecto.fechaEstimada).toLocaleDateString('es-MX') : 'No definida'}</span>
                </div>
              </div>
              {proyecto.descripcion && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">{proyecto.descripcion}</p>
                </div>
              )}
              {proyecto.notas && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-1">Notas:</p>
                  <p className="text-sm text-muted-foreground">{proyecto.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Acciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                disabled={!canStartDesign || !!actionLoading}
                onClick={() => handleAction('iniciar_diseno')}
              >
                {actionLoading === 'iniciar_diseno' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wrench className="w-4 h-4 mr-2" />
                )}
                Iniciar Diseño
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                disabled={!canMarkReadyToQuote || !!actionLoading}
                onClick={() => handleAction('listo_cotizar')}
              >
                {actionLoading === 'listo_cotizar' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <DollarSign className="w-4 h-4 mr-2" />
                )}
                Marcar Listo para Cotizar
              </Button>
              <Button
                className="w-full justify-start"
                disabled={!canCotizar || !!actionLoading}
                onClick={() => handleAction('cotizar')}
              >
                {actionLoading === 'cotizar' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Generar Cotización
              </Button>
              <Button
                className="w-full justify-start"
                disabled={!canRelease || !!actionLoading}
                onClick={() => handleAction('liberar')}
              >
                {actionLoading === 'liberar' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Liberar a Producción
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Planos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Planos ({proyecto.planos?.length || 0})
            </CardTitle>
            <Button size="sm" onClick={() => setUploadModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Subir Plano
            </Button>
          </CardHeader>
          <CardContent>
            {!proyecto.planos || proyecto.planos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p>No hay planos cargados</p>
              </div>
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parte Número</TableHead>
                      <TableHead>Versión</TableHead>
                      <TableHead>Archivo</TableHead>
                      <TableHead>Subido por</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proyecto.planos?.map((plano) => (
                      <TableRow key={plano.id}>
                        <TableCell className="font-mono">{plano.parteNumero}</TableCell>
                        <TableCell>v{plano.version}</TableCell>
                        <TableCell className="truncate max-w-[200px]">{plano.archivoUrl.split('/').pop()}</TableCell>
                        <TableCell>
                          {plano.uploadedByUser
                            ? `${plano.uploadedByUser.nombre} ${plano.uploadedByUser.apellido}`
                            : '-'}
                        </TableCell>
                        <TableCell>{new Date(plano.uploadedAt).toLocaleDateString('es-MX')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Procesos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Procesos de Manufactura ({proyecto.procesos?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!proyecto.procesos || proyecto.procesos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Wrench className="w-12 h-12 mb-4 opacity-50" />
                <p>No hay procesos definidos</p>
              </div>
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sec.</TableHead>
                      <TableHead>Parte Número</TableHead>
                      <TableHead>Proceso</TableHead>
                      <TableHead>Tiempo Est.</TableHead>
                      <TableHead>Máquina</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Costo Est.</TableHead>
                      <TableHead>Estatus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proyecto.procesos?.map((proceso) => (
                      <TableRow key={proceso.id}>
                        <TableCell>{proceso.secuencia}</TableCell>
                        <TableCell className="font-mono">{proceso.parteNumero}</TableCell>
                        <TableCell>{proceso.proceso}</TableCell>
                        <TableCell>
                          {proceso.tiempoEstimado
                            ? `${proceso.tiempoEstimado} min`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {proceso.maquina
                            ? `${proceso.maquina.codigo} - ${proceso.maquina.nombre}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {proceso.operador
                            ? `${proceso.operador.nombre} ${proceso.operador.apellido}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {proceso.costoEstimado
                            ? `$${Number(proceso.costoEstimado).toFixed(2)}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{proceso.estatus}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <UploadPlanoModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        proyectoId={id}
        onUploadSuccess={fetchProyecto}
      />
    </AppLayout>
  );
}
