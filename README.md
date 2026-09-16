# 🏭 AMD México ERP

Sistema de gestión industrial (ERP) para manufactura bajo pedido.

## 🏢 Sucursales
- **Ciudad Juárez, Chihuahua** — Principal
- **Guadalajara, Jalisco**
- **El Paso, Texas**

## 🚀 Quick Start

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Levantar infraestructura (PostgreSQL, Redis, MinIO)
docker compose -f infra/docker/docker-compose.yml up -d

# Inicializar base de datos
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Levantar app en desarrollo
pnpm dev
```

## 📁 Estructura del Proyecto

- `apps/api/` — Backend NestJS
- `apps/web/` — Frontend Next.js
- `packages/` — Código compartido
- `infra/` — Docker, Nginx, scripts
- `docs/` — Documentación del proyecto (compatible con Obsidian)

## 📖 Documentación

Toda la documentación vive en `docs/` en formato Markdown, lista para visualizar en [Obsidian](https://obsidian.md).

## 🔧 Stack

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS + Prisma |
| Frontend | Next.js + Tailwind |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Storage | MinIO (S3) |

## 📄 Licencia

Privado — AMD México © 2025

