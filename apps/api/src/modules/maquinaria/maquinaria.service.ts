import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, EstatusParteOT } from '@prisma/client';
import {
  CreateMaquinaDto,
  UpdateMaquinaDto,
  AsignarOperadorDto,
  CreateMantenimientoDto,
  UpdateEstatusMaquinaDto,
} from './dto/create-maquina.dto';

@Injectable()
export class MaquinariaService {
  constructor(private prisma: PrismaService) {}

  // ─── CRUD Máquinas ──────────────────────────────────────

  async createMaquina(data: CreateMaquinaDto) {
    const maquina = await this.prisma.maquina.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        tipo: data.tipo,
        descripcion: data.descripcion,
        capacidad: data.capacidad,
        sucursalId: data.sucursalId,
        notas: data.notas,
        activo: data.activo ?? true,
        intervaloDiasPreventivo: data.intervaloDiasPreventivo,
        tarifaHora: data.tarifaHora,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Máquina creada exitosamente',
      data: maquina,
    };
  }

  async findAllMaquinas(page: number = 1, limit: number = 20, search?: string, tipo?: string, estatus?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.MaquinaWhereInput = {
      ...(search
        ? {
            OR: [
              { codigo: { contains: search, mode: 'insensitive' } },
              { nombre: { contains: search, mode: 'insensitive' } },
              { descripcion: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(tipo ? { tipo } : {}),
      ...(estatus ? { estatus: estatus as any } : {}),
    };

    const [maquinas, total] = await Promise.all([
      this.prisma.maquina.findMany({
        where,
        skip,
        take: limit,
        orderBy: { codigo: 'asc' },
        include: {
          _count: { select: { operaciones: true, partesOT: true } },
        },
      }),
      this.prisma.maquina.count({ where }),
    ]);

    return { data: maquinas, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneMaquina(id: string) {
    const maquina = await this.prisma.maquina.findUnique({
      where: { id },
      include: {
        operaciones: {
          include: {
            operador: { select: { id: true, nombre: true, apellido: true } },
            wo: { select: { id: true, folio: true, estatus: true } },
            parte: { select: { id: true, numeroParte: true, piezaNombre: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        partesOT: true,
        mantenimientos: {
          orderBy: { fecha: 'desc' },
          take: 10,
        },
      },
    });

    if (!maquina) {
      throw new NotFoundException({ message: 'Máquina no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    return maquina;
  }

  async updateMaquina(id: string, data: UpdateMaquinaDto) {
    try {
      const updateData: Prisma.MaquinaUpdateInput = {};
      if (data.nombre !== undefined) updateData.nombre = data.nombre;
      if (data.tipo !== undefined) updateData.tipo = data.tipo;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.capacidad !== undefined) updateData.capacidad = data.capacidad;
      if (data.sucursalId !== undefined) {
        updateData.sucursal = data.sucursalId
          ? { connect: { id: data.sucursalId } }
          : { disconnect: true };
      }

      if (data.notas !== undefined) updateData.notas = data.notas;
      if (data.activo !== undefined) updateData.activo = data.activo;
      if (data.intervaloDiasPreventivo !== undefined) {
        updateData.intervaloDiasPreventivo = data.intervaloDiasPreventivo;
      }
      if (data.tarifaHora !== undefined) {
        updateData.tarifaHora = data.tarifaHora;
      }

      const maquina = await this.prisma.maquina.update({
        where: { id },
        data: updateData,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Máquina actualizada exitosamente',
        data: maquina,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Máquina no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async deleteMaquina(id: string) {
    try {
      // Soft delete: marcar como inactiva
      const maquina = await this.prisma.maquina.update({
        where: { id },
        data: { activo: false },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Máquina desactivada exitosamente',
        data: maquina,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Máquina no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  // ─── Estatus y control ──────────────────────────────────

  async updateEstatus(id: string, dto: UpdateEstatusMaquinaDto) {
    try {
      const updateData: Prisma.MaquinaUpdateInput = {
        estatus: dto.estatus as any,
        razonEstatus: dto.razon,
      };

      const maquina = await this.prisma.maquina.update({
        where: { id },
        data: updateData,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Estatus actualizado exitosamente',
        data: maquina,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Máquina no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  // ─── Mantenimiento ───────────────────────────────────────

  async addMantenimiento(maquinaId: string, dto: CreateMantenimientoDto) {
    const maquina = await this.prisma.maquina.findUnique({
      where: { id: maquinaId },
    });

    if (!maquina) {
      throw new NotFoundException({ message: 'Máquina no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    const mantenimiento = await this.prisma.mantenimiento.create({
      data: {
        maquinaId,
        tipo: dto.tipo,
        descripcion: dto.descripcion,
        costo: dto.costo,
        proveedor: dto.proveedor,
      },
    });

    // Cambiar estatus a EN_MANTENIMIENTO si es mantenimiento correctivo
    if (dto.tipo === 'CORRECTIVO') {
      await this.prisma.maquina.update({
        where: { id: maquinaId },
        data: { estatus: 'EN_MANTENIMIENTO' as any },
      });
    }

    // PREVENTIVO: actualizar último preventivo
    if (dto.tipo === 'PREVENTIVO' || dto.tipo?.toUpperCase() === 'PREVENTIVO') {
      await this.prisma.maquina.update({
        where: { id: maquinaId },
        data: { ultimoPreventivo: new Date() },
      });
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Mantenimiento registrado exitosamente',
      data: mantenimiento,
    };
  }

  async findMantenimientos(maquinaId: string) {
    const mantenimientos = await this.prisma.mantenimiento.findMany({
      where: { maquinaId },
      orderBy: { fecha: 'desc' },
    });

    return mantenimientos;
  }

  // ─── Estadísticas y capacidad ───────────────────────────

  async getCapacidadInstalada() {
    const [
      totalMaquinas,
      activas,
      enMantenimiento,
      fueraServicio,
      retiradas,
      porTipo,
    ] = await Promise.all([
      this.prisma.maquina.count(),
      this.prisma.maquina.count({ where: { estatus: 'ACTIVA' as any } }),
      this.prisma.maquina.count({ where: { estatus: 'EN_MANTENIMIENTO' as any } }),
      this.prisma.maquina.count({ where: { estatus: 'FUERA_SERVICIO' as any } }),
      this.prisma.maquina.count({ where: { estatus: 'RETIRADA' as any } }),
      this.prisma.maquina.groupBy({
        by: ['tipo'],
        _count: { id: true },
        orderBy: { tipo: 'asc' },
      }),
    ]);

    return {
      resumen: {
        total: totalMaquinas,
        activas,
        enMantenimiento,
        fueraServicio,
        retiradas,
        capacidadOperativa: totalMaquinas > 0 ? Math.round((activas / totalMaquinas) * 100) : 0,
      },
      porTipo: porTipo.map((t) => ({
        tipo: t.tipo,
        cantidad: t._count.id,
      })),
    };
  }

  async getOcupacionMaquinas(fechaInicio?: string, fechaFin?: string) {
    const where: Prisma.OperacionWhereInput = {
      estatus: { in: ['EN_PROCESO', 'PENDIENTE'] },
    };

    if (fechaInicio || fechaFin) {
      // Prefer scheduled window when filtering by dates
      where.OR = [
        {
          fechaInicioProgramada: {
            ...(fechaInicio ? { gte: new Date(fechaInicio) } : {}),
            ...(fechaFin ? { lte: new Date(fechaFin) } : {}),
          },
        },
        {
          AND: [
            { fechaInicioProgramada: null },
            {
              createdAt: {
                ...(fechaInicio ? { gte: new Date(fechaInicio) } : {}),
                ...(fechaFin ? { lte: new Date(fechaFin) } : {}),
              },
            },
          ],
        },
      ];
    }

    const operaciones = await this.prisma.operacion.findMany({
      where,
      include: {
        maquina: { select: { id: true, codigo: true, nombre: true, tipo: true, estatus: true } },
        wo: { select: { id: true, folio: true, estatus: true } },
        parte: { select: { id: true, numeroParte: true, piezaNombre: true } },
      },
      orderBy: [{ fechaInicioProgramada: 'asc' }, { createdAt: 'desc' }],
    });

    // Agrupar por máquina
    const porMaquina = operaciones.reduce((acc, op) => {
      if (!op.maquina) return acc;
      const id = op.maquina.id;
      if (!acc[id]) {
        acc[id] = {
          maquina: op.maquina,
          operacionesActivas: 0,
          partesEnProceso: 0,
          operaciones: [] as typeof operaciones,
        };
      }
      acc[id].operacionesActivas++;
      if (op.estatus === 'EN_PROCESO') {
        acc[id].partesEnProceso++;
      }
      acc[id].operaciones.push(op);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(porMaquina);
  }

  /**
   * Agenda semanal: operaciones con fechas programadas en la semana (lun–dom).
   */
  async getAgendaSemanal(inicioIso?: string) {
    const start = inicioIso ? new Date(inicioIso) : new Date();
    // Normalizar a lunes UTC local (server local)
    const day = start.getDay(); // 0=dom
    const diffToMon = day === 0 ? -6 : 1 - day;
    const lunes = new Date(start);
    lunes.setHours(0, 0, 0, 0);
    lunes.setDate(lunes.getDate() + diffToMon);
    const domingo = new Date(lunes);
    domingo.setDate(domingo.getDate() + 7);

    const operaciones = await this.prisma.operacion.findMany({
      where: {
        fechaInicioProgramada: { gte: lunes, lt: domingo },
        estatus: { not: 'RECHAZADA' as any },
      },
      include: {
        maquina: { select: { id: true, codigo: true, nombre: true, tipo: true } },
        wo: { select: { id: true, folio: true } },
        parte: { select: { id: true, numeroParte: true, piezaNombre: true } },
      },
      orderBy: { fechaInicioProgramada: 'asc' },
    });

    const dias: Array<{ fecha: string; operaciones: typeof operaciones }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dias.push({
        fecha: key,
        operaciones: operaciones.filter((op) => {
          const f = op.fechaInicioProgramada
            ? new Date(op.fechaInicioProgramada).toISOString().slice(0, 10)
            : '';
          return f === key;
        }),
      });
    }

    return {
      semanaInicio: lunes.toISOString(),
      semanaFin: domingo.toISOString(),
      dias,
      total: operaciones.length,
    };
  }

  /**
   * Gantt liviano: barras por máquina en rango (default semana actual).
   */
  async getGanttSemanal(desdeIso?: string, hastaIso?: string) {
    const start = desdeIso ? new Date(desdeIso) : new Date();
    const day = start.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const desde = desdeIso
      ? new Date(desdeIso)
      : (() => {
          const lunes = new Date(start);
          lunes.setHours(0, 0, 0, 0);
          lunes.setDate(lunes.getDate() + diffToMon);
          return lunes;
        })();
    const hasta = hastaIso
      ? new Date(hastaIso)
      : (() => {
          const d = new Date(desde);
          d.setDate(d.getDate() + 7);
          return d;
        })();

    const operaciones = await this.prisma.operacion.findMany({
      where: {
        maquinaId: { not: null },
        fechaInicioProgramada: { not: null, lt: hasta },
        OR: [
          { fechaFinProgramada: null },
          { fechaFinProgramada: { gt: desde } },
        ],
        estatus: { not: 'RECHAZADA' as any },
      },
      include: {
        maquina: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            tipo: true,
            tarifaHora: true,
          },
        },
        wo: { select: { id: true, folio: true } },
        parte: { select: { id: true, numeroParte: true, piezaNombre: true } },
      },
      orderBy: [{ maquinaId: 'asc' }, { fechaInicioProgramada: 'asc' }],
    });

    const porMaquina = new Map<string, { maquina: any; barras: any[] }>();
    for (const op of operaciones) {
      if (!op.maquinaId || !op.maquina) continue;
      const ini = op.fechaInicioProgramada!;
      const fin =
        op.fechaFinProgramada ||
        new Date(ini.getTime() + Number(op.tiempoEstimado || 1) * 3600 * 1000);
      if (!porMaquina.has(op.maquinaId)) {
        porMaquina.set(op.maquinaId, { maquina: op.maquina, barras: [] });
      }
      porMaquina.get(op.maquinaId)!.barras.push({
        id: op.id,
        proceso: op.proceso,
        estatus: op.estatus,
        inicio: ini.toISOString(),
        fin: fin.toISOString(),
        wo: op.wo,
        parte: op.parte,
      });
    }

    return {
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
      maquinas: [...porMaquina.values()],
      total: operaciones.length,
    };
  }

  /**
   * Detecta overlaps de programación en la misma máquina.
   */
  async getConflictosProgramacion(desdeIso?: string, hastaIso?: string) {
    const gantt = await this.getGanttSemanal(desdeIso, hastaIso);
    const conflictos: Array<{
      maquinaId: string;
      maquinaCodigo: string;
      a: { id: string; proceso: string; inicio: string; fin: string; folio?: string };
      b: { id: string; proceso: string; inicio: string; fin: string; folio?: string };
    }> = [];

    for (const row of gantt.maquinas) {
      const barras = [...row.barras].sort(
        (x, y) => new Date(x.inicio).getTime() - new Date(y.inicio).getTime(),
      );
      for (let i = 0; i < barras.length; i++) {
        for (let j = i + 1; j < barras.length; j++) {
          const a = barras[i];
          const b = barras[j];
          const aIni = new Date(a.inicio).getTime();
          const aFin = new Date(a.fin).getTime();
          const bIni = new Date(b.inicio).getTime();
          const bFin = new Date(b.fin).getTime();
          if (aIni < bFin && bIni < aFin) {
            conflictos.push({
              maquinaId: row.maquina.id,
              maquinaCodigo: row.maquina.codigo,
              a: {
                id: a.id,
                proceso: a.proceso,
                inicio: a.inicio,
                fin: a.fin,
                folio: a.wo?.folio,
              },
              b: {
                id: b.id,
                proceso: b.proceso,
                inicio: b.inicio,
                fin: b.fin,
                folio: b.wo?.folio,
              },
            });
          }
        }
      }
    }

    return { data: conflictos, total: conflictos.length };
  }

  async getPreventivosVencidos() {
    const maquinas = await this.prisma.maquina.findMany({
      where: {
        activo: true,
        intervaloDiasPreventivo: { not: null },
        estatus: { not: 'RETIRADA' as any },
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        tipo: true,
        estatus: true,
        intervaloDiasPreventivo: true,
        ultimoPreventivo: true,
      },
    });

    const now = Date.now();
    const vencidos = maquinas
      .map((m) => {
        const intervalo = m.intervaloDiasPreventivo || 0;
        const base = m.ultimoPreventivo
          ? new Date(m.ultimoPreventivo).getTime()
          : new Date(0).getTime();
        const nextDue = base + intervalo * 24 * 3600 * 1000;
        const diasVencido = Math.floor((now - nextDue) / (24 * 3600 * 1000));
        return {
          ...m,
          proximoPreventivo: new Date(nextDue).toISOString(),
          diasVencido,
          vencido: now >= nextDue,
        };
      })
      .filter((m) => m.vencido)
      .sort((a, b) => b.diasVencido - a.diasVencido);

    return { data: vencidos, total: vencidos.length };
  }

  async getHistorialOperaciones(maquinaId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [operaciones, total] = await Promise.all([
      this.prisma.operacion.findMany({
        where: { maquinaId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          operador: { select: { id: true, nombre: true, apellido: true } },
          wo: { select: { id: true, folio: true, estatus: true } },
          parte: { select: { id: true, numeroParte: true, piezaNombre: true } },
        },
      }),
      this.prisma.operacion.count({ where: { maquinaId } }),
    ]);

    return { data: operaciones, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
