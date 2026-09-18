FROM node:20-bookworm

WORKDIR /app

RUN npm install -g pnpm

# Copiar configuración de pnpm y workspaces
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY .npmrc /root/.npmrc
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --no-frozen-lockfile --ignore-scripts


COPY apps/api ./apps/api
COPY packages/shared ./packages/shared/

# Prisma client se genera en el paso de build con --ignore-scripts
RUN cd apps/api && npx prisma generate --schema prisma/schema.prisma

# Set DATABASE_URL to localhost for container runtime (overrides .env)
ENV DATABASE_URL=postgresql://erp:${POSTGRES_PASSWORD:-erp_password}@127.0.0.1:5432/erp_db
RUN pnpm --filter @amd/api build

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
