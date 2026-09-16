#!/bin/bash
# ============================================
# Script de Backup — AMD México ERP
# Ejecutar como cron job diario
# ============================================

set -e

# ─── Variables ────────────────────────────────────────────
BACKUP_DIR="${BACKUP_DIR:-/data/backups}"
DB_NAME="${POSTGRES_DB:-erp_db}"
DB_USER="${POSTGRES_USER:-erp}"
DB_HOST="${POSTGRES_HOST:-localhost}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/daily/erp_${TIMESTAMP}.sql.gz"

# ─── Crear directorio ────────────────────────────────────
mkdir -p "${BACKUP_DIR}/daily"

# ─── Backup PostgreSQL ───────────────────────────────────
echo "[$(date)] Iniciando backup de ${DB_NAME}..."
pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" \
  --no-owner --no-acl --clean --if-exists | gzip > "${BACKUP_FILE}"

# ─── Verificar backup ────────────────────────────────────
if [ -f "${BACKUP_FILE}" ]; then
    SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[$(date)] Backup exitoso: ${BACKUP_FILE} (${SIZE})"
else
    echo "[$(date)] ERROR: No se pudo crear el backup"
    exit 1
fi

# ─── Limpiar backups antiguos ────────────────────────────
echo "[$(date)] Limpiando backups anteriores a ${RETENTION_DAYS} días..."
find "${BACKUP_DIR}/daily" -name "erp_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# ─── Backup semanal (domingo) ────────────────────────────
DAY_OF_WEEK=$(date +%u)
if [ "${DAY_OF_WEEK}" -eq 7 ]; then
    WEEKLY_FILE="${BACKUP_DIR}/monthly/erp_weekly_${TIMESTAMP}.sql.gz"
    mkdir -p "${BACKUP_DIR}/monthly"
    cp "${BACKUP_FILE}" "${WEEKLY_FILE}"
    echo "[$(date)] Backup semanal creado: ${WEEKLY_FILE}"
fi

echo "[$(date)] Backup completado exitosamente."
