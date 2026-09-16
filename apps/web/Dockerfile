FROM node:20-bookworm

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --no-frozen-lockfile

COPY apps/web ./apps/web/
COPY packages/ui ./packages/ui/
COPY packages/shared ./packages/shared/

RUN pnpm --filter @amd/web build

EXPOSE 3000

# next is installed at the workspace root node_modules
CMD ["/app/node_modules/.bin/next", "start"]
