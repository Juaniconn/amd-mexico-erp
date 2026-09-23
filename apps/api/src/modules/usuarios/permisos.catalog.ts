/**
 * Catálogo de permisos del ERP.
 * Cada módulo tiene acciones: ver, crear, editar, eliminar, exportar, admin.
 */

export type PermisoModulo =
  | 'dashboard'
  | 'clientes'
  | 'cotizaciones'
  | 'produccion'
  | 'maquinaria'
  | 'inventario'
  | 'compras'
  | 'proveedores'
  | 'calidad'
  | 'reportes'
  | 'facturacion'
  | 'ingenieria'
  | 'usuarios'
  | 'configuracion'
  | 'vps'
  | 'agentes'
  | 'agentes-cursor'
  | 'embarques'
  | 'transferencias';

export type PermisoAccion =
  | 'ver'
  | 'crear'
  | 'editar'
  | 'eliminar'
  | 'exportar'
  | 'admin'
  | 'asignar'
  | 'aprobar'
  | 'rechazar'
  | 'convertir'
  | 'descontar'
  | 'mantenimiento'
  | 'cambiar_estatus'
  | 'enviar'
  | 'rework'
  | 'cancelar'
  | 'subir_planos'
  | 'asignar_roles'
  | 'asignar_permisos'
  | 'transferencias'
  | 'ajustes'
  | 'ver_metricas'
  | 'ver_alertas';

export interface PermisoDefinicion {
  modulo: PermisoModulo;
  descripcion: string;
  acciones: PermisoAccion[];
}

export const PERMISOS_CATALOGO: PermisoDefinicion[] = [
  {
    modulo: 'dashboard',
    descripcion: 'Dashboard principal',
    acciones: ['ver', 'ver_metricas', 'ver_alertas'],
  },
  {
    modulo: 'clientes',
    descripcion: 'Catálogo de clientes',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
  },
  {
    modulo: 'cotizaciones',
    descripcion: 'Gestión de cotizaciones',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'enviar', 'aprobar', 'rechazar', 'convertir', 'exportar'],
  },
  {
    modulo: 'produccion',
    descripcion: 'Órdenes de trabajo y producción',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'asignar', 'cambiar_estatus', 'exportar'],
  },
  {
    modulo: 'maquinaria',
    descripcion: 'Inventario de maquinaria',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'mantenimiento', 'cambiar_estatus', 'exportar'],
  },
  {
    modulo: 'inventario',
    descripcion: 'Control de inventario',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'transferencias', 'ajustes', 'exportar'],
  },
  {
    modulo: 'compras',
    descripcion: 'Órdenes de compra',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
  },
  {
    modulo: 'proveedores',
    descripcion: 'Catálogo de proveedores',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
  },
  {
    modulo: 'calidad',
    descripcion: 'Control de calidad e inspecciones',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'rechazar', 'rework'],
  },
  {
    modulo: 'reportes',
    descripcion: 'Reportes y estadísticas',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
  },
  {
    modulo: 'facturacion',
    descripcion: 'Facturación',
    acciones: ['ver', 'editar', 'cancelar'],
  },
  {
    modulo: 'embarques',
    descripcion: 'Embarques y envíos',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'enviar'],
  },
  {
    modulo: 'ingenieria',
    descripcion: 'Ingeniería y diseño',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'subir_planos', 'exportar'],
  },
  {
    modulo: 'usuarios',
    descripcion: 'Gestión de usuarios y permisos',
    acciones: ['ver', 'crear', 'editar', 'eliminar', 'asignar_roles', 'asignar_permisos', 'admin'],
  },
  {
    modulo: 'configuracion',
    descripcion: 'Configuración del sistema',
    acciones: ['ver', 'editar'],
  },
  {
    modulo: 'vps',
    descripcion: 'Monitor VPS',
    acciones: ['ver'],
  },
  {
    modulo: 'agentes',
    descripcion: 'Agentes Hermes',
    acciones: ['ver'],
  },
  {
    modulo: 'agentes-cursor',
    descripcion: 'Agentes Cursor',
    acciones: ['ver'],
  },
];

