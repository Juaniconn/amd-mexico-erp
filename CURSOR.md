# AMD México ERP — Estado del Proyecto para Cursor

## Resumen

Sistema ERP de manufactura bajo pedido para AMD México (3 sucursales: Ciudad Juárez, Guadalajara, El Paso TX). Stack: NestJS + Next.js + PostgreSQL + Redis + MinIO, desplegado con Docker y nginx como reverse proxy.

**URL de acceso:** https://objects-bugs-epson-landscape.trycloudflare.com
**Login:** admin@amd-mexico.com / admin123

---

## Stack Tecnológico

| Capa | Tecnología | Puerto |
|------|------------|--------|
| Frontend | Next.js 14 + React 18 + Tailwind CSS + TypeScript | 3000 |
| Backend | NestJS 14 + Prisma ORM + TypeScript | 3001 |
| Base de datos | PostgreSQL 16 (usuario: `erp`, db: `erp_db`) | 5432 |
| Cache | Redis 7 (caché en memoria, sin volumen persistente) | 6379 |
| Almacenamiento | MinIO (S3-compatible) | 9000/9001 |
| Host sysinfo | Node.js metrics server | 3002 |
| Proxy | nginx (puerto 80 → 3000 frontend, /api/ → 3001 backend) | 80 |

---

## Estructura del Proyecto

```
/data/home/ubuntu/data/projets/amd_web_app/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Schema completo (16+ modelos)
│   │   ├── src/
│   │   │   ├── app.module.ts   # Registro de todos los módulos
│   │   │   ├── common/         # Guards (JwtAuth, Roles), decorators
│   │   │   ├── database/       # PrismaModule + PrismaService
│   │   │   └── modules/
│   │   │       ├── auth/           # JWT, refresh token, permisos en payload
│   │   │       ├── usuarios/       # CRUD + roles + permisos por módulo
│   │   │       ├── permisos/       # Catálogo de 19 módulos × 26 acciones
│   │   │       ├── cotizaciones/   # CRUD + flujo lineal (BORRADOR→ENVIADA→ACEPTADA→CONVERTIDA)
│   │   │       ├── produccion/     # Órdenes de trabajo + operaciones + partes
│   │   │       ├── maquinaria/     # 17 máquinas + mantenimiento + historial
│   │   │       ├── inventario/     # Materiales + movimientos + stock bajo
│   │   │       ├── compras/        # Órdenes de compra + transiciones de estatus
│   │   │       ├── facturacion/    # Facturas + detalles + estatus
│   │   │       ├── calidad/        # Control de calidad + inspecciones
│   │   │       ├── reportes/       # Dashboard stats + reportes por tipo
│   │   │       ├── agentes/        # Dashboard Agentes Hermes
│   │   │       ├── agentes-cursor/ # Dashboard Agentes Cursor (Agency Agents roster)
│   │   │       ├── dashboard/      # Métricas + actividad + alertas
│   │   │       ├── vps/            # Monitoreo de infraestructura
│   │   │       └── ingenieria/     # Proyectos + planos + procesos
│   │   └── Dockerfile
│   └── web/                    # Next.js frontend
│       ├── app/
│       │   ├── page.tsx            # Dashboard principal
│       │   ├── (auth)/login/       # Login con guardado de permisos
│       │   ├── cotizaciones/       # Lista + detalle + flujo lineal
│       │   ├── produccion/         # OTs + detalle + partes
│       │   ├── maquinaria/         # Grid + detalle con gauge
│       │   ├── inventario/         # Lista + detalle + movimientos
│       │   ├── compras/            # Lista + detalle + crear
│       │   ├── facturacion/        # Lista + detalle + crear
│       │   ├── calidad/            # Lista + detalle + crear
│       │   ├── reportes/           # Dashboard + vista por tipo
│       │   ├── agentes/            # Dashboard Agentes Hermes
│       │   ├── agentes-cursor/     # Dashboard Agentes Cursor (roster Agency)
│       │   ├── usuarios/           # CRUD + asignación de permisos
│       │   └── vps/                # Monitoreo de infraestructura
│       ├── components/
│       │   ├── Sidebar.tsx         # Sidebar responsive (w-16 móvil, w-60 desktop)
│       │   ├── AppLayout.tsx       # Layout con padding dinámico
│       │   ├── Gauge.tsx           # Gauge circular SVG
│       │   └── ui/                 # Componentes UI reutilizables
│       ├── lib/api.ts              # API client con interceptors JWT
│       ├── types/index.ts          # Tipos TypeScript del proyecto
│       └── next.config.js
├── packages/                     # Shared packages
├── docker-compose.yml
├── package.json                  # Workspace raíz
└── pnpm-workspace.yaml
```

