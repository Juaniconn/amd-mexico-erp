#!/bin/sh
set -e

echo "🔄 Generando cliente Prisma..."
pnpm exec prisma generate

echo "🚀 Iniciando API..."
exec node dist/main.js
