import { Injectable, NotFoundException, HttpStatus, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrdenTrabajoDto, UpdateOrdenTrabajoDto, UpdateOperacionDto } from './dto/create-orden-trabajo.dto';
import { CreateOrdenTrabajoFromQuoteDto } from './dto/create-orden-trabajo-from-quote.dto';
import { AsignarParteDto } from './dto/asignar-parte.dto';
import { UpdateEstatusParteDto } from './dto/update-estatus-parte.dto';
import { Prisma, EstatusParteOT } from '@prisma/client';

@Injectable()
export class ProduccionService {
  constructor(private readonly prisma: PrismaService) {}

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

    const ot = await this.prisma.ordenTrabajo.create({
      data: {
        folio,
        cotizacionId: dto.cotizacionId,
        responsableId: dto.responsableId,
        piezaNombre: cotizacion.detalles.length > 0 ? cotizacion.detalles[0].piezaNombre : null,
        cantidad: cotizacion.detalles.reduce((sum, d) => sum + d.cantidad, 0),
        unidad: cotizacion.detalles.length > 0 ? cotizacion.detalles[0].unidad : null,
        prioridad: 'MEDIA',
        estatus: 'PENDIENTE' as any,
        partes: {
          create: cotizacion.detalles.map((detalle, index) => ({
            numeroParte: `${cotizacion.folio}-P${String(index + 1).padStart(3, '0')}`,
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

    await this.prisma.cotizacion.update({
      where: { id: dto.cotizacionId },
      data: { estatus: 'CONVERTIDA' },
    });

    return ot;
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
    return this.prisma.ordenTrabajo.findMany({
      where: { cotizacionId },
      include: {
        responsable: { select: { id: true, nombre: true, apellido: true } },
        cotizacion: { include: { cliente: true } },
        _count: { select: { partes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
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

  async descontarMaterialesOT(otId: string) {
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

    const resultados: Array<{ parteId: string; materialId: string; cantidad: number; stockAnterior: number; stockNuevo: number }> = [];

    for (const parte of ot.partes) {
      if (!parte.materialId || !parte.material) continue;

      const material = parte.material;
      const cantidad = parte.cantidad;
      const stockAnterior = Number(material.stockActual);
      const stockNuevo = Math.max(0, stockAnterior - cantidad);

      await this.prisma.material.update({
        where: { id: material.id },
        data: { stockActual: stockNuevo },
      });

      resultados.push({
        parteId: parte.id,
        materialId: material.id,
        cantidad,
        stockAnterior,
        stockNuevo,
      });
    }

    return {
      otId,
      otFolio: ot.folio,
      materialesDescontados: resultados.length,
      detalle: resultados,
    };
  }

  async findAllOrdenesTrabajo(page: number = 1, limit: number = 10, search?: string, estatus?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrdenTrabajoWhereInput = {
      ...(estatus ? { estatus: estatus as any } : {}),
      ...(search
        ? {
            OR: [
              { folio: { contains: search, mode: 'insensitive' } },
              { piezaNombre: { contains: search, mode: 'insensitive' } },
              { po: { cliente: { razonSocial: { contains: search, mode: 'insensitive' } } } },
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
          po: { include: { cliente: { select: { id: true, codigo: true, razonSocial: true } } } },
          _count: { select: { operaciones: true, inspecciones: true } },
        },
      }),
      this.prisma.ordenTrabajo.count({ where }),
    ]);

    return { data: ordenes, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneOrdenTrabajo(id: string) {
    const orden = await this.prisma.ordenTrabajo.findUnique({
      where: { id },
      include: {
        po: { include: { cliente: true, cotizacion: true } },
        operaciones: { include: { maquina: true, operador: true, inspecciones: true } },
        inspecciones: true,
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
          wo: { include: { po: { include: { cliente: { select: { razonSocial: true, codigo: true } } } } } },
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
      include: { wo: { include: { po: { include: { cliente: true } } } }, maquina: true, operador: true, inspecciones: true },
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

      return await this.prisma.operacion.update({ where: { id }, data: updateData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Operación no encontrada', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
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
}