---

## Módulos del ERP — Estado Actual

### ✅ Completos y Funcionando

| Módulo | Backend | Frontend | Tests | Descripción |
|--------|---------|----------|-------|-------------|
| **Dashboard** | ✅ | ✅ | ✅ | Métricas, actividad reciente, alertas, filtro por área |
| **Cotizaciones** | ✅ | ✅ | ✅ | CRUD completo, flujo lineal con botones contextuales |
| **Producción** | ✅ | ✅ | ✅ | OTs, partes, operaciones, detalle con timeline |
| **Maquinaria** | ✅ | ✅ | ✅ | 17 máquinas, grid visual, detalle con gauge y mantenimiento |
| **Usuarios** | ✅ | ✅ | ✅ | CRUD, roles (7), permisos por módulo/acción |
| **Inventario** | ✅ | ✅ | ✅ | Materiales, movimientos (ENTRADA/SALIDA/AJUSTE), stock bajo |
| **Compras** | ✅ | ✅ | ✅ | Órdenes de compra, transiciones de estatus, actualización de stock |
| **Facturación** | ✅ | ✅ | ✅ | Facturas, detalles, estatus (PENDIENTE/PAGADA/VENCIDA/CANCELADA) |
| **Calidad** | ✅ | ✅ | ✅ | Control de calidad, inspecciones, defectos |
| **Reportes** | ✅ | ✅ | ✅ | Dashboard stats, reportes por tipo (5 tipos) |
| **Agentes Hermes** | ✅ | ✅ | ✅ | Dashboard de skills Hermes (antes “Agentes”) |
| **Agentes Cursor** | ✅ | ✅ | — | Roster Agency Agents (~278) + orquestador Cursor |
| **VPS** | ✅ | ✅ | ✅ | Monitoreo de infraestructura (discos, CPU, Docker) |

### 🔄 Pendientes de Mejorar

| Módulo | Pendiente |
|--------|-----------|
| **Inventario** | Tests unitarios y de integración (Jest + supertest) |
| **Facturación** | Tests unitarios y de integración |
| **Calidad** | Tests unitarios y de integración |
| **Reportes** | Tests unitarios y de integración |

---

## Modelos de Datos (Prisma Schema)

```prisma
// Modelos principales
model Usuario      { id, email, nombre, apellido, role, permisos, sucursalId }
model Cotizacion  { id, folio, clienteId, estatus, subtotal, iva, total }
model OrdenTrabajo { id, folio, cotizacionId, estatus, prioridad, sucursalId }
model ParteOT      { id, otId, numeroParte, piezaNombre, cantidad, estatus }
model Operacion    { id, woId, parteId, proceso, maquinaId, estatus }
model Maquina     { id, codigo, nombre, tipo, capacidad, estatus, sucursalId }
model Material    { id, codigo, nombre, categoria, unidad, stockActual, stockMinimo }
model MovimientoInventario { id, materialId, tipo, cantidad, documentoRef }
model OrdenCompra { id, folio, proveedorId, estatus, subtotal, impuestos, total }
model DetalleOrdenCompra { id, ordenCompraId, materialId, cantidad, precioUnitario }
model Factura     { id, folio, otId, clienteId, estatus, subtotal, iva, total }
model DetalleFactura { id, facturaId, descripcion, cantidad, precioUnitario }
model Reporte     { id, nombre, tipo, descripcion, parametros, creadoPorId }
model Inspeccion  { id, folio, otId, parteId, inspectorId, estatus }
model Defecto     { id, inspeccionId, tipo, descripcion, cantidad }
model ControlCalidad { id, operacionId, woId, resultado, defectos, observaciones }

// Enums
enum Role { ADMIN, GERENTE, VENDEDOR, PRODUCCION, CALIDAD, COMPRAS, OPERADOR }
enum EstatusCotizacion { BORRADOR, ENVIADA, EN_REVISION, ACEPTADA, RECHAZADA, CANCELADA, CONVERTIDA }
enum EstatusWO { PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA }
enum EstatusParteOT { PENDIENTE, EN_PROCESO, COMPLETADA, EN_INSPECCION, APROBADA, RECHAZADA, PAUSADA, EN_ESPERA_MATERIAL }
enum EstatusFactura { PENDIENTE, PAGADA, VENCIDA, CANCELADA }
enum EstatusOrdenCompra { BORRADOR, PENDIENTE, APROBADA, EN_PRODUCCION, COMPLETADA, ENVIADA, RECIBIDA, CANCELADA }
enum TipoReporte { VENTAS, COMPRAS, PRODUCCION, INVENTARIO, FINANZAS }
```

