'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Eye,
  FileText,
  Loader2,
  AlertCircle,
  Inbox,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { get, patch } from '@/lib/api';

/**
 * Cola de monitoreo para Contabilidad (CONTPAQi).
 * No emite facturas: solo muestra qué OT/cotización facturar afuera.
 */

type EstatusPedido = 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'CANCELADA';

const STATUS_CONFIG: Record<
  EstatusPedido,
  {
    label: string;
    shortLabel: string;
    variant: 'secondary' | 'default' | 'success' | 'destructive' | 'warning';
  }
> = {
  PENDIENTE: { label: 'Por facturar en CONTPAQi', shortLabel: 'Por facturar', variant: 'warning' },
  PAGADA: { label: 'Facturado en CONTPAQi', shortLabel: 'Facturado', variant: 'success' },
  VENCIDA: { label: 'Vencido', shortLabel: 'Vencido', variant: 'destructive' },
  CANCELADA: { label: 'Cancelado', shortLabel: 'Cancelado', variant: 'secondary' },
};

interface PedidoFacturacion {
  id: string;
  folio: string;
  estatus: EstatusPedido;
  total: number;
  moneda: string;
  notas?: string;
  createdAt: string;
  cliente?: { id: string; razonSocial: string; rfc?: string };
  ot?: {
    id: string;
    folio: string;
    cotizacion?: { id: string; folio: string };
  };
  embarque?: { id: string; folio: string };
}

export default function FacturacionPage() {
  return (
    <AppLayout>
      <FacturacionCola />
    </AppLayout>
  );
}

function FacturacionCola() {
  const router = useRouter();
  const [items, setItems] = useState<PedidoFacturacion[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [estatus, setEstatus] = useState('PENDIENTE');
  const [page, setPage] = useState(1);
  const [marking, setMarking] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const q = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (search) q.set('search', search);
      if (estatus) q.set('estatus', estatus);
      const res = await get<{ data: PedidoFacturacion[]; meta: any }>(
        `/api/facturas?${q}`,
      );
      setItems(res.data || []);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar cola CONTPAQi');
    } finally {
      setLoading(false);
    }
  }, [page, search, estatus]);

  useEffect(() => {
    load();
  }, [load]);

  async function marcarContpaq(id: string) {
    try {
      setMarking(id);
      await patch(`/api/facturas/${id}/facturada`);
      await load();
    } catch (err: any) {
      setError(err?.message || 'No se pudo marcar');
    } finally {
      setMarking(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6" /> Facturación
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Cola de monitoreo para Contabilidad. Al finalizar una entrega se genera un pedido
          automático. La factura fiscal se emite en <strong>CONTPAQi</strong>; aquí solo se
          marca qué ya quedó facturado ahí.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm"
            placeholder="Buscar folio, OT, cotización, cliente…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="rounded-lg border bg-background px-3 py-2 text-sm"
          value={estatus}
          onChange={(e) => {
            setEstatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos</option>
          <option value="PENDIENTE">Por facturar en CONTPAQi</option>
          <option value="PAGADA">Facturado en CONTPAQi</option>
          <option value="CANCELADA">Cancelado</option>
        </select>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-1" /> Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
          <Inbox className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm">No hay pedidos en esta vista.</p>
          <p className="text-xs mt-1">Se crean al enviar un embarque (entrega finalizada).</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {items.map((p) => {
              const st = STATUS_CONFIG[p.estatus] || STATUS_CONFIG.PENDIENTE;
              return (
                <div key={p.id} className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{p.folio}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {p.cliente?.razonSocial || 'Sin cliente'}
                      </p>
                    </div>
                    <Badge variant={st.variant} className="shrink-0">
                      {st.shortLabel}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">OT</p>
                      {p.ot ? (
                        <button
                          className="text-primary font-medium"
                          onClick={() => router.push(`/produccion/ot/${p.ot!.id}`)}
                        >
                          {p.ot.folio}
                        </button>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cotización</p>
                      {p.ot?.cotizacion ? (
                        <button
                          className="text-primary font-medium"
                          onClick={() => router.push(`/cotizaciones/${p.ot!.cotizacion!.id}`)}
                        >
                          {p.ot.cotizacion.folio}
                        </button>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Embarque</p>
                      <p>{p.embarque?.folio || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Importe ref.</p>
                      <p className="font-medium">
                        ${Number(p.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                        {p.moneda}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => router.push(`/facturacion/${p.id}`)}
                    >
                      <Eye className="h-4 w-4" /> Ver
                    </Button>
                    {p.estatus === 'PENDIENTE' && (
                      <Button
                        size="sm"
                        className="flex-1 gap-1"
                        disabled={marking === p.id}
                        onClick={() => marcarContpaq(p.id)}
                      >
                        {marking === p.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Hecho CONTPAQi
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Pedido</th>
                  <th className="px-3 py-2">OT</th>
                  <th className="px-3 py-2">Cotización</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Embarque</th>
                  <th className="px-3 py-2">Importe ref.</th>
                  <th className="px-3 py-2">Estatus</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const st = STATUS_CONFIG[p.estatus] || STATUS_CONFIG.PENDIENTE;
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{p.folio}</td>
                      <td className="px-3 py-2">
                        {p.ot ? (
                          <button
                            className="text-primary hover:underline"
                            onClick={() => router.push(`/produccion/ot/${p.ot!.id}`)}
                          >
                            {p.ot.folio}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {p.ot?.cotizacion ? (
                          <button
                            className="text-primary hover:underline"
                            onClick={() =>
                              router.push(`/cotizaciones/${p.ot!.cotizacion!.id}`)
                            }
                          >
                            {p.ot.cotizacion.folio}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2">{p.cliente?.razonSocial || '—'}</td>
                      <td className="px-3 py-2">{p.embarque?.folio || '—'}</td>
                      <td className="px-3 py-2">
                        ${Number(p.total || 0).toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                        })}{' '}
                        {p.moneda}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/facturacion/${p.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {p.estatus === 'PENDIENTE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            disabled={marking === p.id}
                            onClick={() => marcarContpaq(p.id)}
                          >
                            {marking === p.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Hecho en CONTPAQi
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            {page} / {meta.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
