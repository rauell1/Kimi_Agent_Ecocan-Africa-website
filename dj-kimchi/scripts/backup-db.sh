#!/bin/bash
# SQLite database backup script
# Run via cron: */10 * * * * /home/z/my-project/scripts/backup-db.sh

DB_DIR="/home/z/my-project/db"
BACKUP_DIR="${DB_DIR}/backups"
DB_FILE="${DB_DIR}/custom.db"
MAX_BACKUPS=10

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "[$(date -Iseconds)] Database file not found: $DB_FILE"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/custom-${TIMESTAMP}.db"

# Use SQLite backup API for safe copy (avoids corruption)
sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'" 2>/dev/null || cp "$DB_FILE" "$BACKUP_FILE"

# Compress backup
gzip -f "$BACKUP_FILE" 2>/dev/null

# Rotate old backups — keep only the last N
ls -t "${BACKUP_DIR}"/custom-*.db.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f 2>/dev/null

echo "[$(date -Iseconds)] Backup created: ${BACKUP_FILE}.gz"