---

## Patrones Críticos de Build y Deploy

### Backend (NestJS)

```bash
# Build local (obligatorio)
cd /data/home/ubuntu/data/projets/amd_web_app
pnpm --filter @amd/api build

# Docker build
docker build -t amd-erp-api:latest -f apps/api/Dockerfile .

# Deploy rápido (sin rebuild de imagen)
docker cp apps/api/dist amd-erp-api:/app/apps/api/
docker restart amd-erp-api
```

### Frontend (Next.js)

```bash
# Build local (obligatorio)
cd /data/home/ubuntu/data/projets/amd_web_app/apps/web
npx next build

# Copiar .next al directorio de deploy
cd /data/home/ubuntu/data/projets/amd_web_app
rm -rf /tmp/web-deploy && mkdir -p /tmp/web-deploy
pnpm --filter @amd/web deploy /tmp/web-deploy
cp -r apps/web/.next /tmp/web-deploy/

# Docker build
cd /tmp/web-deploy
docker build -t amd-erp-web:latest -f Dockerfile .

# Deploy rápido (sin rebuild de imagen)
docker cp .next amd-erp-web:/app/
docker restart amd-erp-web
```

### Migraciones de Base de Datos

```bash
cd /data/home/ubuntu/data/projets/amd_web_app/apps/api
npx prisma db push --skip-generate --accept-data-loss
npx prisma generate
```

---

## Variables de Entorno

### API (`.env.docker`)
```
DATABASE_URL=postgresql://erp:erp_password@127.0.0.1:5432/erp_db
REDIS_URL=redis://127.0.0.1:6379
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
JWT_SECRET=Xqqau9...I1oA
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=Y8AazT...7GHA
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
API_PORT=3001
PORT=3001
HOST_SYSINFO_URL=http://127.0.0.1:3002
```

### Web
```
# Empty = same-origin (nginx :80 proxies /api → Nest). Paths in code already use /api/...
# NEVER set to "/api" — that produces /api/api/... 404s (fixed 2026-09-23 via resolveApiUrl + nginx strip).
NEXT_PUBLIC_API_URL=
NODE_ENV=production
PORT=3000
```

---

## Docker Containers

```bash
# Todos los contenedores usan --network host
docker run -d --name amd-erp-api --network host --restart unless-stopped \
  --health-cmd='node -e "fetch(\"http://localhost:3001/api/docs\").then(r=>process.exit(r.ok?0:1))"' \
  --env-file .env.docker amd-erp-api:latest

docker run -d --name amd-erp-web --network host --restart unless-stopped \
  --health-cmd='node -e "fetch(\"http://localhost:3000\").then(r=>process.exit(r.ok?0:1))"' \
  amd-erp-web:latest
```

**Contenedores corriendo:**
- amd-erp-api (NestJS :3001)
- amd-erp-web (Next.js :3000)
- amd-erp-db (postgres:16-alpine :5432)
- amd-erp-redis (redis:7-alpine :6379)
- amd-erp-minio (minio :9000/9001)

**Volúmenes Docker:**
- amd-erp-db-data (PostgreSQL)
- amd-erp-minio-data (archivos MinIO)

---

## Sistema de Permisos

