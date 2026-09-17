FROM node:20-bookworm

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --no-frozen-lockfile

COPY apps/api ./apps/api/
COPY packages/shared ./packages/shared/

# Install prisma@6 locally (matches schema) and generate client
RUN pnpm --filter @amd/api add prisma@6.7.0 && pnpm --filter @amd/api add @prisma/client@6.7.0
RUN cd apps/api && pnpm exec prisma generate
RUN pnpm --filter @amd/api build

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
