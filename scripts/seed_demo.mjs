import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed demo...');

  // Verificar si ya hay datos
  const userCount = await prisma.usuario.count();
  if (userCount > 0) {
    console.log('⚠️  Ya existen usuarios, saltando seed para no duplicar datos');
    console.log('🎉 Seed demo completado (ya existen datos)');
    return;
  }

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

  // ─── Clientes ──────────────────────────────────────────
  const clientes = [
    { id: 'CLI-001', codigo: 'CLI-001', razonSocial: 'TechCorp Industries', contacto: 'Carlos Mendoza', email: 'carlos@techcorp.com', telefono: '+52 656 111 2233', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Calle Innovación 456', rfc: 'TCI123456ABC', activo: true, sucursalId: juarez.id },
    { id: 'CLI-002', codigo: 'CLI-002', razonSocial: 'Metalúrgica del Norte', contacto: 'Ana López', email: 'ana@metnorte.com', telefono: '+52 656 222 3344', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Av. Industrial 789', rfc: 'MDN789012DEF', activo: true, sucursalId: juarez.id },
    { id: 'CLI-003', codigo: 'CLI-003', razonSocial: 'Precision Parts LLC', contacto: 'John Smith', email: 'john@precisionparts.com', telefono: '+1 915 555 0100', ciudad: 'El Paso', estado: 'Texas', pais: 'USA', direccion: '456 Industrial Blvd', rfc: 'PPL345678GHI', activo: true, sucursalId: elpaso.id },
    { id: 'CLI-004', codigo: 'CLI-004', razonSocial: 'Aeroespacial Guadalajara', contacto: 'María García', email: 'maria@aerogdl.com', telefono: '+52 33 333 4455', ciudad: 'Guadalajara', estado: 'Jalisco', pais: 'México', direccion: 'Parque Industrial 100', rfc: 'AGD901234JKL', activo: true, sucursalId: guadalajara.id },
    { id: 'CLI-005', codigo: 'CLI-005', razonSocial: 'Automotriz del Pacífico', contacto: 'Roberto Hernández', email: 'roberto@autopac.com', telefono: '+52 664 555 6677', ciudad: 'Tijuana', estado: 'Baja California', pais: 'México', direccion: 'Zona Industrial 200', rfc: 'ADP567890MNO', activo: false, sucursalId: juarez.id },
  ];

  for (const c of clientes) {
    await prisma.cliente.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log('✅ Clientes creados');

  // ─── Proveedores ───────────────────────────────────────
  const proveedores = [
    { id: 'PRV-001', codigo: 'PRV-001', razonSocial: 'Aceros y Metales SA', contacto: 'Pedro Ramírez', email: 'pedro@aceros.com', telefono: '+52 656 777 8899', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Calle Acero 100', rfc: 'AMT123456PQR', activo: true, sucursalId: juarez.id },
    { id: 'PRV-002', codigo: 'PRV-002', razonSocial: 'Electrónica Industrial MX', contacto: 'Laura Sánchez', email: 'laura@elecmx.com', telefono: '+52 33 888 9900', ciudad: 'Guadalajara', estado: 'Jalisco', pais: 'México', direccion: 'Zona Franca 50', rfc: 'EIM789012STU', activo: true, sucursalId: guadalajara.id },
    { id: 'PRV-003', codigo: 'PRV-003', razonSocial: 'Global Supplies Corp', contacto: 'Mike Johnson', email: 'mike@globalsupplies.com', telefono: '+1 214 555 0200', ciudad: 'Dallas', estado: 'Texas', pais: 'USA', direccion: '123 Supply Chain Dr', rfc: 'GSC345678VWX', activo: true, sucursalId: elpaso.id },
    { id: 'PRV-004', codigo: 'PRV-004', razonSocial: 'Packaging Solutions', contacto: 'Sofia Martinez', email: 'sofia@packingsol.com', telefono: '+52 656 999 0011', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Av. Empresarial 300', rfc: 'PSO901234YZA', activo: true, sucursalId: juarez.id },
  ];

  for (const p of proveedores) {
    await prisma.proveedor.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log('✅ Proveedores creados');

  // ─── Materiales ────────────────────────────────────────
  const materiales = [
    { id: 'MAT-001', codigo: 'MAT-001', descripcion: 'Placa de acero inoxidable 304', unidad: 'kg', stockActual: 500, precioUnitario: 25.50, stockMinimo: 100, activo: true, sucursalId: juarez.id },
    { id: 'MAT-002', codigo: 'MAT-002', descripcion: 'Aluminio 6061-T6 barra', unidad: 'm', stockActual: 200, precioUnitario: 45.00, stockMinimo: 50, activo: true, sucursalId: juarez.id },
    { id: 'MAT-003', codigo: 'MAT-003', descripcion: 'Titanio grado 2 lámina', unidad: 'pieza', stockActual: 25, precioUnitario: 350.00, stockMinimo: 10, activo: true, sucursalId: juarez.id },
    { id: 'MAT-004', codigo: 'MAT-004', descripcion: 'Cobre electrolítico alambre', unidad: 'm', stockActual: 1000, precioUnitario: 8.75, stockMinimo: 200, activo: true, sucursalId: juarez.id },
    { id: 'MAT-005', codigo: 'MAT-005', descripcion: 'Plástico ABS gránulos', unidad: 'kg', stockActual: 150, precioUnitario: 12.30, stockMinimo: 50, activo: true, sucursalId: juarez.id },
    { id: 'MAT-006', codigo: 'MAT-006', descripcion: 'Fibra de carbono tela', unidad: 'm²', stockActual: 40, precioUnitario: 180.00, stockMinimo: 15, activo: true, sucursalId: guadalajara.id },
    { id: 'MAT-007', codigo: 'MAT-007', descripcion: 'Rodamiento SKF 6205', unidad: 'pieza', stockActual: 3, precioUnitario: 85.00, stockMinimo: 10, activo: true, sucursalId: juarez.id },
    { id: 'MAT-008', codigo: 'MAT-008', descripcion: 'Aceite lubricante ISO 46', unidad: 'L', stockActual: 80, precioUnitario: 32.00, stockMinimo: 20, activo: true, sucursalId: juarez.id },
  ];

  for (const m of materiales) {
    await prisma.material.upsert({
      where: { id: m.id },
      update: m,
      create: m,
    });
  }
  console.log('✅ Materiales creados');

  // ─── Cotizaciones ──────────────────────────────────────
  const cotizaciones = [
    { id: 'COT-2026-0001', folio: 'COT-2026-0001', clienteId: 'CLI-001', estatus: 'ACEPTADA', total: 45000.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-15'), notas: 'Fabricación de componentes mecánicos' },
    { id: 'COT-2026-0002', folio: 'COT-2026-0002', clienteId: 'CLI-002', estatus: 'PENDIENTE', total: 125000.00, moneda: 'MXN', fechaEntrega: new Date('2026-11-01'), notas: 'Serie de 500 piezas' },
    { id: 'COT-2026-0003', folio: 'COT-2026-0003', clienteId: 'CLI-001', estatus: 'ENVIADA', total: 78000.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-20'), notas: 'Prototipos CNC' },
    { id: 'COT-2026-0004', folio: 'COT-2026-0004', clienteId: 'CLI-003', estatus: 'RECHAZADA', total: 15000.00, moneda: 'USD', fechaEntrega: new Date('2026-09-30'), notas: 'Volumen bajo' },
    { id: 'COT-2026-0005', folio: 'COT-2026-0005', clienteId: 'CLI-004', estatus: 'BORRADOR', total: 92000.00, moneda: 'MXN', fechaEntrega: new Date('2026-11-15'), notas: 'Componentes aeroespaciales' },
    { id: 'COT-2026-0006', folio: 'COT-2026-0006', clienteId: 'CLI-002', estatus: 'CANCELADA', total: 8500.00, moneda: 'MXN', fechaEntrega: new Date('2026-09-25'), notas: 'Cancelado por cliente' },
    { id: 'COT-2026-0007', folio: 'COT-2026-0007', clienteId: 'CLI-005', estatus: 'ACEPTADA', total: 180000.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-30'), notas: 'Lote de producción mensual' },
    { id: 'COT-2026-0008', folio: 'COT-2026-0008', clienteId: 'CLI-001', estatus: 'PENDIENTE', total: 54000.00, moneda: 'MXN', fechaEntrega: new Date('2026-11-10'), notas: 'Mantenimiento industrial' },
  ];

  for (const cot of cotizaciones) {
    await prisma.cotizacion.upsert({
      where: { id: cot.id },
      update: cot,
      create: cot,
    });
  }
  console.log('✅ Cotizaciones creadas');

  // ─── Órdenes de Compra ( OrdenCompra ) ─────────────────
  const ordenCompra = [
    { folio: 'PO-2026-0001', proveedorId: 'PRV-001', estatus: 'APROBADA', total: 35000.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-05'), notas: 'Acero inoxidable' },
    { folio: 'PO-2026-0002', proveedorId: 'PRV-002', estatus: 'PENDIENTE', total: 18000.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-10'), notas: 'Componentes electrónicos' },
    { folio: 'PO-2026-0003', proveedorId: 'PRV-003', estatus: 'COMPLETADA', total: 9500.00, moneda: 'USD', fechaEntrega: new Date('2026-09-28'), notas: 'Suministros globales' },
    { folio: 'PO-2026-0004', proveedorId: 'PRV-004', estatus: 'EN_PRODUCCION', total: 12500.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-18'), notas: 'Empaque y transporte' },
  ];

  for (const oc of ordenCompra) {
    await prisma.ordenCompra.upsert({
      where: { id: oc.folio },
      update: oc,
      create: oc,
    });
  }
  console.log('✅ Órdenes de Compra creadas');

  // ─── Órdenes de Trabajo ( OrdenTrabajo ) ───────────────
  const ordenTrabajo = [
    { folio: 'WO-2026-0001', cotizacionId: 'COT-2026-0001', estatus: 'COMPLETADA', horasEstimadas: 40, activo: true },
    { folio: 'WO-2026-0002', cotizacionId: 'COT-2026-0001', estatus: 'EN_PRODUCCION', horasEstimadas: 60, activo: true },
    { folio: 'WO-2026-0003', cotizacionId: 'COT-2026-0005', estatus: 'PENDIENTE', horasEstimadas: 80, activo: true },
    { folio: 'WO-2026-0004', cotizacionId: 'COT-2026-0007', estatus: 'CALIDAD', horasEstimadas: 30, activo: true },
  ];

  for (const ot of ordenTrabajo) {
    await prisma.ordenTrabajo.upsert({
      where: { id: ot.folio },
      update: ot,
      create: ot,
    });
  }
  console.log('✅ Órdenes de Trabajo creadas');

  console.log('🎉 Seed demo completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
