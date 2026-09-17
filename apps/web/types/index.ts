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
  subtotal: number;
  iva: number;
  total: number;
  estatus: string;
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
  total: number;
  estatus: string;
  condicionesPago?: string;
  notas?: string;
  proveedores?: OrdenCompraProveedor[];
  createdAt: string;
}

export interface Material {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  costoUnitario?: number;
  moneda: string;
  activo: boolean;
  createdAt: string;
}

// ─── Producción ──────────────────────────────────────────

export interface ParteOT {
  id: string;
  otId: string;
  numeroParte: string;
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

export interface DetalleCotizacion {
  id: string;
  cotizacionId: string;
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
