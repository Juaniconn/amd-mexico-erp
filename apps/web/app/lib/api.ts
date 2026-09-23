export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new ApiError(error.message || 'Error de API', res.status, error);
  }
  return res.json();
}

export function get<T>(url: string): Promise<T> {
  return request<T>(url);
}

export function post<T>(url: string, data: any): Promise<T> {
  return request<T>(url, { method: 'POST', body: JSON.stringify(data) });
}

export function put<T>(url: string, data: any): Promise<T> {
  return request<T>(url, { method: 'PUT', body: JSON.stringify(data) });
}

export function patch<T>(url: string, data: any): Promise<T> {
  return request<T>(url, { method: 'PATCH', body: JSON.stringify(data) });
}

export function del<T>(url: string): Promise<T> {
  return request<T>(url, { method: 'DELETE' });
}

export interface Factura {
  id: string; folio: string; clienteId: string; otId?: string;
  ot?: { folio: string }; cliente?: { razonSocial: string };
  moneda: string; subtotal: number; iva: number; total: number;
  estatus: string; notas?: string; createdAt: string;
}

export interface OrdenTrabajo {
  id: string; folio: string; estatus: string; prioridad: string;
  piezaNombre?: string; cantidad?: number; fechaInicio?: string;
  fechaFinEstimada?: string; notas?: string; responsableId?: string;
  cotizacionId?: string; responsable?: { id: string; nombre: string; apellido: string };
  cotizacion?: { id: string; folio: string; clienteId: string; cliente?: { razonSocial: string } };
  createdAt: string; updatedAt?: string; _count?: { partes: number };
}
