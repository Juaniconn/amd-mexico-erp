export type EnumIngenieriaEstatus = 'PENDIENTE_PLANOS' | 'EN_DISENO' | 'LISTO_COTIZAR' | 'COTIZADO' | 'EN_PRODUCCION' | 'LIBERADO' | 'OBSOLETO';
export type EstatusParteOT = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'EN_INSPECCION' | 'APROBADA' | 'RECHAZADA' | 'PAUSADA' | 'EN_ESPERA_MATERIAL';

export interface Cliente {
  id: string; codigo: string; razonSocial: string; rfc?: string; contacto?: string;
  email?: string; telefono?: string; direccion?: string; ciudad?: string;
  estado?: string; activo?: boolean; createdAt: string; updatedAt?: string;
  _count?: { cotizaciones: number; ordenesCompra: number };
}

export interface Cotizacion {
  id: string; folio: string; clienteId: string; moneda: string; subtotal: number;
  iva: number; total: number; estatus: string; notas?: string; fecha: string;
  validez: number; tipoCambio?: number; createdAt: string;
}

export interface DetalleCotizacion {
  id: string; piezaNombre: string; piezaDescripcion?: string; cantidad: number;
  unidad: string; precioUnitario: number; subtotal: number; procesoRequerido?: string;
}

export interface CotizacionWithParts extends Cotizacion {
  cliente?: { razonSocial: string; rfc?: string; ciudad?: string; estado?: string };
  creador?: { nombre: string; apellido: string };
  detalles?: DetalleCotizacion[];
}

export interface Material {
  id: string; codigo: string; descripcion: string; tipo: string; unidad: string;
  stockActual?: number; stockMinimo?: number; costoUnitario?: number; moneda: string;
  proveedorId?: string; notas?: string; createdAt: string;
}

export interface Proveedor {
  id: string; codigo: string; razonSocial: string; rfc?: string; contacto?: string;
  email?: string; telefono?: string; direccion?: string; ciudad?: string;
  estado?: string; activo?: boolean; monedaPref?: string; diasCredito?: number;
  notas?: string; createdAt: string; _count?: { ordenesCompraProveedor: number };
}

export interface ParteOT {
  id: string; otId: string; numeroParte: string; piezaNombre: string;
  descripcion?: string; cantidad: number; unidad: string; estatus: string;
  operadorId?: string; operador?: { id: string; nombre: string; apellido: string };
  maquinaId?: string; maquina?: { id: string; codigo: string; nombre: string };
  createdAt: string; updatedAt: string; notas?: string;
}

export interface IngenieriaProyecto {
  id: string; codigo: string; nombre: string; clienteId: string;
  status: EnumIngenieriaEstatus; descripcion?: string; notas?: string;
  fechaInicio?: string; fechaEstimada?: string; createdAt: string;
  cliente?: { razonSocial: string };
  planos?: any[]; procesos?: any[];
  _count?: { planos: number; procesos: number };
}

export interface IngenieriaStats {
  activos: number; enDiseno: number; listosCotizar: number; liberados: number;
}
