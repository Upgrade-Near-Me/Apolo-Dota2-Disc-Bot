#!/bin/bash
#####################################################
# APOLO Dota 2 Bot - PostgreSQL Restore Script
#####################################################
# Restore database from backup file
# Usage: ./restore-postgres.sh [backup_file.sql.gz]
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

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file argument is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lh "$BACKUP_DIR"/apolo_*.sql.gz | awk '{print $9, "("$5")"}'
    echo ""
    echo -e "${RED}Usage: $0 <backup_file.sql.gz>${NC}"
    echo -e "${YELLOW}Example: $0 apolo_20241208_030000.sql.gz${NC}"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists (support both full path and filename only)
if [ -f "$BACKUP_FILE" ]; then
    RESTORE_PATH="$BACKUP_FILE"
elif [ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    RESTORE_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
else
    echo -e "${RED}[ERROR] Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will OVERWRITE the current database!${NC}"
echo -e "${YELLOW}Restoring from: ${RESTORE_PATH}${NC}"
read -p "Are you sure? (type 'yes' to continue): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled.${NC}"
    exit 0
fi

# Check if docker-compose is running
if ! docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
    echo -e "${RED}[ERROR] PostgreSQL container is not running!${NC}"
    exit 1
fi

echo -e "${YELLOW}[$(date)] Starting database restore...${NC}"

# Drop existing database and recreate
echo -e "${YELLOW}[INFO] Dropping existing database...${NC}"
docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS apolo_dota2;"
docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres -c "CREATE DATABASE apolo_dota2;"

# Restore from backup
echo -e "${YELLOW}[INFO] Restoring from backup...${NC}"
gunzip -c "$RESTORE_PATH" | docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres -d apolo_dota2

# Verify restore
TABLE_COUNT=$(docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres -d apolo_dota2 -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}[SUCCESS] Database restored successfully!${NC}"
    echo -e "${GREEN}[INFO] Tables found: ${TABLE_COUNT}${NC}"
else
    echo -e "${RED}[ERROR] Restore may have failed (no tables found)${NC}"
    exit 1
fi

# Restart bot to reconnect to database
echo -e "${YELLOW}[INFO] Restarting bot...${NC}"
docker-compose -f "$COMPOSE_FILE" restart bot

echo -e "${GREEN}[$(date)] Restore completed successfully!${NC}"
