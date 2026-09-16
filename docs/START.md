# 🚀 Inicio Rápido — AMD México ERP

## Requisitos previos
- Node.js >= 20
- pnpm >= 8
- Docker + Docker Compose (o PostgreSQL, Redis y MinIO instalados localmente)

## 1. Clonar el repositorio
```bash
git clone git@github.com:Juaniconn/amd-mexico-erp.git
cd amd-mexico-erp
```

## 2. Instalar dependencias
```bash
pnpm install
```

## 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus valores reales
```

## 4. Levantar infraestructura
```bash
docker compose -f infra/docker/docker-compose.yml up -d
```
> Si no tienes Docker: instalar PostgreSQL 16, Redis 7 y MinIO directamente.

## 5. Inicializar base de datos
```bash
pnpm db:generate  # Genera el cliente Prisma
pnpm db:migrate   # Ejecuta migraciones
pnpm db:seed     # Datos iniciales (sucursales, admin, catálogos)
```

## 6. Levantar aplicación
```bash
pnpm dev
```

## 7. Acceder
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001

## Credenciales por defecto
| Usuario | Password | Rol |
|---------|----------|-----|
| admin@amd-mexico.com | admin123 | ADMIN |

> ⚠️ Cambiar contraseñas por defecto en producción.
