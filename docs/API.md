# 🔌 API REST — Backend

## Base URL
- Desarrollo: `http://localhost:3001`
- Producción: `https://api.amd-mexico.com`

## Autenticación
```
POST /api/auth/login
Body: { "email": "...", "password": "..." }
Response: { "accessToken": "...", "refreshToken": "..." }
```

## Endpoints principales

### Clientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/clientes | Lista paginada |
| GET | /api/clientes/:id | Detalle |
| POST | /api/clientes | Crear |
| PUT | /api/clientes/:id | Actualizar |
| DELETE | /api/clientes/:id | Eliminar (soft) |

### Cotizaciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/cotizaciones | Lista |
| GET | /api/cotizaciones/:id | Detalle |
| POST | /api/cotizaciones | Crear |
| PUT | /api/cotizaciones/:id | Actualizar |
| PATCH | /api/cotizaciones/:id/estatus | Cambiar estatus |

### Producción
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/produccion/ordenes-trabajo | Lista |
| POST | /api/produccion/ordenes-trabajo | Crear PO |
| PATCH | /api/produccion/ordenes-trabajo/:id/estatus | Actualizar estatus |

## Códigos de error
| Código | Descripción |
|--------|-------------|
| 400 | Bad Request |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 500 | Error del servidor
