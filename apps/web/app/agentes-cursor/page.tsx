'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { get, post } from '@/lib/api';
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
  Sparkles,
  Activity,
  Clock,
  Cloud,
  Wifi,
  WifiOff,
  Search,
  Palette,
  Megaphone,
  FlaskConical,
  Boxes,
  ExternalLink,
  CloudCog,
} from 'lucide-react';

interface CloudAgent {
  id: string;
  name: string;
  status: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  latestRunId?: string;
  env?: { type?: string };
}

interface CloudRun {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  prompt?: string;
  summary?: string;
  model?: string;
}

interface AgentTask {
  modulo: string;
  estado: 'completado' | 'trabajando' | 'error' | 'pendiente';
  resultado?: string;
  duracion?: number;
  finalizado?: string;
}

interface Agent {
  id: string;
  slug?: string;
  nombre: string;
  descripcion: string;
  stack: string[];
  estado: 'activo' | 'inactivo';
  categoria: string;
  division?: string;
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
  Desarrollo: Code2,
  Calidad: FlaskConical,
  Seguridad: ShieldCheck,
  Diseño: Palette,
  Marketing: Megaphone,
  Infraestructura: Server,
  Operaciones: Wrench,
  Especializados: Sparkles,
  PMO: Activity,
  Producto: Boxes,
  Soporte: Wrench,
};

