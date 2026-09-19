#!/bin/bash
set -e

# Runtime config
ENV NODE_ENV=production
ENV API_PORT=3001
ENV PORT=3001
EXPOSE 3001

# Construir DATABASE_URL dinámicamente si no está definida
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER:-erp}:${POSTGRES_PASSWORD:-erp_password}@${POSTGRES_HOST:-127.0.0.1}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-erp_db}"
fi

# Construir REDIS_URL dinámicamente si no está definida
if [ -z "$REDIS_URL" ]; then
  export REDIS_URL="redis://:${REDIS_PASSWORD:-redis_pass_2026}@${REDIS_HOST:-127.0.0.1}:${REDIS_PORT:-6379}"
fi

exec node /app/apps/api/dist/main.js
