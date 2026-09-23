'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { get, postForm, ApiError } from '@/lib/api';
import {
  ArrowLeft,
  Upload,
  FileArchive,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react';

const BOM_PLACEHOLDER = `Item,DWG,Material,QTY
1,260262-002,BLACK DELRIN,16
2,260262-003,BLACK DELRIN,4`;

interface ClienteOpt {
  id: string;
  codigo?: string;
  razonSocial: string;
}

export default function CotizacionDesdePaquetePage() {
  return (
    <AppLayout>
      <DesdePaqueteContent />
    </AppLayout>
  );
}

function DesdePaqueteContent() {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteOpt[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [notas, setNotas] = useState('');
  const [bom, setBom] = useState('');
  const [zip, setZip] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingClientes, setLoadingClientes] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await get<{ data?: ClienteOpt[] } | ClienteOpt[]>(
          '/api/clientes?limit=200',
        );
        const list = Array.isArray(data) ? data : data.data || [];
        setClientes(list);
        if (list.length === 1) setClienteId(list[0].id);
      } catch {
        setError('No se pudieron cargar clientes');
      } finally {
        setLoadingClientes(false);
      }
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!clienteId) {
      setError('Selecciona un cliente');
      return;
    }
    if (!zip) {
      setError('Selecciona el ZIP de planos');
      return;
    }
    if (!bom.trim()) {
      setError('Pega la tabla BOM (Item,DWG,Material,QTY)');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('zip', zip);
      form.append('bom', bom);
      form.append('clienteId', clienteId);
      form.append('moneda', moneda);
      if (notas.trim()) form.append('notas', notas.trim());

      const result = await postForm<{
        id: string;
        folio: string;
        match?: { matched: number; extraPdf?: string[] };
      }>('/api/cotizaciones/desde-paquete', form);

      router.push(`/cotizaciones/${result.id}`);
    } catch (err: any) {
      const data = err instanceof ApiError ? err.data : null;
      const msg =
        data?.message ||
        err?.message ||
        'Error al crear cotización desde paquete';
      const missing = data?.missingPdf as string[] | undefined;
      setError(
        missing?.length
          ? `${typeof msg === 'string' ? msg : 'Faltan PDFs'}: ${missing.join(', ')}`
          : typeof msg === 'string'
            ? msg
            : JSON.stringify(msg),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-1"
          onClick={() => router.push('/cotizaciones')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Cotización desde paquete
          </h1>
          <p className="text-sm text-muted-foreground">
            Sube el ZIP de planos PDF y pega la tabla Item / DWG / Material /
            QTY. Se crea un borrador con precio 0 para completar.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-xl border border-border bg-card p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Cliente</span>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={clienteId}
              disabled={loadingClientes || loading}
              onChange={(e) => setClienteId(e.target.value)}
              required
            >
              <option value="">Seleccionar…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo ? `${c.codigo} — ` : ''}
                  {c.razonSocial}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Moneda</span>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={moneda}
              disabled={loading}
              onChange={(e) => setMoneda(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="MXN">MXN</option>
            </select>
          </label>
        </div>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium flex items-center gap-2">
            <FileArchive className="h-4 w-4" />
            ZIP de planos (PDF)
          </span>
          <input
            type="file"
            accept=".zip,application/zip"
            disabled={loading}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
            onChange={(e) => setZip(e.target.files?.[0] || null)}
          />
          {zip && (
            <span className="text-xs text-muted-foreground">
              {zip.name} ({(zip.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          )}
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Tabla BOM
          </span>
          <textarea
            className="min-h-[220px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-relaxed"
            placeholder={BOM_PLACEHOLDER}
            value={bom}
            disabled={loading}
            onChange={(e) => setBom(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">
            CSV o TSV con encabezados Item, DWG, Material, QTY. El DWG debe
            coincidir con el nombre del PDF (ej. 260262-002.pdf).
          </span>
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Notas (opcional)</span>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={notas}
            disabled={loading}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="RFQ cliente, proyecto…"
          />
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => router.push('/cotizaciones')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {loading ? 'Procesando…' : 'Crear borrador'}
          </Button>
        </div>
      </form>
    </div>
  );
}
