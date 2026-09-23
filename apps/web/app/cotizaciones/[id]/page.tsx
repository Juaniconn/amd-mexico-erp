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
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  DollarSign,
  Hash,
  Package,
  Layers,
  TrendingUp,
  Loader2,
  AlertCircle,
  Inbox,
  Clock,
  XCircle,
  StickyNote,
  Wrench,
  X,
  Plus,
} from 'lucide-react';
import { get, put, del, post, ApiError } from '@/lib/api';
import type { CotizacionWithParts, DetalleCotizacion } from '@/types';

const ESTATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  BORRADOR: 'secondary',
  ENVIADA: 'default',
  EN_REVISION: 'warning',
  ACEPTADA: 'success',
  RECHAZADA: 'destructive',
  CANCELADA: 'outline',
  CONVERTIDA: 'success',
};

const ESTATUS_LABELS: Record<string, string> = {
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
    month: 'long',
    day: 'numeric',
  });
}

interface EditForm {
  moneda: string;
  fechaEntrega: string;
  notas: string;
  estatus: string;
  lineas: { numeroParte: string; descripcion: string; cantidad: number; unidad: string; precioUnitario: number }[];
}

export default function CotizacionDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cotizacion, setCotizacion] = useState<CotizacionWithParts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedOTId, setGeneratedOTId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<EditForm>({
    moneda: 'MXN',
    fechaEntrega: '',
    notas: '',
    estatus: 'BORRADOR',
    lineas: [],
  });

  const fetchCotizacion = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await get<CotizacionWithParts>(`/api/cotizaciones/${id}`);
      setCotizacion(data);
      // Si está convertida, buscar la OT asociada
      if (data.estatus === 'CONVERTIDA') {
        try {
          const ots = await get<{ id: string; folio: string }[]>(`/api/ordenes-trabajo/cotizacion/${id}`);
          if (ots && ots.length > 0) {
            setGeneratedOTId(ots[0].id);
          }
        } catch {
          // no hay OT
        }
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        setError('Cotización no encontrada');
      } else {
        setError(err?.message || 'Error al cargar cotización');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCotizacion();
  }, [fetchCotizacion]);

  const handleSend = async () => {
    setActionLoading('send');
    try {
      await put(`/api/cotizaciones/${id}`, { estatus: 'ENVIADA' });
      await fetchCotizacion();
    } catch (err: any) {
      setError(err?.message || 'Error al enviar cotización');
    } finally {
      setActionLoading('');
    }
  };

  const handleAprobar = async () => {
    if (!confirm('¿Está seguro de aprobar esta cotización? Se convertirá en una Orden de Trabajo.')) return;
    setActionLoading('approve');
    try {
      const result = await post<{ id: string }>(`/api/cotizaciones/${id}/aprobar`, {});
      setGeneratedOTId(result?.id || null);
      await fetchCotizacion();
    } catch (err: any) {
      setError(err?.message || 'Error al aprobar');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!confirm('¿Está seguro de rechazar esta cotización?')) return;
    setActionLoading('reject');
    try {
      await put(`/api/cotizaciones/${id}`, { estatus: 'RECHAZADA' });
      await fetchCotizacion();
    } catch (err: any) {
      setError(err?.message || 'Error al rechazar');
    } finally {
      setActionLoading('');
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Está seguro de cancelar esta cotización?')) return;
    setActionLoading('cancel');
    try {
      await put(`/api/cotizaciones/${id}`, { estatus: 'CANCELADA' });
      await fetchCotizacion();
    } catch (err: any) {
      setError(err?.message || 'Error al cancelar');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de eliminar esta cotización?')) return;
    setActionLoading('delete');
    try {
      await del(`/api/cotizaciones/${id}`);
      router.push('/cotizaciones');
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar cotización');
    } finally {
      setActionLoading('');
    }
  };

  const handleConvertToOT = async () => {
    if (!confirm('¿Está seguro de convertir esta cotización a Orden de Trabajo?')) return;
    setActionLoading('convert');
    try {
      const result = await post<{ id: string }>(`/api/ordenes-trabajo/convertir-cotizacion`, {
        cotizacionId: id,
      });
      await fetchCotizacion();
      if (result?.id) {
        router.push(`/produccion/ot/${result.id}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al convertir a OT');
    } finally {
      setActionLoading('');
    }
  };

  function openEditModal() {
    if (!cotizacion) return;
    setEditForm({
      moneda: cotizacion.moneda || 'MXN',
      fechaEntrega: (cotizacion as any).fechaEntrega || '',
      notas: cotizacion.notas || '',
      estatus: cotizacion.estatus || 'BORRADOR',
      lineas: (cotizacion.detalles || []).map((d: DetalleCotizacion) => ({
        numeroParte: (d as any).numeroParte || '',
        descripcion: d.piezaNombre || '',
        cantidad: d.cantidad || 1,
        unidad: d.unidad || 'PZA',
        precioUnitario: Number(d.precioUnitario) || 0,
      })),
    });
    setShowEditModal(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await put(`/api/cotizaciones/${id}`, {
        moneda: editForm.moneda,
        notas: editForm.notas || undefined,
        estatus: editForm.estatus,
        detalles: editForm.lineas.length > 0
          ? editForm.lineas.map(l => ({
              numeroParte: l.numeroParte,
              piezaNombre: l.descripcion,
              cantidad: Number(l.cantidad),
              unidad: l.unidad,
              precioUnitario: Number(l.precioUnitario),
            }))
          : undefined,
      });
      setShowEditModal(false);
      await fetchCotizacion();
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la cotización');
    } finally {
      setSaving(false);
    }
  }

  function addEditLinea() {
    setEditForm({
      ...editForm,
      lineas: [...editForm.lineas, { numeroParte: '', descripcion: '', cantidad: 1, unidad: 'PZA', precioUnitario: 0 }],
    });
  }

  function removeEditLinea(index: number) {
    setEditForm({
      ...editForm,
      lineas: editForm.lineas.filter((_, i) => i !== index),
    });
  }

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/cotizaciones')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Regresar a Cotizaciones
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!cotizacion) return null;

  const estatus = cotizacion.estatus;
  const isEditable = estatus === 'BORRADOR' || estatus === 'EN_REVISION';
  const isAprobada = estatus === 'ACEPTADA' || estatus === 'CONVERTIDA';
  const detalles = cotizacion.detalles || [];
  const moneda = cotizacion.moneda || 'MXN';
  const subtotal = Number(cotizacion.subtotal) || 0;
  const iva = Number(cotizacion.iva) || 0;
  const total = Number(cotizacion.total) || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/cotizaciones')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Detalle de Cotización {cotizacion.folio}
                </h1>
                <Badge variant={ESTATUS_VARIANTS[estatus] || 'secondary'}>
                  {ESTATUS_LABELS[estatus] || estatus}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">
                Creada el {formatDate(cotizacion.createdAt || cotizacion.fecha)}
              </p>
            </div>
          </div>

        </div>

        {/* Status Stepper - Visual del flujo */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Progreso del flujo</span>
            <Badge variant={ESTATUS_VARIANTS[estatus] || 'secondary'}>
              {ESTATUS_LABELS[estatus] || estatus}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {['BORRADOR', 'ENVIADA', 'ACEPTADA'].map((step, idx) => {
              const stepOrder = ['BORRADOR', 'ENVIADA', 'EN_REVISION', 'ACEPTADA', 'CONVERTIDA'];
              const currentIdx = stepOrder.indexOf(estatus);
              const stepIdx = idx;
              const isActive = currentIdx >= stepIdx;
              const isCurrent = stepOrder[currentIdx] === step;
              const isRejected = estatus === 'RECHAZADA' && step === 'ACEPTADA';
              const isCanceled = estatus === 'CANCELADA' && step === 'ACEPTADA';
              return (
                <div key={step} className="flex items-center gap-1 flex-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                    isCurrent ? 'bg-brand text-white' :
                    isActive ? 'bg-success/20 text-success' :
                    'bg-muted text-muted-foreground'
                  } ${isRejected || isCanceled ? 'bg-destructive/20 text-destructive' : ''}`}>
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${
                    isCurrent ? 'text-foreground' : isActive ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {step === 'BORRADOR' ? 'Borrador' : step === 'ENVIADA' ? 'Enviada' : 'Aprobada'}
                  </span>
                  {idx < 2 && (
                    <div className={`h-0.5 flex-1 ${currentIdx > idx ? 'bg-success' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons - Contextual según estado */}
        <div className="flex flex-wrap gap-2">
          {(estatus === 'BORRADOR' || estatus === 'EN_REVISION') && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleSend}
                disabled={!!actionLoading}
                className="gap-2"
              >
                {actionLoading === 'send' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {estatus === 'BORRADOR' ? 'Enviar' : 'Reenviar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openEditModal}
                disabled={!!actionLoading}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={!!actionLoading}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            </>
          )}

          {estatus === 'ENVIADA' && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleAprobar}
                disabled={!!actionLoading}
                className="gap-2 bg-success hover:bg-success/90"
              >
                {actionLoading === 'approve' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Aprobar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={!!actionLoading}
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                {actionLoading === 'reject' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Rechazar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={!!actionLoading}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </>
          )}

          {estatus === 'ACEPTADA' && (
            <Button
              variant="default"
              size="sm"
              onClick={handleConvertToOT}
              disabled={!!actionLoading}
              className="gap-2 bg-success hover:bg-success/90"
            >
              <CheckCircle2 className="w-4 h-4" />
              Convertir a OT
            </Button>
          )}

          {estatus === 'CONVERTIDA' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (generatedOTId) {
                  router.push(`/produccion/ot/${generatedOTId}`);
                } else {
                  router.push(`/produccion?cotizacionId=${id}`);
                }
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver OT
            </Button>
          )}

          {(estatus === 'RECHAZADA' || estatus === 'CANCELADA') && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Esta cotización está {estatus === 'RECHAZADA' ? 'rechazada' : 'cancelada'}. No se pueden realizar más acciones.
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* General Info + Totals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Information Card */}
          <Card className="card-premium lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">Folio:</span>
                  <span>{cotizacion.folio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">Fecha:</span>
                  <span>{formatDate(cotizacion.fecha)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">Cliente:</span>
                  <span>{cotizacion.cliente?.razonSocial || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">Moneda:</span>
                  <Badge variant="outline">{moneda}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">Validez:</span>
                  <span>{cotizacion.validez} días</span>
                </div>
                {cotizacion.tipoCambio && Number(cotizacion.tipoCambio) > 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">Tipo de cambio:</span>
                    <span>{Number(cotizacion.tipoCambio).toFixed(4)}</span>
                  </div>
                )}
                {cotizacion.cliente?.rfc && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">RFC:</span>
                    <span>{cotizacion.cliente.rfc}</span>
                  </div>
                )}
                {cotizacion.cliente?.ciudad && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Ciudad:</span>
                    <span>
                      {cotizacion.cliente.ciudad}
                      {cotizacion.cliente.estado ? `, ${cotizacion.cliente.estado}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {cotizacion.notas && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-1">
                    <StickyNote className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Notas:</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {cotizacion.notas}
                  </p>
                </div>
              )}

              {cotizacion.creador && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Creador:</span>
                    <span className="text-sm text-muted-foreground">
                      {cotizacion.creador.nombre} {cotizacion.creador.apellido}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals Card */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Totales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal, moneda)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IVA (16%)</span>
                <span className="font-medium">{formatCurrency(iva, moneda)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(total, moneda)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parts/Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Partidas ({detalles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detalles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  No hay partidas registradas
                </p>
              </div>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead className="w-28">No. Parte</TableHead>
                        <TableHead>Pieza / Descripción</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead className="text-right">Precio Unitario</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detalles.map((d: DetalleCotizacion, idx: number) => (
                        <TableRow key={d.id || idx}>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {(d as any).numeroParte || '—'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">{d.piezaNombre}</span>
                              {d.piezaDescripcion && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {d.piezaDescripcion}
                                </p>
                              )}
                              {(d as any).archivoPlanoId && (
                                <p className="text-xs text-brand mt-0.5 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Plano ligado
                                </p>
                              )}
                              {d.procesoRequerido && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Wrench className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {d.procesoRequerido}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {d.cantidad}
                          </TableCell>
                          <TableCell>{d.unidad}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number(d.precioUnitario), moneda)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number(d.subtotal), moneda)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Totals at the bottom of table */}
                <div className="mt-4 flex justify-end">
                  <div className="w-full sm:w-72 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal, moneda)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IVA (16%)</span>
                      <span>{formatCurrency(iva, moneda)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatCurrency(total, moneda)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center animate-fade-in">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-lg font-semibold text-foreground">Editar Cotización {cotizacion?.folio}</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Moneda
                    </label>
                    <select
                      value={editForm.moneda}
                      onChange={(e) => setEditForm({ ...editForm, moneda: e.target.value })}
                      className="input-base"
                    >
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="USD">USD - Dólar Americano</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Estatus
                    </label>
                    <select
                      value={editForm.estatus}
                      onChange={(e) => setEditForm({ ...editForm, estatus: e.target.value })}
                      className="input-base"
                    >
                      <option value="BORRADOR">Borrador</option>
                      <option value="ENVIADA">Enviada</option>
                      <option value="EN_REVISION">En Revisión</option>
                      <option value="ACEPTADA">Aprobada</option>
                      <option value="RECHAZADA">Rechazada</option>
                      <option value="CANCELADA">Cancelada</option>
                      <option value="CONVERTIDA">Convertida</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Fecha Entrega
                  </label>
                  <input
                    type="date"
                    value={editForm.fechaEntrega}
                    onChange={(e) => setEditForm({ ...editForm, fechaEntrega: e.target.value })}
                    className="input-base"
                  />
                </div>

                {/* Lineas */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Partidas
                    </label>
                    <Button type="button" variant="outline" size="sm" onClick={addEditLinea} className="gap-1">
                      <Plus className="h-3 w-3" />
                      Agregar Partida
                    </Button>
                  </div>
                  {editForm.lineas.length === 0 ? (
                    <p className="py-3 text-center text-xs text-muted-foreground">
                      Agregue al menos una partida
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {editForm.lineas.map((l, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-border p-3 space-y-2 sm:flex sm:items-center sm:gap-2 sm:border-0 sm:p-0 sm:space-y-0"
                        >
                          <div className="sm:w-28 shrink-0">
                            <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">
                              Número de Parte
                            </label>
                            <input
                              type="text"
                              placeholder="Núm. parte"
                              value={l.numeroParte}
                              onChange={(e) => {
                                const updated = [...editForm.lineas];
                                updated[i] = { ...l, numeroParte: e.target.value };
                                setEditForm({ ...editForm, lineas: updated });
                              }}
                              className="input-base w-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">
                              Descripción
                            </label>
                            <input
                              type="text"
                              placeholder="Descripción"
                              value={l.descripcion}
                              onChange={(e) => {
                                const updated = [...editForm.lineas];
                                updated[i] = { ...l, descripcion: e.target.value };
                                setEditForm({ ...editForm, lineas: updated });
                              }}
                              className="input-base w-full"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:contents">
                            <div>
                              <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">Cant.</label>
                              <input
                                type="number"
                                placeholder="Cant."
                                min={1}
                                value={l.cantidad}
                                onChange={(e) => {
                                  const updated = [...editForm.lineas];
                                  updated[i] = { ...l, cantidad: Number(e.target.value) };
                                  setEditForm({ ...editForm, lineas: updated });
                                }}
                                className="input-base w-full sm:w-20"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">Unidad</label>
                              <select
                                value={l.unidad}
                                onChange={(e) => {
                                  const updated = [...editForm.lineas];
                                  updated[i] = { ...l, unidad: e.target.value };
                                  setEditForm({ ...editForm, lineas: updated });
                                }}
                                className="input-base w-full sm:w-24"
                              >
                                <option value="PZA">PZA</option>
                                <option value="KG">KG</option>
                                <option value="M">M</option>
                                <option value="M²">M²</option>
                                <option value="M³">M³</option>
                                <option value="LT">LT</option>
                                <option value="HR">HR</option>
                                <option value="JGO">JGO</option>
                                <option value="PAR">PAR</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] uppercase text-muted-foreground sm:hidden">Precio</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Precio"
                              min={0}
                              value={l.precioUnitario}
                              onChange={(e) => {
                                const updated = [...editForm.lineas];
                                updated[i] = { ...l, precioUnitario: Number(e.target.value) };
                                setEditForm({ ...editForm, lineas: updated });
                              }}
                              className="input-base w-full sm:w-28"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEditLinea(i)}
                            className="w-full text-destructive hover:text-destructive sm:w-auto"
                          >
                            <X className="h-4 w-4" />
                            <span className="ml-1 sm:hidden">Quitar</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Notas
                  </label>
                  <textarea
                    value={editForm.notas}
                    onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })}
                    rows={2}
                    className="input-base resize-none"
                    placeholder="Observaciones de la cotización"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="gap-2" disabled={saving}>
                    {saving ? 'Guardando...' : 'Actualizar Cotización'}
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
