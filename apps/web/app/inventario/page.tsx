'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/Card';
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
  X,
  Package,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Inbox,
  Hash,
  Boxes,
  Layers,
  Activity,
} from 'lucide-react';

export default function InventarioPage() {
  return (
    <AppLayout>
      <InventarioContent />
    </AppLayout>
  );
}

function InventarioContent() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    codigo: '',
    descripcion: '',
    unidad: '',
    stockActual: '',
  });

  async function load() {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || '/api'}/inventario/materiales?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error('Error al cargar inventario');
      }

      const data = await res.json();
      setItems(data.data || []);
    } catch (err: any) {
      setError(err?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm({ codigo: '', descripcion: '', unidad: '', stockActual: '' });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/inventario/materiales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          stockActual: form.stockActual ? Number(form.stockActual) : 0,
        }),
      });
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar');
    }
  }

  // Stats calculations
  const totalProductos = items.length;
  const stockBajo = items.filter((m) => (m.stockActual ?? 0) > 0 && (m.stockActual ?? 0) <= 10).length;
  const sinStock = items.filter((m) => (m.stockActual ?? 0) === 0).length;
  const valorInventario = items.reduce((acc, m) => acc + (m.stockActual ?? 0) * (m.precioUnitario ?? 0), 0);

  const filteredItems = items.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.codigo?.toLowerCase().includes(q) ||
      m.descripcion?.toLowerCase().includes(q) ||
      m.unidad?.toLowerCase().includes(q)
    );
  });

  function getStockStatus(stock: number) {
    if (stock === 0) return { variant: 'destructive' as const, label: 'Sin stock', icon: XCircle };
    if (stock <= 10) return { variant: 'warning' as const, label: 'Stock bajo', icon: AlertTriangle };
    return { variant: 'success' as const, label: 'Disponible', icon: Activity };
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            Materiales, stock y movimientos
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Material
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Productos"
          value={totalProductos}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Stock Bajo"
          value={stockBajo}
          icon={<AlertTriangle className="h-4 w-4" />}
          variant="warning"
        />
        <StatCard
          title="Sin Stock"
          value={sinStock}
          icon={<XCircle className="h-4 w-4" />}
          variant="destructive"
        />
        <StatCard
          title="Valor Inventario"
          value={`$${valorInventario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={<Layers className="h-4 w-4" />}
          variant="success"
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código, descripción o unidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => load()}
          className="gap-2"
        >
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estatus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows />
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((m) => {
                const status = getStockStatus(m.stockActual ?? 0);
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.codigo}</TableCell>
                    <TableCell>{m.descripcion}</TableCell>
                    <TableCell className="text-muted-foreground">{m.unidad}</TableCell>
                    <TableCell className="font-semibold">{m.stockActual ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        <status.icon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-semibold">Nuevo Material</h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Código *
                  </label>
                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={form.codigo}
                      onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Descripción *
                  </label>
                  <div className="relative">
                    <Boxes className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Unidad
                    </label>
                    <input
                      type="text"
                      value={form.unidad}
                      onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Stock Actual
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.stockActual}
                      onChange={(e) => setForm({ ...form, stockActual: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background py-2 px-3 text-sm transition focus:ring-2 focus:ring-ring/30 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear
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
  value: number | string;
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

function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-10 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          </TableCell>
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
        No hay materiales registrados
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Agregue un nuevo material para comenzar
      </p>
    </div>
  );
}
