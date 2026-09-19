import { PrismaClient, Role, EstatusPO, EstatusWO, Prioridad, TipoCambio, EstatusCotizacion } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('\u{1F5D1}\u{FE0F}  Limpiando datos existentes...');

  // Limpiar en orden respetando FKs
  try { await prisma.operacion.deleteMany({}); } catch (e: unknown) { console.log('  operacion: no existe'); }
  try { await prisma.controlCalidad.deleteMany({}); } catch (e: unknown) { console.log('  controlCalidad: no existe'); }
  try { await prisma.parteOT.deleteMany({}); } catch (e: unknown) { console.log('  parteOT: no existe'); }
  try { await prisma.ingenieriaPlano.deleteMany({}); } catch (e: unknown) { console.log('  ingenieriaPlano: no existe'); }
  try { await prisma.ingenieriaProceso.deleteMany({}); } catch (e: unknown) { console.log('  ingenieriaProceso: no existe'); }
  try { await prisma.ingenieriaProyecto.deleteMany({}); } catch (e: unknown) { console.log('  ingenieriaProyecto: no existe'); }
  try { await prisma.detalleCotizacion.deleteMany({}); } catch (e: unknown) { console.log('  detalleCotizacion: no existe'); }
  try { await prisma.cotizacion.deleteMany({}); } catch (e: unknown) { console.log('  cotizacion: no existe'); }
  try { await prisma.ordenCompra.deleteMany({}); } catch (e: unknown) { console.log('  ordenCompra: no existe'); }
  try { await prisma.ordenTrabajo.deleteMany({}); } catch (e: unknown) { console.log('  ordenTrabajo: no existe'); }
  try { await prisma.material.deleteMany({}); } catch (e: unknown) { console.log('  material: no existe'); }
  try { await prisma.proveedor.deleteMany({}); } catch (e: unknown) { console.log('  proveedor: no existe'); }
  try { await prisma.cliente.deleteMany({}); } catch (e: unknown) { console.log('  cliente: no existe'); }
  try { await prisma.configuracion.deleteMany({}); } catch (e: unknown) { console.log('  configuracion: no existe'); }
  try { await prisma.usuario.deleteMany({}); } catch (e: unknown) { console.log('  usuario: no existe'); }
  try { await prisma.sucursal.deleteMany({}); } catch (e: unknown) { console.log('  sucursal: no existe'); }

  console.log('\u{2705} Datos limpiados');

  console.log('\u{1F331} Creando datos demo...');

  // ─── Sucursales ───────────────────────────────────────
  const juarez = await prisma.sucursal.create({
    data: {
      codigo: 'JUAREZ',
      nombre: 'Ciudad Juárez',
      ciudad: 'Ciudad Juárez',
      estado: 'Chihuahua',
      pais: 'México',
      direccion: 'Av. Tecnológico 123',
      telefono: '+52 656 123 4567',
      monedaDefault: TipoCambio.MXN,
      esPrincipal: true,
      activo: true,
    },
  });

  const guadalajara = await prisma.sucursal.create({
    data: {
      codigo: 'GUADALAJARA',
      nombre: 'Guadalajara',
      ciudad: 'Guadalajara',
      estado: 'Jalisco',
      pais: 'México',
      direccion: 'Calle Hidalgo 456',
      telefono: '+52 33 987 6543',
      monedaDefault: TipoCambio.MXN,
      esPrincipal: false,
      activo: true,
    },
  });

  const elpaso = await prisma.sucursal.create({
    data: {
      codigo: 'ELPASO',
      nombre: 'El Paso',
      ciudad: 'El Paso',
      estado: 'Texas',
      pais: 'USA',
      direccion: '123 Industrial Blvd',
      telefono: '+1 915 555 0123',
      monedaDefault: TipoCambio.USD,
      esPrincipal: false,
      activo: true,
    },
  });
  console.log('\u{2705} Sucursales');

  // ─── Usuario Admin ────────────────────────────────────
  await prisma.usuario.create({
    data: {
      email: 'admin@amd-mexico.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      nombre: 'Juan',
      apellido: 'Ponce',
      username: 'admin',
      role: Role.ADMIN,
      activo: true,
      sucursalId: juarez.id,
    },
  });
  console.log('\u{2705} Admin');

  // ─── Clientes ────────────────────────────────────────
  const clientes = [
    { codigo: 'CLI-001', razonSocial: 'TechCorp Industries', contacto: 'Carlos Mendoza', email: 'carlos@techcorp.com', telefono: '+52 656 111 2233', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Calle Innovación 456', rfc: 'TCI123456ABC', activo: true },
    { codigo: 'CLI-002', razonSocial: 'Metalúrgica del Norte', contacto: 'Ana López', email: 'ana@metnorte.com', telefono: '+52 656 222 3344', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Av. Industrial 789', rfc: 'MDN789012DEF', activo: true },
    { codigo: 'CLI-003', razonSocial: 'Precision Parts LLC', contacto: 'John Smith', email: 'john@precisionparts.com', telefono: '+1 915 555 0100', ciudad: 'El Paso', estado: 'Texas', pais: 'USA', direccion: '456 Industrial Blvd', rfc: 'PPL345678GHI', activo: true },
    { codigo: 'CLI-004', razonSocial: 'Aeroespacial Guadalajara', contacto: 'María García', email: 'maria@aerogdl.com', telefono: '+52 33 333 4455', ciudad: 'Guadalajara', estado: 'Jalisco', pais: 'México', direccion: 'Parque Industrial 100', rfc: 'AGD901234JKL', activo: true },
    { codigo: 'CLI-005', razonSocial: 'Automotriz del Pacífico', contacto: 'Roberto Hernández', email: 'roberto@autopac.com', telefono: '+52 664 555 6677', ciudad: 'Tijuana', estado: 'Baja California', pais: 'México', direccion: 'Zona Industrial 200', rfc: 'ADP567890MNO', activo: false },
  ];
  for (const c of clientes) {
    await prisma.cliente.create({ data: c });
  }
  console.log('\u{2705} Clientes');

  // ─── Proveedores ─────────────────────────────────────
  const proveedores = [
    { codigo: 'PRV-001', razonSocial: 'Aceros y Metales SA', contacto: 'Pedro Ramírez', email: 'pedro@aceros.com', telefono: '+52 656 777 8899', ciudad: 'Ciudad Juárez', estado: 'Chihuahua', pais: 'México', direccion: 'Calle Acero 100', rfc: 'AMT123456PQR', activo: true },
    { codigo: 'PRV-002', razonSocial: 'Electrónica Industrial MX', contacto: 'Laura Sánchez', email: 'laura@elecmx.com', telefono: '+52 33 888 9900', ciudad: 'Guadalajara', estado: 'Jalisco', pais: 'México', direccion: 'Zona Franca 50', rfc: 'EIM789012STU', activo: true },
    { codigo: 'PRV-003', razonSocial: 'Global Supplies Corp', contacto: 'Mike Johnson', email: 'mike@globalsupplies.com', telefono: '+1 214 555 0200', ciudad: 'Dallas', estado: 'Texas', pais: 'USA', direccion: '123 Supply Chain Dr', rfc: 'GSC345678VWX', activo: true },
  ];
  for (const p of proveedores) {
    await prisma.proveedor.create({ data: p });
  }
  console.log('\u{2705} Proveedores');

  // ─── Materiales ──────────────────────────────────────
  const materiales = [
    { codigo: 'MAT-001', descripcion: 'Placa de acero inoxidable 304', tipo: 'MATERIAL', unidad: 'kg', stockActual: 500, stockMinimo: 100, costoUnitario: 25.50, moneda: TipoCambio.MXN, proveedorCodigo: 'PRV-001', activo: true },
    { codigo: 'MAT-002', descripcion: 'Aluminio 6061-T6 barra', tipo: 'MATERIAL', unidad: 'm', stockActual: 200, stockMinimo: 50, costoUnitario: 45.00, moneda: TipoCambio.MXN, proveedorCodigo: 'PRV-001', activo: true },
    { codigo: 'MAT-003', descripcion: 'Titanio grado 2 lámina', tipo: 'MATERIAL', unidad: 'pieza', stockActual: 25, stockMinimo: 10, costoUnitario: 350.00, moneda: TipoCambio.MXN, proveedorCodigo: 'PRV-002', activo: true },
    { codigo: 'MAT-004', descripcion: 'Cobre electrolítico alambre', tipo: 'MATERIAL', unidad: 'm', stockActual: 1000, stockMinimo: 200, costoUnitario: 8.75, moneda: TipoCambio.MXN, proveedorCodigo: 'PRV-001', activo: true },
    { codigo: 'MAT-005', descripcion: 'Plástico ABS gránulos', tipo: 'MATERIAL', unidad: 'kg', stockActual: 150, stockMinimo: 50, costoUnitario: 12.30, moneda: TipoCambio.MXN, proveedorCodigo: 'PRV-002', activo: true },
    { codigo: 'MAT-006', descripcion: 'Fibra de carbono tela', tipo: 'MATERIAL', unidad: 'm²', stockActual: 40, stockMinimo: 15, costoUnitario: 180.00, moneda: TipoCambio.MXN, proveedorCodigo: 'PRV-003', activo: true },
    { codigo: 'MAT-007', descripcion: 'Rodamiento SKF 6205', tipo: 'PRODUCTO', unidad: 'pieza', stockActual: 3, stockMinimo: 10, costoUnitario: 85.00, moneda: TipoCambio.MXN, proveedorCodigo: 'PRV-003', activo: true },
    { codigo: 'MAT-008', descripcion: 'Aceite lubricante ISO 46', tipo: 'PRODUCTO', unidad: 'L', stockActual: 80, stockMinimo: 20, costoUnitario: 32.00, moneda: TipoCambio.MXN, proveedorCodigo: 'PRV-001', activo: true },
  ];
  for (const m of materiales) {
    const { proveedorCodigo, ...rest } = m;
    await prisma.material.create({
      data: {
        ...rest,
        proveedor: { connect: { codigo: proveedorCodigo } },
      },
    });
  }
  console.log('\u{2705} Materiales');

  // ─── Cotizaciones ────────────────────────────────────
  const cotizaciones = [
    { folio: 'COT-2026-0001', clienteCodigo: 'CLI-001', estatus: EstatusCotizacion.ACEPTADA, total: 45000, moneda: TipoCambio.MXN, fecha: new Date('2026-10-15') },
    { folio: 'COT-2026-0002', clienteCodigo: 'CLI-002', estatus: EstatusCotizacion.ENVIADA, total: 125000, moneda: TipoCambio.MXN, fecha: new Date('2026-11-01') },
    { folio: 'COT-2026-0003', clienteCodigo: 'CLI-001', estatus: EstatusCotizacion.ENVIADA, total: 78000, moneda: TipoCambio.MXN, fecha: new Date('2026-10-20') },
    { folio: 'COT-2026-0004', clienteCodigo: 'CLI-003', estatus: EstatusCotizacion.RECHAZADA, total: 15000, moneda: TipoCambio.USD, fecha: new Date('2026-09-30') },
    { folio: 'COT-2026-0005', clienteCodigo: 'CLI-004', estatus: EstatusCotizacion.BORRADOR, total: 92000, moneda: TipoCambio.MXN, fecha: new Date('2026-11-15') },
    { folio: 'COT-2026-0006', clienteCodigo: 'CLI-002', estatus: EstatusCotizacion.CANCELADA, total: 8500, moneda: TipoCambio.MXN, fecha: new Date('2026-09-25') },
    { folio: 'COT-2026-0007', clienteCodigo: 'CLI-005', estatus: EstatusCotizacion.ACEPTADA, total: 180000, moneda: TipoCambio.MXN, fecha: new Date('2026-10-30') },
    { folio: 'COT-2026-0008', clienteCodigo: 'CLI-001', estatus: EstatusCotizacion.ENVIADA, total: 54000, moneda: TipoCambio.MXN, fecha: new Date('2026-11-10') },
  ];
  for (const cot of cotizaciones) {
    const { clienteCodigo, ...rest } = cot;
    await prisma.cotizacion.create({
      data: {
        ...rest,
        cliente: { connect: { codigo: clienteCodigo } },
      },
    });
  }
  console.log('\u{2705} Cotizaciones');

  // ─── Órdenes de Compra ───────────────────────────────
  const ordenesCompra = [
    { folio: 'PO-2026-0001', clienteCodigo: 'CLI-001', estatus: EstatusPO.APROBADA, total: 35000, moneda: TipoCambio.MXN, fechaEntrega: new Date('2026-10-05') },
    { folio: 'PO-2026-0002', clienteCodigo: 'CLI-002', estatus: EstatusPO.PENDIENTE, total: 18000, moneda: TipoCambio.MXN, fechaEntrega: new Date('2026-10-10') },
    { folio: 'PO-2026-0003', clienteCodigo: 'CLI-003', estatus: EstatusPO.COMPLETADA, total: 9500, moneda: TipoCambio.USD, fechaEntrega: new Date('2026-09-28') },
    { folio: 'PO-2026-0004', clienteCodigo: 'CLI-004', estatus: EstatusPO.EN_PRODUCCION, total: 12500, moneda: TipoCambio.MXN, fechaEntrega: new Date('2026-10-18') },
  ];
  for (const oc of ordenesCompra) {
    const { clienteCodigo, ...rest } = oc;
    await prisma.ordenCompra.create({
      data: {
        ...rest,
        cliente: { connect: { codigo: clienteCodigo } },
      },
    });
  }
  console.log('\u{2705} Órdenes Compra');

  // ─── Órdenes de Trabajo ──────────────────────────────
  const ordenesTrabajo = [
    { folio: 'WO-2026-0001', cotizacionFolio: 'COT-2026-0001', estatus: EstatusWO.COMPLETADA, prioridad: Prioridad.ALTA },
    { folio: 'WO-2026-0002', cotizacionFolio: 'COT-2026-0001', estatus: EstatusWO.EN_PRODUCCION, prioridad: Prioridad.MEDIA },
    { folio: 'WO-2026-0003', cotizacionFolio: 'COT-2026-0005', estatus: EstatusWO.PENDIENTE, prioridad: Prioridad.BAJA },
    { folio: 'WO-2026-0004', cotizacionFolio: 'COT-2026-0007', estatus: EstatusWO.CALIDAD, prioridad: Prioridad.MEDIA },
  ];
  for (const ot of ordenesTrabajo) {
    const { cotizacionFolio, ...rest } = ot;
    await prisma.ordenTrabajo.create({
      data: {
        ...rest,
        cotizacion: { connect: { folio: cotizacionFolio } },
      },
    });
  }
  console.log('\u{2705} Órdenes Trabajo');

  // ─── Configuración ───────────────────────────────────
  const configs = [
    { clave: 'empresa_nombre', valor: 'AMD Automatización y Servicios Industriales' },
    { clave: 'empresa_rfc', valor: 'AME123456ABC' },
    { clave: 'moneda_base', valor: 'MXN' },
    { clave: 'tipo_cambio_usd', valor: '17.50' },
  ];
  for (const cfg of configs) {
    await prisma.configuracion.create({ data: cfg });
  }
  console.log('\u{2705} Configuración');

  console.log('\u{1F389} Seed demo completado exitosamente');
  console.log('');
  console.log('Credenciales:');
  console.log('  Email: admin@amd-mexico.com');
  console.log('  Password: admin123');
}

seed()
  .catch((e: unknown) => {
    console.error('\u{274C} Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
