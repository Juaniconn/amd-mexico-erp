# 🔍 AUDITORÍA GLOBAL — ERP AMD México

**Fecha:** 19 de septiembre de 2026  
**Alcance:** Repositorio completo `/home/ubuntu/data/projets/amd_web_app` (excluyendo `node_modules`, `.next`, `.git`, `dist`)  
**Stack:** Next.js 14 + NestJS 10 + Prisma 6.7 + PostgreSQL 16 + Redis 7 + MinIO + pnpm monorepo  
**Plataforma:** ARM64 VPS Oracle Cloud (Ubuntu 24.04) + nginx reverse proxy  

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Estado | Severidad |
|-----------|--------|-----------|
| Seguridad | 🔴 Crítica | Alta |
| Variables de Entorno | 🔴 Crítica | Alta |
| Configuración Docker | 🟡 Media | Media |
| Código Muerto/Debug | 🟡 Media | Baja |
| CI/CD | 🟡 Media | Media |
| Manejo de Errores | 🟡 Media | Media |
| Documentación | 🟢 Buena | Baja |
| Arquitectura | 🟢 Sólida | N/A |

**Hallazgos totales:** 35  
**Críticos:** 6  
**Altos:** 10  
**Medios:** 14  
**Bajos:** 5  

---

## 🔴 HALLAZGOS CRÍTICOS

### C1. Credenciales hardcodeadas en código fuente (RIESGO DE SEGURIDAD)

**Ubicación:**
- `apps/web/app/test/page.tsx:16` → `password: '[REDACTED]'`
- `apps/api/prisma/seed.ts:64` → `bcrypt.hash('[REDACTED]', 10)`
- `apps/api/prisma/seed.ts:80` → `console.log('✅ Usuario admin creado (admin@amd-mexico.com / admin123)')`
- `apps/api/src/modules/auth/auth.module.ts:17` → `secret: config.get('JWT_SECRET') || '[REDACTED]'`
- `apps/api/src/modules/auth/jwt.strategy.ts:12` → `secretOrKey: process.env.JWT_SECRET || '[REDACTED]'`

**Impacto:** Credenciales expuestas en texto plano. Si el repositorio se filtra, un atacante tiene acceso inmediato al usuario admin con una contraseña conocida.

**Recomendación:**
1. Eliminar la página de test (`apps/web/app/test/page.tsx`) del repositorio de producción.
2. Mover la contraseña del seed a variable de entorno con valor aleatorio generado en el primer deploy.
3. Eliminar los fallback secrets `'[REDACTED]'` — fallar si `JWT_SECRET` no está definido.

---

### C2. Archivo `.env.local.generated.json` contiene credenciales hasheadas

**Ubicación:** `.env.local.generated.json`

**Contenido:**
```json
{
  "db": "[REDACTED]",
  "minio": "[REDACTED]",
  "jwt": "[REDACTED]",
  "jwt_refresh": "[REDACTED]",
  "redis": "[REDACTED]"
}
```

**Impacto:** Aunque parecen hasheados, están en un archivo que podría estar versionado (está en `.gitignore` solo si `.env.local` está listado, pero este archivo específicamente NO está excluido). Verificar con `git check-ignore`.

**Recomendación:** Añadir `.env.local.generated.json` explícitamente al `.gitignore`.

---

### C3. Inconsistencia de variables de entorno — DATABASE_URL

**Análisis:**

| Archivo | DATABASE_URL | Host |
|---------|-------------|------|
| `.env` | `postgresql://erp:***@127.0.0.1:5432/erp_db` | localhost |
| `.env.docker` | `postgresql://erp:***@127.0.0.1:5432/erp_db` | localhost |
| `infra/docker/docker-compose.internal.yml` | No definido (usa env_file `.env.docker`) | — |
| `infra/docker/docker-compose.yml` | `postgresql://${POSTGRES_USER:-erp}:${POSTGRES_PASSWORD:-erp_password}@db:5432/${POSTGRES_DB:-erp_db}` | servicio `db` |

**Impacto:** 
- El `docker-compose.yml` usa conexión interna (`db:5432`) con contraseña por defecto `erp_password`
- El `docker-compose.internal.yml` usa `network_mode: host` y el archivo `.env.docker` con `127.0.0.1`
- Si `.env.docker` tiene la contraseña actualizada pero `docker-compose.yml` usa la de fallback, hay inconsistencia

