FROM node:20-bookworm

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --no-frozen-lockfile

COPY apps/web ./apps/web
COPY packages/ui ./packages/ui
COPY packages/shared ./packages/shared

RUN pnpm --filter @amd/web build

WORKDIR /app/apps/web

# Reinstall production dependencies in the web directory to get clean node_modules
RUN pnpm install --prod --no-frozen-lockfile

EXPOSE 3000

CMD ["node", "/app/apps/web/node_modules/next/dist/bin/next", "start"]
