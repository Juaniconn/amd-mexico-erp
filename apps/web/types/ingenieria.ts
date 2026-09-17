// Ingeniería / Diseño Types

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
  _count?: {
    procesos: number;
    planos: number;
  };
}
