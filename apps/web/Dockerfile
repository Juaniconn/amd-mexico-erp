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

# Copy built output to a clean directory for production
RUN mkdir -p /app/production && \
    cp -r /app/apps/web/.next /app/production/.next && \
    cp -r /app/apps/web/public /app/production/public 2>/dev/null || true && \
    cp -r /app/apps/web/node_modules /app/production/node_modules && \
    cp /app/apps/web/package.json /app/production/package.json && \
    cp /app/apps/web/next.config.js /app/production/next.config.js 2>/dev/null || true

WORKDIR /app/production

EXPOSE 3000

CMD ["/app/production/node_modules/.bin/next", "start"]
