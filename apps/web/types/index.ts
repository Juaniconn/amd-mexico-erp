export interface User {
  id: string;
  email: string;
  nombre?: string;
  apellido?: string;
  username?: string;
  role: string;
  activo?: boolean;
  ultimoAcceso?: string;
  sucursalId?: string;
  createdAt?: string;
  updatedAt?: string;
  sucursal?: {
    id: string;
    codigo: string;
    nombre: string;
    ciudad?: string;
  };
}

export interface Cliente {
  id: string;
  codigo: string;
  razonSocial: string;
  rfc?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  pais?: string;
  creditoLimite?: number | string;
  diasCredito?: number;
  monedaPref?: string;
  notas?: string;
  activo?: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cotizaciones: number;
    ordenesCompra: number;
  };
}

export interface Sucursal {
  id: string;
  codigo: string;
  nombre: string;
  ciudad?: string;
  estado?: string;
  pais?: string;
  direccion?: string;
  telefono?: string;
  monedaDefault?: string;
  esPrincipal?: boolean;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cotizacion {
  id: string;
  folio: string;
  clienteId: string;
  sucursalId?: string;
  fecha: string;
  validez: number;
  moneda: string;
  tipoCambio?: number | string | null;
  subtotal: number;
  iva: number;
  total: number;
  estatus: string;
  notas?: string;
  createdAt: string;
}

export interface Proveedor {
  id: string;
  codigo: string;
  razonSocial: string;
  rfc?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  pais?: string;
  creditoLimite?: number | string;
  diasCredito?: number;
  monedaPref?: string;
  notas?: string;
  activo?: boolean;
  estatus?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    ordenesCompraProveedor: number;
  };
}

