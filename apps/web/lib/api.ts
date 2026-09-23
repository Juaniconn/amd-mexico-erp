/**
 * Base for API calls.
 *
 * Convention (permanent):
 * - Call sites always use paths that already include the Nest prefix: `/api/...`
 * - NEXT_PUBLIC_API_URL is either empty (same-origin via nginx) or an origin
 *   without `/api` (e.g. `https://tunnel.example` or `http://localhost:3001`).
 * - Never set NEXT_PUBLIC_API_URL=/api — that produced `/api/api/...` 404s.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Join base + path without doubling `/api`.
 * Defensive against misconfigured NEXT_PUBLIC_API_URL ending in `/api`.
 */
export function resolveApiUrl(
  path: string,
  base: string = API_URL,
): string {
  const rawBase = String(base ?? '')
    .trim()
    .replace(/\/+$/, '');
  let p = String(path ?? '').trim();
  if (!p) return rawBase || '/';
  if (/^https?:\/\//i.test(p)) return p;
  if (!p.startsWith('/')) p = `/${p}`;

  // base=/api + path=/api/foo  → /api/foo
  // base=https://x/api + path=/api/foo → https://x/api/foo
  if (rawBase.endsWith('/api') && (p === '/api' || p.startsWith('/api/'))) {
    p = p.slice(4) || '/';
  }

  let joined = rawBase ? `${rawBase}${p}` : p;
  // Last-resort collapse: /api/api/foo → /api/foo (absolute or relative)
  joined = joined.replace(/(\/api)(?:\/api)+/g, '/api');
  return joined;
}

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

export interface Factura {
  id: string;
  folio: string;
  otId: string;
  clienteId: string;
  sucursalId?: string;
  moneda: string;
  tipoCambio?: number;
  subtotal: number;
  iva: number;
  total: number;
  estatus: string;
  fechaFactura?: string;
  notas?: string;
  creadoPor?: string;
  createdAt: string;
  updatedAt: string;
  ot?: { id: string; folio: string; estatus: string };
  cliente?: { id: string; razonSocial: string };
  sucursal?: { id: string; nombre: string };
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
  let finalPath = path;
  if (typeof window !== 'undefined') {
    const filter = localStorage.getItem('sucursalFilter'); // 'all' | uuid
    const userSuc = localStorage.getItem('sucursalId');
    const sid = filter && filter !== 'all' ? filter : null;
    // Only auto-append for list-ish GET paths without existing sucursalId
    const method = (options.method || 'GET').toUpperCase();
    if (method === 'GET' && sid && !finalPath.includes('sucursalId=')) {
      finalPath += finalPath.includes('?') ? `&sucursalId=${sid}` : `?sucursalId=${sid}`;
    }
    // Non-admin users without filter still get scoped by API via JWT user.sucursalId
    void userSuc;
  }
  const url = resolveApiUrl(finalPath);
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

export async function cotizarIngenieriaProyecto(id: string): Promise<any> {
  return post(`/api/ingenieria/${id}/cotizar`);
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
  const res = await fetch(resolveApiUrl(`/api/ingenieria/${proyectoId}/planos`), {
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
