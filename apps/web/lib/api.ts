const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface OrdenTrabajo {
  id: string;
  folio: string;
  cotizacionId?: string;
  responsableId?: string;
  estatus: string;
  prioridad: string;
  notas?: string;
  createdAt: string;
  responsable?: { id: string; nombre: string; apellido: string };
  cotizacion?: { folio: string; cliente?: { razonSocial: string } };
  _count?: { partes: number };
}

export interface ParteOT {
  id: string;
  otId: string;
  numeroParte: string;
  piezaNombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  estatus: string;
  operadorId?: string;
  maquinaId?: string;
  operador?: { id: string; nombre: string; apellido: string };
  maquina?: { id: string; codigo: string; nombre: string };
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data?.message || 'Error de API');
    this.status = status;
    this.data = data;
  }
}

async function apiClient<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${path}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }

  return res.json();
}

export function get<T = any>(path: string): Promise<T> {
  return apiClient<T>(path, { method: 'GET' });
}

export function post<T = any>(path: string, body?: any): Promise<T> {
  return apiClient<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function put<T = any>(path: string, body?: any): Promise<T> {
  return apiClient<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function del<T = any>(path: string): Promise<T> {
  return apiClient<T>(path, { method: 'DELETE' });
}

export function patch<T = any>(path: string, body?: any): Promise<T> {
  return apiClient<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export { ApiError, API_URL };
