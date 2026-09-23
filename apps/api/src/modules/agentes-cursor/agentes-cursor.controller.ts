import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CURSOR_AGENTS, CursorAgentInfo } from './cursor-agents.catalog';
import { CursorCloudService } from './cursor-cloud.service';

const SESSION_START = new Date();

@Controller()
export class AgentesCursorController {
  constructor(private readonly cloud: CursorCloudService) {}

  private withLiveFields(a: CursorAgentInfo) {
    return {
      ...a,
      lastActivity: a.sessionsActive
        ? new Date().toISOString()
        : undefined,
      uptime: Math.floor((Date.now() - SESSION_START.getTime()) / 1000),
    };
  }

  // ─── Cloud Agents API (Cursor Pro key) ───────────────────────────

  @Get('agentes-cursor/cloud/me')
  cloudMe() {
    return this.cloud.getMe();
  }

  @Get('agentes-cursor/cloud/summary')
  cloudSummary() {
    return this.cloud.getCloudSummary();
  }

  @Get('agentes-cursor/cloud/agents')
  cloudAgents(
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('includeArchived') includeArchived?: string,
  ) {
    return this.cloud.listAgents(
      limit ? parseInt(limit, 10) : 20,
      cursor,
      includeArchived !== 'false',
    );
  }

  @Post('agentes-cursor/cloud/agents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createCloudAgent(
    @Body()
    body: {
      prompt: string;
      name?: string;
      modelId?: string;
      autoCreatePR?: boolean;
      startingRef?: string;
    },
  ) {
    return this.cloud.createAgent(body);
  }

  @Get('agentes-cursor/cloud/agents/:id')
  cloudAgent(@Param('id') id: string) {
    return this.cloud.getAgent(id);
  }

  @Get('agentes-cursor/cloud/agents/:id/runs')
  cloudAgentRuns(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.cloud.listRuns(id, limit ? parseInt(limit, 10) : 20, cursor);
  }

  @Post('agentes-cursor/cloud/agents/:id/runs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createCloudRun(
    @Param('id') id: string,
    @Body() body: { prompt: string; modelId?: string },
  ) {
    return this.cloud.createRun(id, body);
  }

  @Get('agentes-cursor/cloud/agents/:id/runs/:runId')
  cloudAgentRun(@Param('id') id: string, @Param('runId') runId: string) {
    return this.cloud.getRun(id, runId);
  }

  @Post('agentes-cursor/cloud/agents/:id/runs/:runId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  cancelCloudRun(@Param('id') id: string, @Param('runId') runId: string) {
    return this.cloud.cancelRun(id, runId);
  }

  @Get('agentes-cursor/cloud/agents/:id/usage')
  cloudAgentUsage(
    @Param('id') id: string,
    @Query('runId') runId?: string,
  ) {
    return this.cloud.getAgentUsage(id, runId);
  }

  @Get('agentes-cursor/cloud/models')
  cloudModels() {
    return this.cloud.listModels();
  }

  @Get('agentes-cursor/cloud/repositories')
  cloudRepositories() {
    return this.cloud.listRepositories();
  }

  // ─── Roster Agency (local catalog) ───────────────────────────────

  @Get('agentes-cursor')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoria') categoria?: string,
    @Query('q') q?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 12;
    let list = CURSOR_AGENTS;
    if (categoria && categoria !== 'all') {
      list = list.filter((a) => a.categoria === categoria);
    }
    if (q?.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.nombre.toLowerCase().includes(term) ||
          a.descripcion.toLowerCase().includes(term) ||
          a.slug.toLowerCase().includes(term) ||
          a.division.toLowerCase().includes(term),
      );
    }
    const total = list.length;
    const skip = (pageNum - 1) * limitNum;
    const data = list
      .slice(skip, skip + limitNum)
      .map((a) => this.withLiveFields(a));
    const categorias = [
      ...new Set(CURSOR_AGENTS.map((a) => a.categoria)),
    ].sort();
    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
        categorias,
        rosterTotal: CURSOR_AGENTS.length,
      },
    };
  }

  @Get('agentes-cursor/activos')
  findActivos() {
    return {
      data: CURSOR_AGENTS.filter((a) => a.estado === 'activo').map((a) =>
        this.withLiveFields(a),
      ),
    };
  }

  @Get('agentes-cursor/status')
  getStatus() {
    const now = new Date();
    const uptimeSec = Math.floor(
      (now.getTime() - SESSION_START.getTime()) / 1000,
    );
    const focus = CURSOR_AGENTS.filter((a) => (a.sessionsActive || 0) > 0);
    const status = focus.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      estado: 'online' as const,
      trabajandoEn: a.trabajandoEn ?? null,
      lastActivity: now.toISOString(),
      uptime: uptimeSec,
      sessionsActive: a.sessionsActive || 0,
      tasksCompleted: a.tasks.filter((t) => t.estado === 'completado').length,
    }));
    return { data: status, timestamp: now.toISOString() };
  }

  @Get('agentes-cursor/dashboard')
  async getDashboard() {
    const allTasks = CURSOR_AGENTS.flatMap((a) =>
      a.tasks.map((t) => ({ ...t, agente: a.nombre, agenteId: a.id })),
    );
    const byCat: Record<string, number> = {};
    for (const a of CURSOR_AGENTS) {
      byCat[a.categoria] = (byCat[a.categoria] || 0) + 1;
    }

    let cloud: any = null;
    try {
      cloud = await this.cloud.getCloudSummary();
    } catch (err: any) {
      cloud = {
        connected: false,
        error: err?.message || 'Cloud Agents no disponible',
      };
    }

    return {
      agentes: {
        total: CURSOR_AGENTS.length,
        activos: CURSOR_AGENTS.filter((a) => a.estado === 'activo').length,
        enOrquestacion: CURSOR_AGENTS.filter((a) => (a.sessionsActive || 0) > 0)
          .length,
        trabajando: CURSOR_AGENTS.filter((a) => a.trabajandoEn).length,
      },
      porCategoria: byCat,
      tasks: {
        total: allTasks.length,
        completadas: allTasks.filter((t) => t.estado === 'completado').length,
        trabajando: allTasks.filter((t) => t.estado === 'trabajando').length,
        pendientes: allTasks.filter((t) => t.estado === 'pendiente').length,
        errores: allTasks.filter((t) => t.estado === 'error').length,
      },
      orquestador: {
        id: 'cursor-agents-orchestrator',
        nombre: 'Agency Orchestrator',
        descripcion:
          'Orquesta el roster de Agency Agents en Cursor; elige y ejecuta el especialista adecuado.',
      },
      cloud,
      playbook: 'docs/CLOUD_AGENTS_PLAYBOOK.md',
      defaultRepo: 'https://github.com/Juaniconn/amd-mexico-erp',
    };
  }
}
