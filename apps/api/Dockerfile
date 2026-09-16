FROM node:20-bookworm

WORKDIR /app

RUN npm install -g pnpm prisma@5

COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --no-frozen-lockfile

COPY apps/api ./apps/api/
COPY packages/shared ./packages/shared/

RUN prisma generate --schema apps/api/prisma/schema.prisma
RUN pnpm --filter @amd/api build

EXPOSE 3001

CMD ["node", "dist/main.js"]
