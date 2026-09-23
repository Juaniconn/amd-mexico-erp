import { PrismaClient, Role, EstatusCotizacion, EstatusPO, EstatusWO, EstatusParteOT, EstatusOperacion, EstatusCalidad, EstatusFactura, Prioridad, TipoCambio, EnumIngenieriaEstatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed completo...');

  // ─── Limpiar tablas ──────────────────────────────────────
  console.log('🧹 Limpiando tablas...');
  await prisma.auditLog.deleteMany();
  await prisma.movimientoInventario.deleteMany();
  await prisma.transferencia.deleteMany();
  await prisma.controlCalidad.deleteMany();
  await prisma.operacion.deleteMany();
  await prisma.parteOT.deleteMany();
  await prisma.factura.deleteMany();
  await prisma.ordenTrabajo.deleteMany();
  await prisma.ordenCompraProveedor.deleteMany();
  await prisma.ordenCompra.deleteMany();
  await prisma.detalleCotizacion.deleteMany();
  await prisma.cotizacion.deleteMany();
  await prisma.ingenieriaPlano.deleteMany();
  await prisma.ingenieriaProceso.deleteMany();
  await prisma.ingenieriaProyecto.deleteMany();
  await prisma.material.deleteMany();
  await prisma.maquina.deleteMany();
  await prisma.empleado.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.sucursal.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.configuracion.deleteMany();

  // ─── Usuarios ────────────────────────────────────────────
  console.log('👤 Creando usuarios...');
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@amd-mexico.com',
      passwordHash,
      nombre: 'Juan',
      apellido: 'Ponce',
      username: 'admin',
      role: Role.ADMIN,
      activo: true,
    },
  });

  const gerente = await prisma.usuario.create({
    data: {
      email: 'gerente@amd-mexico.com',
      passwordHash,
      nombre: 'María',
      apellido: 'García',
      username: 'gerente',
      role: Role.GERENTE,
      activo: true,
    },
  });

  const vendedor = await prisma.usuario.create({
    data: {
      email: 'ventas@amd-mexico.com',
      passwordHash,
      nombre: 'Carlos',
      apellido: 'López',
      username: 'ventas',
      role: Role.VENDEDOR,
      activo: true,
    },
  });

  const produccion = await prisma.usuario.create({
    data: {
      email: 'produccion@amd-mexico.com',
      passwordHash,
      nombre: 'Roberto',
      apellido: 'Martínez',
      username: 'produccion',
      role: Role.PRODUCCION,
      activo: true,
    },
  });

  const calidad = await prisma.usuario.create({
    data: {
      email: 'calidad@amd-mexico.com',
      passwordHash,
      nombre: 'Ana',
      apellido: 'Hernández',
      username: 'calidad',
      role: Role.CALIDAD,
      activo: true,
    },
  });

  const compras = await prisma.usuario.create({
    data: {
      email: 'compras@amd-mexico.com',
      passwordHash,
      nombre: 'Luis',
      apellido: 'Ramírez',
      username: 'compras',
      role: Role.COMPRAS,
      activo: true,
    },
  });

  const operador = await prisma.usuario.create({
    data: {
      email: 'operador@amd-mexico.com',
      passwordHash,
      nombre: 'Pedro',
      apellido: 'Sánchez',
      username: 'operador',
      role: Role.OPERADOR,
      activo: true,
    },
  });

  // ─── Sucursales ──────────────────────────────────────────
  console.log('🏢 Creando sucursales...');
  const sucursalJuarez = await prisma.sucursal.create({
    data: {
      codigo: 'JUA',
      nombre: 'Ciudad Juárez',
      ciudad: 'Ciudad Juárez',
      estado: 'Chihuahua',
      pais: 'México',
      direccion: 'Av. Industrial 123',
      telefono: '+52 656 123 4567',
      monedaDefault: TipoCambio.MXN,
      esPrincipal: true,
      activo: true,
    },
  });

  const sucursalGdl = await prisma.sucursal.create({
    data: {
      codigo: 'GDL',
      nombre: 'Guadalajara',
      ciudad: 'Guadalajara',
      estado: 'Jalisco',
      pais: 'México',
      direccion: 'Calle Manufactura 456',
      telefono: '+52 33 987 6543',
      monedaDefault: TipoCambio.MXN,
      esPrincipal: false,
      activo: true,
    },
  });

  const sucursalElPaso = await prisma.sucursal.create({
    data: {
      codigo: 'ELP',
      nombre: 'El Paso TX',
      ciudad: 'El Paso',
      estado: 'Texas',
      pais: 'USA',
      direccion: '1234 Industrial Blvd',
      telefono: '+1 915 555 0123',
      monedaDefault: TipoCambio.USD,
      esPrincipal: false,
      activo: true,
    },
  });

  // ─── Clientes ────────────────────────────────────────────
  console.log('🏭 Creando clientes...');
  const cliente1 = await prisma.cliente.create({
    data: {
      codigo: 'CLI-001',
      razonSocial: 'Maquinados del Norte S.A. de C.V.',
      rfc: 'MNX123456ABC',
      contacto: 'Ing. Roberto García',
      email: 'roberto@maquinadosnorte.com',
      telefono: '+52 656 111 2233',
      direccion: 'Parque Industrial Norte',
      ciudad: 'Ciudad Juárez',
      estado: 'Chihuahua',
      codigoPostal: '32500',
      pais: 'México',
      creditoLimite: 500000,
      diasCredito: 30,
      monedaPref: TipoCambio.MXN,
      notas: 'Cliente principal, maquinados de precisión',
      activo: true,
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      codigo: 'CLI-002',
      razonSocial: 'Aeroespacial del Bajío S.A.',
      rfc: 'ABJ789012XYZ',
      contacto: 'Lic. Patricia Mendoza',
      email: 'patricia@aeroespacialbajio.com',
      telefono: '+52 477 222 3344',
      direccion: 'Zona Industrial 789',
      ciudad: 'León',
      estado: 'Guanajuato',
      codigoPostal: '37500',
      pais: 'México',
      creditoLimite: 750000,
      diasCredito: 45,
      monedaPref: TipoCambio.MXN,
      notas: 'Componentes aeroespaciales',
      activo: true,
    },
  });

  const cliente3 = await prisma.cliente.create({
    data: {
      codigo: 'CLI-003',
      razonSocial: 'Automotriz El Paso LLC',
      rfc: 'AEP456789DEF',
      contacto: 'Mr. James Wilson',
      email: 'jwilson@automotrizelpaso.com',
      telefono: '+1 915 555 5566',
      direccion: '4567 Manufacturing Dr',
      ciudad: 'El Paso',
      estado: 'Texas',
      codigoPostal: '79901',
      pais: 'USA',
      creditoLimite: 1000000,
      diasCredito: 60,
      monedaPref: TipoCambio.USD,
      notas: 'Automotive parts supplier',
      activo: true,
    },
  });

  const cliente4 = await prisma.cliente.create({
    data: {
      codigo: 'CLI-004',
      razonSocial: 'Electrónica y Controles S.A.',
      rfc: 'ECN345678GHI',
      contacto: 'Ing. Fernando Ruiz',
      email: 'fernando@electronica-controles.com',
      telefono: '+52 33 333 4455',
      direccion: 'Av. Tecnología 100',
      ciudad: 'Guadalajara',
      estado: 'Jalisco',
      codigoPostal: '44500',
      pais: 'México',
      creditoLimite: 300000,
      diasCredito: 30,
      monedaPref: TipoCambio.MXN,
      notas: 'Componentes electrónicos',
      activo: true,
    },
  });

  // ─── Proveedores ─────────────────────────────────────────
  console.log('🚚 Creando proveedores...');
  const proveedor1 = await prisma.proveedor.create({
    data: {
      codigo: 'PRV-001',
      razonSocial: 'Aceros y Metales del Norte S.A.',
      rfc: 'AMN111222ABC',
      contacto: 'Sr. Héctor Morales',
      email: 'hector@acerosmn.com',
      telefono: '+52 656 444 5566',
      direccion: 'Carrera Industrial 500',
      ciudad: 'Ciudad Juárez',
      estado: 'Chihuahua',
      codigoPostal: '32500',
      pais: 'México',
      diasCredito: 30,
      monedaPref: TipoCambio.MXN,
      notas: 'Proveedor de aceros y metales',
      activo: true,
    },
  });

  const proveedor2 = await prisma.proveedor.create({
    data: {
      codigo: 'PRV-002',
      razonSocial: 'Plásticos Industriales S.A.',
      rfc: 'PIN333444DEF',
      contacto: 'Sra. Laura Gómez',
      email: 'laura@plasticosind.com',
      telefono: '+52 33 555 6677',
      direccion: 'Zona Industrial 200',
      ciudad: 'Guadalajara',
      estado: 'Jalisco',
      codigoPostal: '44500',
      pais: 'México',
      diasCredito: 30,
      monedaPref: TipoCambio.MXN,
      notas: 'Plásticos industriales',
      activo: true,
    },
  });

  const proveedor3 = await prisma.proveedor.create({
    data: {
      codigo: 'PRV-003',
      razonSocial: 'Fasteners & Parts Co.',
      rfc: 'FAP555666GHI',
      contacto: 'Mr. David Smith',
      email: 'dsmith@fastenersparts.com',
      telefono: '+1 915 555 7788',
      direccion: '7890 Industrial Way',
      ciudad: 'El Paso',
      estado: 'Texas',
      codigoPostal: '79901',
      pais: 'USA',
      diasCredito: 45,
      monedaPref: TipoCambio.USD,
      notas: 'Fasteners and hardware',
      activo: true,
    },
  });

  // ─── Materiales ──────────────────────────────────────────
  console.log('📦 Creando materiales...');
  const material1 = await prisma.material.create({
    data: {
      codigo: 'MAT-001',
      descripcion: 'Placa de acero inoxidable 304',
      tipo: 'Acero',
      unidad: 'KG',
      stockActual: 500,
      stockMinimo: 100,
      costoUnitario: 45.50,
      moneda: TipoCambio.MXN,
      proveedorId: proveedor1.id,
      sucursalId: sucursalJuarez.id,
      notas: 'Acero inoxidable 304, calibre 1/4"',
      activo: true,
    },
  });

  const material2 = await prisma.material.create({
    data: {
      codigo: 'MAT-002',
      descripcion: 'Aluminio 6061-T6',
      tipo: 'Aluminio',
      unidad: 'KG',
      stockActual: 300,
      stockMinimo: 50,
      costoUnitario: 85.00,
      moneda: TipoCambio.MXN,
      proveedorId: proveedor1.id,
      sucursalId: sucursalJuarez.id,
      notas: 'Aluminio 6061-T6 para maquinado',
      activo: true,
    },
  });

  const material3 = await prisma.material.create({
    data: {
      codigo: 'MAT-003',
      descripcion: 'Plástico ABS negro',
      tipo: 'Plástico',
      unidad: 'KG',
      stockActual: 200,
      stockMinimo: 30,
      costoUnitario: 35.00,
      moneda: TipoCambio.MXN,
      proveedorId: proveedor2.id,
      sucursalId: sucursalGdl.id,
      notas: 'ABS negro para inyección',
      activo: true,
    },
  });

  const material4 = await prisma.material.create({
    data: {
      codigo: 'MAT-004',
      descripcion: 'Tornillería M6x20',
      tipo: 'Tornillería',
      unidad: 'PZ',
      stockActual: 10000,
      stockMinimo: 1000,
      costoUnitario: 0.50,
      moneda: TipoCambio.USD,
      proveedorId: proveedor3.id,
      sucursalId: sucursalElPaso.id,
      notas: 'Tornillos M6x20 acero inoxidable',
      activo: true,
    },
  });

  const material5 = await prisma.material.create({
    data: {
      codigo: 'MAT-005',
      descripcion: 'Aceite de corte',
      tipo: 'Lubricante',
      unidad: 'L',
      stockActual: 100,
      stockMinimo: 20,
      costoUnitario: 25.00,
      moneda: TipoCambio.MXN,
      proveedorId: proveedor1.id,
      sucursalId: sucursalJuarez.id,
      notas: 'Aceite de corte para CNC',
      activo: true,
    },
  });

  // ─── Máquinas ────────────────────────────────────────────
  console.log('⚙️ Creando máquinas...')
  const maquina1 = await prisma.maquina.create({
    data: {
      codigo: 'CNC-01',
      nombre: 'Centro de Maquinado Haas VF-2',
      tipo: 'CNC',
      descripcion: 'Centro de maquinado vertical 3 ejes',
      capacidad: '500x400x500mm',
      sucursalId: sucursalJuarez.id,
      notas: 'Maquinado de precisión',
      activo: true,
    },
  });

  const maquina2 = await prisma.maquina.create({
    data: {
      codigo: 'CNC-02',
      nombre: 'Torno CNC Mori Seiki NL2500',
      tipo: 'Torno CNC',
      descripcion: 'Torno CNC de alta precisión',
      capacidad: 'Ø250x500mm',
      sucursalId: sucursalJuarez.id,
      notas: 'Torneado de piezas',
      activo: true,
    },
  });

  const maquina3 = await prisma.maquina.create({
    data: {
      codigo: 'CNC-03',
      nombre: 'Fresadora Bridgeport',
      tipo: 'Fresadora',
      descripcion: 'Fresadora vertical convencional',
      capacidad: '1200x600x500mm',
      sucursalId: sucursalGdl.id,
      notas: 'Fresado general',
      activo: true,
    },
  });

  const maquina4 = await prisma.maquina.create({
    data: {
      codigo: 'INY-01',
      nombre: 'Inyectora de Plástico 250T',
      tipo: 'Inyectora',
      descripcion: 'Máquina inyectora de plástico 250 toneladas',
      capacidad: '250T',
      sucursalId: sucursalGdl.id,
      notas: 'Inyección de plásticos',
      activo: true,
    },
  });

  // ─── Empleados ───────────────────────────────────────────
  console.log('👷 Creando empleados...');
  const empleado1 = await prisma.empleado.create({
    data: {
      codigo: 'EMP-001',
      nombre: 'Miguel',
      apellido: 'Torres',
      puesto: 'Operador CNC',
      email: 'miguel.torres@amd-mexico.com',
      telefono: '+52 656 111 2233',
      fechaIngreso: new Date('2023-01-15'),
      sucursalId: sucursalJuarez.id,
      activo: true,
    },
  });

  const empleado2 = await prisma.empleado.create({
    data: {
      codigo: 'EMP-002',
      nombre: 'Sandra',
      apellido: 'Vázquez',
      puesto: 'Inspector de Calidad',
      email: 'sandra.vazquez@amd-mexico.com',
      telefono: '+52 656 222 3344',
      fechaIngreso: new Date('2023-03-20'),
      sucursalId: sucursalJuarez.id,
      activo: true,
    },
  });

  const empleado3 = await prisma.empleado.create({
    data: {
      codigo: 'EMP-003',
      nombre: 'Jorge',
      apellido: 'Hernández',
      puesto: 'Tornero',
      email: 'jorge.hernandez@amd-mexico.com',
      telefono: '+52 33 333 4455',
      fechaIngreso: new Date('2022-11-10'),
      sucursalId: sucursalGdl.id,
      activo: true,
    },
  });

  // ─── Cotizaciones ────────────────────────────────────────
  console.log('📋 Creando cotizaciones...');
  const cotizacion1 = await prisma.cotizacion.create({
    data: {
      folio: 'COT-2026-0001',
      clienteId: cliente1.id,
      sucursalId: sucursalJuarez.id,
      creadoPor: vendedor.id,
      fecha: new Date('2026-09-01'),
      validez: 30,
      moneda: TipoCambio.MXN,
      subtotal: 15000,
      iva: 2400,
      total: 17400,
      estatus: EstatusCotizacion.CONVERTIDA,
      notas: 'Cotización para maquinado de soportes estructurales',
      detalles: {
        create: [
          {
            piezaNombre: 'Soporte estructural 40x60',
            piezaDescripcion: 'Soporte principal de acero inoxidable',
            cantidad: 50,
            unidad: 'PZ',
            precioUnitario: 200,
            subtotal: 10000,
            tiempoEstimado: 2.5,
            procesoRequerido: 'CNC',
          },
          {
            piezaNombre: 'Eje de transmisión',
            piezaDescripcion: 'Eje cilíndrico pulido',
            cantidad: 25,
            unidad: 'PZ',
            precioUnitario: 200,
            subtotal: 5000,
            tiempoEstimado: 1.5,
            procesoRequerido: 'Torno',
          },
        ],
      },
    },
  });

  const cotizacion2 = await prisma.cotizacion.create({
    data: {
      folio: 'COT-2026-0002',
      clienteId: cliente2.id,
      sucursalId: sucursalGdl.id,
      creadoPor: vendedor.id,
      fecha: new Date('2026-09-05'),
      validez: 30,
      moneda: TipoCambio.MXN,
      subtotal: 28000,
      iva: 4480,
      total: 32480,
      estatus: EstatusCotizacion.ENVIADA,
      notas: 'Componentes aeroespaciales de alta precisión',
      detalles: {
        create: [
          {
            piezaNombre: 'Carcasa de turbina',
            piezaDescripcion: 'Carcasa para turbina aeroespacial',
            cantidad: 10,
            unidad: 'PZ',
            precioUnitario: 2000,
            subtotal: 20000,
            tiempoEstimado: 8,
            procesoRequerido: 'CNC 5 ejes',
          },
          {
            piezaNombre: 'Impulsor',
            piezaDescripcion: 'Impulsor de aluminio',
            cantidad: 10,
            unidad: 'PZ',
            precioUnitario: 800,
            subtotal: 8000,
            tiempoEstimado: 4,
            procesoRequerido: 'CNC',
          },
        ],
      },
    },
  });

  const cotizacion3 = await prisma.cotizacion.create({
    data: {
      folio: 'COT-2026-0003',
      clienteId: cliente3.id,
      sucursalId: sucursalElPaso.id,
      creadoPor: vendedor.id,
      fecha: new Date('2026-09-10'),
      validez: 30,
      moneda: TipoCambio.USD,
      subtotal: 45000,
      iva: 0,
      total: 45000,
      estatus: EstatusCotizacion.BORRADOR,
      notas: 'Automotive parts for El Paso facility',
      detalles: {
        create: [
          {
            piezaNombre: 'Bracket de montaje',
            piezaDescripcion: 'Bracket de montaje automotriz',
            cantidad: 500,
            unidad: 'PZ',
            precioUnitario: 50,
            subtotal: 25000,
            tiempoEstimado: 1,
            procesoRequerido: 'CNC',
          },
          {
            piezaNombre: 'Cubierta de plástico',
            piezaDescripcion: 'Cubierta plástica para interior',
            cantidad: 500,
            unidad: 'PZ',
            precioUnitario: 40,
            subtotal: 20000,
            tiempoEstimado: 0.5,
            procesoRequerido: 'Inyección',
          },
        ],
      },
    },
  });

  const cotizacion4 = await prisma.cotizacion.create({
    data: {
      folio: 'COT-2026-0004',
      clienteId: cliente4.id,
      sucursalId: sucursalGdl.id,
      creadoPor: vendedor.id,
      fecha: new Date('2026-09-12'),
      validez: 30,
      moneda: TipoCambio.MXN,
      subtotal: 8500,
      iva: 1360,
      total: 9860,
      estatus: EstatusCotizacion.ACEPTADA,
      notas: 'Componentes electrónicos para control industrial',
      detalles: {
        create: [
          {
            piezaNombre: 'Carcasa de control',
            piezaDescripcion: 'Carcasa para módulo de control',
            cantidad: 100,
            unidad: 'PZ',
            precioUnitario: 60,
            subtotal: 6000,
            tiempoEstimado: 1,
            procesoRequerido: 'Inyección',
          },
          {
            piezaNombre: 'Placa de montaje',
            piezaDescripcion: 'Placa de montaje para PCB',
            cantidad: 100,
            unidad: 'PZ',
            precioUnitario: 25,
            subtotal: 2500,
            tiempoEstimado: 0.5,
            procesoRequerido: 'CNC',
          },
        ],
      },
    },
  });

  const cotizacion5 = await prisma.cotizacion.create({
    data: {
      folio: 'COT-2026-0005',
      clienteId: cliente1.id,
      sucursalId: sucursalJuarez.id,
      creadoPor: vendedor.id,
      fecha: new Date('2026-09-15'),
      validez: 30,
      moneda: TipoCambio.MXN,
      subtotal: 12000,
      iva: 1920,
      total: 13920,
      estatus: EstatusCotizacion.RECHAZADA,
      notas: 'Cotización rechazada por precio',
      detalles: {
        create: [
          {
            piezaNombre: 'Engranaje cónico',
            piezaDescripcion: 'Engranaje cónico de acero',
            cantidad: 20,
            unidad: 'PZ',
            precioUnitario: 600,
            subtotal: 12000,
            tiempoEstimado: 3,
            procesoRequerido: 'CNC',
          },
        ],
      },
    },
  });

  // ─── Órdenes de Compra ──────────────────────────────────
  console.log('🛒 Creando órdenes de compra...');
  const oc1 = await prisma.ordenCompra.create({
    data: {
      folio: 'OC-2026-0001',
      cotizacionId: cotizacion1.id,
      clienteId: cliente1.id,
      sucursalId: sucursalJuarez.id,
      creadoPor: compras.id,
      fecha: new Date('2026-09-02'),
      fechaEntrega: new Date('2026-09-10'),
      moneda: TipoCambio.MXN,
      subtotal: 8000,
      iva: 1280,
      total: 9280,
      estatus: EstatusPO.COMPLETADA,
      condicionesPago: '30 días',
      notas: 'Orden de compra para materiales de soportes',
      proveedores: {
        create: [
          {
            proveedorId: proveedor1.id,
            cantidad: 100,
            precioUnitario: 45.50,
            estatus: 'completado',
          },
        ],
      },
    },
  });

  const oc2 = await prisma.ordenCompra.create({
    data: {
      folio: 'OC-2026-0002',
      cotizacionId: cotizacion2.id,
      clienteId: cliente2.id,
      sucursalId: sucursalGdl.id,
      creadoPor: compras.id,
      fecha: new Date('2026-09-06'),
      fechaEntrega: new Date('2026-09-15'),
      moneda: TipoCambio.MXN,
      subtotal: 15000,
      iva: 2400,
      total: 17400,
      estatus: EstatusPO.EN_PRODUCCION,
      condicionesPago: '45 días',
      notas: 'Materiales para componentes aeroespaciales',
      proveedores: {
        create: [
          {
            proveedorId: proveedor1.id,
            cantidad: 200,
            precioUnitario: 85,
            estatus: 'en_produccion',
          },
        ],
      },
    },
  });

  // ─── Órdenes de Trabajo ──────────────────────────────────
  console.log('🔧 Creando órdenes de trabajo...');
  const ot1 = await prisma.ordenTrabajo.create({
    data: {
      folio: 'OT-2026-0001',
      poId: oc1.id,
      piezaNombre: 'Soporte estructural 40x60',
      piezaDescripcion: 'Soporte principal de acero inoxidable',
      cantidad: 50,
      unidad: 'PZ',
      fechaInicio: new Date('2026-09-03'),
      fechaFinEstimada: new Date('2026-09-20'),
      fechaFinReal: new Date('2026-09-18'),
      estatus: EstatusWO.COMPLETADA,
      prioridad: Prioridad.ALTA,
      notas: 'OT completada a tiempo',
      creadoPor: produccion.id,
      sucursalId: sucursalJuarez.id,
      cotizacionId: cotizacion1.id,
      responsableId: operador.id,
      partes: {
        create: [
          {
            numeroParte: 'OT-2026-0001-P001',
            piezaNombre: 'Soporte estructural 40x60',
            descripcion: 'Soporte principal de acero inoxidable',
            cantidad: 50,
            unidad: 'PZ',
            estatus: EstatusParteOT.APROBADA,
            maquinaId: maquina1.id,
            operadorId: operador.id,
            materialId: material1.id,
          },
          {
            numeroParte: 'OT-2026-0001-P002',
            piezaNombre: 'Eje de transmisión',
            descripcion: 'Eje cilíndrico pulido',
            cantidad: 25,
            unidad: 'PZ',
            estatus: EstatusParteOT.APROBADA,
            maquinaId: maquina2.id,
            operadorId: operador.id,
            materialId: material2.id,
          },
        ],
      },
      operaciones: {
        create: [
          {
            secuencia: 1,
            proceso: 'CNC - Fresado',
            maquinaId: maquina1.id,
            operadorId: operador.id,
            tiempoEstimado: 2.5,
            tiempoReal: 2.3,
            estatus: EstatusOperacion.COMPLETADA,
          },
          {
            secuencia: 2,
            proceso: 'CNC - Taladrado',
            maquinaId: maquina1.id,
            operadorId: operador.id,
            tiempoEstimado: 1,
            tiempoReal: 0.9,
            estatus: EstatusOperacion.COMPLETADA,
          },
        ],
      },
    },
  });

  // Crear inspecciones después de que la OT exista
  await prisma.controlCalidad.create({
    data: {
      operacionId: (await prisma.operacion.findFirst({ where: { woId: ot1.id, secuencia: 1 } }))?.id || '',
      woId: ot1.id,
      inspectorId: calidad.id,
      fecha: new Date('2026-09-18'),
      resultado: EstatusCalidad.APROBADO,
      observaciones: 'Dentro de tolerancia',
    },
  });

  const ot2 = await prisma.ordenTrabajo.create({
    data: {
      folio: 'OT-2026-0002',
      poId: oc2.id,
      piezaNombre: 'Carcasa de turbina',
      piezaDescripcion: 'Carcasa para turbina aeroespacial',
      cantidad: 10,
      unidad: 'PZ',
      fechaInicio: new Date('2026-09-08'),
      fechaFinEstimada: new Date('2026-09-25'),
      estatus: EstatusWO.EN_PRODUCCION,
      prioridad: Prioridad.URGENTE,
      notas: 'OT en producción, prioridad alta',
      creadoPor: produccion.id,
      sucursalId: sucursalGdl.id,
      cotizacionId: cotizacion2.id,
      responsableId: operador.id,
      partes: {
        create: [
          {
            numeroParte: 'OT-2026-0002-P001',
            piezaNombre: 'Carcasa de turbina',
            descripcion: 'Carcasa para turbina aeroespacial',
            cantidad: 10,
            unidad: 'PZ',
            estatus: EstatusParteOT.EN_PROCESO,
            maquinaId: maquina1.id,
            operadorId: operador.id,
            materialId: material2.id,
          },
          {
            numeroParte: 'OT-2026-0002-P002',
            piezaNombre: 'Impulsor',
            descripcion: 'Impulsor de aluminio',
            cantidad: 10,
            unidad: 'PZ',
            estatus: EstatusParteOT.PENDIENTE,
            maquinaId: maquina2.id,
            operadorId: operador.id,
            materialId: material2.id,
          },
        ],
      },
      operaciones: {
        create: [
          {
            secuencia: 1,
            proceso: 'CNC 5 ejes - Fresado',
            maquinaId: maquina1.id,
            operadorId: operador.id,
            tiempoEstimado: 8,
            estatus: EstatusOperacion.EN_PROCESO,
          },
          {
            secuencia: 2,
            proceso: 'CNC - Taladrado',
            maquinaId: maquina1.id,
            operadorId: operador.id,
            tiempoEstimado: 2,
            estatus: EstatusOperacion.PENDIENTE,
          },
        ],
      },
    },
  });

  const ot3 = await prisma.ordenTrabajo.create({
    data: {
      folio: 'OT-2026-0003',
      piezaNombre: 'Carcasa de control',
      piezaDescripcion: 'Carcasa para módulo de control',
      cantidad: 100,
      unidad: 'PZ',
      fechaInicio: new Date('2026-09-14'),
      fechaFinEstimada: new Date('2026-09-22'),
      estatus: EstatusWO.PENDIENTE,
      prioridad: Prioridad.MEDIA,
      notas: 'OT pendiente de inicio',
      creadoPor: produccion.id,
      sucursalId: sucursalGdl.id,
      cotizacionId: cotizacion4.id,
      responsableId: operador.id,
      partes: {
        create: [
          {
            numeroParte: 'OT-2026-0003-P001',
            piezaNombre: 'Carcasa de control',
            descripcion: 'Carcasa para módulo de control',
            cantidad: 100,
            unidad: 'PZ',
            estatus: EstatusParteOT.PENDIENTE,
            maquinaId: maquina4.id,
            operadorId: operador.id,
            materialId: material3.id,
          },
        ],
      },
    },
  });

  // ─── Facturas ────────────────────────────────────────────
  console.log('🧾 Creando facturas...');
  const factura1 = await prisma.factura.create({
    data: {
      folio: 'FAC-2026-0001',
      otId: ot1.id,
      clienteId: cliente1.id,
      sucursalId: sucursalJuarez.id,
      moneda: TipoCambio.MXN,
      subtotal: 15000,
      iva: 2400,
      total: 17400,
      estatus: EstatusFactura.FACTURADA,
      fechaFactura: new Date('2026-09-19'),
      notas: 'Factura por OT-2026-0001',
      creadoPor: admin.id,
    },
  });

  const factura2 = await prisma.factura.create({
    data: {
      folio: 'FAC-2026-0002',
      otId: ot2.id,
      clienteId: cliente2.id,
      sucursalId: sucursalGdl.id,
      moneda: TipoCambio.MXN,
      subtotal: 28000,
      iva: 4480,
      total: 32480,
      estatus: EstatusFactura.PENDIENTE,
      notas: 'Factura pendiente de OT-2026-0002',
      creadoPor: admin.id,
    },
  });

  // ─── Ingeniería ──────────────────────────────────────────
  console.log('📐 Creando proyectos de ingeniería...')
  const proyecto1 = await prisma.ingenieriaProyecto.create({
    data: {
      codigo: 'ING-2026-001',
      clienteId: cliente1.id,
      sucursalId: sucursalJuarez.id,
      nombre: 'Rediseño de soporte estructural',
      descripcion: 'Rediseño para optimizar peso y resistencia',
      status: EnumIngenieriaEstatus.EN_PRODUCCION,
      fechaInicio: new Date('2026-08-15'),
      fechaEstimada: new Date('2026-09-30'),
      creadoPor: admin.id,
      notas: 'Proyecto de mejora continua',
      procesos: {
        create: [
          {
            parteNumero: 'SOP-001',
            proceso: 'CNC - Fresado',
            tiempoEstimado: 2.5,
            maquinaId: maquina1.id,
            operadorId: operador.id,
            costoEstimado: 500,
            secuencia: 1,
            estatus: 'EN_PRODUCCION',
          },
          {
            parteNumero: 'SOP-001',
            proceso: 'CNC - Taladrado',
            tiempoEstimado: 1,
            maquinaId: maquina1.id,
            operadorId: operador.id,
            costoEstimado: 200,
            secuencia: 2,
            estatus: 'PENDIENTE',
          },
        ],
      },
      planos: {
        create: [
          {
            parteNumero: 'SOP-001',
            version: 1,
            archivoUrl: '/planos/SOP-001_v1.pdf',
            uploadedBy: admin.id,
            estatus: 'ACTIVO',
          },
        ],
      },
    },
  });

  const proyecto2 = await prisma.ingenieriaProyecto.create({
    data: {
      codigo: 'ING-2026-002',
      clienteId: cliente2.id,
      sucursalId: sucursalGdl.id,
      nombre: 'Componentes aeroespaciales',
      descripcion: 'Nuevos componentes para turbina',
      status: EnumIngenieriaEstatus.LISTO_COTIZAR,
      fechaInicio: new Date('2026-09-01'),
      fechaEstimada: new Date('2026-10-15'),
      creadoPor: admin.id,
      notas: 'Proyecto aeroespacial',
      procesos: {
        create: [
          {
            parteNumero: 'TUR-001',
            proceso: 'CNC 5 ejes',
            tiempoEstimado: 8,
            maquinaId: maquina1.id,
            operadorId: operador.id,
            costoEstimado: 1500,
            secuencia: 1,
            estatus: 'PENDIENTE',
          },
        ],
      },
      planos: {
        create: [
          {
            parteNumero: 'TUR-001',
            version: 1,
            archivoUrl: '/planos/TUR-001_v1.pdf',
            uploadedBy: admin.id,
            estatus: 'ACTIVO',
          },
        ],
      },
    },
  });

  // ─── Movimientos de Inventario ───────────────────────────
  console.log('📊 Creando movimientos de inventario...');
  await prisma.movimientoInventario.create({
    data: {
      materialId: material1.id,
      tipo: 'ENTRADA',
      cantidad: 500,
      stockAnterior: 0,
      stockResultante: 500,
      referencia: 'OC-2026-0001',
      notas: 'Entrada por orden de compra',
      creadoPor: compras.id,
    },
  });

  await prisma.movimientoInventario.create({
    data: {
      materialId: material2.id,
      tipo: 'ENTRADA',
      cantidad: 300,
      stockAnterior: 0,
      stockResultante: 300,
      referencia: 'OC-2026-0002',
      notas: 'Entrada por orden de compra',
      creadoPor: compras.id,
    },
  });

  await prisma.movimientoInventario.create({
    data: {
      materialId: material1.id,
      tipo: 'SALIDA',
      cantidad: 50,
      stockAnterior: 500,
      stockResultante: 450,
      referencia: 'OT-2026-0001',
      notas: 'Salida por orden de trabajo',
      creadoPor: produccion.id,
    },
  });

  await prisma.movimientoInventario.create({
    data: {
      materialId: material3.id,
      tipo: 'ENTRADA',
      cantidad: 200,
      stockAnterior: 0,
      stockResultante: 200,
      referencia: 'OC-2026-0003',
      notas: 'Entrada por orden de compra',
      creadoPor: compras.id,
    },
  });

  // ─── Transferencias ──────────────────────────────────────
  console.log('🚛 Creando transferencias...');
  await prisma.transferencia.create({
    data: {
      folio: 'TRF-2026-0001',
      origenId: sucursalJuarez.id,
      destinoId: sucursalGdl.id,
      fecha: new Date('2026-09-10'),
      estatus: 'COMPLETADA',
      notas: 'Transferencia de materiales entre sucursales',
    },
  });

  // ─── Configuración ───────────────────────────────────────
  console.log('⚙️ Creando configuración...');
  await prisma.configuracion.create({
    data: {
      clave: 'empresa.nombre',
      valor: 'AMD México Operations ERP',
      descripcion: 'Nombre de la empresa',
    },
  });

  await prisma.configuracion.create({
    data: {
      clave: 'empresa.moneda_base',
      valor: 'MXN',
      descripcion: 'Moneda base de la empresa',
    },
  });

  await prisma.configuracion.create({
    data: {
      clave: 'produccion.horas_dia',
      valor: '8',
      descripcion: 'Horas de producción por día',
    },
  });

  await prisma.configuracion.create({
    data: {
      clave: 'calidad.tolerancia_default',
      valor: '0.05',
      descripcion: 'Tolerancia dimensional por defecto (mm)',
    },
  });

  console.log('✅ Seed completo ejecutado exitosamente!');
  console.log('');
  console.log('📊 Resumen de datos creados:');
  console.log('  • 7 usuarios (admin, gerente, ventas, producción, calidad, compras, operador)');
  console.log('  • 3 sucursales (Juárez, Guadalajara, El Paso)');
  console.log('  • 4 clientes');
  console.log('  • 3 proveedores');
  console.log('  • 5 materiales');
  console.log('  • 4 máquinas');
  console.log('  • 3 empleados');
  console.log('  • 5 cotizaciones (BORRADOR, ENVIADA, ACEPTADA, CONVERTIDA, RECHAZADA)');
  console.log('  • 2 órdenes de compra');
  console.log('  • 3 órdenes de trabajo (PENDIENTE, EN_PRODUCCION, COMPLETADA)');
  console.log('  • 2 facturas');
  console.log('  • 2 proyectos de ingeniería');
  console.log('  • 4 movimientos de inventario');
  console.log('  • 1 transferencia');
  console.log('  • 4 configuraciones');
  console.log('');
  console.log('🔑 Credenciales de acceso:');
  console.log('  Email: admin@amd-mexico.com');
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
