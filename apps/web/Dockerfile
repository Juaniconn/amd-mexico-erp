# ─── Stage 1: Build ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copiar workspace completo
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/

# Instalar dependencias
RUN pnpm install --no-frozen-lockfile

# Copiar código fuente
COPY apps/web ./apps/web/
COPY packages/ui ./packages/ui/
COPY packages/shared ./packages/shared/

# Build
RUN pnpm --filter @amd/web build

# ─── Stage 2: Production ─────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

# Copiar workspace
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/

# Production dependencies only
RUN pnpm install --omit=dev --no-frozen-lockfile

# Copy built app
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/next.config.js ./
COPY --from=builder /app/apps/web/tsconfig.json ./

RUN addgroup -S erp && adduser -S erp -G erp
USER erp

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
