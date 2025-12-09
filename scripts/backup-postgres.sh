#!/bin/bash
#####################################################
# APOLO Dota 2 Bot - PostgreSQL Backup Script
#####################################################
# Automatic daily backup with 7-day retention
# Usage: Run via cron job daily at 3AM
#####################################################

set -e  # Exit on error

# Configuration
# Auto-detect environment (local Windows or VPS Linux)
if [ -f "docker-compose.yml" ]; then
    # Local development (Windows)
    BACKUP_DIR="./backups"
    COMPOSE_FILE="docker-compose.yml"
else
    # VPS production (Linux)
    BACKUP_DIR="/root/apolo-backups"
    COMPOSE_FILE="/root/Apolo-Dota2-Disc-Bot/docker-compose.prod.yml"
fi

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="apolo_${DATE}.sql.gz"
RETENTION_DAYS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}[$(date)] Starting PostgreSQL backup...${NC}"

# Check if docker-compose is running
if ! docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
    echo -e "${RED}[ERROR] PostgreSQL container is not running!${NC}"
    exit 1
fi

# Perform backup
echo -e "${YELLOW}[INFO] Dumping database...${NC}"
docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U postgres apolo_dota2 | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

# Check if backup was successful
if [ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    echo -e "${GREEN}[SUCCESS] Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})${NC}"
else
    echo -e "${RED}[ERROR] Backup failed!${NC}"
    exit 1
fi

# Cleanup old backups (keep last 7 days)
echo -e "${YELLOW}[INFO] Cleaning up old backups (keeping last ${RETENTION_DAYS} days)...${NC}"
find "$BACKUP_DIR" -name "apolo_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "apolo_*.sql.gz" -type f | wc -l)
echo -e "${GREEN}[INFO] Total backups stored: ${BACKUP_COUNT}${NC}"

# Optional: Upload to cloud (Uncomment if using cloud backup)
# echo -e "${YELLOW}[INFO] Uploading to cloud storage...${NC}"
# rclone copy "${BACKUP_DIR}/${BACKUP_FILE}" remote:apolo-backups/

echo -e "${GREEN}[$(date)] Backup completed successfully!${NC}"
