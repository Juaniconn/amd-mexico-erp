# 🗄️ Base de Datos — PostgreSQL

## Conexión
- **Host**: localhost
- **Puerto**: 5432
- **Database**: erp_db
- **Usuario**: erp
- **URL**: `postgresql://erp:erp_password@localhost:5432/erp_db`

## Diagrama ER
> Diagrama completo en `docs/db/er-diagram.md`

## Tablas principales

### Usuarios y Auth
| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios del sistema con roles |

### Multi-sucursal
| Tabla | Descripción |
|-------|-------------|
| `sucursales` | Sucursales (Juárez, GDL, El Paso) |

### Catálogos
| Tabla | Descripción |
|-------|-------------|
| `clientes` | Clientes con RFC, contacto, crédito |
| `proveedores` | Proveedores |
| `empleados` | Empleados |
| `maquinas` | Máquinas y equipos |
| `materiales` | Materiales e inventario |

### Operación
| Tabla | Descripción |
|-------|-------------|
| `cotizaciones` | Cotizaciones (RFQ) |
| `detalles_cotizacion` | Líneas por cotización |
| `ordenes_compra` | Órdenes de compra (PO) |
| `ordenes_trabajo` | Órdenes de trabajo (WO) |
| `operaciones` | Operaciones de fabricación |
| `control_calidad` | Inspecciones de calidad |
| `movimientos_inventario` | Movimientos de stock |
| `transferencias` | Transferencias entre sucursales |

### Sistema
| Tabla | Descripción |
|-------|-------------|
| `audit_log` | Registro de auditoría (inmutable) |
| `configuracion` | Configuración general |

## Migraciones
```bash
pnpm db:migrate
```

## Studio (visualizar datos)
```bash
pnpm db:studio
```
