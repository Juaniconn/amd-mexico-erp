'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { get, patch } from '@/lib/api';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  XCircle,
} from 'lucide-react';

export default function PedidoFacturacionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await get(`/api/facturas/${id}`);
      setPedido(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function marcarContpaq() {
    try {
      setSaving(true);
      await patch(`/api/facturas/${id}/facturada`);
      await load();
    } catch (err: any) {
      setError(err?.message || 'No se pudo marcar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!pedido) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/facturacion')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          <p className="text-destructive text-sm">{error || 'No encontrado'}</p>
        </div>
      </AppLayout>
    );
  }

  const cot = pedido.ot?.cotizacion;
  const estatusLabel =
    pedido.estatus === 'PENDIENTE'
      ? 'Por facturar en CONTPAQi'
      : pedido.estatus === 'PAGADA'
        ? 'Facturado en CONTPAQi'
        : pedido.estatus;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push('/facturacion')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <FileText className="h-6 w-6" /> {pedido.folio}
              </h1>
              <p className="text-sm text-muted-foreground">
                Pedido de facturación (monitoreo CONTPAQi)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                pedido.estatus === 'PENDIENTE'
                  ? 'warning'
                  : pedido.estatus === 'PAGADA'
                    ? 'success'
                    : 'secondary'
              }
            >
              {estatusLabel}
            </Badge>
            {pedido.estatus === 'PENDIENTE' && (
              <Button size="sm" className="gap-2" disabled={saving} onClick={marcarContpaq}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Marcar facturado en CONTPAQi
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <XCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Este módulo no genera CFDI ni asientos contables. Contabilidad emite la factura en
          CONTPAQi y aquí solo se lleva el seguimiento de qué OT/cotización ya se facturó.
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Cliente" value={pedido.cliente?.razonSocial || '—'} />
          <Info label="RFC" value={pedido.cliente?.rfc || '—'} />
          <Info
            label="OT"
            value={pedido.ot?.folio || '—'}
            link={pedido.ot ? `/produccion/ot/${pedido.ot.id}` : undefined}
          />
          <Info
            label="Cotización"
            value={cot?.folio || '—'}
            link={cot ? `/cotizaciones/${cot.id}` : undefined}
          />
          <Info label="Embarque" value={pedido.embarque?.folio || '—'} />
          <Info
            label="Importe referencia"
            value={`$${Number(pedido.total || 0).toLocaleString('es-MX', {
              minimumFractionDigits: 2,
            })} ${pedido.moneda || 'MXN'}`}
          />
        </div>

        {pedido.notas && (
          <div className="rounded-lg border p-3 text-sm">
            <p className="text-xs uppercase text-muted-foreground mb-1">Notas</p>
            <p className="whitespace-pre-wrap">{pedido.notas}</p>
          </div>
        )}

        {(pedido.detalles || []).length > 0 && (
          <div className="rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Descripción</th>
                  <th className="px-3 py-2 text-right">Cant.</th>
                  <th className="px-3 py-2 text-right">P.U.</th>
                  <th className="px-3 py-2 text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {pedido.detalles.map((d: any) => (
                  <tr key={d.id} className="border-t">
                    <td className="px-3 py-2">{d.descripcion}</td>
                    <td className="px-3 py-2 text-right">{Number(d.cantidad)}</td>
                    <td className="px-3 py-2 text-right">
                      ${Number(d.precioUnitario).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 text-right">
                      ${Number(d.importe).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Info({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) {
  const router = useRouter();
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      {link ? (
        <button
          className="text-sm font-medium text-primary hover:underline"
          onClick={() => router.push(link)}
        >
          {value}
        </button>
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
    </div>
  );
}
