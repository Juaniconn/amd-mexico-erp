import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const CURSOR_API_BASE = 'https://api.cursor.com';

@Injectable()
export class CursorCloudService {
  private readonly logger = new Logger(CursorCloudService.name);

  constructor(private readonly config: ConfigService) {}

  private getApiKey(): string {
    const candidates = [
      this.config.get<string>('CURSOR_API_KEY'),
      process.env.CURSOR_API_KEY,
    ];
    for (const c of candidates) {
      if (c && c.trim()) return c.trim();
    }
    // Docker compose may set CURSOR_API_KEY="" and override ConfigModule .env
    try {
      const fs = require('fs') as typeof import('fs');
      for (const p of ['.env', 'apps/api/.env', '/app/.env']) {
        if (!fs.existsSync(p)) continue;
        const m = fs.readFileSync(p, 'utf8').match(/^CURSOR_API_KEY=(.+)$/m);
        if (m?.[1]?.trim()) return m[1].trim().replace(/^["']|["']$/g, '');
      }
    } catch {
      /* ignore */
    }
    throw new ServiceUnavailableException(
      'CURSOR_API_KEY no configurada. Agrega la key en apps/api/.env',
    );
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const key = this.getApiKey();
    const url = `${CURSOR_API_BASE}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    };
    let res: Response;
    try {
      res = await fetch(url, { ...init, headers });
    } catch (err: any) {
      this.logger.error(`Cursor API network error ${path}: ${err?.message}`);
      throw new BadGatewayException('No se pudo contactar la API de Cursor');
    }
    const text = await res.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text };
    }
    if (!res.ok) {
      const msg =
        body?.message || body?.error || `Cursor API HTTP ${res.status}`;
      this.logger.warn(`Cursor API ${path} -> ${res.status}: ${msg}`);
      throw new BadGatewayException(msg);
    }
    return body as T;
  }

  async getMe() {
    return this.request<{
      apiKeyName: string;
      userId: number;
      createdAt: string;
      userEmail: string;
      userFirstName?: string;
      userLastName?: string;
    }>('/v1/me');
  }

  async listAgents(limit = 20, cursor?: string, includeArchived = true) {
    const q = new URLSearchParams({
      limit: String(Math.min(100, Math.max(1, limit))),
      includeArchived: String(includeArchived),
    });
    if (cursor) q.set('cursor', cursor);
    return this.request<{
      items: Array<{
        id: string;
        name: string;
        status: string;
        env?: { type?: string };
        url?: string;
        createdAt?: string;
        updatedAt?: string;
        latestRunId?: string;
      }>;
      nextCursor?: string;
    }>(`/v1/agents?${q}`);
  }

  async getAgent(id: string) {
    return this.request<any>(`/v1/agents/${encodeURIComponent(id)}`);
  }

  async listRuns(agentId: string, limit = 20, cursor?: string) {
    const q = new URLSearchParams({
      limit: String(Math.min(100, Math.max(1, limit))),
    });
    if (cursor) q.set('cursor', cursor);
    return this.request<{
      items?: any[];
      runs?: any[];
      nextCursor?: string;
    }>(`/v1/agents/${encodeURIComponent(agentId)}/runs?${q}`);
  }

  async getRun(agentId: string, runId: string) {
    return this.request<any>(
      `/v1/agents/${encodeURIComponent(agentId)}/runs/${encodeURIComponent(runId)}`,
    );
  }

  async getAgentUsage(agentId: string, runId?: string) {
    const q = runId ? `?runId=${encodeURIComponent(runId)}` : '';
    return this.request<any>(
      `/v1/agents/${encodeURIComponent(agentId)}/usage${q}`,
    );
  }

  async listModels() {
    return this.request<{ items?: any[]; models?: string[] }>('/v1/models');
  }

  async listRepositories() {
    return this.request<{ items?: Array<{ url: string }> }>('/v1/repositories');
  }

  /**
   * Crea un Cloud Agent + primer run sobre amd-mexico-erp.
   * El repo se fija en backend (no confiar en el cliente).
   */
  async createAgent(input: {
    prompt: string;
    name?: string;
    modelId?: string;
    autoCreatePR?: boolean;
    startingRef?: string;
  }) {
    const text = (input.prompt || '').trim();
    if (!text) {
      throw new BadRequestException('prompt requerido');
    }
    const body: Record<string, any> = {
      prompt: { text },
      name: (input.name || '').trim().slice(0, 100) || undefined,
      repos: [
        {
          url: 'https://github.com/Juaniconn/amd-mexico-erp',
          startingRef: input.startingRef || 'main',
        },
      ],
      autoCreatePR: input.autoCreatePR !== false,
    };
    if (input.modelId?.trim()) {
      body.model = { id: input.modelId.trim() };
    }
    return this.request<{ agent: any; run: any }>('/v1/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async createRun(
    agentId: string,
    input: { prompt: string; modelId?: string },
  ) {
    const text = (input.prompt || '').trim();
    if (!text) {
      throw new BadRequestException('prompt requerido');
    }
    const body: Record<string, any> = { prompt: { text } };
    if (input.modelId?.trim()) {
      body.model = { id: input.modelId.trim() };
    }
    return this.request<any>(
      `/v1/agents/${encodeURIComponent(agentId)}/runs`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
  }

  async cancelRun(agentId: string, runId: string) {
    return this.request<{ id: string }>(
      `/v1/agents/${encodeURIComponent(agentId)}/runs/${encodeURIComponent(runId)}/cancel`,
      { method: 'POST' },
    );
  }

  /** Resumen para el dashboard del módulo */
  async getCloudSummary() {
    const [me, agentsRes, modelsRes] = await Promise.all([
      this.getMe(),
      this.listAgents(50).catch(() => ({ items: [] as any[] })),
      this.listModels().catch(
        (): { items?: any[]; models?: string[] } => ({ items: [], models: [] }),
      ),
    ]);
    const agents = agentsRes.items || [];
    const byStatus: Record<string, number> = {};
    for (const a of agents) {
      const s = (a.status || 'UNKNOWN').toUpperCase();
      byStatus[s] = (byStatus[s] || 0) + 1;
    }
    const models =
      modelsRes.items?.map((m: any) => ({
        id: m.id,
        displayName: m.displayName || m.id,
      })) ||
      (modelsRes.models || []).map((id: string) => ({ id, displayName: id }));

    return {
      connected: true,
      me: {
        apiKeyName: me.apiKeyName,
        email: me.userEmail,
        name: [me.userFirstName, me.userLastName].filter(Boolean).join(' '),
        userId: me.userId,
      },
      agents: {
        total: agents.length,
        byStatus,
        items: agents,
      },
      models: {
        total: models.length,
        items: models.slice(0, 40),
      },
      fetchedAt: new Date().toISOString(),
    };
  }
}
