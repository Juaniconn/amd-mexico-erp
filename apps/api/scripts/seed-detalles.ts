import { PrismaClient, EstatusOperacion, EstatusParteOT } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Realistic data pools ────────────────────────────────────
const PIEZAS = [
  { nombre: 'Eje principal', descripcion: 'Eje de acero inoxidable 304 para transmisión', unidad: 'pieza', proceso: 'Torneado CNC', precioBase: 2500 },
  { nombre: 'Carcasa motor', descripcion: 'Carcasa de aluminio fundido para motor eléctrico', unidad: 'pieza', proceso: 'Fundición y maquinado', precioBase: 4800 },
  { nombre: 'Engranaje recto', descripcion: 'Engranaje recto módulo 2, 20 dientes, acero 1045', unidad: 'pieza', proceso: 'Fresado y rectificado', precioBase: 1200 },
  { nombre: 'Soporte estructural', descripcion: 'Soporte de acero A-36 para ensamble', unidad: 'pieza', proceso: 'Corte y soldadura', precioBase: 850 },
  { nombre: 'Rodamiento SKF 6205', descripcion: 'Rodamiento rígido de bolas 25x52x15', unidad: 'pieza', proceso: 'Ensamble', precioBase: 320 },
  { nombre: 'Turbina hidráulica', descripcion: 'Turbina de bronce para bomba centrífuga', unidad: 'pieza', proceso: 'Fundición y balanceo', precioBase: 7500 },
  { nombre: 'Válvula de control', descripcion: 'Válvula globo 4" clase 300, acero forjado', unidad: 'pieza', proceso: 'Maquinado y pruebas', precioBase: 3200 },
  { nombre: 'Brida ciega', descripcion: 'Brida ciega RF 6" clase 150, acero al carbón', unidad: 'pieza', proceso: 'Corte y maquinado', precioBase: 680 },
  { nombre: 'Eje de transmisión', descripcion: 'Eje de acero 4140 templado y revenido', unidad: 'pieza', proceso: 'Torneado y rectificado', precioBase: 1850 },
  { nombre: 'Impulsor centrífugo', descripcion: 'Impulsor de acero inoxidable 316, 6 álabes', unidad: 'pieza', proceso: 'Fundición y maquinado', precioBase: 5400 },
  { nombre: 'Acople flexible', descripcion: 'Acople de engranes doble, tamaño 5', unidad: 'pieza', proceso: 'Maquinado', precioBase: 2100 },
  { nombre: 'Sello mecánico', descripcion: 'Sello mecánico tipo cartucho, carburo de silicio', unidad: 'pieza', proceso: 'Ensamble', precioBase: 950 },
  { nombre: 'Camisa de eje', descripcion: 'Camisa protectora de acero inoxidable 316L', unidad: 'pieza', proceso: 'Torneado', precioBase: 780 },
  { nombre: 'Volante de inercia', descripcion: 'Volante de hierro fundido, 400mm diámetro', unidad: 'pieza', proceso: 'Fundición y balanceo', precioBase: 3600 },
  { nombre: 'Piñón cónico', descripcion: 'Piñón recto relación 3:1, acero aleado', unidad: 'pieza', proceso: 'Fresado y cementado', precioBase: 2900 },
  { nombre: 'Tapa de inspección', descripcion: 'Tapa circular 300mm, acero inoxidable', unidad: 'pieza', proceso: 'Corte láser y doblado', precioBase: 420 },
  { nombre: 'Junta de expansión', descripcion: 'Junta metálica 8" para tubería', unidad: 'pieza', proceso: 'Formado y soldadura', precioBase: 1650 },
  { nombre: 'Chumacera', descripcion: 'Chumacera tipo SNH con rodamiento 6310', unidad: 'pieza', proceso: 'Fundición y maquinado', precioBase: 1100 },
  { nombre: 'Reductor de velocidad', descripcion: 'Reductor cicloidal relación 25:1', unidad: 'pieza', proceso: 'Ensamble y pruebas', precioBase: 12500 },
  { nombre: 'Polea dentada', descripcion: 'Polea HTD 5M, 60 dientes, aluminio', unidad: 'pieza', proceso: 'Torneado y fresado', precioBase: 580 },
];

