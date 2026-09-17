import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateControlCalidadDto, UpdateControlCalidadDto } from './dto/create-control-calidad.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CalidadService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateControlCalidadDto) {
    const operacion = await this.prisma.operacion.findUnique({ where: { id: data.operacionId } });
    if (!operacion) {
      throw new NotFoundException({ message: 'Operación no encontrada', statusCode: HttpStatus.NOT_FOUND });
    }

    const createData: any = {
      operacion: { connect: { id: data.operacionId } },
      resultado: data.resultado,
      defectos: data.defectos,
      observaciones: data.observaciones,
    };

    if (data.ordenTrabajoId) {
      createData.wo = { connect: { id: data.ordenTrabajoId } };
    }

    return this.prisma.controlCalidad.create({
      data: createData,
      include: { operacion: true, wo: true },
    });
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, resultado?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      ...(resultado ? { resultado: resultado as any } : {}),
      ...(search
        ? {
            OR: [
              { operacion: { wo: { piezaNombre: { contains: search, mode: 'insensitive' } } } },
              { defectos: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.controlCalidad.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          operacion: { include: { maquina: true, wo: true } },
          inspector: { select: { id: true, nombre: true, apellido: true } },
        },
      }),
      this.prisma.controlCalidad.count({ where }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.controlCalidad.findUnique({
      where: { id },
      include: {
        operacion: { include: { maquina: true, wo: true } },
        inspector: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    if (!item) {
      throw new NotFoundException({ message: 'Registro de calidad no encontrado', statusCode: HttpStatus.NOT_FOUND });
    }

    return item;
  }

  async update(id: string, data: UpdateControlCalidadDto) {
    try {
      const updateData: any = {};
      if (data.resultado) updateData.resultado = data.resultado as any;
      if (data.defectos !== undefined) updateData.defectos = data.defectos;
      if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;

      return await this.prisma.controlCalidad.update({ where: { id }, data: updateData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Registro de calidad no encontrado', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.controlCalidad.delete({ where: { id } });
      return { message: 'Registro eliminado correctamente' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Registro de calidad no encontrado', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }
}