const CATEGORY_COLORS: Record<string, string> = {
  Desarrollo: 'text-blue-400',
  Calidad: 'text-amber-400',
  Seguridad: 'text-red-400',
  Diseño: 'text-pink-400',
  Marketing: 'text-orange-400',
  Especializados: 'text-violet-400',
  PMO: 'text-cyan-400',
  Producto: 'text-fuchsia-400',
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

export default function AgentesCursorPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rosterTotal, setRosterTotal] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoria, setCategoria] = useState('all');
  const [q, setQ] = useState('');
  const [qInput, setQInput] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [dashboard, setDashboard] = useState<any>(null);
  const [cloudAgents, setCloudAgents] = useState<CloudAgent[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState('');
  const [selectedCloudId, setSelectedCloudId] = useState<string | null>(null);
  const [cloudRuns, setCloudRuns] = useState<CloudRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [launchPrompt, setLaunchPrompt] = useState('');
  const [launchName, setLaunchName] = useState('');
  const [autoCreatePR, setAutoCreatePR] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [launchMsg, setLaunchMsg] = useState('');
  const limit = 12;

  const loadAgents = useCallback(async (p: number, cat: string, query: string) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: String(p),
        limit: String(limit),
      });
      if (cat && cat !== 'all') params.set('categoria', cat);
      if (query.trim()) params.set('q', query.trim());
      const data = await get<{ data: Agent[]; meta: any }>(
        `/api/agentes-cursor?${params.toString()}`,
      );
      setAgents(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setFilteredTotal(data.meta?.total || 0);
      setRosterTotal(data.meta?.rosterTotal || data.meta?.total || 0);
      if (data.meta?.categorias) setCategorias(data.meta.categorias);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar agentes Cursor');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    try {
      const data = await get<{ data: AgentStatus[]; timestamp: string }>(
        `/api/agentes-cursor/status`,
      );
      setStatuses(data.data || []);
      setLastRefresh(new Date());
    } catch {
      // ignore
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await get<any>(`/api/agentes-cursor/dashboard`);
      setDashboard(data);
      if (data?.cloud?.connected && data.cloud.agents?.items) {
        setCloudAgents(data.cloud.agents.items);
        setCloudError('');
      } else if (data?.cloud && !data.cloud.connected) {
        setCloudError(data.cloud.error || 'Cloud Agents no disponible');
        setCloudAgents([]);
      }
    } catch {
      // ignore
    }
  }, []);

  const loadCloudAgents = useCallback(async () => {
    try {
      setCloudLoading(true);
      setCloudError('');
      const data = await get<{ items: CloudAgent[] }>(
        `/api/agentes-cursor/cloud/agents?limit=50`,
      );
      setCloudAgents(data.items || []);
    } catch (err: any) {
      setCloudError(err?.message || 'Error al cargar Cloud Agents');
      setCloudAgents([]);
    } finally {
      setCloudLoading(false);
    }
  }, []);

  const loadCloudRuns = useCallback(async (agentId: string) => {
    try {
      setRunsLoading(true);
      setSelectedCloudId(agentId);
      const data = await get<{ items?: CloudRun[]; runs?: CloudRun[] }>(
        `/api/agentes-cursor/cloud/agents/${encodeURIComponent(agentId)}/runs?limit=20`,
      );
      setCloudRuns(data.items || data.runs || []);
    } catch (err: any) {
      setCloudRuns([]);
      setCloudError(err?.message || 'Error al cargar runs');
    } finally {
      setRunsLoading(false);
    }
  }, []);

  const launchCloudAgent = useCallback(async () => {
    const prompt = launchPrompt.trim();
    if (!prompt) {
      setLaunchMsg('Escribe un prompt (una sola tarea).');
      return;
    }
    try {
      setLaunching(true);
      setLaunchMsg('');
      const res = await post<{ agent?: any; run?: any }>(
        `/api/agentes-cursor/cloud/agents`,
        {
          prompt,
          name: launchName.trim() || undefined,
          autoCreatePR,
        },
      );
      const agentId = res.agent?.id;
      setLaunchMsg(
        agentId
          ? `Agente creado: ${agentId}${res.agent?.url ? ` · ${res.agent.url}` : ''}`
          : 'Agente creado',
      );
      setLaunchPrompt('');
      setLaunchName('');
      await loadCloudAgents();
      await loadDashboard();
      if (agentId) await loadCloudRuns(agentId);
    } catch (err: any) {
      setLaunchMsg(err?.message || 'No se pudo crear el agente');
    } finally {
      setLaunching(false);
    }
  }, [
    launchPrompt,
    launchName,
    autoCreatePR,
    loadCloudAgents,
    loadDashboard,
    loadCloudRuns,
  ]);

  useEffect(() => {
    loadAgents(page, categoria, q);
    loadStatuses();
    loadDashboard();
  }, [loadAgents, loadStatuses, loadDashboard, page, categoria, q]);

  useEffect(() => {
    const interval = setInterval(() => loadStatuses(), 5000);
    return () => clearInterval(interval);
  }, [loadStatuses]);

  const getStatus = (agentId: string) => statuses.find((s) => s.id === agentId);

  const stats = {
    total: rosterTotal,
    filtrados: filteredTotal,
    online: statuses.filter((s) => s.estado === 'online').length,
    orquestacion: dashboard?.agentes?.enOrquestacion ?? statuses.length,
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agentes Cursor</h1>
            <p className="text-sm text-muted-foreground">
              Roster Agency Agents orquestado desde Cursor
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              Actualizado{' '}
              {lastRefresh.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                loadAgents(page, categoria, q);
                loadStatuses();
                loadDashboard();
                loadCloudAgents();
                if (selectedCloudId) loadCloudRuns(selectedCloudId);
              }}
              disabled={loading || cloudLoading}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading || cloudLoading ? 'animate-spin' : ''}`}
              />
              Actualizar
            </Button>
          </div>
        </div>

        {dashboard?.orquestador && (
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {dashboard.orquestador.nombre}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dashboard.orquestador.descripcion}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cloud Agents (API Cursor Pro) */}
        <section className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CloudCog className="h-4 w-4 text-sky-400" />
              <h2 className="text-sm font-semibold tracking-tight">Cloud Agents</h2>
              {dashboard?.cloud?.connected && (
                <Badge
                  variant="outline"
                  className="border-sky-500/30 bg-sky-500/10 text-[10px] text-sky-400"
                >
                  Conectado
                </Badge>
              )}
            </div>
            {dashboard?.cloud?.me?.email && (
              <p className="text-[10px] text-muted-foreground">
                {dashboard.cloud.me.apiKeyName} · {dashboard.cloud.me.email}
              </p>
            )}
          </div>

          {cloudError && !dashboard?.cloud?.connected && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{cloudError}</span>
            </div>
          )}

          {/* Nuevo agente / run */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Nuevo Cloud Agent
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                Juaniconn/amd-mexico-erp · main
              </span>
            </div>
            <input
              value={launchName}
              onChange={(e) => setLaunchName(e.target.value)}
              placeholder="Nombre opcional (ej. Fix tests inventario)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sky-500/50"
            />
            <textarea
              value={launchPrompt}
              onChange={(e) => setLaunchPrompt(e.target.value)}
              placeholder="Prompt: una sola tarea concreta (ver docs/CLOUD_AGENTS_PLAYBOOK.md)…"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sky-500/50"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={autoCreatePR}
                  onChange={(e) => setAutoCreatePR(e.target.checked)}
                  className="rounded border-border"
                />
                Crear PR al terminar
              </label>
              <Button
                size="sm"
                className="gap-2"
                disabled={launching || !launchPrompt.trim()}
                onClick={launchCloudAgent}
              >
                {launching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CloudCog className="h-3.5 w-3.5" />
                )}
                Lanzar agente
              </Button>
            </div>
            {launchMsg && (
              <p className="text-xs text-muted-foreground break-all">{launchMsg}</p>
            )}
          </div>

          {cloudLoading && cloudAgents.length === 0 ? (
            <div className="h-24 animate-pulse rounded-xl border border-border bg-card" />
          ) : cloudAgents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-6 text-center">
              <Cloud className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No hay Cloud Agents todavía
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Créalos desde Cursor o la API; aquí aparecerán con sus runs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="space-y-2">
                {cloudAgents.map((ca) => {
                  const status = (ca.status || '').toUpperCase();
                  const active = selectedCloudId === ca.id;
                  return (
                    <button
                      key={ca.id}
                      type="button"
                      onClick={() => loadCloudRuns(ca.id)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                        active
                          ? 'border-sky-500/50 bg-sky-500/10'
                          : 'border-border bg-card hover:border-sky-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{ca.name || ca.id}</p>
                          <p className="truncate font-mono text-[10px] text-muted-foreground">
                            {ca.id}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] ${
                            status === 'RUNNING' || status === 'ACTIVE'
                              ? 'border-green-500/30 text-green-400'
                              : status === 'FAILED' || status === 'ERROR'
                                ? 'border-red-500/30 text-red-400'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {status || '—'}
                        </Badge>
                      </div>
                      {ca.url && (
                        <a
                          href={ca.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 inline-flex items-center gap-1 text-[10px] text-sky-400 hover:underline"
                        >
                          Abrir <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Runs
                </p>
                {!selectedCloudId ? (
                  <p className="text-xs text-muted-foreground">
                    Selecciona un agente para ver sus corridas.
                  </p>
                ) : runsLoading ? (
                  <div className="flex justify-center py-8 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : cloudRuns.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sin runs para este agente.</p>
                ) : (
                  <ul className="max-h-72 space-y-2 overflow-y-auto">
                    {cloudRuns.map((run) => (
                      <li
                        key={run.id}
                        className="rounded-lg border border-border bg-muted/20 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-mono text-[10px] text-muted-foreground">
                            {run.id}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {run.status || '—'}
                          </Badge>
                        </div>
                        {(run.summary || run.prompt) && (
                          <p className="mt-1 line-clamp-2 text-xs text-foreground">
                            {run.summary || run.prompt}
                          </p>
                        )}
                        {run.createdAt && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {new Date(run.createdAt).toLocaleString('es-MX')}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {dashboard?.cloud?.models?.total > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {dashboard.cloud.models.total} modelos disponibles vía API
            </p>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold tracking-tight">{stats.total}</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Roster
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold tracking-tight text-violet-400">
              {stats.filtrados}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Filtrados
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold tracking-tight text-green-400">
              {stats.online}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Online
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold tracking-tight text-blue-400">
              {stats.orquestacion}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              En orquestación
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  setQ(qInput);
                }
              }}
              placeholder="Buscar agente, slug o división…"
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <Button
            size="sm"
            onClick={() => {
              setPage(1);
              setQ(qInput);
            }}
          >
            Buscar
          </Button>
          <select
            value={categoria}
            onChange={(e) => {
              setPage(1);
              setCategoria(e.target.value);
            }}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="all">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bot className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No hay agentes Cursor con ese filtro
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const Icon = CATEGORY_ICONS[agent.categoria] || Sparkles;
              const agentStatus = getStatus(agent.id);
              const isOnline = agentStatus?.estado === 'online' || (agent.sessionsActive || 0) > 0;
              const uptime = agentStatus?.uptime || agent.uptime || 0;
              const tasksCompleted = agent.tasks.filter((t) => t.estado === 'completado').length;

              return (
                <Card
                  key={agent.id}
                  className="relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                >
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ${
                          CATEGORY_COLORS[agent.categoria] || 'text-primary'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isOnline ? (
                          <>
                            <Wifi className="h-3 w-3 text-green-400" />
                            <Badge
                              variant="outline"
                              className="gap-1 border-green-500/30 bg-green-500/10 text-[10px] text-green-400"
                            >
                              Online
                            </Badge>
                          </>
                        ) : (
                          <>
                            <WifiOff className="h-3 w-3 text-muted-foreground/50" />
                            <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
                              Standby
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <h3 className="mb-1 text-sm font-semibold text-foreground">{agent.nombre}</h3>
                    <p className="mb-2 font-mono text-[10px] text-muted-foreground">
                      @{agent.slug || agent.id.replace(/^cursor-/, '')}
                    </p>
                    <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {agent.descripcion}
                    </p>

                    <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Uptime:</span>
                      <span className="text-xs font-medium text-foreground">
                        {formatUptime(uptime)}
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-1">
                      {agent.stack.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-[10px]">
                          {tech}
                        </Badge>
                      ))}
                    </div>

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

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
