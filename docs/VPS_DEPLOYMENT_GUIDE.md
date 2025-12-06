# 🚀 VPS Deployment Guide - Hostinger EasyPanel + Ubuntu

Complete guide to deploy APOLO Dota 2 Bot to Hostinger VPS with Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [VPS Setup](#vps-setup)
- [Docker Installation](#docker-installation)
- [Application Setup](#application-setup)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required on Hostinger VPS

- Ubuntu 22.04 LTS or higher
- Min 2GB RAM (4GB recommended)
- Min 20GB disk space
- SSH access (root or sudo user)
- EasyPanel (optional but recommended)

### Local Machine

- Git installed
- SSH key configured for Hostinger

---

## VPS Setup

### 1. Connect to VPS

```bash
ssh root@your_vps_ip
```

Or with SSH key:

```bash
ssh -i /path/to/key root@your_vps_ip
```

### 2. Initial System Updates

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git net-tools htop

# Set timezone
timedatectl set-timezone UTC
# Or your timezone: timedatectl set-timezone America/Sao_Paulo
```

### 3. Create Non-Root User (Recommended)

```bash
# Create user
adduser apolo
# Follow prompts for password

# Add to sudoers
usermod -aG sudo apolo

# Switch to new user
su - apolo
```

---

## Docker Installation

### 1. Install Docker

```bash
# Add Docker repository
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clean up
rm get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker run hello-world
```

### 2. Install Docker Compose

```bash
# Download latest version
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 3. Enable Docker Service

```bash
# Start Docker on boot
sudo systemctl enable docker

# Start Docker now
sudo systemctl start docker

# Check status
sudo systemctl status docker
```

---

## Application Setup

### 1. Clone Repository

```bash
# Create projects directory
mkdir -p ~/projects
cd ~/projects

# Clone repository
git clone https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot.git
cd Apolo-Dota2-Disc-Bot
```

### 2. Create Environment File

```bash
# Copy template
cp .env.example .env

# Edit with your credentials
nano .env
```

**Fill these required variables:**

```env
# Discord
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_ids

# Database (STRONG PASSWORD!)
DB_USER=apolo_bot
DB_PASSWORD=Tr0p1c@lP@rrots#2024!DB
DB_NAME=apolo_dota2

# Redis (STRONG PASSWORD!)
REDIS_PASSWORD=RedisS3cur3P@ssw0rd!2024

# API Keys
STRATZ_API_TOKEN_1=your_stratz_token
STEAM_API_KEY=your_steam_key
GEMINI_API_KEY_1=your_gemini_key

# Grafana (STRONG PASSWORD!)
GRAFANA_ADMIN_PASSWORD=Dota2@Monitor2024!Secure

# Environment
NODE_ENV=production
LOG_LEVEL=info
```

### 3. Set File Permissions

```bash
# Restrict .env access (important!)
chmod 600 .env

# Make logs directory
mkdir -p logs

# Set permissions
chmod 755 logs
```

### 4. Create Directories

```bash
# Create infrastructure directories
mkdir -p infra/prometheus
mkdir -p infra/postgres
mkdir -p infra/grafana/provisioning/{dashboards,datasources}
```

Files should already be in the repo, but ensure they exist.

---

## Deployment

### 1. Build and Start Services

```bash
# Using production compose file
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f bot
```

### 2. Run Database Migrations

```bash
# Wait for Postgres to be healthy (usually 30 seconds)
sleep 30

# Run migrations
docker-compose -f docker-compose.prod.yml exec bot npx tsx src/database/migrate.ts

# Check if tables were created
docker-compose -f docker-compose.prod.yml exec postgres psql -U apolo_bot -d apolo_dota2 -c "\dt"
```

### 3. Deploy Discord Commands

```bash
# Register commands
docker-compose -f docker-compose.prod.yml exec bot npx tsx src/deploy-commands.ts

# Check logs for confirmation
docker-compose -f docker-compose.prod.yml logs bot --tail=20
```

### 4. Verify All Services

```bash
# Check all containers are healthy
docker-compose -f docker-compose.prod.yml ps

# Should see:
# apolo-bot       Up X minutes (healthy)
# apolo-postgres  Up X minutes (healthy)
# apolo-redis     Up X minutes (healthy)
# apolo-prometheus Up X minutes
# apolo-grafana   Up X minutes
```

---

## Monitoring

### 1. Access Grafana

Open browser and navigate to:

```
http://your_vps_ip:3000
```

**Login:**
- Username: admin
- Password: (from GRAFANA_ADMIN_PASSWORD in .env)

**Change Password Immediately!**

### 2. Access Prometheus

```
http://localhost:9091
```

From VPS terminal only (not public):

```bash
curl http://localhost:9091/api/v1/targets
```

### 3. View Bot Logs

```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f bot

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 bot

# Specific time range (docker logs --since)
docker-compose -f docker-compose.prod.yml logs --since 2024-12-06 bot
```

### 4. System Resources

```bash
# Check memory/CPU usage
docker stats

# Check disk space
df -h

# Check individual container
docker stats apolo-bot
```

---

## Backup & Recovery

### 1. Backup PostgreSQL

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U apolo_bot -d apolo_dota2 > ~/backups/apolo_dota2_$(date +%Y-%m-%d).sql

# Compress backup
gzip ~/backups/apolo_dota2_*.sql

# List backups
ls -lh ~/backups/
```

### 2. Automated Daily Backups

Create backup script:

```bash
# Create file
cat > ~/backup-apolo.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="$HOME/backups"
BACKUP_DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_BACKUP="$BACKUP_DIR/apolo_dota2_$BACKUP_DATE.sql"

# Create backup
docker-compose -f ~/projects/Apolo-Dota2-Disc-Bot/docker-compose.prod.yml exec -T postgres \
  pg_dump -U apolo_bot -d apolo_dota2 > "$DB_BACKUP"

# Compress
gzip "$DB_BACKUP"

# Keep only last 7 days
find "$BACKUP_DIR" -name "apolo_dota2_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DB_BACKUP.gz"
EOF

chmod +x ~/backup-apolo.sh
```

Add to crontab (daily at 2 AM):

```bash
# Edit crontab
crontab -e

# Add line:
0 2 * * * /home/apolo/backup-apolo.sh
```

### 3. Restore from Backup

```bash
# Decompress backup
gunzip ~/backups/apolo_dota2_2024-12-06.sql.gz

# Restore (after cleaning old data)
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U apolo_bot -d apolo_dota2 < ~/backups/apolo_dota2_2024-12-06.sql

# Verify
docker-compose -f docker-compose.prod.yml exec postgres psql -U apolo_bot -d apolo_dota2 -c "SELECT COUNT(*) FROM users;"
```

---

## Troubleshooting

### Bot Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs bot

# Common issues:
# 1. Invalid Discord token
# 2. Database not healthy
# 3. Missing environment variables

# Fix: Check .env file
nano .env

# Restart
docker-compose -f docker-compose.prod.yml restart bot
```

### Database Connection Failed

```bash
# Check Postgres health
docker-compose -f docker-compose.prod.yml logs postgres

# Connect to Postgres
docker-compose -f docker-compose.prod.yml exec postgres psql -U apolo_bot -d apolo_dota2

# Check tables
\dt

# Exit
\q
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Remove old images
docker image prune -a --filter "until=720h"

# Check container logs size
du -sh /var/lib/docker/containers/*/
```

### Services Not Communicating

```bash
# Check network
docker network ls
docker network inspect apolo-dota2_apolo-net

# Test connectivity
docker-compose -f docker-compose.prod.yml exec bot ping postgres
docker-compose -f docker-compose.prod.yml exec bot ping redis
```

### Restart All Services

```bash
# Graceful shutdown
docker-compose -f docker-compose.prod.yml down

# Restart everything
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## Security Checklist

- [ ] Changed Grafana admin password
- [ ] Redis has strong password
- [ ] Database has strong password
- [ ] .env file has `chmod 600` permissions
- [ ] PostgreSQL port 5432 NOT exposed to internet
- [ ] Redis port 6379 NOT exposed to internet
- [ ] SSH key configured (not password-based)
- [ ] Firewall configured (ufw)
- [ ] Regular backups scheduled
- [ ] Monitor disk space
- [ ] Monitor memory usage
- [ ] Update system regularly

---

## Firewall Configuration (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (CRITICAL!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Grafana
sudo ufw allow 3000/tcp

# Allow Prometheus (optional)
sudo ufw allow 9091/tcp

# Deny everything else (default)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check rules
sudo ufw status
```

---

## Updating Application

```bash
# Pull latest changes
cd ~/projects/Apolo-Dota2-Disc-Bot
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f bot
```

---

## Support & Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [Ubuntu Firewall (UFW)](https://help.ubuntu.com/community/UFW)

---

## Quick Command Reference

```bash
# Status
docker-compose -f docker-compose.prod.yml ps

# Logs
docker-compose -f docker-compose.prod.yml logs -f bot

# Stop all
docker-compose -f docker-compose.prod.yml down

# Start all
docker-compose -f docker-compose.prod.yml up -d

# Restart bot
docker-compose -f docker-compose.prod.yml restart bot

# SSH into bot
docker-compose -f docker-compose.prod.yml exec bot bash

# Backup
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U apolo_bot -d apolo_dota2 | gzip > backup.sql.gz

# System cleanup
docker system prune -a
```

---

**Last Updated:** December 6, 2025  
**Status:** Production Ready ✅
