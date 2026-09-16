import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/create-material.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMaterialDto) {
    const existing = await this.prisma.material.findUnique({
      where: { codigo: data.codigo },
    });

    if (existing) {
      throw new ConflictException({
        message: 'Ya existe un material con ese código',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    return this.prisma.material.create({
      data: {
        codigo: data.codigo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        unidad: data.unidad,
        stockMinimo: data.stockMinimo
          ? new Prisma.Decimal(data.stockMinimo)
          : new Prisma.Decimal(0),
        costoUnitario: data.costoUnitario
          ? new Prisma.Decimal(data.costoUnitario)
          : null,
        moneda: (data.moneda as any) || 'MXN',
        notas: data.notas,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.MaterialWhereInput = search
      ? {
          OR: [
            { codigo: { contains: search, mode: 'insensitive' } },
            { descripcion: { contains: search, mode: 'insensitive' } },
            { tipo: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [materiales, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.material.count({ where }),
    ]);

    return {
      data: materiales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const material = await this.prisma.material.findUnique({ where: { id } });

    if (!material) {
      throw new NotFoundException({
        message: 'Material no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return material;
  }

  async update(id: string, data: UpdateMaterialDto) {
    try {
      const updateData: Prisma.MaterialUpdateInput = {};
      if (data.descripcion) updateData.descripcion = data.descripcion;
      if (data.tipo) updateData.tipo = data.tipo;
      if (data.unidad) updateData.unidad = data.unidad;
      if (data.stockMinimo !== undefined)
        updateData.stockMinimo = new Prisma.Decimal(data.stockMinimo);
      if (data.costoUnitario !== undefined)
        updateData.costoUnitario = new Prisma.Decimal(data.costoUnitario);
      if (data.moneda) updateData.moneda = data.moneda as any;
      if (data.notas !== undefined) updateData.notas = data.notas;
      if (data.estatus) updateData.activo = data.estatus === 'activo';

      return await this.prisma.material.update({ where: { id }, data: updateData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Material no encontrado', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.material.delete({ where: { id } });
      return { message: 'Material eliminado correctamente' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Material no encontrado', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }
}
