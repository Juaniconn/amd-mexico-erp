#!/bin/bash
set -e

# Construir DATABASE_URL dinámicamente si no está definida
if [ -z "$DATABASE_URL" ]; then
  PG_USER=${POSTGRES_USER:-erp}
  PG_PASS=${POSTGRES_PASSWORD:-erp_password}
  PG_HOST=${POSTGRES_HOST:-127.0.0.1}
  PG_PORT=${POSTGRES_PORT:-5432}
  PG_DB=${POSTGRES_DB:-erp_db}
  export DATABASE_URL="postgresql://${PG_USER}:${PG_PASS}@${PG_HOST}:${PG_PORT}/${PG_DB}"
fi

# Construir REDIS_URL dinámicamente si no está definida
if [ -z "$REDIS_URL" ]; then
  REDIS_PASS=${REDIS_PASSWORD:-redis_pass_2026}
  REDIS_HOST=${REDIS_HOST:-127.0.0.1}
  REDIS_PORT=${REDIS_PORT:-6379}
  export REDIS_URL="redis://:${REDIS_PASS}@${REDIS_HOST}:${REDIS_PORT}"
fi

echo "DATABASE_URL=$DATABASE_URL"
echo "REDIS_URL=$REDIS_URL"
echo "Starting API..."

exec node /app/apps/api/dist/main.js
