'use client';

import { useEffect, useState, FormEvent } from 'react';
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
  Search,
  Plus,
  FileText,
  Settings,
  Wrench,
  CheckCircle,
  Clock,
  DollarSign,
  Layers,
  Loader2,
} from 'lucide-react';
import { IngenieriaProyecto, IngenieriaStats, EnumIngenieriaEstatus } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

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

export default function IngenieriaPage() {
  const [proyectos, setProyectos] = useState<IngenieriaProyecto[]>([]);
  const [stats, setStats] = useState<IngenieriaStats>({ activos: 0, enDiseno: 0, listosCotizar: 0, liberados: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProyectos = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ page: '1', limit: '50' });
      if (search) params.set('search', search);

      const res = await fetch(`${API_URL}/api/ingenieria?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProyectos(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/ingenieria/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchProyectos();
    fetchStats();
  }, [search]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ingeniería y Diseño</h1>
            <p className="text-muted-foreground">Gestión de proyectos de ingeniería</p>
          </div>
          <Button onClick={() => window.location.href = '/ingenieria/nuevo'}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-premium hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold">{stats.activos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Wrench className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En Diseño</p>
                  <p className="text-2xl font-bold">{stats.enDiseno}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Listos Cotizar</p>
                  <p className="text-2xl font-bold">{stats.listosCotizar}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Liberados</p>
                  <p className="text-2xl font-bold">{stats.liberados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : proyectos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p>No hay proyectos de ingeniería</p>
              </div>
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Estatus</TableHead>
                      <TableHead>Planos</TableHead>
                      <TableHead>Procesos</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proyectos.map((proyecto) => (
                      <TableRow
                        key={proyecto.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => window.location.href = `/ingenieria/${proyecto.id}`}
                      >
                        <TableCell className="font-mono text-sm">{proyecto.codigo}</TableCell>
                        <TableCell className="font-medium">{proyecto.nombre}</TableCell>
                        <TableCell>{proyecto.cliente?.razonSocial}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(proyecto.status) as any}>
                            {getStatusLabel(proyecto.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{proyecto._count?.planos || 0}</TableCell>
                        <TableCell>{proyecto._count?.procesos || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/ingenieria/${proyecto.id}`;
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
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
    </AppLayout>
  );
}
