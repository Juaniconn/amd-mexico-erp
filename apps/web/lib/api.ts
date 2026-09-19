const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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

// ─── Ingeniería API Helpers ──────────────────────────────

export interface IngenieriaProyecto {
  id: string;
  codigo: string;
  clienteId: string;
  nombre: string;
  descripcion?: string;
  status: string;
  fechaInicio?: string;
  fechaEstimada?: string;
  notas?: string;
  createdAt: string;
}

export async function getIngenieriaProyectos(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ data: IngenieriaProyecto[]; meta: any }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.search) searchParams.set('search', params.search);
  return get(`/api/ingenieria?${searchParams}`);
}

export async function getIngenieriaProyecto(id: string): Promise<any> {
  return get(`/api/ingenieria/${id}`);
}

export async function getIngenieriaStats(): Promise<any> {
  return get('/api/ingenieria/stats');
}

export async function createIngenieriaProyecto(data: {
  clienteId: string;
  sucursalId?: string;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaEstimada?: string;
  notas?: string;
}): Promise<any> {
  return post('/api/ingenieria', data);
}

export async function updateIngenieriaProyecto(
  id: string,
  data: Partial<{
    clienteId: string;
    sucursalId: string;
    nombre: string;
    descripcion: string;
    status: string;
    fechaInicio: string;
    fechaEstimada: string;
    notas: string;
  }>,
): Promise<any> {
  return patch(`/api/ingenieria/${id}`, data);
}

export async function liberarIngenieriaProyecto(id: string): Promise<any> {
  return post(`/api/ingenieria/${id}/liberar`);
}

export async function uploadPlano(
  proyectoId: string,
  file: File,
  parteNumero: string,
  version: number = 1,
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('parteNumero', parteNumero);
  formData.append('version', String(version));

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const res = await fetch(`${API_URL}/ingenieria/${proyectoId}/planos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }

  return res.json();
}

export { ApiError, API_URL };