/**
 * Permisos por defecto según rol.
 * Los permisos específicos por usuario pueden anular estos valores.
 */
export const PERMISOS_DEFAULT_POR_ROLE: Record<string, { modulo: PermisoModulo; acciones: PermisoAccion[] }[]> = {
  ADMIN: [], // Admin tiene todos los permisos, no necesita entradas explícitas
  GERENTE: [
    { modulo: 'dashboard', acciones: ['ver', 'ver_metricas', 'ver_alertas'] },
    { modulo: 'clientes', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { modulo: 'cotizaciones', acciones: ['ver', 'crear', 'editar', 'eliminar', 'enviar', 'aprobar', 'rechazar', 'convertir', 'exportar'] },
    { modulo: 'produccion', acciones: ['ver', 'crear', 'editar', 'eliminar', 'asignar', 'cambiar_estatus', 'exportar'] },
    { modulo: 'maquinaria', acciones: ['ver', 'crear', 'editar', 'eliminar', 'mantenimiento', 'cambiar_estatus', 'exportar'] },
    { modulo: 'inventario', acciones: ['ver', 'crear', 'editar', 'eliminar', 'transferencias', 'ajustes', 'exportar'] },
    { modulo: 'compras', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'] },
    { modulo: 'proveedores', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { modulo: 'calidad', acciones: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'rechazar', 'rework'] },
    { modulo: 'reportes', acciones: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { modulo: 'facturacion', acciones: ['ver', 'editar', 'cancelar'] },
    { modulo: 'embarques', acciones: ['ver', 'crear', 'editar', 'eliminar', 'enviar'] },
    { modulo: 'ingenieria', acciones: ['ver', 'crear', 'editar', 'eliminar', 'subir_planos', 'exportar'] },
    { modulo: 'configuracion', acciones: ['ver', 'editar'] },
    { modulo: 'vps', acciones: ['ver'] },
    { modulo: 'agentes', acciones: ['ver'] },
    { modulo: 'agentes-cursor', acciones: ['ver'] },
  ],
  VENDEDOR: [
    { modulo: 'dashboard', acciones: ['ver'] },
    { modulo: 'clientes', acciones: ['ver', 'crear', 'editar', 'exportar'] },
    { modulo: 'cotizaciones', acciones: ['ver', 'crear', 'editar', 'enviar', 'exportar'] },
    { modulo: 'facturacion', acciones: ['ver', 'editar'] },
    { modulo: 'embarques', acciones: ['ver', 'crear', 'enviar'] },
  ],
  PRODUCCION: [
    { modulo: 'produccion', acciones: ['ver', 'crear', 'editar', 'asignar', 'cambiar_estatus'] },
    { modulo: 'maquinaria', acciones: ['ver', 'mantenimiento'] },
    { modulo: 'inventario', acciones: ['ver'] },
    { modulo: 'embarques', acciones: ['ver', 'crear', 'editar', 'enviar'] },
  ],
  CALIDAD: [
    { modulo: 'calidad', acciones: ['ver', 'crear', 'editar', 'aprobar', 'rechazar', 'rework'] },
    { modulo: 'produccion', acciones: ['ver'] },
  ],
  COMPRAS: [
    { modulo: 'compras', acciones: ['ver', 'crear', 'editar', 'aprobar'] },
    { modulo: 'proveedores', acciones: ['ver', 'crear', 'editar'] },
    { modulo: 'inventario', acciones: ['ver'] },
  ],
  OPERADOR: [
    { modulo: 'produccion', acciones: ['ver'] },
    { modulo: 'maquinaria', acciones: ['ver'] },
    { modulo: 'inventario', acciones: ['ver'] },
  ],
};
