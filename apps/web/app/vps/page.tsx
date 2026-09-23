'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { get } from '@/lib/api';
import { Server, Cpu, HardDrive, MemoryStick, Activity, Container, RefreshCw, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface Metrics {
  uptime: string;
  memory: string;
  cpu: string;
  loadAvg: string;
}

interface DiskRow {
  fs: string;
  size: string;
  used: string;
  avail: string;
  pct: number;
  mount: string;
}

interface ContainerRow {
  name: string;
  status: string;
  up: boolean;
  healthy: boolean;
}

interface DockerData {
  containers: string;
  images: string;
  volumes: string;
}

function parseDisks(raw: string): DiskRow[] {
  return raw.split('\n')
    .slice(1)
    .map(l => {
      const p = l.trim().split(/\s+/);
      if (p.length >= 6 && p[0] !== 'Filesystem') {
        return { fs: p[0], size: p[1], used: p[2], avail: p[3], pct: parseInt(p[4]) || 0, mount: p.slice(5).join(' ') };
      }
      return null;
    })
    .filter(Boolean) as DiskRow[];
}

function parseMem(raw: string): { total: number; used: number; avail: number } | null {
  const line = raw.split('\n').find(l => l.startsWith('Mem:'));
  if (!line) return null;
  const p = line.split(/\s+/).slice(1);
  return { total: parseFloat(p[0]) || 0, used: parseFloat(p[1]) || 0, avail: parseFloat(p[5]) || 0 };
}

function parseContainers(raw: string): ContainerRow[] {
  return raw.split('\n').filter(Boolean).map(l => ({
    name: l.split('|')[0]?.trim() || '',
    status: l.split('|')[1]?.trim() || '',
    up: l.includes('Up'),
    healthy: l.includes('healthy'),
  }));
}

function CircularGauge({ pct, size = 80, strokeWidth = 6, color, label, value }: {
  pct: number; size?: number; strokeWidth?: number; color: string; label: string; value: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="currentColor" strokeWidth={strokeWidth}
            className="text-border"
          />
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-foreground">{value}</span>
        </div>
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

function LinearBar({ pct, color, height = 8 }: { pct: number; color: string; height?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-border" style={{ height }}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MetricTile({ icon: Icon, label, value, subtext, color, children }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; subtext?: string; color: string; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-border/80 hover:shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
      {subtext && <div className="mt-0.5 text-[11px] text-muted-foreground">{subtext}</div>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function VpsMonitor() {
  const [metrics, setMetrics] = useState<Metrics>({ uptime: '', memory: '', cpu: '', loadAvg: '' });
  const [cpuLoad, setCpuLoad] = useState<{ load1: number; load5: number; load15: number } | null>(null);
  const [disks, setDisks] = useState<DiskRow[]>([]);
  const [mem, setMem] = useState<{ total: number; used: number; avail: number } | null>(null);
  const [containers, setContainers] = useState<ContainerRow[]>([]);
  const [docker, setDocker] = useState<DockerData>({ containers: '', images: '', volumes: '' });
  const [lastUpdate, setLastUpdate] = useState('');
  const [live, setLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const [d, s, c, cl] = await Promise.all([
        get<any>('/api/vps/disks'),
        get<Metrics>('/api/vps/status'),
        get<any>('/api/vps/docker'),
        get<{ load1: number; load5: number; load15: number }>('/api/vps/cpu-load'),
      ]);
      setMetrics(s);
      setCpuLoad(cl);
      setDisks(parseDisks(d.df || ''));
      setMem(parseMem(s.memory || ''));
      setContainers(parseContainers(c.containers || ''));
      setDocker({ containers: c.containers || '', images: c.images || '', volumes: c.volumes || '' });
      setLastUpdate(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLive(true);
    } catch {
      setLive(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 5000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const memPct = mem ? Math.round((mem.used / mem.total) * 100) : 0;
  const running = containers.filter(c => c.up).length;
  const healthy = containers.filter(c => c.healthy).length;
  const unit = metrics.memory.includes('Gi') ? 'GiB' : 'MiB';
  const cpuCores = parseInt(metrics.cpu) || 1;

  const memColor = memPct < 60 ? '#10b981' : memPct < 80 ? '#f59e0b' : '#ef4444';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-3 w-3 items-center justify-center rounded-full ${live ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}>
              {live && <span className="absolute h-3 w-3 animate-ping rounded-full bg-emerald-400 opacity-75" />}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">VPS Monitor</h1>
              <p className="text-[11px] text-muted-foreground">{metrics.cpu} cores · {unit}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="num-mono">{metrics.uptime}</span>
            </div>
            <span className="num-mono">{lastUpdate}</span>
            <button
              onClick={() => { setRefreshing(true); fetchAll().then(() => setRefreshing(false)); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Actualizar"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricTile icon={Cpu} label="CPU Load" value={cpuLoad ? cpuLoad.load1.toFixed(2) : metrics.loadAvg || '—'} color="bg-blue-500/10 text-blue-400"
            subtext={cpuLoad ? `1min: ${cpuLoad.load1.toFixed(2)} · 5min: ${cpuLoad.load5.toFixed(2)} · 15min: ${cpuLoad.load15.toFixed(2)}` : 'Average 1, 5, 15 min'}>
            {cpuLoad && (
              <div className="flex items-end gap-1 h-8">
                {[cpuLoad.load1, cpuLoad.load5, cpuLoad.load15].map((load, i) => {
                  const height = Math.min(100, (load / cpuCores) * 100);
                  const color = load < cpuCores * 0.6 ? 'bg-emerald-500' : load < cpuCores * 0.8 ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full rounded-sm bg-border" style={{ height: '100%' }}>
                        <div className={`w-full rounded-sm ${color} transition-all duration-300`} style={{ height: `${height}%` }} />
                      </div>
                      <span className="text-[8px] text-muted-foreground">{i === 0 ? '1m' : i === 1 ? '5m' : '15m'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </MetricTile>
          <MetricTile icon={MemoryStick} label="RAM" value={`${memPct}%`} color="bg-purple-500/10 text-purple-400"
            subtext={mem ? `${mem.used} / ${mem.total} ${unit}` : '—'}>
            <LinearBar pct={memPct} color={memPct < 60 ? 'bg-emerald-500' : memPct < 80 ? 'bg-amber-500' : 'bg-red-500'} />
          </MetricTile>
          <MetricTile icon={Container} label="Docker" value={`${running}/${containers.length}`} color="bg-cyan-500/10 text-cyan-400"
            subtext={`${healthy} healthy`} />
          <MetricTile icon={Activity} label="Uptime" value={metrics.uptime || '—'} color="bg-emerald-500/10 text-emerald-400"
            subtext="System running time" />
        </div>

        {/* Gauges Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center">
            <CircularGauge pct={memPct} color={memColor} label="RAM Usage" value={`${memPct}%`} />
          </div>
          {disks.slice(0, 3).map((d, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center justify-center">
              <CircularGauge
                pct={d.pct}
                color={d.pct < 60 ? '#10b981' : d.pct < 80 ? '#f59e0b' : '#ef4444'}
                label={d.mount === '/' ? 'Root' : d.mount || d.fs}
                value={`${d.pct}%`}
              />
            </div>
          ))}
        </div>

        {/* Disks Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
            <HardDrive className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-foreground">Disk Usage</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Filesystem</th>
                  <th className="px-4 py-2 font-medium">Mount</th>
                  <th className="px-4 py-2 font-medium">Size</th>
                  <th className="px-4 py-2 font-medium">Used</th>
                  <th className="px-4 py-2 font-medium">Available</th>
                  <th className="px-4 py-2 font-medium w-48">Usage</th>
                  <th className="px-4 py-2 font-medium text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {disks.map((d, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground">{d.fs}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{d.mount}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground">{d.size}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground">{d.used}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{d.avail}</td>
                    <td className="px-4 py-2.5">
                      <LinearBar pct={d.pct} color={d.pct < 60 ? 'bg-emerald-500' : d.pct < 80 ? 'bg-amber-500' : 'bg-red-500'} />
                    </td>
                    <td className={`px-4 py-2.5 text-right font-mono text-xs font-semibold ${d.pct >= 80 ? 'text-red-500' : d.pct >= 60 ? 'text-amber-500' : 'text-foreground'}`}>
                      {d.pct}%
                    </td>
                  </tr>
                ))}
                {disks.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Sin datos de disco</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Containers */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
            <Container className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold text-foreground">Docker Containers</span>
            <span className="ml-auto text-xs text-muted-foreground">{running} running · {healthy} healthy</span>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {containers.map((c, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/10 p-3 transition hover:border-border/80 hover:bg-muted/20">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${c.healthy ? 'bg-emerald-500' : c.up ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <span className="truncate font-mono text-xs font-semibold text-foreground">{c.name}</span>
                  </div>
                  {c.healthy ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : c.up ? (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  )}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{c.status}</p>
              </div>
            ))}
            {containers.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-muted-foreground">Sin contenedores</div>
            )}
          </div>
        </div>

        {/* Docker Assets */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
              <Server className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-semibold text-foreground">Images</span>
              <span className="ml-auto num-mono text-xs text-muted-foreground">{docker.images.split('\n').filter(Boolean).length}</span>
            </div>
            <div className="max-h-48 overflow-y-auto p-3">
              {docker.images.split('\n').filter(Boolean).map((img, i) => (
                <div key={i} className="truncate rounded px-2 py-1.5 font-mono text-xs text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-colors">
                  {img.split(' ')[0]}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
              <HardDrive className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">Volumes</span>
              <span className="ml-auto num-mono text-xs text-muted-foreground">{docker.volumes.split('\n').filter(Boolean).length}</span>
            </div>
            <div className="max-h-48 overflow-y-auto p-3">
              {docker.volumes.split('\n').filter(Boolean).map((vol, i) => (
                <div key={i} className="truncate rounded px-2 py-1.5 font-mono text-xs text-muted-foreground hover:bg-muted/20 hover:text-foreground transition-colors">
                  {vol}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
