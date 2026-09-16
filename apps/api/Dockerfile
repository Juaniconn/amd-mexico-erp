# ─── Stage 1: Build ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY apps/api ./apps/api/
COPY packages/shared ./packages/shared/

# Build
RUN pnpm --filter @amd/api build

# Generate Prisma client
RUN pnpm --filter @amd/api exec prisma generate

# ─── Stage 2: Production ─────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy built assets
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma

# Create non-root user
RUN addgroup -S erp && adduser -S erp -G erp
USER erp

EXPOSE 3001

CMD ["node", "dist/main.js"]