export interface OrdenCompraProveedor {
  id: string;
  proveedorId: string;
  proveedorNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

export type EstatusOrdenCompra = 'BORRADOR' | 'ENVIADA' | 'RECIBIDA' | 'CANCELADA';

export interface DetalleOrdenCompra {
  id?: string;
  material?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

export interface OrdenCompra {
  id: string;
  folio: string;
  cotizacionId?: string;
  clienteId: string;
  sucursalId?: string;
  razonSocial?: string;
  fecha: string;
  fechaEntrega?: string;
  moneda: string;
  subtotal: number;
  iva: number;
  impuestos?: number;
  total: number;
  estatus: string;
  condicionesPago?: string;
  notas?: string;
  proveedores?: OrdenCompraProveedor[];
  detalles?: DetalleOrdenCompra[];
  createdAt: string;
}

export interface Material {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  unidad: string;
  stockActual: number | string;
  stockMinimo: number | string;
  ubicacion?: string;
  precioUnitario?: number | string;
  activo: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    movimientos: number;
  };
}

export interface MovimientoMaterial {
  id: string;
  materialId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  documento?: string;
  notas?: string;
  usuarioId?: string;
  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  createdAt: string;
}

export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

// ─── Producción ──────────────────────────────────────────

export interface ParteOT {
  id: string;
  otId: string;
  numeroParte?: string;
  piezaNombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  estatus: EstatusParteOT;
  maquinaId?: string;
  operadorId?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  operador?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  maquina?: {
    id: string;
    codigo: string;
    nombre: string;
  };
}

export type EstatusParteOT =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'COMPLETADA'
  | 'EN_INSPECCION'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'PAUSADA'
  | 'EN_ESPERA_MATERIAL';

export type EstatusOperacion =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'COMPLETADA'
  | 'RECHAZADA';

export interface DetalleCotizacion {
  id: string;
  cotizacionId: string;
  numeroParte?: string;
  piezaNombre: string;
  piezaDescripcion?: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  subtotal: number;
  tiempoEstimado?: number;
  procesoRequerido?: string;
  archivoPlanoId?: string;
  notas?: string;
}

export interface CotizacionWithParts extends Cotizacion {
  detalles: DetalleCotizacion[];
  ordenesTrabajo?: OrdenTrabajo[];
  cliente?: {
    id: string;
    codigo: string;
    razonSocial: string;
    rfc?: string;
    ciudad?: string;
    estado?: string;
    contacto?: string;
    email?: string;
    telefono?: string;
    monedaPref?: string;
  };
  creador?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface OrdenTrabajo {
  id: string;
  folio: string;
  poId?: string;
  piezaNombre?: string;
  piezaDescripcion?: string;
  cantidad?: number;
  unidad?: string;
  fechaInicio?: string;
  fechaFinEstimada?: string;
  fechaFinReal?: string;
  estatus: string;
  prioridad: string;
  notas?: string;
  creadoPor?: string;
  sucursalId?: string;
  cotizacionId?: string;
  responsableId?: string;
  createdAt: string;
  updatedAt: string;
  responsable?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  cotizacion?: Cotizacion & { cliente: Cliente };
  po?: OrdenCompra;
  operaciones?: any[];
  partes?: ParteOT[];
  _count?: {
    operaciones: number;
    inspecciones: number;
    partes: number;
  };
}

// ─── Ingeniería / Diseño ─────────────────────────────────

export type EnumIngenieriaEstatus =
  | 'PENDIENTE_PLANOS'
  | 'EN_DISENO'
  | 'LISTO_COTIZAR'
  | 'COTIZADO'
  | 'EN_PRODUCCION'
  | 'LIBERADO'
  | 'OBSOLETO';

export interface IngenieriaProceso {
  id: string;
  proyectoId: string;
  parteNumero: string;
  proceso: string;
  tiempoEstimado?: number | null;
  maquinaId?: string | null;
  operadorId?: string | null;
  costoEstimado?: number | null;
  secuencia: number;
  notas?: string | null;
  estatus: string;
  createdAt: string;
  updatedAt: string;
  maquina?: {
    id: string;
    codigo: string;
    nombre: string;
    tipo?: string;
  };
  operador?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface IngenieriaPlano {
  id: string;
  proyectoId: string;
  parteNumero: string;
  version: number;
  archivoUrl: string;
  uploadedAt: string;
  uploadedBy?: string | null;
  estatus: string;
  createdAt: string;
  updatedAt: string;
  uploadedByUser?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface IngenieriaProyecto {
  id: string;
  codigo: string;
  clienteId: string;
  sucursalId?: string | null;
  nombre: string;
  descripcion?: string | null;
  status: EnumIngenieriaEstatus;
  fechaInicio?: string | null;
  fechaEstimada?: string | null;
  creadoPor?: string | null;
  notas?: string | null;
  createdAt: string;
  updatedAt: string;
  cliente?: {
    id: string;
    codigo: string;
    razonSocial: string;
    ciudad?: string;
    estado?: string;
  };
  sucursal?: {
    id: string;
    codigo: string;
    nombre: string;
  } | null;
  creador?: {
    id: string;
    nombre: string;
    apellido: string;
  } | null;
  procesos?: IngenieriaProceso[];
  planos?: IngenieriaPlano[];
  cotizaciones?: {
    id: string;
    folio: string;
    estatus: string;
    total: number;
  }[];
  _count?: {
    procesos: number;
    planos: number;
  };
}

export interface IngenieriaStats {
  activos: number;
  enDiseno: number;
  listosCotizar: number;
  liberados: number;
}

// ─── Facturación ──────────────────────────────────────────
export type EstatusFactura = 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'CANCELADA';

export interface DetalleFactura {
  id?: string;
  facturaId?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

export interface Factura {
  id: string;
  folio: string;
  clienteId: string;
  cliente?: { id: string; razonSocial: string; rfc?: string };
  fecha: string;
  fechaVencimiento?: string;
  moneda: string;
  tipoCambio?: number;
  subtotal: number;
  impuestos: number;
  iva?: number;
  total: number;
  estatus: EstatusFactura;
  notas?: string;
  creadoPor?: string;
  createdAt: string;
  updatedAt: string;
  detalles?: DetalleFactura[];
  otId?: string;
  ot?: { id: string; folio: string };
  sucursalId?: string;
  sucursal?: { id: string; nombre: string };
}
