// ─── Facturación ──────────────────────────────────────────

export type EstatusFactura = 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'CANCELADA';

export interface DetalleFactura {
  id?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

export interface Factura {
  id: string;
  folio: string;
  clienteId: string;
  clienteNombre?: string;
  razonSocial?: string;
  rfc?: string;
  fecha: string;
  fechaVencimiento?: string;
  moneda: string;
  subtotal: number;
  impuestos: number;
  iva?: number;
  total: number;
  estatus: EstatusFactura;
  condicionesPago?: string;
  notas?: string;
  detalles?: DetalleFactura[];
  createdAt: string;
  updatedAt: string;
}
