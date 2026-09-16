# 🔄 CI/CD — GitHub Actions

## Visión General

Pipeline de CI/CD que se ejecuta en cada push a `main`:

```
Push a main → [CI: Lint + Build + Test] → [Deploy: Build Docker + Up services]
```

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
- **Acciones**: lint → build → test

### Deploy (Continuous Deployment)
- **Trigger**: push a `main` o merge de PR
- **Acciones**:
  1. `git pull` en el servidor
  2. `pnpm install`
  3. `docker compose build`
  4. Backup pre-deploy
  5. `docker compose up -d`

## Diagrama de Flujo

```
┌──────────────┐     ┌───────────┐     ┌──────────────┐
│ Push to main │────▶│ CI Checks │────▶│ Deploy Stage │
│              │     │           │     │              │
│              │     │ • Lint    │     │ • Git pull   │
│              │     │ • Build   │     │ • Build imgs │
│              │     │ • Test    │     │ • DB backup  │
│              │     └───────────┘     │ • Docker up  │
└──────────────┘                       └──────────────┘
```

## Troubleshooting

### El deploy falla por SSH
- Verificar que la llave privada sea la misma que la pública
- Confirmar que `SSH_HOST` coincida con la IP actual del servidor

### secrets no disponibles
- Nombre exacto: mayúsculas, guiones bajos
- Sin espacios al inicio/final

## Referencias

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [SSH Key Authentication](https://docs.github.com/es/authentication/connecting-to-github-with-ssh)
