import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const maquinas = [
  { codigo: 'VMC-01', nombre: 'Centro de Maquinado VMC 01', tipo: 'CNC', descripcion: 'Fresado CNC de 5 ejes', capacidad: '5 ejes' },
  { codigo: 'VMC-02', nombre: 'Centro de Maquinado VMC 02', tipo: 'CNC', descripcion: 'Fresado CNC de 3 ejes', capacidad: '3 ejes' },
  { codigo: 'VMC-03', nombre: 'Centro de Maquinado VMC 03', tipo: 'CNC', descripcion: 'Fresado CNC de 3 ejes', capacidad: '3 ejes' },
  { codigo: 'VMC-04', nombre: 'Centro de Maquinado VMC 04', tipo: 'CNC', descripcion: 'Fresado CNC de 3 ejes', capacidad: '3 ejes' },
  { codigo: 'VMC-05', nombre: 'Centro de Maquinado VMC 05', tipo: 'CNC', descripcion: 'Fresado CNC de 3 ejes', capacidad: '3 ejes' },
  { codigo: 'TNC-01', nombre: 'Torno CNC 01', tipo: 'CNC', descripcion: 'Torneado CNC', capacidad: '2 ejes' },
  { codigo: 'TNC-02', nombre: 'Torno CNC 02', tipo: 'CNC', descripcion: 'Torneado CNC', capacidad: '2 ejes' },
  { codigo: 'LSR-01', nombre: 'Corte Láser 01', tipo: 'LASER', descripcion: 'Corte láser de fibra', capacidad: '2kW' },
  { codigo: 'LSR-02', nombre: 'Corte Láser 02', tipo: 'LASER', descripcion: 'Corte láser CO2', capacidad: '4kW' },
  { codigo: 'PB-01', nombre: 'Prensa Dobladora 01', tipo: 'PRENSA', descripcion: 'Press Brake', capacidad: '100 ton' },
  { codigo: 'EDM-01', nombre: 'Wire EDM 01', tipo: 'EDM', descripcion: 'Erosionadora de hilo', capacidad: 'Hilo 0.25mm' },
  { codigo: 'FRM-01', nombre: 'Fresadora Manual 01', tipo: 'CONVENCIONAL', descripcion: 'Fresado convencional' },
  { codigo: 'FRM-02', nombre: 'Fresadora Manual 02', tipo: 'CONVENCIONAL', descripcion: 'Fresado convencional' },
  { codigo: 'FRM-03', nombre: 'Fresadora Manual 03', tipo: 'CONVENCIONAL', descripcion: 'Fresado convencional' },
  { codigo: 'RCT-01', nombre: 'Rectificadora de Superficies 01', tipo: 'RECTIFICADO', descripcion: 'Rectificado de superficies' },
  { codigo: 'INY-01', nombre: 'Inyección de Plástico 01', tipo: 'INYECCION', descripcion: 'Máquina de inyección', capacidad: '200 ton' },
  { codigo: 'RTR-01', nombre: 'Router CNC 01', tipo: 'CNC', descripcion: 'Router CNC para prototipos', capacidad: '3 ejes' },
];

async function main() {
  // Eliminar máquinas existentes
  await prisma.maquina.deleteMany({});

  for (const m of maquinas) {
    await prisma.maquina.create({
      data: {
        codigo: m.codigo,
        nombre: m.nombre,
        tipo: m.tipo,
        descripcion: m.descripcion,
        capacidad: m.capacidad,
        activo: true,
        estatus: 'ACTIVA',
      },
    });
  }

  console.log('✅ ' + maquinas.length + ' máquinas creadas exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
