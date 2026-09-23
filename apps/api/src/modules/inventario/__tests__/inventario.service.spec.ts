import { Test, TestingModule } from '@nestjs/testing';
import { InventarioService } from '../inventario.service';
import { PrismaService } from '../../../database/prisma.service';
import { StockSucursalService } from '../stock-sucursal.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const SUCURSAL_PRINCIPAL = {
  id: 'suc-principal',
  codigo: 'CJZ',
  nombre: 'Ciudad Juárez',
  esPrincipal: true,
  activo: true,
};

const mockStockSucursalService = {
  syncMaterialAggregate: jest.fn().mockResolvedValue(0),
  ensureRow: jest.fn(),
  adjust: jest.fn(),
  getStock: jest.fn(),
};

// Mock PrismaService
const mockPrismaService = {
  material: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  sucursal: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  stockSucursal: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
};

describe('InventarioService', () => {
  let service: InventarioService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventarioService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StockSucursalService,
          useValue: mockStockSucursalService,
        },
      ],
    }).compile();

    service = module.get<InventarioService>(InventarioService);
    prisma = module.get(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('debe crear un material con datos válidos', async () => {
      const dto: CreateMaterialDto = {
        codigo: 'MAT-001',
        nombre: 'Tornillo de acero',
        stockActual: 12,
        stockMinimo: 2,
      };

      const created = {
        id: '1',
        codigo: dto.codigo,
        nombre: dto.nombre,
      };
      const stored = {
        ...created,
        stockMinimo: 2,
        stocks: [
          {
            sucursalId: SUCURSAL_PRINCIPAL.id,
            stockActual: 12,
            stockMinimo: 2,
          },
        ],
      };

      prisma.material.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(stored as any);
      prisma.material.create.mockResolvedValue(created as any);
      prisma.sucursal.findMany.mockResolvedValue([SUCURSAL_PRINCIPAL] as any);
      prisma.stockSucursal.create.mockResolvedValue({} as any);

      const result = await service.create(dto);

      expect(prisma.material.findUnique).toHaveBeenCalledWith({
        where: { codigo: dto.codigo },
      });
      expect(prisma.material.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          codigo: dto.codigo,
          nombre: dto.nombre,
        }),
      });
      expect(prisma.sucursal.findMany).toHaveBeenCalledWith({
        where: { activo: true },
      });
      expect(prisma.stockSucursal.create).toHaveBeenCalledWith({
        data: {
          materialId: '1',
          sucursalId: SUCURSAL_PRINCIPAL.id,
          stockActual: 12,
          stockMinimo: 2,
        },
      });
      expect(mockStockSucursalService.syncMaterialAggregate).toHaveBeenCalledWith(
        prisma,
        '1',
      );
      expect(result).toEqual({
        ...stored,
        stockActual: 12,
        stockMinimo: 2,
        stockSucursalId: SUCURSAL_PRINCIPAL.id,
      });
    });

    it('debe lanzar ConflictException si el código ya existe', async () => {
      const dto: CreateMaterialDto = {
        codigo: 'MAT-001',
        nombre: 'Tornillo de acero',
      };

      const existingMaterial = { id: '1', codigo: 'MAT-001' };
      prisma.material.findUnique.mockResolvedValue(existingMaterial as any);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll()', () => {
    it('debe retornar lista paginada de materiales', async () => {
      const materiales = [
        { id: '1', codigo: 'MAT-001', nombre: 'Material 1' },
        { id: '2', codigo: 'MAT-002', nombre: 'Material 2' },
      ];

      prisma.material.findMany.mockResolvedValue(materiales as any);
      prisma.material.count.mockResolvedValue(2);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: materiales,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          sucursalId: null,
        },
      });
      expect(prisma.material.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          include: {
            stocks: {
              include: {
                sucursal: {
                  select: { id: true, codigo: true, nombre: true },
                },
              },
            },
          },
        }),
      );
    });

    it('debe proyectar stock de la sucursal cuando se filtra', async () => {
      const materiales = [
        {
          id: '1',
          codigo: 'MAT-001',
          nombre: 'Material 1',
          stockActual: 99,
          stockMinimo: 1,
          stocks: [{ sucursalId: 'suc-2', stockActual: 4, stockMinimo: 3 }],
        },
      ];

      prisma.material.findMany.mockResolvedValue(materiales as any);
      prisma.material.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, undefined, 'suc-2');

      expect(prisma.material.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { stocks: { where: { sucursalId: 'suc-2' } } },
        }),
      );
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          stockActual: 4,
          stockMinimo: 3,
          stockSucursalId: 'suc-2',
          stockTotal: 99,
        }),
      );
      expect(result.meta.sucursalId).toBe('suc-2');
    });

    it('debe aplicar filtro de búsqueda cuando se proporciona', async () => {
      prisma.material.findMany.mockResolvedValue([]);
      prisma.material.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'tornillo');

      expect(prisma.material.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                codigo: expect.objectContaining({ contains: 'tornillo' }),
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne()', () => {
    it('debe retornar un material por ID', async () => {
      const material = {
        id: '1',
        codigo: 'MAT-001',
        nombre: 'Tornillo',
      };

      prisma.material.findUnique.mockResolvedValue(material as any);

      const result = await service.findOne('1');

      expect(prisma.material.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          stocks: {
            include: {
              sucursal: { select: { id: true, codigo: true, nombre: true } },
            },
          },
        },
      });
      expect(result).toEqual(material);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      prisma.material.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('debe actualizar campos del material', async () => {
      const updateData = { nombre: 'Nuevo nombre' };
      const updatedMaterial = { id: '1', codigo: 'MAT-001', ...updateData };

      prisma.material.update.mockResolvedValue(updatedMaterial as any);

      const result = await service.update('1', updateData as any);

      expect(prisma.material.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining(updateData),
      });
      expect(result).toEqual(updatedMaterial);
    });

    it('debe lanzar NotFoundException si el material no existe', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: 'test',
      });
      prisma.material.update.mockRejectedValue(error);

      await expect(service.update('999', { nombre: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove()', () => {
    it('debe eliminar el material', async () => {
      prisma.material.delete.mockResolvedValue({ id: '1' } as any);

      const result = await service.remove('1');

      expect(prisma.material.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({ message: 'Material eliminado correctamente' });
    });

    it('debe lanzar NotFoundException si el material no existe', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: 'test',
      });
      prisma.material.delete.mockRejectedValue(error);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('buscar()', () => {
    it('debe buscar materiales por término', async () => {
      const materiales = [
        { id: '1', codigo: 'MAT-001', nombre: 'Tornillo' },
      ];

      prisma.material.findMany.mockResolvedValue(materiales as any);

      const result = await service.buscar('tornillo');

      expect(prisma.material.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            activo: true,
          }),
        }),
      );
      expect(result).toEqual(materiales);
    });
  });
});