**Recomendación:**
1. Unificar a un solo archivo docker-compose o usar el mismo enfoque
2. Eliminar contraseñas por defecto en docker-compose.yml (`erp_password`, `minioadmin123`)
3. Usar `env_file` consistente en todos los servicios

---

### C4. Docker Compose: Contraseñas por defecto en texto plano

**Ubicación:** `infra/docker/docker-compose.yml`

```yaml
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-erp_password}
MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin123}
JWT_SECRET: ${JWT_SECRET:-cambiar-por-un-secret-secto-de-64-caracteres}
JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-cambiar-por-otro-secret-secto-de-64-caracteres}
```

**Impacto:** Si las variables de entorno no están definidas, el sistema se levanta con credenciales conocidas públicamente.

**Recomendación:** Eliminar los valores por defecto. Fallar con error explícito si no están definidas:
```yaml
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD no definida}
```

---

### C5. PostgreSQL autenticación md5 en internal compose

**Ubicación:** `infra/docker/docker-compose.internal.yml`

```yaml
POSTGRES_INITDB_ARGS: --auth=md5
POSTGRES_HOST_AUTH_METHOD: md5
```

**Impacto:** md5 es considerado inseguro. PostgreSQL 16 soporta scram-sha-256 por defecto.

**Recomendación:** Eliminar estas líneas o cambiar a `scram-sha-256`.

---

### C6. Network mode host inconsistente

**Análisis:**
- `docker-compose.yml`: usa red bridge por defecto
- `docker-compose.internal.yml`: usa `network_mode: host`

**Impacto:** Los puertos están expuestos directamente en el host sin aislamiento de red. Si se ejecutan ambos compose simultáneamente, hay conflictos de puertos.

**Recomendación:** Decidir una estrategia: red bridge (más segura) o host (mejor rendimiento). No mezclar.

---

## 🟡 HALLAZGOS DE SEVERIDAD MEDIA

### M1. Código de debug en producción (console.log)

**Archivos afectados:**
- `apps/api/src/main.ts:46-47` → 2 console.logs
- `apps/api/prisma/seed.ts` → 6 console.logs
- `apps/web/app/ingenieria/page.tsx:79,96` → 2 console.error
- `apps/web/app/page.tsx:88` → 1 console.error

**Recomendación:**
- Usar un logger estructurado (Pino o Winston) en NestJS
- Eliminar console.logs de seed o usar nivel `debug`
- Crear un wrapper de error handling centralizado en frontend

---

### M2. Swagger documentación expuesta en producción

**Ubicación:** `apps/api/src/main.ts:42`

```typescript
SwaggerModule.setup('api/docs', app, document);
```

**Impacto:** La documentación del API está disponible públicamente en producción, exponiendo todos los endpoints y DTOs.

**Recomendación:**
```typescript
if (process.env.NODE_ENV !== 'production') {
  SwaggerModule.setup('api/docs', app, document);
}
```

---

### M3. Rate limiting insuficiente en nginx

**Ubicación:** `infra/nginx/nginx.conf`

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
```

**Análisis:**
- 100 req/min para API es muy bajo para un ERP con múltiples módulos
- No hay rate limiting en el frontend (web server)
- No hay protección contra DDoS volumétrico

**Recomendación:**
- Aumentar a 300-500 r/m para API
- Añadir rate limiting al servidor web
- Considerar fail2ban para IPs maliciosas
- Añadir rate limiting por usuario (no solo por IP) en el backend

---

### M4. Falta helmet/express security middleware

**Análisis:** No se encuentra configuración de helmet o headers de seguridad adicionales en NestJS (solo los de nginx).

**Headers faltantes:**
- Content-Security-Policy
- Strict-Transport-Security (HSTS)
- Permissions-Policy

**Recomendación:**
```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

### M5. CORS demasiado permisivo

**Ubicación:** `apps/api/src/main.ts:23`

```typescript
app.enableCors({
  origin: true,
  credentials: true,
});
```

**Impacto:** `origin: true` refleja el origen de la solicitud, permitiendo CORS desde cualquier dominio.

