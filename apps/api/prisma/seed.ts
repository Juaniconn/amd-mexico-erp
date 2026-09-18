import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // ─── Sucursales ──────────────────────────────────────────
  const juarez = await prisma.sucursal.upsert({
    where: { codigo: 'JUAREZ' },
    update: {},
    create: {
      codigo: 'JUAREZ',
      nombre: 'Ciudad Juárez',
      ciudad: 'Ciudad Juárez',
      estado: 'Chihuahua',
      pais: 'México',
      direccion: 'Av. Tecnológico 123, Juárez, Chih.',
      telefono: '+52 656 123 4567',
      monedaDefault: 'MXN',
      esPrincipal: true,
      activo: true,
    },
  });

  const guadalajara = await prisma.sucursal.upsert({
    where: { codigo: 'GUADALAJARA' },
    update: {},
    create: {
      codigo: 'GUADALAJARA',
      nombre: 'Guadalajara',
      ciudad: 'Guadalajara',
      estado: 'Jalisco',
      pais: 'México',
      direccion: 'Calle Hidalgo 456, GDL, Jal.',
      telefono: '+52 33 987 6543',
      monedaDefault: 'MXN',
      esPrincipal: false,
      activo: true,
    },
  });

  const elpaso = await prisma.sucursal.upsert({
    where: { codigo: 'ELPASO' },
    update: {},
    create: {
      codigo: 'ELPASO',
      nombre: 'El Paso',
      ciudad: 'El Paso',
      estado: 'Texas',
      pais: 'USA',
      direccion: '123 Industrial Blvd, El Paso, TX',
      telefono: '+1 915 555 0123',
      monedaDefault: 'USD',
      esPrincipal: false,
      activo: true,
    },
  });

  console.log('✅ Sucursales creadas');

  // ─── Usuario Admin ──────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@amd-mexico.com' },
    update: {},
    create: {
      email: 'admin@amd-mexico.com',
      passwordHash,
      nombre: 'Juan',
      apellido: 'Ponce',
      username: 'admin',
      role: 'ADMIN',
      activo: true,
      sucursalId: juarez.id,
    },
  });

  console.log('✅ Usuario admin creado (admin@amd-mexico.com / admin123)');

  // ─── Configuración inicial ──────────────────────────────
  const configs = [
    { clave: 'empresa_nombre', valor: 'AMD Automatización y Servicios Industriales', descripcion: 'Nombre de la empresa' },
    { clave: 'empresa_rfc', valor: 'AME123456ABC', descripcion: 'RFC de la empresa' },
    { clave: 'moneda_base', valor: 'MXN', descripcion: 'Moneda base del sistema' },
    { clave: 'tipo_cambio_usd', valor: '17.50', descripcion: 'Tipo de cambio USD/MXN (actualizar diariamente)' },
    { clave: 'cotizacion_validez_dias', valor: '30', descripcion: 'Días de validez de cotizaciones' },
    { clave: 'wo_prefijo', valor: 'WO', descripcion: 'Prefijo para órdenes de trabajo' },
    { clave: 'po_prefijo', valor: 'PO', descripcion: 'Prefijo para órdenes de compra' },
    { clave: 'cotizacion_prefijo', valor: 'COT', descripcion: 'Prefijo para cotizaciones' },
  ];

  for (const cfg of configs) {
    await prisma.configuracion.upsert({
      where: { clave: cfg.clave },
      update: { valor: cfg.valor },
      create: cfg,
    });
  }

  console.log('✅ Configuración inicial creada');
  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
