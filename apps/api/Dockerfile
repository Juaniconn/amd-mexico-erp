FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace
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

# Login directory
WORKDIR /app/apps/api

# Create non-root user
RUN addgroup -S erp && adduser -S erp -G erp
USER erp

EXPOSE 3001

CMD ["node", "dist/main.js"]
