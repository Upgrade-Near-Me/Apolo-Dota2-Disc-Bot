#!/usr/bin/env bash

# Basic security monitoring for APOLO VPS (read-only checks)
# - Counts PostgreSQL failed authentications (last 24h)
# - Lists top usernames causing failures
# - Scans apolo-bot logs for potential secret leaks (last 24h)
# - Shows live Postgres connections (inside container)
# - Reports Redis overcommit_memory setting
#
# Usage:
#   chmod +x scripts/security-monitor.sh
#   ./scripts/security-monitor.sh

set -euo pipefail

echo "=== APOLO Security Monitor (READ-ONLY) ==="
date
echo

echo "--- PostgreSQL: failed authentication count (24h) ---"
docker logs postgres --since 24h 2>&1 | grep -i 'password authentication failed' | wc -l || echo "0"

echo "--- PostgreSQL: top usernames failing (24h) ---"
docker logs postgres --since 24h 2>&1 \
  | grep -i 'password authentication failed' \
  | grep -o 'user \"[^\"]*\"' \
  | awk -F '"' '{print $2}' \
  | sort | uniq -c | sort -nr | head -n 10 || true

echo "--- PostgreSQL: live connections to 5432 ---"
if docker exec postgres ss -tnp >/dev/null 2>&1; then
  docker exec postgres ss -tnp | grep ':5432' || echo "No active connections"
elif docker exec postgres netstat -tnp >/dev/null 2>&1; then
  docker exec postgres netstat -tnp | grep ':5432' || echo "No active connections"
else
  docker exec postgres lsof -nPi :5432 || echo "Socket tools not available"
fi

echo "--- apolo-bot: potential leak scan (24h) ---"
docker logs apolo-bot --since 24h 2>&1 \
  | grep -i -E 'token|password|secret|apikey|api_key|authorization' \
  | wc -l || echo "0"

echo "--- Redis: overcommit_memory setting ---"
sysctl vm.overcommit_memory 2>/dev/null || echo "sysctl not accessible; run on host if needed"

echo "--- Notes ---"
echo "- For Redis recommendation, host should have vm.overcommit_memory=1"
echo "- If PostgreSQL failures persist, identify source container/service and fix credentials"
echo "- This script is non-invasive and safe to run regularly (cron)"
