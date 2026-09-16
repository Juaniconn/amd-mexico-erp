# ─── Stage 1: Build ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY apps/web ./apps/web/
COPY packages/ui ./packages/ui/
COPY packages/shared ./packages/shared/

# Build
RUN pnpm --filter @amd/web build

# ─── Stage 2: Production ─────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built app
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/next.config.js ./

RUN addgroup -S erp && adduser -S erp -G erp
USER erp

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