- **7 roles:** ADMIN, GERENTE, VENDEDOR, PRODUCCION, CALIDAD, COMPRAS, OPERADOR
- **19 módulos** × **26 acciones** (ver, crear, editar, eliminar, exportar, admin, asignar, aprobar, rechazar, convertir, descontar, mantenimiento, cambiar_estatus, enviar, rework, cancelar, subir_planos, asignar_roles, asignar_permisos, transferencias, ajustes, ver_metricas, ver_alertas)
- Permisos almacenados como JSON en el modelo Usuario
- JWT incluye permisos en el payload
- Sidebar filtra módulos por permisos del usuario

---

## Cotización Hermes (Nous :free)

Happy path: `/cotizaciones/desde-paquete` → ZIP + BOM → **Generar borrador** (Hermes ON).
- Cascada :free (LongCat primero): longcat → step-3.7-flash → solar-pro4 → laguna-s → laguna-xs → ling-fin → ling-sante. Rate-limit → siguiente modelo. **Sin heurística.**
- Proxy: `hermes-proxy.service` (`127.0.0.1:8645`). Skill: `~/.hermes/skills/amd-web-app/amd-cotizacion`.
- QTY solo BOM; PDF = manufactura.
- API: `desde-paquete` (`conHermes`), `hermes-cotizar`, `hermes-chat`.

## Agentes Disponibles (Skills de Hermes)

| Agente | Descripción | Stack |
|--------|-------------|-------|
| **amd-backend-architect** | Diseña API, endpoints, DTOs y Prisma schema | NestJS, Prisma, PostgreSQL |
| **amd-frontend-wizard** | UI/UX Next.js 14, React, Tailwind, responsive | Next.js, React, Tailwind |
| **amd-qa-engineer** | Tests unitarios y de integración, verificación | Jest, Playwright, Testing Library |

**Uso:** Se invocan vía `delegate_task` para trabajar en paralelo en módulos diferentes.

---

## Estado Actual del Servidor

| Recurso | Estado |
|---------|--------|
| **sda (45GB)** | Sistema operativo (10% usado) |
| **sdb (100GB)** | Datos y proyectos (38% usado, 58G libres) |
| **Cloudflare Tunnel** | Activo → nginx :80 |
| **5 contenedores Docker** | Todos healthy |
| **Limpieza automática** | Cron job diario 3:00 AM |

---

## Auditoría

Ver `docs/AUDITORIA_ERP_2026-09-22.md` (estado real MTO + P0/P1/P2). P0 Compras/Facturación/convert OT corregidos 2026-09-22.

## Tareas Pendientes

1. **Tests** — Agregar tests unitarios y de integración para Inventario, Facturación, Calidad y Reportes
2. **Nginx** — Configurar nginx como reverse proxy en puerto 80 (actualmente el tunnel apunta directo a nginx)
3. **CI/CD** — Pipeline de GitHub Actions para deploy automático
4. **Backup** — Script de backup automático de la base de datos

---

## Reglas Importantes

1. **NO** mover archivos entre sda y sdb — usar bind mount existente
2. **NO** reiniciar el agente Hermes — es la sesión actual
3. **Siempre** ejecutar `pnpm --filter @amd/api build` antes de `docker build`
4. **Siempre** copiar `.next` manualmente al directorio de deploy web
5. **NO** usar `http://127.0.0.1:3001` en el frontend — usar la URL del tunnel
6. **Después de cada cambio/rebuild** — ejecutar limpieza de Docker caches
7. **Sidebar responsive** — w-16 en móvil, w-60 en desktop
8. **Header siempre oscuro** — `bg-[#0a0e14]`
9. **Usar `@Patch()`** en lugar de `@Put()` en el backend
10. **Prisma** — ejecutar `prisma generate` después de cada cambio en schema.prisma

---

## Verificación Rápida

```bash
# Verificar contenedores
docker ps --filter name=amd-erp --format "{{.Names}}: {{.Status}}"

# Verificar frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Verificar API
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/docs

# Verificar módulos
curl -s http://localhost:3000/inventario
curl -s http://localhost:3000/compras
curl -s http://localhost:3000/facturacion
curl -s http://localhost:3000/calidad
curl -s http://localhost:3000/reportes
curl -s http://localhost:3000/agentes
```