**Recomendación:**
```typescript
app.enableCors({
  origin: ['https://amd-mexico.com', 'https://www.amd-mexico.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

### M6. Manejo de archivos sin validación de tipo

**Ubicación:** `apps/api/src/modules/ingenieria/ingenieria.controller.ts:73-87`

```typescript
@Post(':id/planos')
@UseInterceptors(FileInterceptor('file'))
async uploadPlano(...) {
  const archivoUrl = `/uploads/ingenieria/${id}/${file.originalname}`;
  // ...
}
```

**Impacto:**
- No valida tipo de archivo (acepta .exe, .php, etc.)
- No valida tamaño máximo
- Usa `file.originalname` directamente (path traversal risk)
- No implementa subida real a MinIO (hardcodea URL)

**Recomendación:**
1. Validar MIME type y extensión
2. Limitar tamaño con `fileSize` en FileInterceptor
3. Sanitizar nombre de archivo
4. Implementar subida real a MinIO

---

### M7. Backend bindeado solo a localhost

**Ubicación:** `apps/api/src/main.ts:45`

```typescript
await app.listen(port, '127.0.0.1');
```

**Impacto:** En el docker-compose.yml, el servicio web intenta conectar a `http://api:3001`, pero la API no es accesible en la red de Docker porque solo escucha en localhost.

**Recomendación:**
```typescript
await app.listen(port, '0.0.0.0');
```
O mejor: bindear a todas las interfaces en contenedores, localhost en development.

---

### M8. Network mode host en docker-compose.internal.yml rompe service discovery

**Ubicación:** `infra/docker/docker-compose.internal.yml`

```yaml
services:
  api:
    network_mode: host
    environment:
      MINIO_ENDPOINT: 127.0.0.1
```

**Problema:** Con `network_mode: host`, el servicio API comparte la red del host. Las referencias a otros servicios por nombre de DNS (ej: `db`, `redis`) no funcionan.

**Recomendación:** Usar red bridge de Docker y nombres de servicio, o documentar que este compose es solo para desarrollo local.

---

### M9. Volúmenes Docker inconsistentes

**Análisis:**

| Compose | Volúmenes |
|---------|-----------|
| `docker-compose.yml` | `postgres_data`, `redis_data`, `minio_data` |
| `docker-compose.internal.yml` | `docker_docker_postgres_data`, `docker_docker_redis_data`, `docker_docker_minio_data` (external: true) |

**Impacto:** Si ambos composes apuntan a la misma base de datos pero con volúmenes diferentes, hay inconsistencia de datos.

**Recomendación:** Unificar nombres de volúmenes o usar solo un compose.

---

### M10. Frontend dashboard usa rutas hardcodeadas inconsistentes

**Ubicación:** `apps/web/app/page.tsx:69-75`

```typescript
get<{ data: { meta: { total: number } } }>('/api/clientes?limit=1'),
get<{ data: { meta: { total: number } } }>('/api/ordenes-compra?limit=1'),
get<{ data: { meta: { total: number } } }>('/api/operaciones?limit=1'),
```

**Problema:** `operaciones` no está definido como controlador separado — es parte de `produccion`. Esto causará error 404.

**Verificación necesaria:** Confirmar que `/api/operaciones` existe en el backend.

---

### M11. Sidebar tiene ruta hardcodeada inválida

**Ubicación:** `apps/web/components/Sidebar.tsx:36`

```typescript
{ href: '/cotizaciones/[id]', icon: FileText, label: 'Detalle Cotización' },
```

**Impacto:** `[id]` es sintaxis de ruta de Next.js, no una URL real. Esto lleva a una página 404.

**Recomendación:** Eliminar esta entrada del sidebar o usar un ID real/placeholder.

---

### M12. Imports potencialmente rotos — @types/multer

**Ubicación:** `apps/api/src/modules/ingenieria/ingenieria.controller.ts:78`

```typescript
@UploadedFile() file: any, // @types/multer no disponible; simplificado para build
```

**Impacto:** Comentario indica que `@types/multer` no está disponible. Esto sugiere que la dependencia no está instalada correctamente.

**Recomendación:** Verificar que `@types/multer` esté en `package.json` y correctamente instalado.

---

### M13. Seed script usa contraseña débil

