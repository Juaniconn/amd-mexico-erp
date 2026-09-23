import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateOrdenCompraDto,
  UpdateOrdenCompraDto,
  CreateDetalleOrdenCompraDto,
} from './dto/create-orden-compra.dto';
import { Prisma, EstatusOrdenCompra, TipoMovimiento } from '@prisma/client';
import { StockSucursalService } from '../inventario/stock-sucursal.service';

const IMPUESTO_RATE = 0.16; // 16% IVA

@Injectable()
export class ComprasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockSvc: StockSucursalService,
  ) {}

  // ─── Folio Generation ─────────────────────────────────────

  async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `OC-${year}-`;

    const lastOrden = await this.prisma.ordenCompra.findFirst({
      where: {
        folio: {
          startsWith: prefix,
        },
      },
      orderBy: {
        folio: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastOrden) {
      const parts = lastOrden.folio.split('-');
      const lastNumber = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  // ─── Totales ──────────────────────────────────────────────

  calcularTotales(detalles: CreateDetalleOrdenCompraDto[]): {
    subtotal: number;
    impuestos: number;
    total: number;
  } {
    let subtotal = 0;
    for (const det of detalles) {
      subtotal += Number(det.cantidad) * Number(det.precioUnitario);
    }
    const impuestos = subtotal * IMPUESTO_RATE;
    const total = subtotal + impuestos;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      impuestos: Math.round(impuestos * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  // ─── CRUD ─────────────────────────────────────────────────

  async create(data: CreateOrdenCompraDto, userId?: string) {
    const folio = await this.generateFolio();

    // Validar proveedor
    if (data.proveedorId) {
      const proveedor = await this.prisma.proveedor.findUnique({
        where: { id: data.proveedorId },
      });
      if (!proveedor) {
        throw new BadRequestException({
          message: `Proveedor con ID ${data.proveedorId} no encontrado`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    }

    // Validar materiales
    for (const det of data.detalles) {
      const material = await this.prisma.material.findUnique({
        where: { id: det.materialId },
      });
      if (!material) {
        throw new BadRequestException({
          message: `Material con ID ${det.materialId} no encontrado`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    }

    // Calcular totales
    const totales = this.calcularTotales(data.detalles);

    // Preparar datos de detalles
    const detallesData = data.detalles.map((det) => ({
      materialId: det.materialId,
      descripcion: det.descripcion || '',
      cantidad: new Prisma.Decimal(det.cantidad),
      precioUnitario: new Prisma.Decimal(det.precioUnitario),
      importe: new Prisma.Decimal(
        Number(det.cantidad) * Number(det.precioUnitario),
      ),
    }));

    try {
      const ordenCompra = await this.prisma.ordenCompra.create({
        data: {
          folio,
          ...(data.proveedorId && {
            proveedor: { connect: { id: data.proveedorId } },
          }),
          ...(data.sucursalId && {
            sucursal: { connect: { id: data.sucursalId } },
          }),
          ...(userId && {
            creador: { connect: { id: userId } },
          }),
          ...(data.fecha && {
            fecha: new Date(data.fecha),
          }),
          ...(data.fechaEntrega && {
            fechaEntrega: new Date(data.fechaEntrega),
          }),
          ...(data.moneda && {
            moneda: data.moneda as any,
          }),
          ...(data.tipoCambio && {
            tipoCambio: new Prisma.Decimal(data.tipoCambio),
          }),
          condicionesPago: data.condicionesPago,
          notas: data.notas,
          subtotal: new Prisma.Decimal(totales.subtotal),
          impuestos: new Prisma.Decimal(totales.impuestos),
          total: new Prisma.Decimal(totales.total),
          detalles: {
            create: detallesData,
          },
        },
        include: {
          proveedor: true,
          creador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          detalles: {
            include: {
              material: true,
            },
          },
        },
      });

      return ordenCompra;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          message: 'Ya existe una orden de compra con ese folio',
          statusCode: HttpStatus.CONFLICT,
        });
      }
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    estatus?: string,
    sucursalId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.OrdenCompraWhereInput = {
      ...(search
        ? {
            OR: [
              { folio: { contains: search, mode: 'insensitive' } },
              {
                proveedor: {
                  razonSocial: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
      ...(estatus ? { estatus: estatus as EstatusOrdenCompra } : {}),
      ...(sucursalId ? { sucursalId } : {}),
    };

    const [ordenes, total] = await Promise.all([
      this.prisma.ordenCompra.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          proveedor: {
            select: {
              id: true,
              codigo: true,
              razonSocial: true,
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
            select: { detalles: true },
          },
        },
      }),
      this.prisma.ordenCompra.count({ where }),
    ]);

    return {
      data: ordenes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const ordenCompra = await this.prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        proveedor: true,
        sucursal: true,
        creador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        detalles: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!ordenCompra) {
      throw new NotFoundException({
        message: 'Orden de compra no encontrada',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return ordenCompra;
  }

  async update(id: string, data: UpdateOrdenCompraDto) {
    const existing = await this.prisma.ordenCompra.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException({
        message: 'Orden de compra no encontrada',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Validar proveedor si se proporciona
    if (data.proveedorId) {
      const proveedor = await this.prisma.proveedor.findUnique({
        where: { id: data.proveedorId },
      });
      if (!proveedor) {
        throw new BadRequestException({
          message: `Proveedor con ID ${data.proveedorId} no encontrado`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    }

    // Validar materiales si se proporcionan detalles
    if (data.detalles?.length) {
      for (const det of data.detalles) {
        const material = await this.prisma.material.findUnique({
          where: { id: det.materialId },
        });
        if (!material) {
          throw new BadRequestException({
            message: `Material con ID ${det.materialId} no encontrado`,
            statusCode: HttpStatus.BAD_REQUEST,
          });
        }
      }
    }

    const {
      proveedorId,
      sucursalId,
      fechaEntrega,
      moneda,
      tipoCambio,
      condicionesPago,
      notas,
      detalles,
    } = data;

    // Si hay nuevos detalles, eliminar anteriores y crear nuevos
    if (detalles?.length) {
      // Calcular totales con los nuevos detalles
      const totales = this.calcularTotales(detalles);

      await this.prisma.detalleOrdenCompra.deleteMany({
        where: { ordenCompraId: id },
      });

      await this.prisma.ordenCompra.update({
        where: { id },
        data: {
          ...(proveedorId && {
            proveedor: { connect: { id: proveedorId } },
          }),
          ...(sucursalId && {
            sucursal: { connect: { id: sucursalId } },
          }),
          ...(fechaEntrega && {
            fechaEntrega: new Date(fechaEntrega),
          }),
          ...(moneda && {
            moneda: moneda as any,
          }),
          ...(tipoCambio && {
            tipoCambio: new Prisma.Decimal(tipoCambio),
          }),
          ...(condicionesPago !== undefined && {
            condicionesPago,
          }),
          ...(notas !== undefined && {
            notas,
          }),
          subtotal: new Prisma.Decimal(totales.subtotal),
          impuestos: new Prisma.Decimal(totales.impuestos),
          total: new Prisma.Decimal(totales.total),
          detalles: {
            create: detalles.map((det) => ({
              materialId: det.materialId,
              descripcion: det.descripcion || '',
              cantidad: new Prisma.Decimal(det.cantidad),
              precioUnitario: new Prisma.Decimal(det.precioUnitario),
              importe: new Prisma.Decimal(
                Number(det.cantidad) * Number(det.precioUnitario),
              ),
            })),
          },
        },
        include: {
          proveedor: true,
          creador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          detalles: {
            include: {
              material: true,
            },
          },
        },
      });
    } else {
      // Sin detalles, solo actualizar campos básicos
      await this.prisma.ordenCompra.update({
        where: { id },
        data: {
          ...(proveedorId && {
            proveedor: { connect: { id: proveedorId } },
          }),
          ...(sucursalId && {
            sucursal: { connect: { id: sucursalId } },
          }),
          ...(fechaEntrega && {
            fechaEntrega: new Date(fechaEntrega),
          }),
          ...(moneda && {
            moneda: moneda as any,
          }),
          ...(tipoCambio && {
            tipoCambio: new Prisma.Decimal(tipoCambio),
          }),
          ...(condicionesPago !== undefined && {
            condicionesPago,
          }),
          ...(notas !== undefined && {
            notas,
          }),
        },
      });
    }

    return this.findOne(id);
  }

  async cambiarEstatus(
    id: string,
    nuevoEstatus: EstatusOrdenCompra,
    userId?: string,
  ) {
    const ordenCompra = await this.prisma.ordenCompra.findUnique({
      where: { id },
      include: { detalles: true },
    });

    if (!ordenCompra) {
      throw new NotFoundException({
        message: 'Orden de compra no encontrada',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Validar transición de estatus
    const transicionesValidas: Record<EstatusOrdenCompra, EstatusOrdenCompra[]> = {
      [EstatusOrdenCompra.BORRADOR]: [
        EstatusOrdenCompra.PENDIENTE,
        EstatusOrdenCompra.ENVIADA,
        EstatusOrdenCompra.CANCELADA,
      ],
      [EstatusOrdenCompra.PENDIENTE]: [
        EstatusOrdenCompra.APROBADA,
        EstatusOrdenCompra.CANCELADA,
      ],
      [EstatusOrdenCompra.APROBADA]: [
        EstatusOrdenCompra.EN_PRODUCCION,
        EstatusOrdenCompra.CANCELADA,
      ],
      [EstatusOrdenCompra.EN_PRODUCCION]: [
        EstatusOrdenCompra.COMPLETADA,
        EstatusOrdenCompra.CANCELADA,
      ],
      [EstatusOrdenCompra.COMPLETADA]: [],
      [EstatusOrdenCompra.ENVIADA]: [
        EstatusOrdenCompra.RECIBIDA,
        EstatusOrdenCompra.CANCELADA,
      ],
      [EstatusOrdenCompra.RECIBIDA]: [],
      [EstatusOrdenCompra.CANCELADA]: [],
    };

    if (
      ordenCompra.estatus === nuevoEstatus ||
      !transicionesValidas[ordenCompra.estatus].includes(nuevoEstatus)
    ) {
      throw new BadRequestException({
        message: `No se puede cambiar de ${ordenCompra.estatus} a ${nuevoEstatus}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Si el nuevo estatus es RECIBIDA, actualizar stock de materiales
    if (nuevoEstatus === EstatusOrdenCompra.RECIBIDA) {
      return this.prisma.$transaction(async (tx) => {
        // Actualizar estatus de la orden
        const updated = await tx.ordenCompra.update({
          where: { id },
          data: { estatus: nuevoEstatus },
          include: {
            proveedor: true,
            creador: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
            detalles: {
              include: {
                material: true,
              },
            },
          },
        });

        // Crear movimientos de inventario (ENTRADA) por sucursal de la OC
        const sid =
          ordenCompra.sucursalId ||
          (
            await tx.sucursal.findFirst({ where: { esPrincipal: true } })
          )?.id;
        if (!sid) {
          throw new BadRequestException('OC sin sucursal y no hay sucursal principal');
        }

        for (const det of ordenCompra.detalles) {
          await this.stockSvc.adjust(tx, {
            materialId: det.materialId,
            sucursalId: sid,
            cantidad: Number(det.cantidad),
            tipo: 'ENTRADA',
            documentoRef: ordenCompra.folio,
            notas: `Entrada por OC ${ordenCompra.folio}`,
            userId,
          });
        }

        return updated;
      });
    }

    // Para otros cambios de estatus, solo actualizar
    return this.prisma.ordenCompra.update({
      where: { id },
      data: { estatus: nuevoEstatus },
      include: {
        proveedor: true,
        creador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        detalles: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  async findByProveedorId(
    proveedorId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.OrdenCompraWhereInput = {
      proveedorId,
    };

    const [ordenes, total] = await Promise.all([
      this.prisma.ordenCompra.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          proveedor: {
            select: {
              id: true,
              codigo: true,
              razonSocial: true,
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
            select: { detalles: true },
          },
        },
      }),
      this.prisma.ordenCompra.count({ where }),
    ]);

    return {
      data: ordenes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(id: string) {
    try {
      const ordenCompra = await this.prisma.ordenCompra.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              detalles: true,
            },
          },
        },
      });

      if (!ordenCompra) {
        throw new NotFoundException({
          message: 'Orden de compra no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      // No permitir eliminar si está RECIBIDA (ya afectó stock)
      if (ordenCompra.estatus === EstatusOrdenCompra.RECIBIDA) {
        throw new ConflictException({
          message:
            'No se puede eliminar una orden de compra que ya fue recibida',
          statusCode: HttpStatus.CONFLICT,
        });
      }

      await this.prisma.ordenCompra.delete({ where: { id } });
      return { message: 'Orden de compra eliminada correctamente' };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException({
          message: 'Orden de compra no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * MRP-lite: stock bajo por sucursal → OC BORRADOR.
   * qty sugerida = max(0, stockMinimo - stockActual). Precio = Material.precioUnitario || 0.
   */
  async crearDesdeReorden(
    sucursalId: string,
    userId?: string,
    proveedorId?: string,
  ) {
    const rows = await this.prisma.stockSucursal.findMany({
      where: { sucursalId, material: { activo: true } },
      include: { material: true },
    });

    const bajos = rows
      .map((r) => {
        const actual = Number(r.stockActual);
        const minimo = Number(r.stockMinimo);
        const qty = Math.max(0, minimo - actual);
        return { row: r, qty };
      })
      .filter((x) => x.qty > 0);

    if (bajos.length === 0) {
      throw new BadRequestException({
        message: 'No hay materiales bajo mínimo en esta sucursal',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const detalles = bajos.map(({ row, qty }) => ({
      materialId: row.materialId,
      descripcion: row.material.nombre || row.material.codigo,
      cantidad: qty,
      precioUnitario: Number(row.material.precioUnitario || 0),
    }));

    return this.create(
      {
        sucursalId,
        proveedorId,
        notas: `OC auto desde reorden / stock bajo (sucursal ${sucursalId})`,
        detalles,
      } as any,
      userId,
    );
  }

  /**
   * MRP 1 nivel: BOM de OT − StockSucursal → OC BORRADOR con faltantes.
   */
  async crearDesdeBomOt(
    otId: string,
    sucursalId?: string,
    userId?: string,
    proveedorId?: string,
  ) {
    const ot = await this.prisma.ordenTrabajo.findFirst({
      where: { OR: [{ id: otId }, { folio: otId }] },
      include: {
        bomItems: { include: { material: true } },
      },
    });
    if (!ot) {
      throw new NotFoundException({
        message: 'Orden de trabajo no encontrada',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (!ot.bomItems?.length) {
      throw new BadRequestException({
        message: 'La OT no tiene BOM; agrega materiales primero',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    let sid = sucursalId || ot.sucursalId || undefined;
    if (!sid) {
      sid = (await this.getSucursalPrincipalId()) || undefined;
    }
    if (!sid) {
      throw new BadRequestException({
        message: 'No se pudo resolver sucursal para MRP',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Agregar cantidades por materialId
    const need = new Map<
      string,
      { material: (typeof ot.bomItems)[0]['material']; qty: number }
    >();
    for (const item of ot.bomItems) {
      const prev = need.get(item.materialId);
      const qty = Number(item.cantidad);
      if (prev) prev.qty += qty;
      else need.set(item.materialId, { material: item.material, qty });
    }

    const materialIds = [...need.keys()];
    const stocks = await this.prisma.stockSucursal.findMany({
      where: { sucursalId: sid, materialId: { in: materialIds } },
    });
    const stockMap = new Map(
      stocks.map((s) => [s.materialId, Number(s.stockActual)]),
    );

    const faltantes: Array<{
      materialId: string;
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      requerido: number;
      disponible: number;
    }> = [];

    for (const [materialId, { material, qty }] of need) {
      const disponible = stockMap.get(materialId) ?? 0;
      const faltante = Math.max(0, qty - disponible);
      if (faltante > 0) {
        faltantes.push({
          materialId,
          descripcion: material.nombre || material.codigo,
          cantidad: faltante,
          precioUnitario: Number(material.precioUnitario || 0),
          requerido: qty,
          disponible,
        });
      }
    }

    if (faltantes.length === 0) {
      throw new BadRequestException({
        message: 'Stock suficiente para el BOM; no se genera OC',
        statusCode: HttpStatus.BAD_REQUEST,
        detalle: [...need.entries()].map(([materialId, v]) => ({
          materialId,
          requerido: v.qty,
          disponible: stockMap.get(materialId) ?? 0,
        })),
      } as any);
    }

    const orden = await this.create(
      {
        sucursalId: sid,
        proveedorId,
        notas: `OC MRP desde BOM OT ${ot.folio}`,
        detalles: faltantes.map((f) => ({
          materialId: f.materialId,
          descripcion: f.descripcion,
          cantidad: f.cantidad,
          precioUnitario: f.precioUnitario,
        })),
      } as any,
      userId,
    );

    return {
      ...orden,
      mrp: {
        otId: ot.id,
        folio: ot.folio,
        sucursalId: sid,
        faltantes,
      },
    };
  }

  async getSucursalPrincipalId(): Promise<string | null> {
    const s = await this.prisma.sucursal.findFirst({
      where: { activo: true, esPrincipal: true },
      select: { id: true },
    });
    return s?.id || null;
  }
}
