FROM node:20-bookworm

WORKDIR /app

# Install pnpm and prisma CLI globally
RUN npm install -g pnpm prisma

# Copy workspace files
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY apps/api ./apps/api/
COPY packages/shared ./packages/shared/

# Build API
RUN pnpm --filter @amd/api build

# ─── Stage 2: Production ─────────────────────────────────
FROM node:20-bookworm

WORKDIR /app

RUN npm install -g pnpm prisma

# Copy workspace and package.json files
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built API and Prisma schema
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma

# Generate Prisma client at build time (uses global prisma CLI)
RUN prisma generate --schema apps/api/prisma/schema.prisma

WORKDIR /app/apps/api

# Create non-root user
RUN addgroup --system erp && adduser --system --group erp
USER erp

EXPOSE 3001

CMD ["node", "dist/main.js"]
