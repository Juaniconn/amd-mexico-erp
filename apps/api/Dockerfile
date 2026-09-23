FROM node:20-bookworm-slim
WORKDIR /app

# Instalar libssl3 (requerido por Prisma query engine)
RUN apt-get update && apt-get install -y libssl3 && rm -rf /var/lib/apt/lists/*

# Copiar node_modules ya instalados (con symlinks de pnpm del host)
COPY node_modules ./node_modules
COPY apps/api/node_modules ./apps/api/node_modules

# Copiar app pre-compilada y prisma schema
COPY apps/api/dist ./apps/api/dist
COPY apps/api/prisma ./apps/api/prisma
COPY packages/shared ./packages/shared

# Runtime
ENV NODE_ENV=production
ENV API_PORT=3001
ENV PORT=3001
EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
