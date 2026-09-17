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
