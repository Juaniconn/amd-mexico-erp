'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { get } from '@/lib/api';
import {
  Loader2,
  AlertCircle,
  Bot,
  Code2,
  ShieldCheck,
  Server,
  Wrench,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Pause,
  Activity,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface AgentTask {
  modulo: string;
  estado: 'completado' | 'trabajando' | 'error' | 'pendiente';
  resultado?: string;
  duracion?: number;
  finalizado?: string;
}

interface Agent {
  id: string;
  nombre: string;
  descripcion: string;
  stack: string[];
  estado: 'activo' | 'inactivo';
  categoria: string;
  trabajandoEn?: string | null;
  tasks: AgentTask[];
  lastActivity?: string;
  uptime?: number;
  sessionsActive?: number;
}

interface AgentStatus {
  id: string;
  nombre: string;
  estado: 'online' | 'idle';
  trabajandoEn: string | null;
  lastActivity?: string;
  uptime?: number;
  sessionsActive?: number;
  tasksCompleted: number;
}

const CATEGORY_ICONS: Record<string, typeof Bot> = {
  'Desarrollo': Code2,
  'Calidad': ShieldCheck,
  'Infraestructura': Server,
  'Operaciones': Wrench,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Desarrollo': 'text-blue-400',
  'Calidad': 'text-amber-400',
  'Infraestructura': 'text-emerald-400',
  'Operaciones': 'text-purple-400',
};

function formatUptime(seconds?: number): string {
  if (!seconds) return '0s';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export default function AgentesPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const limit = 6;

  const loadAgents = useCallback(async (p: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await get<{ data: Agent[]; meta: any }>(`/api/agentes?page=${p}&limit=${limit}`);
      setAgents(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar agentes');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllAgents = useCallback(async () => {
    try {
      const data = await get<{ data: Agent[]; meta: any }>(`/api/agentes?page=1&limit=100`);
      setAllAgents(data.data || []);
    } catch {
      // ignore
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    try {
      const data = await get<{ data: AgentStatus[]; timestamp: string }>(`/api/agentes/status`);
      setStatuses(data.data || []);
      setLastRefresh(new Date());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadAgents(page);
    loadAllAgents();
    loadStatuses();
  }, [loadAgents, loadAllAgents, loadStatuses, page]);

  // Auto-refresh cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadStatuses();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadStatuses]);

  const stats = {
    total: allAgents.length,
    activos: allAgents.filter((a) => a.estado === 'activo').length,
    online: statuses.filter((s) => s.estado === 'online').length,
    trabajando: allAgents.filter((a) => a.trabajandoEn).length,
    completadas: allAgents.reduce((acc, a) => acc + a.tasks.filter((t) => t.estado === 'completado').length, 0),
  };

  const allTasks = allAgents
    .flatMap((a) => a.tasks.map((t) => ({ ...t, agente: a.nombre, agenteId: a.id })))
    .sort((a, b) => new Date(b.finalizado || 0).getTime() - new Date(a.finalizado || 0).getTime());

  const getStatus = (agentId: string) => statuses.find((s) => s.id === agentId);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agentes Hermes</h1>
            <p className="text-sm text-muted-foreground">Estatus de agentes especializados Hermes</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              Actualizado {lastRefresh.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => { loadAgents(page); loadStatuses(); }} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold tracking-tight">{stats.total}</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Total</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold tracking-tight text-emerald-400">{stats.activos}</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Activos</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold tracking-tight text-green-400">{stats.online}</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Online</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold tracking-tight text-blue-400">{stats.trabajando}</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Trabajando</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold tracking-tight text-amber-400">{stats.completadas}</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Tareas OK</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bot className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No hay agentes registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const Icon = CATEGORY_ICONS[agent.categoria] || Bot;
              const isWorking = !!agent.trabajandoEn;
              const lastTask = agent.tasks[agent.tasks.length - 1];
              const tasksCompleted = agent.tasks.filter((t) => t.estado === 'completado').length;
              const agentStatus = getStatus(agent.id);
              const isOnline = agentStatus?.estado === 'online';
              const uptime = agentStatus?.uptime || agent.uptime || 0;

              return (
                <Card key={agent.id} className="relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="p-5">
                    {/* Icon + Status */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ${CATEGORY_COLORS[agent.categoria] || 'text-primary'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isOnline ? (
                          <>
                            <Wifi className="h-3 w-3 text-green-400" />
                            <Badge variant="outline" className="gap-1 border-green-500/30 bg-green-500/10 text-[10px] text-green-400">
                              Online
                            </Badge>
                          </>
                        ) : (
                          <>
                            <WifiOff className="h-3 w-3 text-muted-foreground/50" />
                            <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
                              Idle
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Name + Description */}
                    <h3 className="mb-1 text-sm font-semibold text-foreground">{agent.nombre}</h3>
                    <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{agent.descripcion}</p>

                    {/* Working on / Last task */}
                    {isWorking ? (
                      <div className="mb-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-blue-400">Trabajando en</p>
                        <p className="text-xs font-medium text-foreground">{agent.trabajandoEn}</p>
                      </div>
                    ) : (
                      <div className="mb-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Última tarea</p>
                        <p className="truncate text-xs text-foreground">
                          {lastTask ? `${lastTask.modulo} — ${lastTask.estado}` : 'Sin tareas'}
                        </p>
                      </div>
                    )}

                    {/* Uptime */}
                    <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Uptime:</span>
                      <span className="text-xs font-medium text-foreground">{formatUptime(uptime)}</span>
                    </div>

                    {/* Stack */}
                    <div className="mb-3 flex flex-wrap gap-1">
                      {agent.stack.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-[10px]">
                          {tech}
                        </Badge>
                      ))}
                      {agent.stack.length > 3 && (
                        <Badge variant="secondary" className="text-[10px]">+{agent.stack.length - 3}</Badge>
                      )}
                    </div>

                    {/* Stats footer */}
                    <div className="flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground">
                      <span>{agent.categoria}</span>
                      <span>{tasksCompleted} tareas</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Actividad Reciente (Colapsable) */}
        <div className="rounded-xl border border-border">
          <button
            onClick={() => setActivityExpanded((e) => !e)}
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Actividad Reciente</span>
              <Badge variant="secondary" className="text-[10px]">{allTasks.length}</Badge>
            </div>
            {activityExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {activityExpanded && (
            <div className="border-t border-border">
              {allTasks.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-muted-foreground">Sin actividad registrada</p>
              ) : (
                <ul className="divide-y divide-border">
                  {allTasks.slice(0, 10).map((task, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                      {task.estado === 'completado' ? (
                        <CircleDot className="h-3 w-3 shrink-0 text-emerald-400" />
                      ) : task.estado === 'trabajando' ? (
                        <Clock className="h-3 w-3 shrink-0 text-blue-400" />
                      ) : (
                        <Pause className="h-3 w-3 shrink-0 text-muted-foreground" />
                      )}
                      <span className="font-medium text-foreground">{task.agente}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-foreground">{task.modulo}</span>
                      <Badge variant="secondary" className="text-[10px]">{task.estado}</Badge>
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {task.finalizado ? new Date(task.finalizado).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
