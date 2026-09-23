import { Injectable, NotFoundException, HttpStatus, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrdenTrabajoDto, UpdateOrdenTrabajoDto, UpdateOperacionDto } from './dto/create-orden-trabajo.dto';
import { CreateOperacionDto } from './dto/create-operacion.dto';
import { CreateOrdenTrabajoFromQuoteDto } from './dto/create-orden-trabajo-from-quote.dto';
import { AsignarParteDto } from './dto/asignar-parte.dto';
import { UpdateEstatusParteDto } from './dto/update-estatus-parte.dto';
import { Prisma, EstatusParteOT } from '@prisma/client';
import { StockSucursalService } from '../inventario/stock-sucursal.service';

@Injectable()
export class ProduccionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockSvc: StockSucursalService,
  ) {}

  async createOrdenTrabajo(data: CreateOrdenTrabajoDto) {
    if (data.ordenCompraId) {
      const ordenCompra = await this.prisma.ordenCompra.findUnique({ where: { id: data.ordenCompraId } });
      if (!ordenCompra) {
        throw new NotFoundException({ message: 'Orden de compra no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
    }

    const folio = await this.generateFolio();

    const ordenTrabajo = await this.prisma.ordenTrabajo.create({
      data: {
        folio,
        po: data.ordenCompraId ? { connect: { id: data.ordenCompraId } } : undefined,
        piezaNombre: data.piezaNombre,
        piezaDescripcion: data.piezaDescripcion,
        cantidad: data.cantidad,
        unidad: data.unidad,
        prioridad: (data.prioridad as any) || 'MEDIA',
        notas: data.notas,
        estatus: 'PENDIENTE' as any,
        operaciones: data.operaciones
          ? {
              create: data.operaciones.map((op, idx) => ({
                proceso: op.proceso,
                secuencia: op.secuencia || idx + 1,
                maquinaId: op.maquinaId,
                operadorId: op.operadorId,
                tiempoEstimado: op.tiempoEstimado ? new Prisma.Decimal(op.tiempoEstimado) : null,
                notas: op.notas,
              })),
            }
          : undefined,
      },
      include: { po: true, operaciones: true },
    });

    return ordenTrabajo;
  }

  async convertirCotizacionAOrdenTrabajo(dto: CreateOrdenTrabajoFromQuoteDto) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id: dto.cotizacionId },
      include: { detalles: true, cliente: true },
    });

    if (!cotizacion) {
      throw new NotFoundException({ message: 'Cotización no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    if (cotizacion.estatus !== 'ACEPTADA') {
      throw new BadRequestException({
        message: 'Solo se pueden convertir cotizaciones con estatus ACEPTADA',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const folio = await this.generateOTFolio();

    const ot = await this.prisma.$transaction(async (tx) => {
      const created = await tx.ordenTrabajo.create({
        data: {
          folio,
          cotizacionId: dto.cotizacionId,
          sucursalId: cotizacion.sucursalId,
          responsableId: dto.responsableId,
          piezaNombre: cotizacion.detalles.length > 0 ? cotizacion.detalles[0].piezaNombre : null,
          cantidad: cotizacion.detalles.reduce((sum, d) => sum + d.cantidad, 0),
          unidad: cotizacion.detalles.length > 0 ? cotizacion.detalles[0].unidad : null,
          prioridad: 'MEDIA',
          estatus: 'PENDIENTE' as any,
          partes: {
            create: cotizacion.detalles.map((detalle, index) => ({
              numeroParte: detalle.numeroParte || `${cotizacion.folio}-P${String(index + 1).padStart(3, '0')}`,
              piezaNombre: detalle.piezaNombre,
              descripcion: detalle.piezaDescripcion,
              cantidad: detalle.cantidad,
              unidad: detalle.unidad,
              estatus: EstatusParteOT.PENDIENTE,
            })),
          },
        },
        include: {
          partes: true,
          cotizacion: { include: { cliente: true } },
          responsable: { select: { id: true, nombre: true, apellido: true } },
        },
      });

      // Operaciones desde procesoRequerido de cada detalle → parte
      let secuencia = 1;
      for (let i = 0; i < cotizacion.detalles.length; i++) {
        const detalle = cotizacion.detalles[i];
        const parte = created.partes[i];
        if (!detalle.procesoRequerido || !parte) continue;
        const procesos = detalle.procesoRequerido
          .split(/[,;/|]+/)
          .map((p) => p.trim())
          .filter(Boolean);
        for (const proceso of procesos) {
          await tx.operacion.create({
            data: {
              woId: created.id,
              parteId: parte.id,
              proceso,
              secuencia: secuencia++,
              estatus: 'PENDIENTE' as any,
              tiempoEstimado: detalle.tiempoEstimado,
            },
          });
        }
      }

      await tx.cotizacion.update({
        where: { id: dto.cotizacionId },
        data: { estatus: 'CONVERTIDA' },
      });

      return created;
    });

    const result = await this.prisma.ordenTrabajo.findUnique({
      where: { id: ot.id },
      include: {
        partes: true,
        operaciones: { orderBy: { secuencia: 'asc' } },
        cotizacion: { include: { cliente: true } },
        responsable: { select: { id: true, nombre: true, apellido: true } },
      },
    });
    if (!result) {
      throw new NotFoundException({
        message: 'OT creada pero no encontrada',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return result;
  }

  async asignarOperadorAParte(parteId: string, dto: AsignarParteDto) {
    try {
      return await this.prisma.parteOT.update({
        where: { id: parteId },
        data: {
          operadorId: dto.operadorId,
          maquinaId: dto.maquinaId,
          notas: dto.notas || undefined,
        },
        include: { operador: true, maquina: true, ot: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Parte no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async actualizarEstatusParte(parteId: string, dto: UpdateEstatusParteDto) {
    try {
      return await this.prisma.parteOT.update({
        where: { id: parteId },
        data: { estatus: dto.estatus as EstatusParteOT },
        include: { operador: true, maquina: true, ot: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Parte no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async asignarResponsableOT(otId: string, responsableId: string) {
    try {
      return await this.prisma.ordenTrabajo.update({
        where: { id: otId },
        data: { responsableId },
        include: {
          responsable: { select: { id: true, nombre: true, apellido: true } },
          cotizacion: { include: { cliente: true } },
          partes: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Orden de trabajo no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async findByCotizacionId(cotizacionId: string) {
    const ots = await this.prisma.ordenTrabajo.findMany({
      where: { cotizacionId },
      include: {
        responsable: { select: { id: true, nombre: true, apellido: true } },
        cotizacion: { include: { cliente: true } },
        _count: { select: { partes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ots;
  }

  async findPartesByOT(otId: string) {
    return this.prisma.parteOT.findMany({
      where: { otId },
      include: {
        operador: { select: { id: true, nombre: true, apellido: true } },
        maquina: { select: { id: true, codigo: true, nombre: true } },
        material: { select: { id: true, codigo: true, descripcion: true, stockActual: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findParteByNumeroParte(otId: string, numeroParte: string) {
    const parte = await this.prisma.parteOT.findFirst({
      where: { otId, numeroParte },
      include: {
        operador: { select: { id: true, nombre: true, apellido: true } },
        maquina: { select: { id: true, codigo: true, nombre: true } },
        material: { select: { id: true, codigo: true, descripcion: true, stockActual: true } },
        ot: { include: { cotizacion: { include: { cliente: true } } } },
      },
    });

    if (!parte) {
      throw new NotFoundException({ message: 'Parte no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    const operaciones = await this.prisma.operacion.findMany({
      where: { woId: otId, parteId: parte.id },
      include: {
        maquina: true,
        operador: { select: { id: true, nombre: true, apellido: true } },
        inspecciones: true,
      },
      orderBy: { secuencia: 'asc' },
    });

    const inspecciones = await this.prisma.controlCalidad.findMany({
      where: { woId: otId },
      include: {
        inspector: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    return { ...parte, operaciones, inspecciones };
  }

  async descontarMaterialesOT(otId: string, userId?: string) {
    const ot = await this.prisma.ordenTrabajo.findUnique({
      where: { id: otId },
      include: {
        partes: {
          include: { material: true },
        },
      },
    });

    if (!ot) {
      throw new Error('Orden de trabajo no encontrada');
    }

    let sid = ot.sucursalId;
    if (!sid) {
      const principal = await this.prisma.sucursal.findFirst({
        where: { esPrincipal: true },
      });
      sid = principal?.id || null;
    }
    if (!sid) {
      throw new BadRequestException('OT sin sucursal y no hay sucursal principal');
    }

    const resultados: Array<{
      parteId: string;
      materialId: string;
      cantidad: number;
      stockAnterior: number;
      stockNuevo: number;
    }> = [];

    await this.prisma.$transaction(async (tx) => {
      for (const parte of ot.partes) {
        if (!parte.materialId || !parte.material) continue;
        const cantidad = parte.cantidad;
        const adj = await this.stockSvc.adjust(tx, {
          materialId: parte.materialId,
          sucursalId: sid!,
          cantidad,
          tipo: 'SALIDA',
          documentoRef: ot.folio,
          notas: `Descuento automático OT ${ot.folio} / parte ${parte.numeroParte}`,
          userId,
        });
        resultados.push({
          parteId: parte.id,
          materialId: parte.materialId,
          cantidad,
          stockAnterior: adj.stockAnterior,
          stockNuevo: adj.stockResultante,
        });
      }
    });

    return {
      otId,
      otFolio: ot.folio,
      sucursalId: sid,
      materialesDescontados: resultados.length,
      detalle: resultados,
    };
  }

  async generarRetrabajo(otId: string, notas?: string) {
    const ot = await this.prisma.ordenTrabajo.findUnique({
      where: { id: otId },
      include: {
        cotizacion: { include: { cliente: true } },
        partes: true,
        operaciones: true,
      },
    });

    if (!ot) {
      throw new NotFoundException('Orden de trabajo no encontrada');
    }

    // Generar folio de retrabajo
    const lastOT = await this.prisma.ordenTrabajo.findFirst({
      where: { folio: { contains: 'OT-' } },
      orderBy: { createdAt: 'desc' },
      select: { folio: true },
    });

    const lastNumber = lastOT
      ? parseInt(lastOT.folio.replace('OT-', ''), 10)
      : 0;
    const folio = `OT-${String(lastNumber + 1).padStart(6, '0')}`;

    // Crear nueva OT de retrabajo
    const retrabajo = await this.prisma.ordenTrabajo.create({
      data: {
        folio,
        poId: ot.poId,
        piezaNombre: ot.piezaNombre,
        piezaDescripcion: ot.piezaDescripcion,
        cantidad: ot.cantidad,
        unidad: ot.unidad,
        estatus: 'PENDIENTE',
        prioridad: 'ALTA',
        notas: notas || `Retrabajo de ${ot.folio}`,
        creadoPor: ot.creadoPor,
        sucursalId: ot.sucursalId,
        cotizacionId: ot.cotizacionId,
        responsableId: ot.responsableId,
        retrabajoDeId: otId,
      },
      include: {
        cotizacion: { include: { cliente: true } },
      },
    });

    // Copiar partes de la OT original
    for (const parte of ot.partes) {
      await this.prisma.parteOT.create({
        data: {
          otId: retrabajo.id,
          numeroParte: parte.numeroParte,
          piezaNombre: parte.piezaNombre,
          descripcion: parte.descripcion,
          cantidad: parte.cantidad,
          unidad: parte.unidad,
          estatus: 'PENDIENTE',
          maquinaId: parte.maquinaId,
          materialId: parte.materialId,
          notas: `Retrabajo de ${parte.numeroParte}`,
        },
      });
    }

    // Copiar operaciones de la OT original
    for (const op of ot.operaciones) {
      await this.prisma.operacion.create({
        data: {
          woId: retrabajo.id,
          secuencia: op.secuencia,
          proceso: op.proceso,
          maquinaId: op.maquinaId,
          operadorId: op.operadorId,
          estatus: 'PENDIENTE',
          notas: `Retrabajo de ${op.proceso}`,
        },
      });
    }

    return {
      message: 'Retrabajo generado exitosamente',
      retrabajo: {
        id: retrabajo.id,
        folio: retrabajo.folio,
        estatus: retrabajo.estatus,
        partes: ot.partes.length,
        operaciones: ot.operaciones.length,
      },
    };
  }

  async findAllOrdenesTrabajo(
    page: number = 1,
    limit: number = 10,
    search?: string,
    estatus?: string,
    sucursalId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrdenTrabajoWhereInput = {
      ...(estatus ? { estatus: estatus as any } : {}),
      ...(sucursalId ? { sucursalId } : {}),
      ...(search
        ? {
            OR: [
              { folio: { contains: search, mode: 'insensitive' } },
              { piezaNombre: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [ordenes, total] = await Promise.all([
      this.prisma.ordenTrabajo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          po: { include: { proveedor: { select: { id: true, codigo: true, razonSocial: true } } } },
          _count: { select: { operaciones: true, inspecciones: true } },
        },
      }),
      this.prisma.ordenTrabajo.count({ where }),
    ]);

    return { data: ordenes, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneOrdenTrabajo(id: string) {
    // Buscar por UUID o por folio
    const orden = await this.prisma.ordenTrabajo.findFirst({
      where: {
        OR: [
          { id },
          { folio: id },
        ],
      },
      include: {
        po: { include: { proveedor: true } },
        operaciones: { include: { maquina: true, operador: true, inspecciones: true } },
        inspecciones: true,
        partes: true,
        bomItems: {
          include: {
            material: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                unidad: true,
                precioUnitario: true,
              },
            },
            parte: { select: { id: true, numeroParte: true, piezaNombre: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        cotizacion: { include: { cliente: true } },
        responsable: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    if (!orden) {
      throw new NotFoundException({ message: 'Orden de trabajo no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    return orden;
  }

  async updateOrdenTrabajo(id: string, data: UpdateOrdenTrabajoDto) {
    try {
      const updateData: Prisma.OrdenTrabajoUpdateInput = {};
      if (data.estatus) updateData.estatus = data.estatus as any;
      if (data.notas !== undefined) updateData.notas = data.notas;
      if (data.cantidad) updateData.cantidad = data.cantidad;
      if (data.prioridad) updateData.prioridad = data.prioridad as any;
      if (data.fechaInicio) updateData.fechaInicio = new Date(data.fechaInicio) as any;
      if (data.fechaFinEstimada) updateData.fechaFinEstimada = new Date(data.fechaFinEstimada) as any;

      return await this.prisma.ordenTrabajo.update({ where: { id }, data: updateData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Orden de trabajo no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async findAllOperaciones(page: number = 1, limit: number = 20, estatus?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.OperacionWhereInput = estatus ? { estatus: estatus as any } : {};
    const [operaciones, total] = await Promise.all([
      this.prisma.operacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wo: { include: { po: { include: { proveedor: { select: { razonSocial: true, codigo: true } } } } } },
          maquina: true,
          operador: { select: { id: true, nombre: true, apellido: true, username: true } },
        },
      }),
      this.prisma.operacion.count({ where }),
    ]);

    return { data: operaciones, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneOperacion(id: string) {
    const operacion = await this.prisma.operacion.findUnique({
      where: { id },
      include: { wo: { include: { po: { include: { proveedor: true } } } }, maquina: true, operador: true, inspecciones: true },
    });

    if (!operacion) {
      throw new NotFoundException({ message: 'Operación no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    return operacion;
  }

  async updateOperacion(id: string, data: UpdateOperacionDto) {
    try {
      const updateData: Prisma.OperacionUpdateInput = {};
      if (data.tiempoReal !== undefined) updateData.tiempoReal = new Prisma.Decimal(data.tiempoReal);
      if (data.estatus) updateData.estatus = data.estatus as any;
      if (data.notas !== undefined) updateData.notas = data.notas;
      if (data.fechaInicioProgramada !== undefined) {
        updateData.fechaInicioProgramada = data.fechaInicioProgramada
          ? new Date(data.fechaInicioProgramada)
          : null;
      }
      if (data.fechaFinProgramada !== undefined) {
        updateData.fechaFinProgramada = data.fechaFinProgramada
          ? new Date(data.fechaFinProgramada)
          : null;
      }
      if (data.maquinaId !== undefined) {
        updateData.maquina = data.maquinaId
          ? { connect: { id: data.maquinaId } }
          : { disconnect: true };
      }

      return await this.prisma.operacion.update({
        where: { id },
        data: updateData,
        include: {
          maquina: { select: { id: true, codigo: true, nombre: true } },
          wo: { select: { id: true, folio: true } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Operación no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async programarOperacion(
    id: string,
    data: {
      fechaInicioProgramada: string;
      fechaFinProgramada?: string;
      maquinaId?: string;
    },
  ) {
    if (!data.fechaInicioProgramada) {
      throw new BadRequestException('fechaInicioProgramada es requerida');
    }
    const inicio = new Date(data.fechaInicioProgramada);
    let fin = data.fechaFinProgramada ? new Date(data.fechaFinProgramada) : null;
    if (!fin) {
      const op = await this.prisma.operacion.findUnique({ where: { id } });
      const horas = Number(op?.tiempoEstimado || 1);
      fin = new Date(inicio.getTime() + Math.max(horas, 0.5) * 3600 * 1000);
    }
    return this.updateOperacion(id, {
      fechaInicioProgramada: inicio.toISOString(),
      fechaFinProgramada: fin.toISOString(),
      maquinaId: data.maquinaId,
    });
  }

  async addOperacion(parteId: string, dto: CreateOperacionDto) {
    const parte = await this.prisma.parteOT.findUnique({
      where: { id: parteId },
    });

    if (!parte) {
      throw new NotFoundException({ message: 'Parte no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    // Calcular secuencia automáticamente si no se proporciona
    let secuencia = dto.secuencia;
    if (!secuencia) {
      const lastOperacion = await this.prisma.operacion.findFirst({
        where: { woId: parte.otId },
        orderBy: { secuencia: 'desc' },
      });
      secuencia = lastOperacion ? lastOperacion.secuencia + 1 : 1;
    }

    const operacion = await this.prisma.operacion.create({
      data: {
        woId: parte.otId,
        parteId: parte.id,
        proceso: dto.proceso,
        maquinaId: dto.maquinaId,
        operadorId: dto.operadorId,
        tiempoEstimado: dto.tiempoEstimado ? new Prisma.Decimal(dto.tiempoEstimado) : null,
        notas: dto.notas,
        secuencia,
        estatus: 'PENDIENTE',
      },
      include: {
        maquina: true,
        operador: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    return operacion;
  }

  async findAllMaquinas() {
    return this.prisma.maquina.findMany({
      where: { activo: true },
      orderBy: { codigo: 'asc' },
    });
  }

  async findAllOperadores() {
    return this.prisma.usuario.findMany({
      where: { activo: true, role: { in: ['OPERADOR', 'PRODUCCION', 'ADMIN', 'GERENTE'] } },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        username: true,
        role: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  private async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `WO-${year}-`;
    const last = await this.prisma.ordenTrabajo.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
    });
    let sequence = 1;
    if (last) {
      const match = last.folio.match(/WO-\d+-(\d+)/);
      if (match) sequence = parseInt(match[1], 10) + 1;
    }
    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  private async generateOTFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `OT-${year}-`;
    const last = await this.prisma.ordenTrabajo.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
    });
    let sequence = 1;
    if (last) {
      const match = last.folio.match(/OT-\d+-(\d+)/);
      if (match) sequence = parseInt(match[1], 10) + 1;
    }
    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Costeo OT: materiales + MO + máquina + overhead % vs cotización.
   */
  async getCosteoOT(id: string, tarifaHora = 350, overheadPct = 0) {
    const ot = await this.findOneOrdenTrabajo(id);
    const materialIds = [
      ...new Set(
        (ot.partes || [])
          .map((p: any) => p.materialId)
          .filter(Boolean) as string[],
      ),
    ];

    const movimientos = await this.prisma.movimientoInventario.findMany({
      where: {
        tipo: 'SALIDA',
        OR: [
          { documentoRef: ot.folio },
          ...(materialIds.length
            ? [{ materialId: { in: materialIds } }]
            : []),
        ],
      },
      include: { material: { select: { id: true, codigo: true, nombre: true, precioUnitario: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Prefer movements linked to this OT folio
    const movsOt = movimientos.filter(
      (m) => m.documentoRef === ot.folio || m.documentoRef?.includes(ot.folio),
    );
    const usedMovs = movsOt.length ? movsOt : [];

    let costoMaterial = 0;
    const detalleMaterial = usedMovs.map((m) => {
      const precio = Number(m.material?.precioUnitario || 0);
      const cant = Number(m.cantidad);
      const importe = precio * cant;
      costoMaterial += importe;
      return {
        materialId: m.materialId,
        codigo: m.material?.codigo,
        cantidad: cant,
        precioUnitario: precio,
        importe,
      };
    });

    // Si no hay salidas kardex, estimar material desde BOM
    if (detalleMaterial.length === 0 && (ot as any).bomItems?.length) {
      for (const item of (ot as any).bomItems) {
        const precio = Number(item.material?.precioUnitario || 0);
        const cant = Number(item.cantidad);
        const importe = precio * cant;
        costoMaterial += importe;
        detalleMaterial.push({
          materialId: item.materialId,
          codigo: item.material?.codigo,
          cantidad: cant,
          precioUnitario: precio,
          importe,
        });
      }
    }

    const ops = ot.operaciones || [];
    let horasReal = 0;
    let horasEstimadas = 0;
    let costoMaquina = 0;
    const detalleMaquina: Array<{
      operacionId: string;
      proceso: string;
      maquinaCodigo?: string;
      horas: number;
      tarifaHora: number;
      importe: number;
    }> = [];

    for (const op of ops) {
      const hReal = Number((op as any).tiempoReal || 0);
      const hEst = Number((op as any).tiempoEstimado || 0);
      horasReal += hReal;
      horasEstimadas += hEst;
      const horasOp = hReal > 0 ? hReal : 0;
      const tarifaMaq = Number((op as any).maquina?.tarifaHora || 0);
      if (horasOp > 0 && tarifaMaq > 0) {
        const importe = horasOp * tarifaMaq;
        costoMaquina += importe;
        detalleMaquina.push({
          operacionId: op.id,
          proceso: (op as any).proceso,
          maquinaCodigo: (op as any).maquina?.codigo,
          horas: horasOp,
          tarifaHora: tarifaMaq,
          importe,
        });
      }
    }

    const costoManoObra = horasReal * tarifaHora;
    const costoEstimadoMo = horasEstimadas * tarifaHora;
    const subtotalDirecto = costoMaterial + costoManoObra + costoMaquina;
    const overhead = subtotalDirecto * (Math.max(0, overheadPct) / 100);
    const costoReal = subtotalDirecto + overhead;

    const cotizado = ot.cotizacion ? Number(ot.cotizacion.total) : null;
    const margen =
      cotizado != null ? cotizado - costoReal : null;
    const margenPct =
      cotizado && cotizado > 0 && margen != null
        ? (margen / cotizado) * 100
        : null;

    return {
      otId: ot.id,
      folio: ot.folio,
      tarifaHora,
      overheadPct,
      cotizado,
      costoMaterial,
      costoManoObra,
      costoMaquina,
      overhead,
      costoReal,
      costoEstimadoMo,
      horasReal,
      horasEstimadas,
      margen,
      margenPct,
      detalleMaterial,
      detalleMaquina,
      sinMovimientosMaterial:
        usedMovs.length === 0 && detalleMaterial.length === 0,
      materialDesdeBom:
        usedMovs.length === 0 && detalleMaterial.length > 0,
    };
  }

  // ─── BOM por OT (P3-A) ───────────────────────────────────

  async listBom(otId: string) {
    const ot = await this.findOneOrdenTrabajo(otId);
    return this.prisma.bomItem.findMany({
      where: { otId: ot.id },
      include: {
        material: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            unidad: true,
            precioUnitario: true,
          },
        },
        parte: { select: { id: true, numeroParte: true, piezaNombre: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addBomItem(
    otId: string,
    data: {
      materialId: string;
      cantidad: number;
      unidad?: string;
      parteId?: string;
      notas?: string;
    },
  ) {
    const ot = await this.findOneOrdenTrabajo(otId);
    const material = await this.prisma.material.findUnique({
      where: { id: data.materialId },
    });
    if (!material) {
      throw new NotFoundException({
        message: 'Material no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (data.parteId) {
      const parte = await this.prisma.parteOT.findFirst({
        where: { id: data.parteId, otId: ot.id },
      });
      if (!parte) {
        throw new BadRequestException({
          message: 'Parte no pertenece a esta OT',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    }
    return this.prisma.bomItem.create({
      data: {
        otId: ot.id,
        materialId: data.materialId,
        cantidad: data.cantidad,
        unidad: data.unidad || String(material.unidad || 'PZA'),
        parteId: data.parteId,
        notas: data.notas,
      },
      include: {
        material: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            unidad: true,
            precioUnitario: true,
          },
        },
      },
    });
  }

  async updateBomItem(
    otId: string,
    itemId: string,
    data: {
      materialId?: string;
      cantidad?: number;
      unidad?: string;
      parteId?: string | null;
      notas?: string | null;
    },
  ) {
    const ot = await this.findOneOrdenTrabajo(otId);
    const existing = await this.prisma.bomItem.findFirst({
      where: { id: itemId, otId: ot.id },
    });
    if (!existing) {
      throw new NotFoundException({
        message: 'Ítem BOM no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return this.prisma.bomItem.update({
      where: { id: itemId },
      data: {
        ...(data.materialId !== undefined ? { materialId: data.materialId } : {}),
        ...(data.cantidad !== undefined ? { cantidad: data.cantidad } : {}),
        ...(data.unidad !== undefined ? { unidad: data.unidad } : {}),
        ...(data.parteId !== undefined ? { parteId: data.parteId } : {}),
        ...(data.notas !== undefined ? { notas: data.notas } : {}),
      },
      include: {
        material: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            unidad: true,
            precioUnitario: true,
          },
        },
      },
    });
  }

  async deleteBomItem(otId: string, itemId: string) {
    const ot = await this.findOneOrdenTrabajo(otId);
    const existing = await this.prisma.bomItem.findFirst({
      where: { id: itemId, otId: ot.id },
    });
    if (!existing) {
      throw new NotFoundException({
        message: 'Ítem BOM no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    await this.prisma.bomItem.delete({ where: { id: itemId } });
    return { ok: true, id: itemId };
  }

  async replaceBom(
    otId: string,
    items: Array<{
      materialId: string;
      cantidad: number;
      unidad?: string;
      parteId?: string;
      notas?: string;
    }>,
  ) {
    const ot = await this.findOneOrdenTrabajo(otId);
    await this.prisma.$transaction(async (tx) => {
      await tx.bomItem.deleteMany({ where: { otId: ot.id } });
      if (items.length) {
        await tx.bomItem.createMany({
          data: items.map((i) => ({
            otId: ot.id,
            materialId: i.materialId,
            cantidad: i.cantidad,
            unidad: i.unidad || 'PZA',
            parteId: i.parteId,
            notas: i.notas,
          })),
        });
      }
    });
    return this.listBom(ot.id);
  }
}