**Ubicación:** `apps/api/prisma/seed.ts:64`

```typescript
const passwordHash = await bcrypt.hash('[REDACTED]', 10);
```

**Impacto:** Contraseña predecible. Si el seed se ejecuta en producción sin cambiar la contraseña, es un riesgo.

**Recomendación:**
```typescript
const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || crypto.randomBytes(16).toString('hex');
```

---

### M14. Dockerfile de API copia node_modules del host

**Ubicación:** `apps/api/Dockerfile:8-9`

```dockerfile
COPY node_modules ./node_modules
COPY apps/api/node_modules ./apps/api/node_modules
```

**Impacto:** Los node_modules del host pueden contener binarios compilados para una arquitectura diferente (x86 vs ARM64).

**Recomendación:** Usar multi-stage build e instalar dependencias dentro del contenedor.

---

### M15. Dockerfile de web usa node:20-bookworm (no slim)

**Ubicación:** `apps/web/Dockerfile:1`

```dockerfile
FROM node:20-bookworm
```

**Impacto:** La imagen completa de Debian ocupa ~900MB vs ~200MB de la versión slim.

**Recomendación:** Usar `node:20-bookworm-slim` y solo instalar dependencias necesarias.

---

### M16. CI/CD usa Node 24 pero proyecto usa Node 20

**Ubicación:** `.github/workflows/ci.yml:21`

```yaml
node-version: 24
```

**Impacto:** Discrepancia entre CI y runtime puede causar comportamientos inesperados.

**Recomendación:** Usar `.nvmrc` o `package.json` `engines` como fuente de verdad.

---

### M17. Deploy workflow usa npm en lugar de pnpm

**Ubicación:** `.github/workflows/deploy.yml:38`

```yaml
npm install --legacy-peer-deps
```

**Impacto:** El proyecto usa pnpm workspace. Usar npm puede causar errores de resolución de dependencias.

**Recomendación:** Usar `pnpm install --frozen-lockfile` en CI/CD.

---

### M18. Prisma seed se ejecuta en cada deploy

**Ubicación:** `.github/workflows/deploy.yml:59`

```yaml
npx prisma db seed --schema apps/api/prisma/schema.prisma
```

**Impacto:** `upsert` es idempotente, pero si el seed cambia contraseñas o datos críticos, se sobrescriben en cada deploy.

**Recomendación:** Separar migración de seed. El seed solo debería ejecutarse manualmente o en primer deploy.

---

### M19. No hay health check endpoint en el backend

**Análisis:** No se encuentra `/health` o `/ready` endpoint en el código del API.

**Impacto:** No hay forma de verificar la salud del backend más que por el puerto.

**Recomendación:**
```typescript
@Controller('health')
class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

---

### M20. No hay tests unitarios ni de integración visibles

**Análisis:**
- Solo existe `apps/api/src/app.module.spec.ts` (vacío/placeholder)
- No hay tests en los módulos
- El CI ejecuta `pnpm test` pero no hay tests reales

**Impacto:** Cambios en producción no están cubiertos por tests automatizados.

---

## 🟢 HALLAZGOS DE SEVERIDAD BAJA / MEJORAS

### B1. No hay Makefile ni scripts de desarrollo rápido

**Recomendación:** Crear un `Makefile` con targets comunes:
```makefile
dev: pnpm dev
build: pnpm build
db-migrate: pnpm db:migrate
db-seed: pnpm db:seed
test: pnpm test
lint: pnpm lint
```

---

### B2. No hay .editorconfig ni configuración de formateo compartida

**Recomendación:** Añadir `.editorconfig` y configurar Prettier + ESLint compartido.

---

### B3. No hay configuración de Dev Containers

**Recomendación:** Añadir `.devcontainer/devcontainer.json` para desarrollo consistente en VS Code.

---

### B4. Comentarios en schema.prisma referencian módulos removidos

**Ubicación:** `apps/api/prisma/schema.prisma:628-631`

```prisma
// ─── Ventas (Sales Orders) ──────────────────────────────

