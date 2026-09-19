'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { get, post, ApiError } from '@/lib/api';
import { Plus, Trash2, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ClienteOption {
  id: string;
  codigo: string;
  razonSocial: string;
  monedaPref?: string;
}

interface LineItem {
  id: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
}

const UNIDADES = ['PZA', 'KG', 'M', 'M²', 'M³', 'LT', 'HR', 'JGO', 'PAR'];

function createEmptyLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    descripcion: '',
    cantidad: 1,
    unidad: 'PZA',
    precioUnitario: 0,
  };
}

export default function NuevaCotizacionPage() {
  return (
    <AppLayout>
      <NuevaCotizacionContent />
    </AppLayout>
  );
}

function NuevaCotizacionContent() {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [clienteId, setClienteId] = useState('');
  const [moneda, setMoneda] = useState<'MXN' | 'USD'>('MXN');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [notas, setNotas] = useState('');
  const [lineas, setLineas] = useState<LineItem[]>([createEmptyLine()]);

  // Load clientes on mount
  useEffect(() => {
    async function loadClientes() {
      try {
        setLoadingClientes(true);
        const res = await get<{ data: ClienteOption[] }>('/api/clientes?limit=100');
        setClientes(res.data || []);
      } catch (err: any) {
        setError(err?.message || 'Error al cargar clientes');
      } finally {
        setLoadingClientes(false);
      }
    }
    loadClientes();
  }, []);

  // Update moneda when cliente changes
  function handleClienteChange(id: string) {
    setClienteId(id);
    const cliente = clientes.find((c) => c.id === id);
    if (cliente?.monedaPref) {
      setMoneda(cliente.monedaPref as 'MXN' | 'USD');
    }
  }

  // Line item handlers
  function addLinea() {
    setLineas([...lineas, createEmptyLine()]);
  }

  function removeLinea(id: string) {
    if (lineas.length === 1) return;
    setLineas(lineas.filter((l) => l.id !== id));
  }

  function updateLinea(id: string, field: keyof LineItem, value: string | number) {
    setLineas(
      lineas.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  }

  // Calculate total
  const total = lineas.reduce((sum, l) => sum + l.cantidad * l.precioUnitario, 0);

  // Submit handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!clienteId) {
      setError('Debe seleccionar un cliente');
      return;
    }
    if (!fechaEntrega) {
      setError('Debe ingresar una fecha de entrega');
      return;
    }
    if (lineas.length === 0) {
      setError('Debe agregar al menos una partida');
      return;
    }
    for (const linea of lineas) {
      if (!linea.descripcion.trim()) {
        setError('Todas las partidas deben tener una descripción');
        return;
      }
      if (linea.cantidad <= 0) {
        setError('La cantidad debe ser mayor a cero en todas las partidas');
        return;
      }
      if (linea.precioUnitario < 0) {
        setError('El precio unitario no puede ser negativo');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        clienteId,
        moneda,
        fechaEntrega,
        notas: notas || undefined,
        lineas: lineas.map((l) => ({
          descripcion: l.descripcion,
          cantidad: l.cantidad,
          unidad: l.unidad,
          precioUnitario: l.precioUnitario,
        })),
      };

      await post('/api/cotizaciones', payload);
      setSuccess('Cotización creada exitosamente. Redirigiendo...');
      setTimeout(() => {
        router.push('/cotizaciones');
      }, 1500);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.data?.message || err.message || 'Error al crear la cotización');
      } else {
        setError('Error al crear la cotización');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Cotización</h1>
          <p className="text-sm text-muted-foreground">
            Crear una nueva cotización para el cliente
          </p>
        </div>
        <Link href="/cotizaciones">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success-muted px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info Card */}
        <div className="card-premium rounded-xl border border-border p-6">
          <h2 className="section-title mb-4 text-lg font-semibold">Información General</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Cliente */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Cliente *
              </label>
              <select
                value={clienteId}
                onChange={(e) => handleClienteChange(e.target.value)}
                required
                disabled={loadingClientes}
                className="input-base"
              >
                <option value="">
                  {loadingClientes ? 'Cargando clientes...' : 'Seleccionar cliente'}
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} - {c.razonSocial}
                  </option>
                ))}
              </select>
            </div>

            {/* Moneda */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Moneda
              </label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as 'MXN' | 'USD')}
                className="input-base"
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dólar Americano</option>
              </select>
            </div>

            {/* Fecha Entrega */}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Fecha de Entrega *
              </label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                required
                className="input-base"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Notas
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="input-base resize-none"
              placeholder="Observaciones o notas adicionales..."
            />
          </div>
        </div>

        {/* Line Items Card */}
        <div className="card-premium rounded-xl border border-border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title text-lg font-semibold">Partidas</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLinea}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Partida
            </Button>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Descripción
                  </th>
                  <th className="w-24 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Cantidad
                  </th>
                  <th className="w-24 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Unidad
                  </th>
                  <th className="w-32 px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    P. Unitario
                  </th>
                  <th className="w-24 px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Subtotal
                  </th>
                  <th className="w-16 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {lineas.map((linea, index) => (
                  <tr key={linea.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={linea.descripcion}
                        onChange={(e) => updateLinea(linea.id, 'descripcion', e.target.value)}
                        placeholder="Descripción de la partida"
                        className="input-base w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={linea.cantidad}
                        onChange={(e) => updateLinea(linea.id, 'cantidad', Number(e.target.value))}
                        className="input-base w-full text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={linea.unidad}
                        onChange={(e) => updateLinea(linea.id, 'unidad', e.target.value)}
                        className="input-base w-full"
                      >
                        {UNIDADES.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={linea.precioUnitario}
                        onChange={(e) => updateLinea(linea.id, 'precioUnitario', Number(e.target.value))}
                        className="input-base w-full text-right"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                        {(linea.cantidad * linea.precioUnitario).toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeLinea(linea.id)}
                          disabled={lineas.length === 1}
                          title="Eliminar partida"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/30">
                  <td colSpan={4} className="px-3 py-2 text-right font-semibold text-muted-foreground">
                    Total ({moneda})
                  </td>
                  <td className="px-3 py-2 text-right text-lg font-bold">
                    {total.toLocaleString('es-MX', {
                      style: 'currency',
                      currency: moneda,
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Link href="/cotizaciones">
            <Button type="button" variant="outline" size="sm">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" size="sm" className="gap-2" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Crear Cotización'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
