import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ComprasModule } from '../compras.module';
import { PrismaService } from '../../../database/prisma.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Prisma } from '@prisma/client';

const PRISMA_CLIENT_VERSION = 'test';

// Mock PrismaService
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
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

describe('ComprasController (integration)', () => {
  let app: INestApplication;
  let prisma: typeof mockPrismaService;

  // Valid UUIDs for testing
  const PROVEEDOR_UUID = '550e8400-e29b-41d4-a716-446655440002';
  const MATERIAL_UUID = '550e8400-e29b-41d4-a716-446655440010';
  const ORDEN_UUID = '550e8400-e29b-41d4-a716-446655440003';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ComprasModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'test-user-id', sub: 'test-user-id', role: 'ADMIN' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/compras/ordenes', () => {
    it('→ 200 con lista de órdenes de compra', async () => {
      const mockOrdenes = [
        {
          id: ORDEN_UUID,
          folio: 'OC-2026-0001',
          proveedor: { id: PROVEEDOR_UUID, codigo: 'PROV001', razonSocial: 'Proveedor 1' },
          creador: { id: 'u1', nombre: 'Admin', apellido: 'User' },
          _count: { detalles: 2 },
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          folio: 'OC-2026-0002',
          proveedor: { id: '550e8400-e29b-41d4-a716-446655440005', codigo: 'PROV002', razonSocial: 'Proveedor 2' },
          creador: { id: 'u1', nombre: 'Admin', apellido: 'User' },
          _count: { detalles: 1 },
        },
      ];

      prisma.ordenCompra.findMany.mockResolvedValue(mockOrdenes as any);
      prisma.ordenCompra.count.mockResolvedValue(2);

      const response = await request(app.getHttpServer())
        .get('/api/compras/ordenes')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
      expect(response.body.meta.page).toBe(1);
    });

    it('→ 200 con filtros de búsqueda y estatus', async () => {
      prisma.ordenCompra.findMany.mockResolvedValue([]);
      prisma.ordenCompra.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/api/compras/ordenes?search=OC-2026&estatus=borrador')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });
  });

  describe('POST /api/compras/ordenes', () => {
    it('→ 201 con orden de compra creada', async () => {
      const createDto = {
        proveedorId: PROVEEDOR_UUID,
        condicionesPago: '30 días',
        notas: 'Orden de prueba',
        detalles: [
          {
            materialId: MATERIAL_UUID,
            cantidad: 10,
            precioUnitario: 100.50,
          },
        ],
      };

      const mockProveedor = { id: PROVEEDOR_UUID, nombre: 'Proveedor Test' };
      const mockMaterial = { id: MATERIAL_UUID, nombre: 'Material Test', stockActual: 50 };

      prisma.ordenCompra.findFirst.mockResolvedValue(null);
      prisma.proveedor.findUnique.mockResolvedValue(mockProveedor as any);
      prisma.material.findUnique.mockResolvedValue(mockMaterial as any);
      prisma.ordenCompra.create.mockResolvedValue({
        id: ORDEN_UUID,
        folio: 'OC-2026-0001',
        estatus: 'BORRADOR',
      } as any);

      const response = await request(app.getHttpServer())
        .post('/api/compras/ordenes')
        .send(createDto)
        .expect(201);

      expect(response.body).toBeDefined();
    });

    it('→ 400 con proveedorId inválido', async () => {
      const invalidDto = {
        proveedorId: 'invalid-uuid',
        detalles: [
          {
            materialId: MATERIAL_UUID,
            cantidad: 10,
            precioUnitario: 100,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/compras/ordenes')
        .send(invalidDto)
        .expect(400);
    });

    it('→ 400 si el proveedor no existe', async () => {
      const createDto = {
        proveedorId: PROVEEDOR_UUID,
        detalles: [
          {
            materialId: MATERIAL_UUID,
            cantidad: 10,
            precioUnitario: 100,
          },
        ],
      };

      prisma.ordenCompra.findFirst.mockResolvedValue(null);
      prisma.proveedor.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/compras/ordenes')
        .send(createDto)
        .expect(400);
    });

    it('→ 409 si el folio ya existe', async () => {
      const createDto = {
        proveedorId: PROVEEDOR_UUID,
        detalles: [
          {
            materialId: MATERIAL_UUID,
            cantidad: 10,
            precioUnitario: 100,
          },
        ],
      };

      const mockProveedor = { id: PROVEEDOR_UUID };
      const mockMaterial = { id: MATERIAL_UUID, stockActual: 50 };

      prisma.ordenCompra.findFirst.mockResolvedValue(null);
      prisma.proveedor.findUnique.mockResolvedValue(mockProveedor as any);
      prisma.material.findUnique.mockResolvedValue(mockMaterial as any);

      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: PRISMA_CLIENT_VERSION,
      });
      prisma.ordenCompra.create.mockRejectedValue(prismaError);

      await request(app.getHttpServer())
        .post('/api/compras/ordenes')
        .send(createDto)
        .expect(409);
    });
  });

  describe('GET /api/compras/ordenes/:id', () => {
    it('→ 200 con la orden encontrada', async () => {
      const mockOrden = {
        id: ORDEN_UUID,
        folio: 'OC-2026-0001',
        proveedor: { id: PROVEEDOR_UUID, razonSocial: 'Proveedor 1' },
        creador: { id: 'u1', nombre: 'Admin', apellido: 'User', email: 'admin@test.com' },
        detalles: [],
      };

      prisma.ordenCompra.findUnique.mockResolvedValue(mockOrden as any);

      const response = await request(app.getHttpServer())
        .get(`/api/compras/ordenes/${ORDEN_UUID}`)
        .expect(200);

      expect(response.body.id).toBe(ORDEN_UUID);
      expect(response.body.folio).toBe('OC-2026-0001');
    });

    it('→ 404 si la orden no existe', async () => {
      prisma.ordenCompra.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/api/compras/ordenes/550e8400-e29b-41d4-a716-446655440099')
        .expect(404);
    });
  });

  describe('PATCH /api/compras/ordenes/:id', () => {
    it('→ 200 al actualizar una orden', async () => {
      prisma.ordenCompra.findUnique.mockResolvedValue({ id: ORDEN_UUID } as any);
      prisma.ordenCompra.update.mockResolvedValue({
        id: ORDEN_UUID,
        folio: 'OC-2026-0001',
        condicionesPago: '60 días',
        estatus: 'BORRADOR',
      } as any);

      const response = await request(app.getHttpServer())
        .patch(`/api/compras/ordenes/${ORDEN_UUID}`)
        .send({ condicionesPago: '60 días' })
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('→ 404 si la orden no existe', async () => {
      prisma.ordenCompra.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/api/compras/ordenes/550e8400-e29b-41d4-a716-446655440099')
        .send({ notas: 'test' })
        .expect(404);
    });
  });

  describe('PATCH /api/compras/ordenes/:id/estatus', () => {
    it('→ 200 al cambiar estatus', async () => {
      prisma.ordenCompra.findUnique.mockResolvedValue({ id: ORDEN_UUID, estatus: 'BORRADOR', detalles: [] } as any);
      prisma.ordenCompra.update.mockResolvedValue({
        id: ORDEN_UUID,
        estatus: 'ENVIADA',
      } as any);

      const response = await request(app.getHttpServer())
        .patch(`/api/compras/ordenes/${ORDEN_UUID}/estatus`)
        .send({ estatus: 'ENVIADA' })
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('DELETE /api/compras/ordenes/:id', () => {
    it('→ 200 al eliminar correctamente', async () => {
      const mockOrden = {
        id: ORDEN_UUID,
        folio: 'OC-2026-0001',
        estatus: 'BORRADOR',
        _count: { detalles: 1 },
      };

      prisma.ordenCompra.findUnique.mockResolvedValue(mockOrden as any);
      prisma.ordenCompra.delete.mockResolvedValue(mockOrden as any);

      const response = await request(app.getHttpServer())
        .delete(`/api/compras/ordenes/${ORDEN_UUID}`)
        .expect(200);

      expect(response.body.message).toBe('Orden de compra eliminada correctamente');
    });

    it('→ 404 si la orden no existe', async () => {
      prisma.ordenCompra.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/api/compras/ordenes/550e8400-e29b-41d4-a716-446655440099')
        .expect(404);
    });

    it('→ 409 si ya fue recibida', async () => {
      const mockOrden = {
        id: ORDEN_UUID,
        folio: 'OC-2026-0001',
        estatus: 'RECIBIDA',
        _count: { detalles: 1 },
      };

      prisma.ordenCompra.findUnique.mockResolvedValue(mockOrden as any);

      await request(app.getHttpServer())
        .delete(`/api/compras/ordenes/${ORDEN_UUID}`)
        .expect(409);
    });
  });

  describe('GET /api/compras/proveedores/:id/ordenes', () => {
    it('→ 200 con órdenes del proveedor', async () => {
      const mockOrdenes = [
        {
          id: ORDEN_UUID,
          folio: 'OC-2026-0001',
          proveedor: { id: PROVEEDOR_UUID, codigo: 'PROV001', razonSocial: 'Proveedor 1' },
          _count: { detalles: 2 },
        },
      ];

      prisma.ordenCompra.findMany.mockResolvedValue(mockOrdenes as any);
      prisma.ordenCompra.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get(`/api/compras/proveedores/${PROVEEDOR_UUID}/ordenes`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
    });
  });
});
