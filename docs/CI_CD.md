# 🔄 CI/CD — GitHub Actions

## Visión General

Pipeline de CI/CD que se ejecuta en cada push a `main`:

```
Push a main → [CI: Lint + Build + Test] → [Deploy: Infraestructura + DB]
```

## Stack de CI/CD

| Componente | Versión |
|------------|---------|
| GitHub Actions | ubuntu-latest (Node 24) |
| pnpm | 9.15.4 (instalado vía npm en CI, servidor usa standalone) |
| Docker | 29.8.1 |
| Docker Compose | v5.5.1 |

### Nota sobre pnpm
El workflow CI usa `npm install -g pnpm@9.15.4` (funciona correctamente con `approve-builds=true` en `.npmrc`). El servidor usa pnpm 12 standalone con configuración en `pnpm-workspace.yaml`. Si el servidor actualiza pnpm, recordar que pnpm 12 ignora `approve-builds` y usa `onlyBuiltDependencies` en el workspace config.

## Configuración Inicial (una vez)

### 1. Crear claves SSH para GitHub Actions

Las claves ya fueron generadas en el servidor:
- **Pública** (en `~/.ssh/authorized_keys`): `github-actions`
- **Privada** (en `~/.ssh/github_actions`): para GitHub Secrets

### 2. Agregar Secrets a GitHub

1. Ir a: **Settings → Secrets and variables → Actions**
2. Crear estos 3 secretos:

| Nombre | Valor |
|--------|-------|
| `SSH_PRIVATE_KEY` | Contenido de `~/.ssh/github_actions` (llave privada completa) |
| `SSH_USER` | `ubuntu` |
| `SSH_HOST` | `40.233.14.136` |

### 3. Cómo copiar la llave privada

```bash
# En el servidor, mostrar la llave
cat ~/.ssh/github_actions

# Copiar contenido y pegarlo en GitHub Secrets
```

## Workflows

### CI (Continuous Integration)
- **Trigger**: push/PR a `main`
- **Acciones**: install pnpm 9 → install deps → lint → build → test

### Deploy (Continuous Deployment)
- **Trigger**: push a `main` o merge de PR
- **Acciones**:
  1. SSH al servidor
  2. Verificar/instalar pnpm
  3. `git pull`
  4. `pnpm install`
  5. Levantar DB con Docker
  6. Prisma migrate + seed

## Diagrama de Flujo

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│ Push to main │────▶│ CI (GitHub)   │────▶│ Deploy (SSH) │
│              │     │               │     │              │
│              │     │ pnpm install │     │ git pull     │
│              │     │ lint          │     │ pnpm install │
│              │     │ build         │     │ docker up db │
│              │     │ test          │     │ prisma cmd   │
└──────────────┘     └───────────────┘     └──────────────┘
```

## Troubleshooting

### `ERR_PNPM_IGNORED_BUILDS`
- **CI**: El workflow ya usa pnpm 9.15.4. Si persiste, revisar que `.npmrc` tenga `approve-builds=true`
- **Deploy**: El servidor usa pnpm 12 standalone que ignora esta config. Resolver corriendo `pnpm approve-builds` localmente o usar `npx pnpm@9`

### El deploy falla por SSH
- Verificar que la llave privada sea la misma que la pública
- Confirmar que `SSH_HOST` coincida con la IP actual del servidor

### secrets no disponibles
- Nombre exacto: mayúsculas, guiones bajos
- Sin espacios al inicio/final

## Referencias

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [SSH Key Authentication](https://docs.github.com/es/authentication/connecting-to-github-with-ssh)
