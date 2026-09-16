import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClientDto } from './clientes.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateClientDto) {
    try {
      // Verificar que el código no exista
      const existing = await this.prisma.cliente.findUnique({
        where: { codigo: data.codigo },
      });

      if (existing) {
        throw new ConflictException({
          message: 'Ya existe un cliente con ese código',
          statusCode: HttpStatus.CONFLICT,
        });
      }

      const cliente = await this.prisma.cliente.create({
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
          creditoLimite: data.creditoLimite
            ? new Prisma.Decimal(data.creditoLimite)
            : null,
          diasCredito: data.diasCredito,
          monedaPref: (data.monedaPref as any) || 'MXN',
          notas: data.notas,
        },
        include: {
          cotizaciones: true,
          ordenesCompra: true,
        },
      });

      return cliente;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException({
            message: 'Ya existe un cliente con ese código o RFC',
            statusCode: HttpStatus.CONFLICT,
          });
        }
      }
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.ClienteWhereInput = search
      ? {
          OR: [
            { codigo: { contains: search, mode: 'insensitive' } },
            { razonSocial: { contains: search, mode: 'insensitive' } },
            { rfc: { contains: search, mode: 'insensitive' } },
            { ciudad: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [clientes, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { cotizaciones: true, ordenesCompra: true },
          },
        },
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return {
      data: clientes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        cotizaciones: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        ordenesCompra: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException({
        message: 'Cliente no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return cliente;
  }

  async update(id: string, data: Partial<CreateClientDto>) {
    try {
      const { monedaPref, ...rest } = data;
      const updateData: Prisma.ClienteUpdateInput = {
        ...rest,
      };
      if (monedaPref) {
        updateData.monedaPref = monedaPref as any;
      }

      const cliente = await this.prisma.cliente.update({
        where: { id },
        data: updateData,
        include: {
          cotizaciones: true,
          ordenesCompra: true,
        },
      });

      return cliente;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'Cliente no encontrado',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }
        if (error.code === 'P2002') {
          throw new ConflictException({
            message: 'Ya existe un cliente con ese código o RFC',
            statusCode: HttpStatus.CONFLICT,
          });
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Verificar si tiene cotizaciones u órdenes
      const cliente = await this.prisma.cliente.findUnique({
        where: { id },
        include: {
          _count: {
            select: { cotizaciones: true, ordenesCompra: true },
          },
        },
      });

      if (!cliente) {
        throw new NotFoundException({
          message: 'Cliente no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      if (cliente._count.cotizaciones > 0 || cliente._count.ordenesCompra > 0) {
        throw new BadRequestException({
          message: 'No se puede eliminar un cliente con cotizaciones u órdenes de compra asociadas',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      await this.prisma.cliente.delete({
        where: { id },
      });

      return { message: 'Cliente eliminado correctamente' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException({
            message: 'Cliente no encontrado',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }
      }
      throw error;
    }
  }
}
