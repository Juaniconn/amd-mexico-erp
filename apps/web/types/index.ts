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

export interface VentaItem {
  id?: string;
  piezaNombre: string;
  piezaDescripcion?: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  subtotal?: number;
  tiempoEstimado?: number;
  procesoRequerido?: string;
  notas?: string;
}

export interface Venta {
  id: string;
  folio: string;
  clienteId: string;
  sucursalId?: string;
  creadoPor?: string;
  fecha: string;
  fechaEntrega?: string;
  moneda: 'MXN' | 'USD';
  tipoCambio?: number | null;
  subtotal: number;
  iva: number;
  total: number;
  estatus: string;
  condicionesPago?: string;
  notas?: string;
  cliente?: Cliente;
  sucursal?: Sucursal;
  items?: VentaItem[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

export interface VentaListResponse {
  data: Venta[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

// ─── CRM ─────────────────────────────────────────────────

export interface ActividadLead {
  id: string;
  leadId: string;
  tipo: 'NOTA' | 'LLAMADA' | 'EMAIL' | 'REUNION' | 'TAREA';
  descripcion: string;
  userId?: string;
  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InteresLead {
  id: string;
  leadId: string;
  descripcion: string;
  cantidad?: number;
  notas?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  folio: string;
  nombre: string;
  contactoNombre?: string;
  email?: string;
  telefono?: string;
  origen: 'REFERENCIA' | 'WEB' | 'LLAMADA' | 'EMAIL' | 'FERIA' | 'OTRO';
  estatus: 'NUEVO' | 'CONTACTADO' | 'CALIFICADO' | 'PROPUESTA' | 'GANADO' | 'PERDIDO';
  valorEstimado?: number | string | null;
  moneda: 'MXN' | 'USD';
  tipoCambio?: number | string | null;
  descripcion?: string;
  notas?: string;
  fechaSeguimiento?: string;
  proximaAccion?: string;
  vendedorId?: string;
  vendedor?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  clienteId?: string;
  cliente?: Cliente;
  actividades?: ActividadLead[];
  intereses?: InteresLead[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadListResponse {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
