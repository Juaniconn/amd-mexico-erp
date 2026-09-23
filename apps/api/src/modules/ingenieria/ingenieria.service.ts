import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateIngenieriaProyectoDto, UpdateIngenieriaProyectoDto } from './dto/create-ingenieria-proyecto.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class IngenieriaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateIngenieriaProyectoDto, userId?: string) {
    try {
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: data.clienteId },
      });

      if (!cliente) {
        throw new NotFoundException({
          message: 'Cliente no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      const codigo = await this.generateCodigo();

      const proyecto = await this.prisma.ingenieriaProyecto.create({
        data: {
          codigo,
          clienteId: data.clienteId,
          sucursalId: data.sucursalId,
          nombre: data.nombre,
          descripcion: data.descripcion,
          status: 'PENDIENTE_PLANOS',
          fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
          fechaEstimada: data.fechaEstimada ? new Date(data.fechaEstimada) : null,
          creadoPor: userId,
          notas: data.notas,
        },
        include: {
          cliente: {
            select: {
              id: true,
              codigo: true,
              razonSocial: true,
              ciudad: true,
              estado: true,
            },
          },
          sucursal: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
          creador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          _count: {
            select: { procesos: true, planos: true },
          },
        },
      });

      return proyecto;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException({
            message: 'Ya existe un proyecto con ese código',
            statusCode: HttpStatus.CONFLICT,
          });
        }
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.IngenieriaProyectoWhereInput = search
      ? {
          OR: [
            { codigo: { contains: search, mode: 'insensitive' } },
            { nombre: { contains: search, mode: 'insensitive' } },
            { cliente: { razonSocial: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [proyectos, total] = await Promise.all([
      this.prisma.ingenieriaProyecto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          cliente: {
            select: {
              id: true,
              codigo: true,
              razonSocial: true,
              ciudad: true,
              estado: true,
            },
          },
          sucursal: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
          creador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          _count: {
            select: { procesos: true, planos: true },
          },
        },
      }),
      this.prisma.ingenieriaProyecto.count({ where }),
    ]);

    return {
      data: proyectos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const proyecto = await this.prisma.ingenieriaProyecto.findUnique({
      where: { id },
      include: {
        cliente: true,
        sucursal: true,
        creador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        procesos: {
          orderBy: { secuencia: 'asc' },
          include: {
            maquina: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                tipo: true,
              },
            },
            operador: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        planos: {
          orderBy: [{ parteNumero: 'asc' }, { version: 'desc' }],
          include: {
            uploadedByUser: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        cotizaciones: {
          select: {
            id: true,
            folio: true,
            estatus: true,
            total: true,
          },
        },
      },
    });

    if (!proyecto) {
      throw new NotFoundException({
        message: 'Proyecto de ingeniería no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return proyecto;
  }

  async update(id: string, data: UpdateIngenieriaProyectoDto) {
    try {
      const existing = await this.prisma.ingenieriaProyecto.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException({
          message: 'Proyecto de ingeniería no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      const proyecto = await this.prisma.ingenieriaProyecto.update({
        where: { id },
        data: {
          clienteId: data.clienteId,
          sucursalId: data.sucursalId,
          nombre: data.nombre,
          descripcion: data.descripcion,
          status: data.status as any,
          fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
          fechaEstimada: data.fechaEstimada ? new Date(data.fechaEstimada) : undefined,
          notas: data.notas,
        },
        include: {
          cliente: {
            select: {
              id: true,
              codigo: true,
              razonSocial: true,
            },
          },
          sucursal: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
          _count: {
            select: { procesos: true, planos: true },
          },
        },
      });

      return proyecto;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'Proyecto de ingeniería no encontrado',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }
      }
      throw error;
    }
  }

  async liberar(id: string) {
    const existing = await this.prisma.ingenieriaProyecto.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException({
        message: 'Proyecto de ingeniería no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (existing.status !== 'LISTO_COTIZAR' && existing.status !== 'COTIZADO') {
      throw new BadRequestException({
        message: 'Solo se pueden liberar proyectos en estatus LISTO_COTIZAR o COTIZADO',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const proyecto = await this.prisma.ingenieriaProyecto.update({
      where: { id },
      data: { status: 'LIBERADO' },
      include: {
        cliente: {
          select: {
            id: true,
            codigo: true,
            razonSocial: true,
          },
        },
        _count: {
          select: { procesos: true, planos: true },
        },
      },
    });

    return proyecto;
  }

  /**
   * Crea cotización borrador desde procesos/planos del proyecto.
   * Estatus proyecto → COTIZADO.
   */
  async crearCotizacionDesdeProyecto(id: string, userId?: string) {
    const proyecto = await this.prisma.ingenieriaProyecto.findUnique({
      where: { id },
      include: {
        procesos: { orderBy: { secuencia: 'asc' } },
        planos: { where: { estatus: 'ACTIVO' }, orderBy: { parteNumero: 'asc' } },
      },
    });

    if (!proyecto) {
      throw new NotFoundException({
        message: 'Proyecto de ingeniería no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (
      proyecto.status !== 'LISTO_COTIZAR' &&
      proyecto.status !== 'EN_DISENO' &&
      proyecto.status !== 'PENDIENTE_PLANOS'
    ) {
      throw new BadRequestException({
        message: `No se puede cotizar desde estatus ${proyecto.status}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Agrupar por parte: procesos suman costo; si no hay procesos, una línea por plano
    const partes = new Map<
      string,
      { nombre: string; costo: number; tiempo: number; proceso: string }
    >();

    for (const proc of proyecto.procesos) {
      const key = proc.parteNumero || 'GENERAL';
      const cur = partes.get(key) || {
        nombre: key,
        costo: 0,
        tiempo: 0,
        proceso: '',
      };
      cur.costo += Number(proc.costoEstimado || 0);
      cur.tiempo += Number(proc.tiempoEstimado || 0);
      cur.proceso = cur.proceso
        ? `${cur.proceso}; ${proc.proceso}`
        : proc.proceso;
      partes.set(key, cur);
    }

    if (partes.size === 0) {
      for (const plano of proyecto.planos) {
        const key = plano.parteNumero || 'GENERAL';
        if (!partes.has(key)) {
          partes.set(key, {
            nombre: key,
            costo: 0,
            tiempo: 0,
            proceso: 'Por cotizar',
          });
        }
      }
    }

    if (partes.size === 0) {
      partes.set('GENERAL', {
        nombre: proyecto.nombre,
        costo: 0,
        tiempo: 0,
        proceso: 'Ingeniería',
      });
    }

    const year = new Date().getFullYear();
    const prefix = `COT-${year}-`;
    const last = await this.prisma.cotizacion.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { folio: 'desc' },
    });
    let n = 1;
    if (last) {
      const partsFolio = last.folio.split('-');
      n = (parseInt(partsFolio[partsFolio.length - 1], 10) || 0) + 1;
    }
    const folio = `${prefix}${String(n).padStart(4, '0')}`;

    const detallesArr = Array.from(partes.entries()).map(([key, v]) => {
      const precio = v.costo > 0 ? v.costo : 0;
      return {
        numeroParte: key,
        piezaNombre: v.nombre,
        piezaDescripcion: `Desde ingeniería ${proyecto.codigo}`,
        cantidad: 1,
        unidad: 'PZA',
        precioUnitario: new Prisma.Decimal(precio),
        subtotal: new Prisma.Decimal(precio),
        tiempoEstimado: v.tiempo ? new Prisma.Decimal(v.tiempo) : null,
        procesoRequerido: v.proceso || null,
      };
    });

    const subtotal = detallesArr.reduce((s, d) => s + Number(d.precioUnitario), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const result = await this.prisma.$transaction(async (tx) => {
      const cotizacion = await tx.cotizacion.create({
        data: {
          folio,
          clienteId: proyecto.clienteId,
          sucursalId: proyecto.sucursalId,
          ingenieriaProyectoId: proyecto.id,
          creadoPor: userId,
          subtotal: new Prisma.Decimal(subtotal),
          iva: new Prisma.Decimal(iva),
          total: new Prisma.Decimal(total),
          estatus: 'BORRADOR',
          notas: `Generada desde proyecto ${proyecto.codigo}`,
          detalles: { create: detallesArr },
        },
        include: { detalles: true, cliente: true },
      });

      const updated = await tx.ingenieriaProyecto.update({
        where: { id },
        data: { status: 'COTIZADO' },
      });

      return { cotizacion, proyecto: updated };
    });

    return result;
  }

  async uploadPlano(
    proyectoId: string,
    parteNumero: string,
    archivoUrl: string,
    version: number = 1,
    userId?: string,
  ) {
    const proyecto = await this.prisma.ingenieriaProyecto.findUnique({
      where: { id: proyectoId },
    });

    if (!proyecto) {
      throw new NotFoundException({
        message: 'Proyecto de ingeniería no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const plano = await this.prisma.ingenieriaPlano.create({
      data: {
        proyectoId,
        parteNumero,
        version,
        archivoUrl,
        uploadedBy: userId,
        estatus: 'ACTIVO',
      },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return plano;
  }

  async getStats() {
    const [activos, enDiseno, listosCotizar, liberados] = await Promise.all([
      this.prisma.ingenieriaProyecto.count({
        where: {
          status: { in: ['PENDIENTE_PLANOS', 'EN_PRODUCCION'] },
        },
      }),
      this.prisma.ingenieriaProyecto.count({
        where: { status: 'EN_DISENO' },
      }),
      this.prisma.ingenieriaProyecto.count({
        where: { status: 'LISTO_COTIZAR' },
      }),
      this.prisma.ingenieriaProyecto.count({
        where: { status: 'LIBERADO' },
      }),
    ]);

    return {
      activos,
      enDiseno,
      listosCotizar,
      liberados,
    };
  }

  private async generateCodigo(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ING-${year}-`;

    const lastProyecto = await this.prisma.ingenieriaProyecto.findFirst({
      where: { codigo: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (lastProyecto) {
      const match = lastProyecto.codigo.match(/ING-\d+-(\d+)/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