const OPERACIONES = [
  { proceso: 'Torneado CNC', tiempoBase: 2.5 },
  { proceso: 'Torneado CNC', tiempoBase: 1.5 },
  { proceso: 'Fresado CNC', tiempoBase: 3.0 },
  { proceso: 'Taladro CNC', tiempoBase: 0.8 },
  { proceso: 'Rectificado', tiempoBase: 1.2 },
  { proceso: 'Corte láser CO2', tiempoBase: 0.5 },
  { proceso: 'Soldadura TIG', tiempoBase: 2.0 },
  { proceso: 'Soldadura MIG', tiempoBase: 1.5 },
  { proceso: 'Ensamble', tiempoBase: 1.0 },
  { proceso: 'Pruebas no destructivas', tiempoBase: 0.5 },
  { proceso: 'Temple y revenido', tiempoBase: 4.0 },
  { proceso: 'Acabado superficial', tiempoBase: 1.5 },
  { proceso: 'Balanceo', tiempoBase: 0.8 },
  { proceso: 'Control de calidad', tiempoBase: 0.5 },
  { proceso: 'Torneado CNC', tiempoBase: 2.0 },
];

// ─── Helpers ─────────────────────────────────────────────────
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals: number = 2): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Main seed logic ─────────────────────────────────────────
async function seedDetalles() {
  console.log('🌱 Iniciando seed de detalles, operaciones y partes...\n');

  // ── 1. Seed detalles_cotizacion ────────────────────────────
  console.log('📋 Procesando cotizaciones...');
  const cotizaciones = await prisma.cotizacion.findMany({
    include: { detalles: true },
  });

  let detallesCreados = 0;
  let cotizacionesActualizadas = 0;

  for (const cot of cotizaciones) {
    // Idempotency: skip if already has detalles
    if (cot.detalles.length > 0) {
      console.log(`  ⏭️  ${cot.folio} ya tiene ${cot.detalles.length} detalle(s), omitiendo`);
      continue;
    }

    const numDetalles = randomInt(2, 4);
    const piezasSeleccionadas = shuffleAndPick(PIEZAS, numDetalles);

    let subtotalCot = 0;

    for (const pieza of piezasSeleccionadas) {
      const cantidad = randomInt(1, 20);
      const variacionPrecio = randomDecimal(0.85, 1.15);
      const precioUnitario = parseFloat((pieza.precioBase * variacionPrecio).toFixed(2));
      const subtotal = parseFloat((cantidad * precioUnitario).toFixed(2));
      const tiempoEstimado = parseFloat((pieza.precioBase * 0.001 * randomDecimal(0.8, 1.2)).toFixed(2));

      subtotalCot += subtotal;

      await prisma.detalleCotizacion.create({
        data: {
          cotizacionId: cot.id,
          piezaNombre: pieza.nombre,
          piezaDescripcion: pieza.descripcion,
          cantidad,
          unidad: pieza.unidad,
          precioUnitario,
          subtotal,
          tiempoEstimado,
          procesoRequerido: pieza.proceso,
        },
      });
      detallesCreados++;
    }

    // Update cotizacion totals
    const iva = parseFloat((subtotalCot * 0.16).toFixed(2));
    const total = parseFloat((subtotalCot + iva).toFixed(2));

    await prisma.cotizacion.update({
      where: { id: cot.id },
      data: { subtotal: subtotalCot, iva, total },
    });
    cotizacionesActualizadas++;

    console.log(`  ✅ ${cot.folio}: ${numDetalles} detalle(s), subtotal=$${subtotalCot.toFixed(2)}, total=$${total.toFixed(2)}`);
  }

  console.log(`\n📊 Detalles cotización: ${detallesCreados} creados, ${cotizacionesActualizadas} cotizaciones actualizadas\n`);

  // ── 2. Seed operaciones ────────────────────────────────────
  console.log('⚙️  Procesando órdenes de trabajo...');
  const ordenesTrabajo = await prisma.ordenTrabajo.findMany({
    include: { operaciones: true, partes: true },
  });

  let operacionesCreadas = 0;
  let partesCreadas = 0;

  for (const ot of ordenesTrabajo) {
    // Idempotency: skip if already has operaciones
    if (ot.operaciones.length > 0) {
      console.log(`  ⏭️  ${ot.folio} ya tiene ${ot.operaciones.length} operación(es), omitiendo`);
      continue;
    }

    const numOperaciones = randomInt(2, 3);
    const opsSeleccionadas = shuffleAndPick(OPERACIONES, numOperaciones);

    for (let i = 0; i < opsSeleccionadas.length; i++) {
      const op = opsSeleccionadas[i];
      const tiempoEstimado = parseFloat((op.tiempoBase * randomDecimal(0.8, 1.3)).toFixed(2));

      // Determine status based on position (earlier ops more likely completed)
      let estatus: EstatusOperacion;
      if (i === 0) {
        estatus = pickRandom([EstatusOperacion.COMPLETADA, EstatusOperacion.EN_PROCESO]);
      } else if (i === 1) {
        estatus = pickRandom([EstatusOperacion.EN_PROCESO, EstatusOperacion.PENDIENTE]);
      } else {
        estatus = EstatusOperacion.PENDIENTE;
      }

      const tiempoReal = estatus === EstatusOperacion.COMPLETADA
        ? parseFloat((tiempoEstimado * randomDecimal(0.9, 1.15)).toFixed(2))
        : null;

      await prisma.operacion.create({
        data: {
          woId: ot.id,
          secuencia: i + 1,
          proceso: op.proceso,
          tiempoEstimado,
          tiempoReal,
          estatus,
        },
      });
      operacionesCreadas++;
    }

    // ── 3. Seed partes_ot ────────────────────────────────────
    // Create 1-3 parts per OT
    const numPartes = randomInt(1, 3);
    const partesSeleccionadas = shuffleAndPick(PIEZAS, numPartes);

    for (const pieza of partesSeleccionadas) {
      const cantidad = randomInt(1, 10);
      const numeroParte = `P-${ot.folio.split('-').slice(1).join('-')}-${randomInt(100, 999)}`;

      // Status based on OT status
      let estatusParte: EstatusParteOT;
      if (ot.estatus === 'COMPLETADA') {
        estatusParte = EstatusParteOT.COMPLETADA;
      } else if (ot.estatus === 'EN_PRODUCCION') {
        estatusParte = pickRandom([EstatusParteOT.EN_PROCESO, EstatusParteOT.PENDIENTE, EstatusParteOT.EN_INSPECCION]);
      } else if (ot.estatus === 'CALIDAD') {
        estatusParte = pickRandom([EstatusParteOT.EN_INSPECCION, EstatusParteOT.APROBADA]);
      } else {
        estatusParte = EstatusParteOT.PENDIENTE;
      }

      await prisma.parteOT.create({
        data: {
          otId: ot.id,
          numeroParte,
          piezaNombre: pieza.nombre,
          descripcion: pieza.descripcion,
          cantidad,
          unidad: pieza.unidad,
          estatus: estatusParte,
        },
      });
      partesCreadas++;
    }

    console.log(`  ✅ ${ot.folio}: ${numOperaciones} operación(es), ${numPartes} parte(s)`);
  }

  console.log(`\n📊 Operaciones: ${operacionesCreadas} creadas`);
  console.log(`📊 Partes OT: ${partesCreadas} creadas`);

  // ── Summary ─────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🎉 Seed de detalles completado exitosamente');
  console.log('═══════════════════════════════════════════════════');
  console.log(`   Cotizaciones procesadas: ${cotizaciones.length}`);
  console.log(`   Detalles creados:        ${detallesCreados}`);
  console.log(`   OTs procesadas:          ${ordenesTrabajo.length}`);
  console.log(`   Operaciones creadas:     ${operacionesCreadas}`);
  console.log(`   Partes OT creadas:       ${partesCreadas}`);
  console.log('═══════════════════════════════════════════════════');
}

seedDetalles()
  .catch((e: unknown) => {
    console.error('❌ Error en seed-detalles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
