import { Test, TestingModule } from '@nestjs/testing';
import { ComprasService } from '../compras.service';
import { PrismaService } from '../../../database/prisma.service';
import { CreateOrdenCompraDto, CreateDetalleOrdenCompraDto } from '../dto/create-orden-compra.dto';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const PRISMA_CLIENT_VERSION = 'test';

describe('ComprasService', () => {
  let service: ComprasService;

  const mockPrismaService = {
    ordenCompra: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    proveedor: {
      findUnique: jest.fn(),
    },
    material: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    detalleOrdenCompra: {
      deleteMany: jest.fn(),
    },
    movimientoInventario: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComprasService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ComprasService>(ComprasService);

    jest.clearAllMocks();
  });

  describe('create()', () => {
    const validDto: CreateOrdenCompraDto = {
      proveedorId: '550e8400-e29b-41d4-a716-446655440001',
      condicionesPago: '30 días',
      notas: 'Orden de prueba',
      detalles: [
        {
          materialId: '550e8400-e29b-41d4-a716-446655440010',
          cantidad: 10,
          precioUnitario: 100.50,
          descripcion: 'Material principal',
        },
      ],
    };

    it('debe crear una orden de compra con detalles válidos', async () => {
      const mockProveedor = { id: '550e8400-e29b-41d4-a716-446655440001', nombre: 'Proveedor Test' };
      const mockMaterial = { id: '550e8400-e29b-41d4-a716-446655440010', nombre: 'Material 1', stockActual: 50 };
      const mockOrdenCreada = {
        id: '550e8400-e29b-41d4-a716-446655440099',
        folio: 'OC-2026-0001',
        proveedorId: '550e8400-e29b-41d4-a716-446655440001',
        condicionesPago: '30 días',
        notas: 'Orden de prueba',
        subtotal: 1005.00,
        impuestos: 160.80,
        total: 1165.80,
        estatus: 'BORRADOR',
        proveedor: mockProveedor,
        detalles: [{
          id: 'det-uuid-1',
          materialId: '550e8400-e29b-41d4-a716-446655440010',
          cantidad: 10,
          precioUnitario: 100.50,
          importe: 1005.00,
          material: mockMaterial,
        }],
      };

      mockPrismaService.ordenCompra.findFirst.mockResolvedValue(null);
      mockPrismaService.proveedor.findUnique.mockResolvedValue(mockProveedor as any);
      mockPrismaService.material.findUnique.mockResolvedValue(mockMaterial as any);
      mockPrismaService.ordenCompra.create.mockResolvedValue(mockOrdenCreada as any);

      const result = await service.create(validDto, 'user-uuid-1');

      expect(mockPrismaService.ordenCompra.findFirst).toHaveBeenCalledWith({
        where: {
          folio: {
            startsWith: 'OC-2026-',
          },
        },
        orderBy: {
          folio: 'desc',
        },
      });
      expect(mockPrismaService.proveedor.findUnique).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440001' },
      });
      expect(mockPrismaService.material.findUnique).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440010' },
      });
      expect(result).toEqual(mockOrdenCreada);
    });

    it('debe crear orden sin proveedor (proveedorId opcional)', async () => {
      const dtoSinProveedor: CreateOrdenCompraDto = {
        detalles: [
          {
            materialId: '550e8400-e29b-41d4-a716-446655440010',
            cantidad: 5,
            precioUnitario: 200,
          },
        ],
      };

      const mockMaterial = { id: '550e8400-e29b-41d4-a716-446655440010', stockActual: 50 };

      mockPrismaService.ordenCompra.findFirst.mockResolvedValue(null);
      mockPrismaService.material.findUnique.mockResolvedValue(mockMaterial as any);
      mockPrismaService.ordenCompra.create.mockResolvedValue({
        id: 'orden-uuid',
        folio: 'OC-2026-0001',
        estatus: 'BORRADOR',
      } as any);

      const result = await service.create(dtoSinProveedor);

      expect(mockPrismaService.proveedor.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.ordenCompra.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debe lanzar BadRequestException si el proveedor no existe', async () => {
      mockPrismaService.ordenCompra.findFirst.mockResolvedValue(null);
      mockPrismaService.proveedor.findUnique.mockResolvedValue(null);

      await expect(service.create(validDto)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el material no existe', async () => {
      const mockProveedor = { id: '550e8400-e29b-41d4-a716-446655440001' };

      mockPrismaService.ordenCompra.findFirst.mockResolvedValue(null);
      mockPrismaService.proveedor.findUnique.mockResolvedValue(mockProveedor as any);
      mockPrismaService.material.findUnique.mockResolvedValue(null);

      await expect(service.create(validDto)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar ConflictException si hay error de unicidad', async () => {
      const mockProveedor = { id: '550e8400-e29b-41d4-a716-446655440001' };
      const mockMaterial = { id: '550e8400-e29b-41d4-a716-446655440010', stockActual: 50 };

      mockPrismaService.ordenCompra.findFirst.mockResolvedValue(null);
      mockPrismaService.proveedor.findUnique.mockResolvedValue(mockProveedor as any);
      mockPrismaService.material.findUnique.mockResolvedValue(mockMaterial as any);

      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: PRISMA_CLIENT_VERSION,
      });
      mockPrismaService.ordenCompra.create.mockRejectedValue(prismaError);

      await expect(service.create(validDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('calcularTotales()', () => {
    it('debe calcular subtotal, impuestos y total correctamente', () => {
      const detalles: CreateDetalleOrdenCompraDto[] = [
        { materialId: 'mat-1', cantidad: 5, precioUnitario: 200 },
        { materialId: 'mat-2', cantidad: 3, precioUnitario: 150 },
      ];

      const result = service.calcularTotales(detalles);

      expect(result.subtotal).toBe(1450);
      expect(result.impuestos).toBeCloseTo(232);
      expect(result.total).toBeCloseTo(1682);
    });

    it('debe redondear a 2 decimales', () => {
      const detalles: CreateDetalleOrdenCompraDto[] = [
        { materialId: 'mat-1', cantidad: 3, precioUnitario: 33.333 },
      ];

      const result = service.calcularTotales(detalles);

      expect(result.subtotal).toBe(100);
    });

    it('debe retornar ceros para lista vacía', () => {
      const result = service.calcularTotales([]);

      expect(result.subtotal).toBe(0);
      expect(result.impuestos).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findAll()', () => {
    it('debe retornar lista paginada de órdenes de compra', async () => {
      const mockOrdenes = [
        {
          id: '1',
          folio: 'OC-2026-0001',
          proveedor: { id: 'p1', codigo: 'PROV001', razonSocial: 'Proveedor 1' },
          creador: { id: 'u1', nombre: 'Admin', apellido: 'User' },
          _count: { detalles: 2 },
        },
        {
          id: '2',
          folio: 'OC-2026-0002',
          proveedor: { id: 'p2', codigo: 'PROV002', razonSocial: 'Proveedor 2' },
          creador: { id: 'u1', nombre: 'Admin', apellido: 'User' },
          _count: { detalles: 1 },
        },
      ];

      mockPrismaService.ordenCompra.findMany.mockResolvedValue(mockOrdenes as any);
      mockPrismaService.ordenCompra.count.mockResolvedValue(2);

      const result = await service.findAll(1, 10);

      expect(mockPrismaService.ordenCompra.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(mockPrismaService.ordenCompra.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockOrdenes,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('debe aplicar filtros de búsqueda y estatus', async () => {
      mockPrismaService.ordenCompra.findMany.mockResolvedValue([]);
      mockPrismaService.ordenCompra.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'OC-2026', 'borrador');

      expect(mockPrismaService.ordenCompra.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                folio: expect.objectContaining({ contains: 'OC-2026' }),
              }),
            ]),
          }),
        }),
      );
    });

    it('debe manejar múltiples páginas correctamente', async () => {
      mockPrismaService.ordenCompra.findMany.mockResolvedValue([]);
      mockPrismaService.ordenCompra.count.mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(mockPrismaService.ordenCompra.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });
  });

  describe('findOne()', () => {
    it('debe retornar una orden de compra por ID', async () => {
      const mockOrden = {
        id: '1',
        folio: 'OC-2026-0001',
        proveedor: { id: 'p1', nombre: 'Proveedor 1' },
        creador: { id: 'u1', nombre: 'Admin', apellido: 'User', email: 'admin@test.com' },
        detalles: [
          {
            id: 'd1',
            materialId: 'm1',
            cantidad: 10,
            precioUnitario: 100,
            material: { id: 'm1', nombre: 'Material 1' },
          },
        ],
      };

      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(mockOrden as any);

      const result = await service.findOne('1');

      expect(mockPrismaService.ordenCompra.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.objectContaining({
          proveedor: true,
          creador: expect.any(Object),
          detalles: expect.any(Object),
        }),
      });
      expect(result).toEqual(mockOrden);
    });

    it('debe lanzar NotFoundException si la orden no existe', async () => {
      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('debe actualizar campos básicos de la orden', async () => {
      const updateData = { condicionesPago: '60 días', notas: 'Nota actualizada' };
      const existingOrden = { id: '1', estatus: 'BORRADOR' };
      const updatedOrden = {
        id: '1',
        folio: 'OC-2026-0001',
        condicionesPago: '60 días',
        notas: 'Nota actualizada',
        estatus: 'BORRADOR',
        proveedor: null,
        creador: null,
        detalles: [],
      };

      mockPrismaService.ordenCompra.findUnique
        .mockResolvedValueOnce(existingOrden as any)
        .mockResolvedValueOnce(updatedOrden as any);
      mockPrismaService.ordenCompra.update.mockResolvedValue(updatedOrden as any);

      const result = await service.update('1', updateData as any);

      expect(mockPrismaService.ordenCompra.update).toHaveBeenCalled();
      expect(result).toEqual(updatedOrden);
    });

    it('debe lanzar NotFoundException si la orden no existe', async () => {
      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(null);

      await expect(service.update('999', { notas: 'test' })).rejects.toThrow(NotFoundException);
    });

    it('debe eliminar detalles anteriores y crear nuevos cuando se proporcionan', async () => {
      const updateData = {
        detalles: [
          { materialId: 'mat-nuevo', cantidad: 5, precioUnitario: 100 },
        ],
      };
      const existingOrden = { id: '1', estatus: 'BORRADOR' };
      const mockMaterial = { id: 'mat-nuevo', stockActual: 20 };
      const updatedOrden = {
        id: '1',
        detalles: [{ id: 'det-nuevo', materialId: 'mat-nuevo' }],
      };

      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(existingOrden as any);
      mockPrismaService.material.findUnique.mockResolvedValue(mockMaterial as any);
      mockPrismaService.ordenCompra.update.mockResolvedValue(updatedOrden as any);

      await service.update('1', updateData as any);

      expect(mockPrismaService.detalleOrdenCompra.deleteMany).toHaveBeenCalledWith({
        where: { ordenCompraId: '1' },
      });
      expect(mockPrismaService.ordenCompra.update).toHaveBeenCalled();
    });
  });

  describe('cambiarEstatus()', () => {
    it('debe cambiar estatus de BORRADOR a ENVIADA', async () => {
      const mockOrden = {
        id: '1',
        folio: 'OC-2026-0001',
        estatus: 'BORRADOR',
        detalles: [],
      };

      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(mockOrden as any);
      mockPrismaService.ordenCompra.update.mockResolvedValue({
        ...mockOrden,
        estatus: 'ENVIADA',
      } as any);

      const result = await service.cambiarEstatus('1', 'ENVIADA' as any);

      expect(mockPrismaService.ordenCompra.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { estatus: 'ENVIADA' },
        }),
      );
      expect(result.estatus).toBe('ENVIADA');
    });

    it('debe lanzar NotFoundException si la orden no existe', async () => {
      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(null);

      await expect(
        service.cambiarEstatus('999', 'ENVIADA' as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException para transición inválida', async () => {
      const mockOrden = {
        id: '1',
        estatus: 'BORRADOR',
        detalles: [],
      };

      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(mockOrden as any);

      await expect(
        service.cambiarEstatus('1', 'RECIBIDA' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe actualizar stock cuando el estatus es RECIBIDA', async () => {
      const mockOrden = {
        id: '1',
        folio: 'OC-2026-0001',
        estatus: 'ENVIADA',
        detalles: [
          { id: 'd1', materialId: 'mat-1', cantidad: 10 },
        ],
      };
      const mockMaterial = { id: 'mat-1', stockActual: 50 };
      const mockUpdatedOrden = {
        id: '1',
        estatus: 'RECIBIDA',
        detalles: mockOrden.detalles,
      };

      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(mockOrden as any);
      mockPrismaService.material.findUnique.mockResolvedValue(mockMaterial as any);

      mockPrismaService.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          ordenCompra: {
            update: jest.fn().mockResolvedValue(mockUpdatedOrden),
          },
          material: {
            findUnique: jest.fn().mockResolvedValue(mockMaterial),
            update: jest.fn().mockResolvedValue({ ...mockMaterial, stockActual: 60 }),
          },
          movimientoInventario: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const result = await service.cambiarEstatus('1', 'RECIBIDA' as any, 'user-1');

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result.estatus).toBe('RECIBIDA');
    });
  });

  describe('remove()', () => {
    it('debe eliminar la orden de compra correctamente', async () => {
      const mockOrden = {
        id: '1',
        folio: 'OC-2026-0001',
        estatus: 'BORRADOR',
        _count: { detalles: 1 },
      };

      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(mockOrden as any);
      mockPrismaService.ordenCompra.delete.mockResolvedValue(mockOrden as any);

      const result = await service.remove('1');

      expect(mockPrismaService.ordenCompra.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({ message: 'Orden de compra eliminada correctamente' });
    });

    it('debe lanzar NotFoundException si la orden no existe', async () => {
      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ConflictException si la orden ya fue recibida', async () => {
      const mockOrden = {
        id: '1',
        folio: 'OC-2026-0001',
        estatus: 'RECIBIDA',
        _count: { detalles: 1 },
      };

      mockPrismaService.ordenCompra.findUnique.mockResolvedValue(mockOrden as any);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });
  });

  describe('findByProveedorId()', () => {
    it('debe retornar órdenes de compra por proveedor', async () => {
      const mockOrdenes = [
        {
          id: '1',
          folio: 'OC-2026-0001',
          proveedor: { id: 'p1', codigo: 'PROV001', razonSocial: 'Proveedor 1' },
          _count: { detalles: 2 },
        },
      ];

      mockPrismaService.ordenCompra.findMany.mockResolvedValue(mockOrdenes as any);
      mockPrismaService.ordenCompra.count.mockResolvedValue(1);

      const result = await service.findByProveedorId('p1', 1, 10);

      expect(mockPrismaService.ordenCompra.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { proveedorId: 'p1' },
        }),
      );
      expect(result).toEqual({
        data: mockOrdenes,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });
});
