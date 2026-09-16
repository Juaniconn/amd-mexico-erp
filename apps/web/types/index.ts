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
