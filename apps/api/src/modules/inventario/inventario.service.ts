import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateMovimientoDto,
} from './dto/create-material.dto';
import { StockSucursalService } from './stock-sucursal.service';

@Injectable()
export class InventarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockSvc: StockSucursalService,
  ) {}

  // ─── Material CRUD ─────────────────────────────────────────

  async create(data: CreateMaterialDto, sucursalId?: string) {
    const existing = await this.prisma.material.findUnique({
      where: { codigo: data.codigo },
    });

    if (existing) {
      throw new ConflictException({
        message: 'Ya existe un material con ese código',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const material = await this.prisma.material.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        unidad: data.unidad as any,
        stockActual: data.stockActual
          ? new Prisma.Decimal(data.stockActual)
          : new Prisma.Decimal(0),
        stockMinimo: data.stockMinimo
          ? new Prisma.Decimal(data.stockMinimo)
          : new Prisma.Decimal(0),
        precioUnitario: data.precioUnitario
          ? new Prisma.Decimal(data.precioUnitario)
          : null,
        ubicacion: data.ubicacion,
        notas: data.notas,
      },
    });

    // Seed stock rows for all sucursales; initial qty on given/principal
    const sucursales = await this.prisma.sucursal.findMany({ where: { activo: true } });
    const principal = sucursales.find((s) => s.esPrincipal) || sucursales[0];
    const targetId = sucursalId || principal?.id;
    for (const s of sucursales) {
      const qty =
        s.id === targetId && data.stockActual ? Number(data.stockActual) : 0;
      await this.prisma.stockSucursal.create({
        data: {
          materialId: material.id,
          sucursalId: s.id,
          stockActual: qty,
          stockMinimo: data.stockMinimo || 0,
        },
      });
    }
    if (targetId) {
      await this.stockSvc.syncMaterialAggregate(this.prisma, material.id);
    }
    return this.findOne(material.id, targetId);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sucursalId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.MaterialWhereInput = search
      ? {
          OR: [
            { codigo: { contains: search, mode: 'insensitive' } },
            { nombre: { contains: search, mode: 'insensitive' } },
            { descripcion: { contains: search, mode: 'insensitive' } },
            { categoria: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [materiales, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          stocks: sucursalId
            ? { where: { sucursalId } }
            : { include: { sucursal: { select: { id: true, codigo: true, nombre: true } } } },
        },
      }),
      this.prisma.material.count({ where }),
    ]);

    const data = materiales.map((m: any) => {
      if (sucursalId) {
        const st = m.stocks?.[0];
        return {
          ...m,
          stockActual: st ? Number(st.stockActual) : 0,
          stockMinimo: st ? Number(st.stockMinimo) : Number(m.stockMinimo),
          stockSucursalId: sucursalId,
          stockTotal: Number(m.stockActual),
        };
      }
      return m;
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        sucursalId: sucursalId || null,
      },
    };
  }

  async findOne(id: string, sucursalId?: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        stocks: {
          include: { sucursal: { select: { id: true, codigo: true, nombre: true } } },
        },
      },
    });

    if (!material) {
      throw new NotFoundException({
        message: 'Material no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (sucursalId) {
      const st = material.stocks.find((s) => s.sucursalId === sucursalId);
      return {
        ...material,
        stockActual: st ? Number(st.stockActual) : 0,
        stockMinimo: st ? Number(st.stockMinimo) : Number(material.stockMinimo),
        stockSucursalId: sucursalId,
      };
    }
    return material;
  }

  async update(id: string, data: UpdateMaterialDto) {
    try {
      const updateData: Prisma.MaterialUpdateInput = {};
      if (data.nombre !== undefined) updateData.nombre = data.nombre;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.categoria !== undefined) updateData.categoria = data.categoria;
      if (data.unidad !== undefined) updateData.unidad = data.unidad as any;
      if (data.stockMinimo !== undefined)
        updateData.stockMinimo = new Prisma.Decimal(data.stockMinimo);
      if (data.precioUnitario !== undefined)
        updateData.precioUnitario = new Prisma.Decimal(data.precioUnitario);
      if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion;
      if (data.notas !== undefined) updateData.notas = data.notas;
      if (data.activo !== undefined) updateData.activo = data.activo;

      return await this.prisma.material.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException({
          message: 'Material no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.material.delete({ where: { id } });
      return { message: 'Material eliminado correctamente' };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException({
          message: 'Material no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException({
          message: 'No se puede eliminar el material porque tiene registros asociados',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      throw error;
    }
  }

  // ─── Buscador de Materiales ─────────────────────────────

  async buscar(termino: string) {
    return this.prisma.material.findMany({
      where: {
        activo: true,
        OR: [
          { codigo: { contains: termino, mode: 'insensitive' } },
          { nombre: { contains: termino, mode: 'insensitive' } },
          { descripcion: { contains: termino, mode: 'insensitive' } },
          { categoria: { contains: termino, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { nombre: 'asc' },
    });
  }

  // ─── Movimientos de Stock ───────────────────────────────

  async movimientoStock(
    materialId: string,
    dto: CreateMovimientoDto & { sucursalId?: string },
    realizadoPorId: string,
    sucursalId: string,
  ) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      throw new NotFoundException({
        message: 'Material no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const sid = dto.sucursalId || sucursalId;
    if (!sid) {
      throw new BadRequestException('sucursalId es requerido para movimientos');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.tipo === 'AJUSTE') {
        const row = await this.stockSvc.ensureRow(tx, materialId, sid);
        const stockAnterior = Number(row.stockActual);
        const stockResultante = Number(dto.cantidad);
        await tx.stockSucursal.update({
          where: { id: row.id },
          data: { stockActual: stockResultante },
        });
        const movimiento = await tx.movimientoInventario.create({
          data: {
            materialId,
            sucursalId: sid,
            tipo: 'AJUSTE',
            cantidad: Math.abs(stockResultante - stockAnterior),
            stockAnterior,
            stockResultante,
            documentoRef: dto.documentoRef,
            notas: dto.notas,
            realizadoPorId,
          },
        });
        await this.stockSvc.syncMaterialAggregate(tx, materialId);
        const updated = await tx.material.findUnique({ where: { id: materialId } });
        return { movimiento, material: updated };
      }

      const tipo = dto.tipo as 'ENTRADA' | 'SALIDA';
      await this.stockSvc.adjust(tx, {
        materialId,
        sucursalId: sid,
        cantidad: Number(dto.cantidad),
        tipo,
        documentoRef: dto.documentoRef,
        notas: dto.notas,
        userId: realizadoPorId,
      });
      const movimiento = await tx.movimientoInventario.findFirst({
        where: { materialId, sucursalId: sid },
        orderBy: { createdAt: 'desc' },
      });
      const updated = await tx.material.findUnique({ where: { id: materialId } });
      return { movimiento, material: updated };
    });
  }

  async getMovimientos(
    materialId: string,
    page: number = 1,
    limit: number = 10,
    sucursalId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.MovimientoInventarioWhereInput = {
      materialId,
      ...(sucursalId ? { sucursalId } : {}),
    };

    const [movimientos, total] = await Promise.all([
      this.prisma.movimientoInventario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          realizadoPor: {
            select: { id: true, nombre: true, apellido: true, email: true },
          },
          sucursal: { select: { id: true, codigo: true, nombre: true } },
        },
      }),
      this.prisma.movimientoInventario.count({ where }),
    ]);

    return {
      data: movimientos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStockBajo(sucursalId?: string) {
    if (sucursalId) {
      const rows = await this.prisma.stockSucursal.findMany({
        where: { sucursalId, material: { activo: true } },
        include: {
          material: true,
          sucursal: { select: { id: true, codigo: true, nombre: true } },
        },
      });
      const data = rows
        .filter((r) => Number(r.stockActual) <= Number(r.stockMinimo))
        .map((r) => ({
          ...r.material,
          stockActual: Number(r.stockActual),
          stockMinimo: Number(r.stockMinimo),
          sucursal: r.sucursal,
        }));
      return { data };
    }

    const materiales = await this.prisma.$queryRaw<
      Array<{
        id: string;
        codigo: string;
        nombre: string;
        stockActual: Prisma.Decimal;
        stockMinimo: Prisma.Decimal;
      }>
    >`SELECT id, codigo, nombre, stock_actual AS "stockActual", stock_minimo AS "stockMinimo"
       FROM materiales
       WHERE activo = true AND stock_actual <= stock_minimo
       ORDER BY stock_actual ASC`;
    return { data: materiales };
  }
}
