import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProveedorDto, UpdateProveedorDto } from './dto/create-proveedor.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async generateCodigo(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PROV-${year}-`;

    const lastProveedor = await this.prisma.proveedor.findFirst({
      where: {
        codigo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        codigo: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastProveedor) {
      const parts = lastProveedor.codigo.split('-');
      const lastNumber = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  async create(data: CreateProveedorDto) {
    const existing = await this.prisma.proveedor.findUnique({
      where: { codigo: data.codigo },
    });

    if (existing) {
      throw new ConflictException({
        message: 'Ya existe un proveedor con ese código',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    return this.prisma.proveedor.create({
      data: {
        codigo: data.codigo,
        razonSocial: data.razonSocial,
        rfc: data.rfc,
        contacto: data.contacto,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        ciudad: data.ciudad,
        estado: data.estado,
        codigoPostal: data.codigoPostal,
        pais: data.pais || 'México',
        diasCredito: data.diasCredito,
        monedaPref: (data.monedaPref as any) || 'MXN',
        notas: data.notas,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProveedorWhereInput = search
      ? {
          OR: [
            { codigo: { contains: search, mode: 'insensitive' } },
            { razonSocial: { contains: search, mode: 'insensitive' } },
            { rfc: { contains: search, mode: 'insensitive' } },
            { ciudad: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [proveedores, total] = await Promise.all([
      this.prisma.proveedor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { ordenesCompra: true },
          },
        },
      }),
      this.prisma.proveedor.count({ where }),
    ]);

    return {
      data: proveedores,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id },
      include: {
        ordenesCompra: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!proveedor) {
      throw new NotFoundException({
        message: 'Proveedor no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return proveedor;
  }

  async update(id: string, data: UpdateProveedorDto) {
    try {
      const updateData: Prisma.ProveedorUpdateInput = {};
      if (data.razonSocial) updateData.razonSocial = data.razonSocial;
      if (data.rfc !== undefined) updateData.rfc = data.rfc;
      if (data.contacto !== undefined) updateData.contacto = data.contacto;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.telefono !== undefined) updateData.telefono = data.telefono;
      if (data.direccion !== undefined) updateData.direccion = data.direccion;
      if (data.ciudad !== undefined) updateData.ciudad = data.ciudad;
      if (data.estado !== undefined) updateData.estado = data.estado;
      if (data.codigoPostal !== undefined) updateData.codigoPostal = data.codigoPostal;
      if (data.pais !== undefined) updateData.pais = data.pais;
      if (data.diasCredito !== undefined) updateData.diasCredito = data.diasCredito;
      if (data.monedaPref) updateData.monedaPref = data.monedaPref as any;
      if (data.notas !== undefined) updateData.notas = data.notas;
      if (data.estatus) updateData.activo = data.estatus === 'activo';

      return await this.prisma.proveedor.update({ where: { id }, data: updateData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Proveedor no encontrado', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const proveedor = await this.prisma.proveedor.findUnique({
        where: { id },
        include: {
          _count: {
            select: { ordenesCompra: true },
          },
        },
      });

      if (!proveedor) {
        throw new NotFoundException({
          message: 'Proveedor no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      if (proveedor._count.ordenesCompra > 0) {
        throw new ConflictException({
          message: 'No se puede eliminar un proveedor con órdenes de compra asociadas',
          statusCode: HttpStatus.CONFLICT,
        });
      }

      await this.prisma.proveedor.delete({ where: { id } });
      return { message: 'Proveedor eliminado correctamente' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException({ message: 'Proveedor no encontrado', statusCode: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }
}
