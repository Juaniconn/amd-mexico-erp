import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed demo...');

  // Obtener sucursales
  const juarez = await prisma.sucursal.findFirst({ where: { codigo: 'JUAREZ' } });
  const guadalajara = await prisma.sucursal.findFirst({ where: { codigo: 'GUADALAJARA' } });
  const elpaso = await prisma.sucursal.findFirst({ where: { codigo: 'ELPASO' } });

  // ─── Clientes ──────────────────────────────────────────
  const clientes = [
    { codigo: 'CLI-001', razonSocial: 'TechCorp Industries', contacto: 'Carlos Mendoza', email: 'carlos@techcorp.com', telefono: '+52 656 111 2233', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Calle Innovación 456', rfc: 'TCI123456ABC', activo: true },
    { codigo: 'CLI-002', razonSocial: 'Metalúrgica del Norte', contacto: 'Ana López', email: 'ana@metnorte.com', telefono: '+52 656 222 3344', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Av. Industrial 789', rfc: 'MDN789012DEF', activo: true },
    { codigo: 'CLI-003', razonSocial: 'Precision Parts LLC', contacto: 'John Smith', email: 'john@precisionparts.com', telefono: '+1 915 555 0100', ciudad: 'El Paso', estado: 'Texas', pais: 'USA', direccion: '456 Industrial Blvd', rfc: 'PPL345678GHI', activo: true },
    { codigo: 'CLI-004', razonSocial: 'Aeroespacial Guadalajara', contacto: 'María García', email: 'maria@aerogdl.com', telefono: '+52 33 333 4455', ciudad: 'Guadalajara', estado: 'Jalisco', pais: 'México', direccion: 'Parque Industrial 100', rfc: 'AGD901234JKL', activo: true },
    { codigo: 'CLI-005', razonSocial: 'Automotriz del Pacífico', contacto: 'Roberto Hernández', email: 'roberto@autopac.com', telefono: '+52 664 555 6677', ciudad: 'Tijuana', estado: 'Baja California', pais: 'México', direccion: 'Zona Industrial 200', rfc: 'ADP567890MNO', activo: false },
  ];

  for (const c of clientes) {
    await prisma.cliente.upsert({
      where: { id: c.codigo },
      update: c,
      create: c,
    });
  }
  console.log('✅ Clientes creados');

  // ─── Proveedores ───────────────────────────────────────
  const proveedores = [
    { codigo: 'PRV-001', razonSocial: 'Aceros y Metales SA', contacto: 'Pedro Ramírez', email: 'pedro@aceros.com', telefono: '+52 656 777 8899', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Calle Acero 100', rfc: 'AMT123456PQR', activo: true },
    { codigo: 'PRV-002', razonSocial: 'Electrónica Industrial MX', contacto: 'Laura Sánchez', email: 'laura@elecmx.com', telefono: '+52 33 888 9900', ciudad: 'Guadalajara', estado: 'Jalisco', pais: 'México', direccion: 'Zona Franca 50', rfc: 'EIM789012STU', activo: true },
    { codigo: 'PRV-003', razonSocial: 'Global Supplies Corp', contacto: 'Mike Johnson', email: 'mike@globalsupplies.com', telefono: '+1 214 555 0200', ciudad: 'Dallas', estado: 'Texas', pais: 'USA', direccion: '123 Supply Chain Dr', rfc: 'GSC345678VWX', activo: true },
    { codigo: 'PRV-004', razonSocial: 'Packaging Solutions', contacto: 'Sofia Martinez', email: 'sofia@packingsol.com', telefono: '+52 656 999 0011', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Av. Empresarial 300', rfc: 'PSO901234YZA', activo: true },
  ];

  for (const p of proveedores) {
    await prisma.proveedor.upsert({
      where: { id: p.codigo },
      update: p,
      create: p,
    });
  }
  console.log('✅ Proveedores creados');

  // ─── Materiales ────────────────────────────────────────
  const materiales = [
    { codigo: 'MAT-001', descripcion: 'Placa de acero inoxidable 304', unidad: 'kg', stockActual: 500, precioUnitario: 25.50, stockMinimo: 100, activo: true },
    { codigo: 'MAT-002', descripcion: 'Aluminio 6061-T6 barra', unidad: 'm', stockActual: 200, precioUnitario: 45.00, stockMinimo: 50, activo: true },
    { codigo: 'MAT-003', descripcion: 'Titanio grado 2 lámina', unidad: 'pieza', stockActual: 25, precioUnitario: 350.00, stockMinimo: 10, activo: true },
    { codigo: 'MAT-004', descripcion: 'Cobre electrolítico alambre', unidade: 'm', stockActual: 1000, precioUnitario: 8.75, stockMinimo: 200, activo: true },
    { codigo: 'MAT-005', descripcion: 'Plástico ABS gránulos', unidad: 'kg', stockActual: 150, precioUnitario: 12.30, stockMinimo: 50, activo: true },
    { codigo: 'MAT-006', descripcion: 'Fibra de carbono tela', unidad: 'm²', stockActual: 40, precioUnitario: 180.00, stockMinimo: 15, activo: true },
    { codigo: 'MAT-007', descripcion: 'Rodamiento SKF 6205', unidad: 'pieza', stockActual: 3, precioUnitario: 85.00, stockMinimo: 10, activo: true },
    { codigo: 'MAT-008', descripcion: 'Aceite lubricante ISO 46', unidad: 'L', stockActual: 80, precioUnitario: 32.00, stockMinimo: 20, activo: true },
  ];

  for (const m of materiales) {
    await prisma.material.upsert({
      where: { id: m.codigo },
      update: m,
      create: m,
    });
  }
  console.log('✅ Materiales creados');

  // ─── Cotizaciones ──────────────────────────────────────
  const cotizaciones = [
    { folio: 'COT-2026-0001', clienteId: 'CLI-001', estatus: 'ACEPTADA', total: 45000.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-15'), notas: 'Fabricación de componentes mecánicos' },
    { folio: 'COT-2026-0002', clienteId: 'CLI-002', estatus: 'PENDIENTE', total: 125000.00, moneda: 'MXN', fechaEntrega: new Date('2026-11-01'), notas: 'Serie de 500 piezas' },
    { folio: 'COT-2026-0003', clienteId: 'CLI-001', estatus: 'ENVIADA', total: 78000.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-20'), notas: 'Prototipos CNC' },
    { folio: 'COT-2026-0004', clienteId: 'CLI-003', estatus: 'RECHAZADA', total: 15000.00, moneda: 'USD', fechaEntrega: new Date('2026-09-30'), notas: 'Volumen bajo' },
    { folio: 'COT-2026-0005', clienteId: 'CLI-004', estatus: 'BORRADOR', total: 92000.00, moneda: 'MXN', fechaEntrega: new Date('2026-11-15'), notas: 'Componentes aeroespaciales' },
    { folio: 'COT-2026-0006', clienteId: 'CLI-002', estatus: 'CANCELADA', total: 8500.00, moneda: 'MXN', fechaEntrega: new Date('2026-09-25'), notas: 'Cancelado por cliente' },
    { folio: 'COT-2026-0007', clienteId: 'CLI-005', estatus: 'ACEPTADA', total: 180000.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-30'), notas: 'Lote de producción mensual' },
    { folio: 'COT-2026-0008', clienteId: 'CLI-001', estatus: 'PENDIENTE', total: 54000.00, moneda: 'MXN', fechaEntrega: new Date('2026-11-10'), notas: 'Mantenimiento industrial' },
  ];

  for (const cot of cotizaciones) {
    await prisma.cotizacion.upsert({
      where: { id: cot.folio },
      update: cot,
      create: cot,
    });
  }
  console.log('✅ Cotizaciones creadas');

  // ─── Órdenes de Compra (como OrdenCompra) ─────────────
  const ordenesCompra = [
    { folio: 'PO-2026-0001', proveedorId: 'PRV-001', estatus: 'APROBADA', total: 35000.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-05'), notas: 'Acero inoxidable' },
    { folio: 'PO-2026-0002', proveedorId: 'PRV-002', estatus: 'PENDIENTE', total: 18000.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-10'), notas: 'Componentes electrónicos' },
    { folio: 'PO-2026-0003', proveedorId: 'PRV-003', estatus: 'COMPLETADA', total: 9500.00, moneda: 'USD', fechaEntrega: new Date('2026-09-28'), notas: 'Suministros globales' },
    { folio: 'PO-2026-0004', proveedorId: 'PRV-004', estatus: 'EN_PRODUCCION', total: 12500.00, moneda: 'MXN', fechaEntrega: new Date('2026-10-18'), notas: 'Empaque y transporte' },
  ];

  for (const oc of ordenesCompra) {
    await prisma.ordenCompra.upsert({
      where: { id: oc.folio },
      update: oc,
      create: oc,
    });
  }
  console.log('✅ Órdenes de Compra creadas');

  // ─── Órdenes de Trabajo (como OrdenTrabajo) ───────────
  const ordenesTrabajo = [
    { folio: 'WO-2026-0001', cotizacionId: 'COT-2026-0001', estatus: 'COMPLETADA', horasEstimadas: 40, maquina: 'CNC-01', activo: true },
    { folio: 'WO-2026-0002', cotizacionId: 'COT-2026-0001', estatus: 'EN_PRODUCCION', horasEstimadas: 60, maquina: 'CNC-02', activo: true },
    { folio: 'WO-2026-0003', cotizacionId: 'COT-2026-0005', estatus: 'PENDIENTE', horasEstimadas: 80, maquina: 'LASER-01', activo: true },
    { folio: 'WO-2026-0004', cotizacionId: 'COT-2026-0007', estatus: 'CALIDAD', horasEstimadas: 30, maquina: 'EDM-01', activo: true },
  ];

  for (const ot of ordenesTrabajo) {
    await prisma.ordenTrabajo.upsert({
      where: { id: ot.folio },
      update: ot,
      create: ot,
    });
  }
  console.log('✅ Órdenes de Trabajo creadas');

  // ─── Operaciones ───────────────────────────────────────
  const operaciones = [
    { codigo: 'OP-2026-0001', descripcion: 'Maquinado CNC componente A', estatus: 'COMPLETADA', duracionMin: 120, maquina: 'CNC-01', activo: true },
    { codigo: 'OP-2026-0002', descripcion: 'Corte lámar placa 5mm', estatus: 'EN_PROCESO', duracionMin: 45, maquina: 'LASER-01', activo: true },
    { codigo: 'OP-2026-0003', descripcion: 'EDM mecanizado fino', estatus: 'COMPLETADA', duracionMin: 90, maquina: 'EDM-01', activo: true },
    { codigo: 'OP-2026-0004', descripcion: 'Soldadura TIG estructura', estatus: 'PENDIENTE', duracionMin: 60, maquina: 'WELD-01', activo: true },
    { codigo: 'OP-2026-0005', descripcion: 'Rectificado de precisión', estatus: 'EN_PROCESO', duracionMin: 30, maquina: 'GRIND-01', activo: true },
    { codigo: 'OP-2026-0006', descripcion: 'Inspección de calidad', estatus: 'COMPLETADA', duracionMin: 25, maquina: 'QC-01', activo: true },
  ];

  for (const op of operaciones) {
    await prisma.operacion.upsert({
      where: { id: op.codigo },
      update: op,
      create: op,
    });
  }
  console.log('✅ Operaciones creadas');

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
