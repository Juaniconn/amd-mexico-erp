'use client';

import { useEffect, useState, FormEvent, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { get, postForm, ApiError } from '@/lib/api';
import { parseBomAuto, type BomRow } from '@/lib/bom-parser';
import {
  ArrowLeft,
  Upload,
  FileArchive,
  Loader2,
  AlertCircle,
  Package,
  ClipboardPaste,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Info,
  Eraser,
} from 'lucide-react';

const BOM_PLACEHOLDER = `Item,DWG,Material,QTY
1,260262-002,BLACK DELRIN,16
2,260262-003,BLACK DELRIN,4

— o pega la tabla de Outlook (Ctrl+V); también sirve celda por línea —`;

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
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [parsedBom, setParsedBom] = useState<BomRow[]>([]);
  const [parseError, setParseError] = useState('');

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

  useEffect(() => {
    if (!bom.trim()) {
      setParsedBom([]);
      setParseError('');
      return;
    }
    try {
      setParsedBom(parseBomAuto(bom));
      setParseError('');
    } catch (e: any) {
      setParsedBom([]);
      setParseError(e?.message || 'Error al parsear');
    }
  }, [bom]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setBom(text);
        setError('');
      }
    } catch {
      setError(
        'No se pudo leer el portapapeles. Usa Ctrl+V (o Cmd+V) dentro del cuadro BOM.',
      );
      textareaRef.current?.focus();
    }
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (
      file &&
      (file.name.endsWith('.csv') ||
        file.name.endsWith('.tsv') ||
        file.name.endsWith('.txt'))
    ) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBom((ev.target?.result as string) || '');
      };
      reader.readAsText(file);
    }
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
      setError('Pega la tabla BOM (Item, DWG, Material, QTY)');
      return;
    }
    try {
      parseBomAuto(bom);
    } catch (err: any) {
      setError(err?.message || 'BOM inválido');
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

  const doubtful = parsedBom.filter(
    (r) => !r.material || !/^\d{4,}-\d+/.test(r.dwg),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
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
            QTY (Outlook, CSV o TSV). Se crea un borrador con precio 0.
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-medium flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              Tabla BOM
            </span>
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePaste}
                disabled={loading}
                className="gap-1.5"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                Pegar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="gap-1.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                CSV/TSV
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBom('');
                  setError('');
                }}
                disabled={loading || !bom}
                className="gap-1.5"
              >
                <Eraser className="h-3.5 w-3.5" />
                Limpiar
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) =>
                  setBom((ev.target?.result as string) || '');
                reader.readAsText(file);
              }
            }}
          />
          <div
            className={`relative rounded-md border-2 border-dashed transition-colors ${
              dragOver ? 'border-brand bg-brand/5' : 'border-input'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
          >
            <textarea
              ref={textareaRef}
              className="min-h-[180px] w-full rounded-md bg-background px-3 py-2 font-mono text-xs leading-relaxed resize-y"
              placeholder={BOM_PLACEHOLDER}
              value={bom}
              disabled={loading}
              onChange={(e) => setBom(e.target.value)}
              onPaste={() => setError('')}
            />
            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-brand/10">
                <span className="text-sm font-medium text-brand">
                  Suelta el archivo CSV/TSV aquí
                </span>
              </div>
            )}
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Preferible <kbd className="px-1 rounded border">Ctrl+V</kbd> /
              Cmd+V desde Outlook. También CSV, TSV o una celda por línea. El
              DWG debe coincidir con el PDF (ej. 260272-001.pdf).
            </span>
          </div>
        </div>

        {bom.trim() && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-medium">Vista previa del BOM</span>
              {parseError ? (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <XCircle className="h-3.5 w-3.5" />
                  {parseError}
                </span>
              ) : parsedBom.length > 0 ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {parsedBom.length} ítems detectados
                  {doubtful.length > 0
                    ? ` · ${doubtful.length} a revisar`
                    : ''}
                </span>
              ) : null}
            </div>
            {parsedBom.length > 0 && (
              <div className="max-h-[240px] overflow-auto rounded-md border border-border bg-background">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-medium">Item</th>
                      <th className="px-2 py-1.5 text-left font-medium">DWG</th>
                      <th className="px-2 py-1.5 text-left font-medium">
                        Material
                      </th>
                      <th className="px-2 py-1.5 text-right font-medium">QTY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedBom.map((row, i) => {
                      const warn =
                        !row.material || !/^\d{4,}-\d+/.test(row.dwg);
                      return (
                        <tr
                          key={`${row.item}-${row.dwg}-${i}`}
                          className={`border-t border-border ${
                            warn ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <td className="px-2 py-1">{row.item}</td>
                          <td className="px-2 py-1 font-mono">{row.dwg}</td>
                          <td className="px-2 py-1">
                            {row.material || (
                              <span className="text-muted-foreground italic">
                                (sin material)
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-1 text-right">{row.qty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
          <Button
            type="submit"
            disabled={loading || !!parseError || !parsedBom.length}
            className="gap-2"
          >
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
