import { Controller, Get, Query } from '@nestjs/common';

interface AgentTask {
  modulo: string;
  estado: 'completado' | 'trabajando' | 'error' | 'pendiente';
  resultado?: string;
  duracion?: number;
  finalizado?: string;
}

interface AgentInfo {
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

const SESSION_START = new Date();

const AGENTES: AgentInfo[] = [
  {
    id: 'amd-backend-architect',
    nombre: 'Backend Architect',
    descripcion: 'Diseña API, endpoints, DTOs y Prisma schema con NestJS.',
    stack: ['NestJS', 'Prisma', 'PostgreSQL', 'TypeScript'],
    estado: 'activo',
    categoria: 'Desarrollo',
    trabajandoEn: null,
    lastActivity: new Date().toISOString(),
    uptime: Math.floor((Date.now() - SESSION_START.getTime()) / 1000),
    sessionsActive: 1,
    tasks: [
      { modulo: 'Inventario', estado: 'completado', resultado: 'API completa: CRUD materiales, movimientos, stock', duracion: 487, finalizado: '2026-09-22T16:00:13Z' },
      { modulo: 'Compras', estado: 'completado', resultado: 'API completa: órdenes de compra, transiciones, stock', duracion: 1293, finalizado: '2026-09-22T16:30:00Z' },
      { modulo: 'Facturación', estado: 'completado', resultado: 'API completa: facturas, detalles, estatus', duracion: 776, finalizado: '2026-09-22T17:12:00Z' },
      { modulo: 'Calidad', estado: 'completado', resultado: 'API completa: control de calidad, inspecciones', duracion: 450, finalizado: '2026-09-22T17:20:00Z' },
      { modulo: 'Reportes', estado: 'completado', resultado: 'API completa: reportes por tipo, dashboard', duracion: 380, finalizado: '2026-09-22T17:25:00Z' },
    ],
  },
  {
    id: 'amd-frontend-wizard',
    nombre: 'Frontend Wizard',
    descripcion: 'Construye UI/UX con Next.js 14, React, Tailwind CSS y TypeScript.',
    stack: ['Next.js 14', 'React 18', 'Tailwind', 'TypeScript'],
    estado: 'activo',
    categoria: 'Desarrollo',
    trabajandoEn: null,
    lastActivity: new Date().toISOString(),
    uptime: Math.floor((Date.now() - SESSION_START.getTime()) / 1000),
    sessionsActive: 1,
    tasks: [
      { modulo: 'Inventario', estado: 'completado', resultado: 'UI completa: lista, crear, detalle, movimientos', duracion: 585, finalizado: '2026-09-22T16:01:51Z' },
      { modulo: 'Compras', estado: 'completado', resultado: 'UI completa: lista, detalle, crear orden', duracion: 343, finalizado: '2026-09-22T16:35:00Z' },
      { modulo: 'Facturación', estado: 'completado', resultado: 'UI completa: lista, detalle, nueva factura', duracion: 3090, finalizado: '2026-09-22T17:40:00Z' },
      { modulo: 'Calidad', estado: 'completado', resultado: 'UI completa: lista, detalle, nueva inspección', duracion: 420, finalizado: '2026-09-22T17:45:00Z' },
      { modulo: 'Reportes', estado: 'completado', resultado: 'UI completa: dashboard, vista de reporte', duracion: 350, finalizado: '2026-09-22T17:50:00Z' },
    ],
  },
  {
    id: 'amd-qa-engineer',
    nombre: 'QA Engineer',
    descripcion: 'Escribe tests, verifica edge cases y asegura calidad del software.',
    stack: ['Jest', 'Playwright', 'React Testing Library'],
    estado: 'activo',
    categoria: 'Calidad',
    trabajandoEn: null,
    lastActivity: new Date().toISOString(),
    uptime: Math.floor((Date.now() - SESSION_START.getTime()) / 1000),
    sessionsActive: 1,
    tasks: [
      { modulo: 'Inventario', estado: 'completado', resultado: 'Tests unitarios y de integración (36 tests)', duracion: 320, finalizado: '2026-09-22T15:58:30Z' },
      { modulo: 'Compras', estado: 'completado', resultado: 'Tests unitarios y de integración (58 tests)', duracion: 1681, finalizado: '2026-09-22T16:40:00Z' },
    ],
  },
  {
    id: 'system-cleanup',
    nombre: 'System Cleanup',
    descripcion: 'Limpia Docker, imágenes huérfanas, build cache y caches npm/pnpm.',
    stack: ['Docker', 'Shell', 'Cron'],
    estado: 'activo',
    categoria: 'Infraestructura',
    trabajandoEn: null,
    lastActivity: new Date().toISOString(),
    uptime: Math.floor((Date.now() - SESSION_START.getTime()) / 1000),
    sessionsActive: 1,
    tasks: [
      { modulo: 'Limpieza', estado: 'completado', resultado: 'Liberados ~38GB de build cache e imágenes huérfanas', duracion: 120, finalizado: '2026-09-22T15:30:00Z' },
    ],
  },
  {
    id: 'amd-web-app',
    nombre: 'AMD Web App',
    descripcion: 'Build & deploy del ERP amd_web_app con Docker, nginx y Cloudflare.',
    stack: ['Docker', 'nginx', 'Cloudflare', 'CI/CD'],
    estado: 'activo',
    categoria: 'Infraestructura',
    trabajandoEn: null,
    lastActivity: new Date().toISOString(),
    uptime: Math.floor((Date.now() - SESSION_START.getTime()) / 1000),
    sessionsActive: 1,
    tasks: [
      { modulo: 'Deploy', estado: 'completado', resultado: '5 contenedores healthy, tunnel activo', duracion: 300, finalizado: '2026-09-22T14:00:00Z' },
    ],
  },
  {
    id: 'amd-inventory-planner',
    nombre: 'Inventory Planner (Próximo)',
    descripcion: 'Monitorea stock bajo y sugiere órdenes de compra automáticas.',
    stack: ['NestJS', 'Prisma', 'Next.js'],
    estado: 'inactivo',
    categoria: 'Operaciones',
    tasks: [],
  },
  {
    id: 'amd-production-scheduler',
    nombre: 'Production Scheduler (Próximo)',
    descripcion: 'Planifica OTs y asigna maquinaria disponible en tiempo real.',
    stack: ['NestJS', 'Prisma', 'Next.js'],
    estado: 'inactivo',
    categoria: 'Operaciones',
    tasks: [],
  },
  {
    id: 'amd-maintenance-planner',
    nombre: 'Maintenance Planner (Próximo)',
    descripcion: 'Sugiere mantenimiento preventivo basado en horas de uso.',
    stack: ['NestJS', 'Prisma', 'Next.js'],
    estado: 'inactivo',
    categoria: 'Operaciones',
    tasks: [],
  },
];

@Controller()
export class AgentesController {
  @Get('agentes')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNum - 1) * limitNum;
    const total = AGENTES.length;
    const data = AGENTES.slice(skip, skip + limitNum);
    return {
      data,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    };
  }

  @Get('agentes/activos')
  findActivos() {
    return { data: AGENTES.filter((a) => a.estado === 'activo') };
  }

  @Get('agentes/status')
  getStatus() {
    const now = new Date();
    const status = AGENTES.filter((a) => a.estado === 'activo').map((a) => {
      const lastAct = a.lastActivity ? new Date(a.lastActivity) : null;
      const uptimeSec = Math.floor((now.getTime() - SESSION_START.getTime()) / 1000);
      const sessions = a.sessionsActive || 0;
      const isActive = lastAct && (now.getTime() - lastAct.getTime()) < 300000; // 5 min

      return {
        id: a.id,
        nombre: a.nombre,
        estado: isActive ? 'online' : 'idle',
        trabajandoEn: a.trabajandoEn,
        lastActivity: a.lastActivity,
        uptime: uptimeSec,
        sessionsActive: sessions,
        tasksCompleted: a.tasks.filter((t) => t.estado === 'completado').length,
      };
    });
    return { data: status, timestamp: now.toISOString() };
  }

  @Get('agentes/dashboard')
  getDashboard() {
    const allTasks = AGENTES.flatMap((a) =>
      a.tasks.map((t) => ({ ...t, agente: a.nombre, agenteId: a.id }))
    );
    return {
      agentes: {
        total: AGENTES.length,
        activos: AGENTES.filter((a) => a.estado === 'activo').length,
        trabajando: AGENTES.filter((a) => a.trabajandoEn).length,
      },
      tasks: {
        total: allTasks.length,
        completadas: allTasks.filter((t) => t.estado === 'completado').length,
        trabajando: allTasks.filter((t) => t.estado === 'trabajando').length,
        pendientes: allTasks.filter((t) => t.estado === 'pendiente').length,
        errores: allTasks.filter((t) => t.estado === 'error').length,
      },
      actividad: allTasks.sort((a, b) =>
        new Date(b.finalizado || 0).getTime() - new Date(a.finalizado || 0).getTime()
      ),
    };
  }
}
