import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { InventarioModule } from '../inventario.module';
import { PrismaService } from '../../../database/prisma.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { NotFoundException } from '@nestjs/common';

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
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

describe('InventarioController (integration)', () => {
  let app: INestApplication;
  let prisma: typeof mockPrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [InventarioModule],
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

  describe('GET /api/inventario/materiales', () => {
    it('→ 200 con lista de materiales', async () => {
      const mockMateriales = [
        { id: '1', codigo: 'MAT-001', nombre: 'Tornillo', unidad: 'PZA' },
        { id: '2', codigo: 'MAT-002', nombre: 'Tuerca', unidad: 'PZA' },
      ];

      prisma.material.findMany.mockResolvedValue(mockMateriales as any);
      prisma.material.count.mockResolvedValue(2);

      const response = await request(app.getHttpServer())
        .get('/api/inventario/materiales')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
      expect(response.body.meta.page).toBe(1);
    });
  });

  describe('POST /api/inventario/materiales', () => {
    it('→ 201 con material creado', async () => {
      const createDto = {
        codigo: 'MAT-NEW',
        nombre: 'Material de prueba',
      };

      prisma.material.findUnique.mockResolvedValue(null);
      prisma.material.create.mockResolvedValue({
        id: 'new-id',
        ...createDto,
      } as any);

      const response = await request(app.getHttpServer())
        .post('/api/inventario/materiales')
        .send(createDto)
        .expect(201);

      expect(response.body).toBeDefined();
    });

    it('→ 400 con datos inválidos', async () => {
      const invalidDto = {
        codigo: '',
      };

      await request(app.getHttpServer())
        .post('/api/inventario/materiales')
        .send(invalidDto)
        .expect(400);
    });

    it('→ 409 si el código ya existe', async () => {
      prisma.material.findUnique.mockResolvedValue({ id: '1', codigo: 'MAT-001' } as any);

      await request(app.getHttpServer())
        .post('/api/inventario/materiales')
        .send({
          codigo: 'MAT-001',
          nombre: 'Test',
        })
        .expect(409);
    });
  });

  describe('PATCH /api/inventario/materiales/:id', () => {
    it('→ 200 al actualizar un material', async () => {
      prisma.material.update.mockResolvedValue({
        id: '1',
        codigo: 'MAT-001',
        nombre: 'Actualizado',
      } as any);

      const response = await request(app.getHttpServer())
        .patch('/api/inventario/materiales/1')
        .send({ nombre: 'Actualizado' })
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('→ 404 si el material no existe', async () => {
      prisma.material.update.mockRejectedValue(new NotFoundException('Material no encontrado'));

      await request(app.getHttpServer())
        .patch('/api/inventario/materiales/999')
        .send({ nombre: 'test' })
        .expect(404);
    });
  });

  describe('GET /api/inventario/materiales/:id', () => {
    it('→ 200 con el material encontrado', async () => {
      prisma.material.findUnique.mockResolvedValue({
        id: '1',
        codigo: 'MAT-001',
        nombre: 'Tornillo',
      } as any);

      const response = await request(app.getHttpServer())
        .get('/api/inventario/materiales/1')
        .expect(200);

      expect(response.body.id).toBe('1');
      expect(response.body.codigo).toBe('MAT-001');
    });

    it('→ 404 si no existe', async () => {
      prisma.material.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/api/inventario/materiales/999')
        .expect(404);
    });
  });

  describe('DELETE /api/inventario/materiales/:id', () => {
    it('→ 200 al eliminar correctamente', async () => {
      prisma.material.delete.mockResolvedValue({ id: '1' } as any);

      await request(app.getHttpServer())
        .delete('/api/inventario/materiales/1')
        .expect(200);
    });

    it('→ 404 si no existe', async () => {
      prisma.material.delete.mockRejectedValue(new NotFoundException('Material no encontrado'));

      await request(app.getHttpServer())
        .delete('/api/inventario/materiales/999')
        .expect(404);
    });
  });

  describe('GET /api/inventario/materiales/buscar', () => {
    it('→ 200 con resultados de búsqueda', async () => {
      prisma.material.findMany.mockResolvedValue([
        { id: '1', codigo: 'MAT-001', nombre: 'Tornillo' },
      ] as any);

      const response = await request(app.getHttpServer())
        .get('/api/inventario/materiales/buscar?search=tornillo')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('→ 200 con array vacío si no hay search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/inventario/materiales/buscar')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });
});
