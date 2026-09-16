FROM node:20-bookworm

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

WORKDIR /app/apps/web

RUN addgroup --system erp && adduser --system --group erp
USER erp

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