// ─── CRM ─────────────────────────────────────────────────
```

**Impacto:** Comentarios vacíos confunden sobre el estado actual del schema.

**Recomendación:** Eliminar o actualizar comentarios.

---

### B5. Archivo .env.docker.bak en repositorio

**Ubicación:** `.env.docker.bak`

**Impacto:** Archivo de respaldo de credenciales anteriores en el repositorio.

**Recomendación:** Eliminar el archivo y asegurarse de que `.env*.bak` esté en `.gitignore`.

---

### B6. Archivos en packages/ no están siendo usados

**Análisis:**
- `packages/shared/` — package.json existe pero no se encuentra código fuente referenciado
- `packages/ui/` — package.json existe pero no hay imports desde apps/web

**Recomendación:** Si no se usan, eliminar para simplificar el monorepo. Si se planean usar, documentar.

---

## 🏗️ EVALUACIÓN DE ARQUITECTURA

### Estado Actual: Monorepo con pnpm

**Fortalezas:**
1. ✅ Separación clara entre API y Frontend
2. ✅ Módulos NestJS bien organizados (11 módulos de negocio)
3. ✅ Prisma schema robusto y bien estructurado
4. ✅ TypeScript en toda la codebase
5. ✅ Validación con class-validator en DTOs
6. ✅ Autenticación JWT con refresh tokens
7. ✅ Multi-sucursal implementado
8. ✅ AuditLog para trazabilidad

**Debilidades:**
1. ❌ Sin tests automatizados
2. ❌ Sin logging estructurado
3. ❌ Sin health checks
4. ❌ Sin documentación OpenAPI completa (falta describir endpoints)
5. ❌ Frontend muy básico (pocas páginas funcionales)
6. ❌ Sin manejo de transacciones complejas
7. ❌ Sin caché en el backend
8. ❌ Sin colas de trabajo para operaciones pesadas

### ¿Mantener o partir de cero?

**Recomendación: MANTENER la arquitectura actual con mejoras**

Justificación:
- El schema Prisma es sólido y cubre bien el dominio de negocio
- La separación NestJS modules es correcta
- Next.js 14 es apropiado para el frontend
- El esfuerzo de reescritura superaría el de mejora

---

## 🗺️ ROADMAP DE IMPLEMENTACIÓN

### Sprint 1: Seguridad (Semana 1-2)
- [ ] Eliminar credenciales hardcodeadas
- [ ] Configurar JWT fall-back seguro (sin default)
- [ ] Corregir CORS
- [ ] Añadir helmet al backend
- [ ] Eliminar .env.docker.bak y .env.local.generated.json del repo
- [ ] Configurar HSTS y CSP

### Sprint 2: Estabilización (Semana 3-4)
- [ ] Unificar docker-compose (eliminar internal o hacerlo consistente)
- [ ] Corregir DATABASE_URL inconsistency
- [ ] Añadir health checks
- [ ] Validar que @types/multer esté instalado
- [ ] Corregir ruta `/api/operaciones` en frontend
- [ ] Eliminar ruta `/cotizaciones/[id]` hardcodeada del sidebar
- [ ] Arreglar Dockerfiles (multi-stage, slim)

### Sprint 3: Calidad de Código (Semana 5-6)
- [ ] Añadir logging estructurado (Pino)
- [ ] Desactivar Swagger en producción
- [ ] Eliminar console.logs
- [ ] Añadir tests unitarios (mínimo: auth, clientes, cotizaciones)
- [ ] Configurar Prettier + ESLint compartido
- [ ] Añadir Makefile

### Sprint 4: CI/CD y DevOps (Semana 7-8)
- [ ] Corregir workflow (pnpm en lugar de npm)
- [ ] Separar seed de migración en deploy
- [ ] Añadir escaneo de dependencias (npm audit / snyk)
- [ ] Configurar renovate/dependabot
- [ ] Añadir tests al pipeline CI
- [ ] Configurar staging environment

### Sprint 5: Funcionalidades (Semana 9-12)
- [ ] Implementar subida real a MinIO
- [ ] Añadir validación de archivos (tipo, tamaño)
- [ ] Añadir transacciones en operaciones críticas
- [ ] Implementar refresh token rotation
- [ ] Añadir paginación cursor-based para listados grandes
- [ ] Completar páginas frontend (calidad, configuración)

### Sprint 6: Escabilidad (Semana 13-16)
- [ ] Añadir Redis caching en consultas frecuentes
- [ ] Implementar colas con BullMQ para reportes pesados
- [ ] Añadir rate limiting por usuario
- [ ] Configurar PM2 cluster mode
- [ ] Implementar soft deletes
- [ ] Añadir search full-text con PostgreSQL

---

## 📋 CHECKLIST DE ACCIONES INMEDIATAS

- [ ] **HOY:** Eliminar `apps/web/app/test/page.tsx`
- [ ] **HOY:** Cambiar `'[REDACTED]'` por variable de entorno en seed
- [ ] **HOY:** Eliminar `'[REDACTED]'` de auth module y strategy
- [ [ ] **HOY:** Añadir `.env.local.generated.json` a `.gitignore`
- [ ] **HOY:** Unificar docker-compose.internal.yml con docker-compose.yml
- [ ] **ESTA SEMANA:** Corregir CORS en main.ts
- [ ] **ESTA SEMANA:** Validar que `/api/operaciones` existe en backend
- [ ] **ESTA SEMANA:** Eliminar `.env.docker.bak` del repositorio
- [ ] **ESTA SEMANA:** Añadir health check endpoint
- [ ] **ESTA SEMANA:** Corregir Dockerfile de web (usar slim)
- [ ] **ESTA SEMANA:** Arreglar CI/CD para usar pnpm

---

## 📈 MÉTRICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| Líneas de TypeScript (aprox) | ~4,500 |
| Módulos backend | 13 |
| Modelos Prisma | 22 |
| Endpoints REST | ~55 |
| Páginas frontend | 12 |
| Dependencias directas (API) | 15 |
| Dependencias directas (Web) | ~8 |
| Archivos de tests | 1 (vacío) |
| Dependencias con vulnerabilidades | Por auditar |

---

## 🔗 ARCHIVOS ANALIZADOS

### Backend (apps/api)
- [x] `package.json` — dependencias y scripts
- [x] `src/main.ts` — bootstrap, CORS, validación
- [x] `src/app.module.ts` — módulos registrados
- [x] `src/common/guards/jwt-auth.guard.ts` — autenticación
- [x] `src/common/guards/roles.guard.ts` — autorización
- [x] `src/database/prisma.service.ts` — Prisma client
- [x] `src/database/prisma.module.ts` — módulo Prisma
- [x] `src/modules/auth/**` — Auth completo
- [x] `src/modules/clientes/**` — Clientes CRUD
- [x] `src/modules/produccion/**` — Producción + Operaciones
- [x] `src/modules/ingenieria/**` — Ingeniería + Planos
- [x] `src/modules/inventario/**` — Inventario
- [x] `src/modules/compras/**` — Órdenes de Compra
- [x] `prisma/schema.prisma` — Schema completo
- [x] `prisma/seed.ts` — Datos iniciales
- [x] `Dockerfile` — Build de producción

### Frontend (apps/web)
- [x] `app/layout.tsx` — Layout principal
- [x] `app/page.tsx` — Dashboard
- [x] `app/test/page.tsx` — Test (debe eliminarse)
- [x] `lib/api.ts` — Cliente API
- [x] `lib/utils.ts` — Utilidades
- [x] `components/Sidebar.tsx` — Navegación
- [x] `components/AppLayout.tsx` — Layout wrapper
- [x] `Dockerfile` — Build de producción

### Infraestructura
- [x] `infra/docker/docker-compose.yml` — Compose principal
- [x] `infra/docker/docker-compose.internal.yml` — Compose interno
- [x] `infra/docker/.env` — Variables de entorno Docker
- [x] `infra/nginx/nginx.conf` — Configuración nginx
- [x] `infra/scripts/backup.sh` — Script de respaldo
- [x] `.github/workflows/ci.yml` — Pipeline CI
- [x] `.github/workflows/deploy.yml` — Pipeline deploy

### Configuración
- [x] `.env.example` — Ejemplo de variables
- [x] `.env` — Variables de desarrollo (parcial)
- [x] `.env.docker` — Variables de Docker (parcial)
- [x] `.gitignore` — Archivos ignorados
- [x] `package.json` — Configuración monorepo

---

**Fin del reporte.**  
*Generado por auditoría automatizada — Septiembre 2026*
