# 🔒 Seguridad

## Autenticación
- JWT con access token (8h) y refresh token (7d + rotación)
- Refresh tokens revocables en Redis
- 2FA opcional (TOTP) para administradores

## Autorización (RBAC)
| Rol | Permisos |
|-----|----------|
| ADMIN | Acceso total |
| GERENTE | Multi-sucursal, reportes |
| VENDEDOR | Cotizaciones, clientes |
| PRODUCCION | WOs, operaciones |
| CALIDAD | QC, inspecciones |
| COMPRAS | POs, proveedores |
| OPERADOR | Solo sus operaciones |

## Multi-tenancy
- Cada registro tiene `sucursal_id` (obligatorio)
- Middleware filtra datos por sucursal del usuario
- Usuarios de Juárez NO ven datos de Guadalajara

## Rate Limiting
- 100 req/min por IP
- 1000 req/min por usuario autenticado
- Configurable en Redis

## Cabeceras de seguridad
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

## Validación de datos
- DTOs con class-validator en todos los inputs
- Whitelist de campos (forbidNonWhitelisted)
- Prisma (parameterized queries) — inyección SQL imposible

## Auditoría
- Tabla `audit_log` inmutable (append-only)
- Registra: usuario, acción, entidad, datos antes/después, IP, timestamp
