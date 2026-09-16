import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto.dto';
import { CreateActividadLeadDto } from './dto/create-actividad-lead.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLeadDto, userId?: string) {
    try {
      const folio = await this.generateFolio();

      const lead = await this.prisma.lead.create({
        data: {
          folio,
          nombre: data.nombre,
          contactoNombre: data.contactoNombre,
          email: data.email,
          telefono: data.telefono,
          origen: (data.origen as any) || 'REFERENCIA',
          estatus: (data.estatus as any) || 'NUEVO',
          valorEstimado: data.valorEstimado
            ? new Prisma.Decimal(data.valorEstimado)
            : null,
          moneda: (data.moneda as any) || 'MXN',
          tipoCambio: data.tipoCambio
            ? new Prisma.Decimal(data.tipoCambio)
            : null,
          descripcion: data.descripcion,
          notas: data.notas,
          fechaSeguimiento: data.fechaSeguimiento
            ? new Date(data.fechaSeguimiento)
            : null,
          proximaAccion: data.proximaAccion
            ? new Date(data.proximaAccion)
            : null,
          ...(data.vendedorId && {
            vendedor: { connect: { id: data.vendedorId } },
          }),
          ...(data.clienteId && {
            cliente: { connect: { id: data.clienteId } },
          }),
          ...(data.intereses && data.intereses.length > 0 && {
            intereses: {
              create: data.intereses.map((i) => ({
                descripcion: i.descripcion,
                cantidad: i.cantidad,
                notas: i.notas,
              })),
            },
          }),
        },
        include: {
          vendedor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          cliente: {
            select: {
              id: true,
              codigo: true,
              razonSocial: true,
            },
          },
          intereses: true,
          _count: {
            select: { actividades: true },
          },
        },
      });

      return lead;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException({
            message: 'Ya existe un lead con ese folio',
            statusCode: HttpStatus.CONFLICT,
          });
        }
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = search
      ? {
          OR: [
            { folio: { contains: search, mode: 'insensitive' } },
            { nombre: { contains: search, mode: 'insensitive' } },
            { contactoNombre: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { telefono: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vendedor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          cliente: {
            select: {
              id: true,
              codigo: true,
              razonSocial: true,
              ciudad: true,
              estado: true,
            },
          },
          _count: {
            select: { actividades: true, intereses: true },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        vendedor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        cliente: true,
        actividades: {
          orderBy: { createdAt: 'desc' },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        intereses: true,
      },
    });

    if (!lead) {
      throw new NotFoundException({
        message: 'Lead no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return lead;
  }

  async update(id: string, data: UpdateLeadDto) {
    try {
      const existing = await this.prisma.lead.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException({
          message: 'Lead no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      let updateData: Prisma.LeadUpdateInput = {};
      if (data.nombre) updateData.nombre = data.nombre;
      if (data.contactoNombre !== undefined)
        updateData.contactoNombre = data.contactoNombre;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.telefono !== undefined) updateData.telefono = data.telefono;
      if (data.origen) updateData.origen = data.origen as any;
      if (data.estatus) updateData.estatus = data.estatus as any;
      if (data.valorEstimado !== undefined)
        updateData.valorEstimado = data.valorEstimado
          ? new Prisma.Decimal(data.valorEstimado)
          : null;
      if (data.moneda) updateData.moneda = data.moneda as any;
      if (data.tipoCambio !== undefined)
        updateData.tipoCambio = data.tipoCambio
          ? new Prisma.Decimal(data.tipoCambio)
          : null;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.notas !== undefined) updateData.notas = data.notas;
      if (data.fechaSeguimiento)
        updateData.fechaSeguimiento = new Date(data.fechaSeguimiento);
      if (data.proximaAccion)
        updateData.proximaAccion = new Date(data.proximaAccion);
      if (data.vendedorId)
        updateData.vendedor = { connect: { id: data.vendedorId } } as any;
      if (data.clienteId)
        updateData.cliente = { connect: { id: data.clienteId } } as any;

      // Handle intereses replacement
      if (data.intereses) {
        await this.prisma.interesLead.deleteMany({
          where: { leadId: id },
        });
        if (data.intereses.length > 0) {
          updateData.intereses = {
            create: data.intereses.map((i) => ({
              descripcion: i.descripcion,
              cantidad: i.cantidad,
              notas: i.notas,
            })),
          };
        }
      }

      const lead = await this.prisma.lead.update({
        where: { id },
        data: updateData,
        include: {
          vendedor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          cliente: {
            select: {
              id: true,
              codigo: true,
              razonSocial: true,
            },
          },
          intereses: true,
          _count: {
            select: { actividades: true },
          },
        },
      });

      return lead;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'Lead no encontrado',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const lead = await this.prisma.lead.findUnique({
        where: { id },
      });

      if (!lead) {
        throw new NotFoundException({
          message: 'Lead no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      await this.prisma.lead.delete({
        where: { id },
      });

      return { message: 'Lead eliminado correctamente' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'Lead no encontrado',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }
      }
      throw error;
    }
  }

  // ─── Actividades ─────────────────────────────────────────

  async addActividad(data: CreateActividadLeadDto, userId?: string) {
    try {
      const lead = await this.prisma.lead.findUnique({
        where: { id: data.leadId },
      });

      if (!lead) {
        throw new NotFoundException({
          message: 'Lead no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      const actividad = await this.prisma.actividadLead.create({
        data: {
          lead: { connect: { id: data.leadId } },
          tipo: (data.tipo as any) || 'NOTA',
          descripcion: data.descripcion,
          ...(userId && { usuario: { connect: { id: userId } } }),
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      return actividad;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'Lead no encontrado',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }
      }
      throw error;
    }
  }

  async getActividades(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException({
        message: 'Lead no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.prisma.actividadLead.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });
  }

  // ─── Estadísticas ────────────────────────────────────────

  async getStats() {
    const [total, porEstatus, porOrigen] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.groupBy({
        by: ['estatus'],
        _count: { estatus: true },
      }),
      this.prisma.lead.groupBy({
        by: ['origen'],
        _count: { origen: true },
      }),
    ]);

    const valorTotal = await this.prisma.lead.aggregate({
      where: { estatus: { not: 'PERDIDO' } },
      _sum: { valorEstimado: true },
    });

    return {
      total,
      porEstatus,
      porOrigen,
      valorTotalEstimado: valorTotal._sum.valorEstimado || 0,
    };
  }

  private async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CRM-${year}-`;

    const lastLead = await this.prisma.lead.findFirst({
      where: { folio: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (lastLead) {
      const match = lastLead.folio.match(/CRM-\d+-(\d+)/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
