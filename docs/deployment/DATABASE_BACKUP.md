# 💾 Database Backup & Recovery Guide

Complete guide for backing up and restoring PostgreSQL database.

## 📊 Backup Strategy

### Automatic Daily Backups

**Schedule:** Every day at 3:00 AM UTC
**Retention:** 7 days (168 hours)
**Location:** `/root/apolo-backups/`
**Format:** Compressed SQL dump (`.sql.gz`)

### What's Backed Up

- ✅ All tables and data
- ✅ Indexes and constraints
- ✅ Database schema
- ✅ Sequences and views
- ✅ Permissions and roles

---

## 🚀 Setup Instructions

### 1. Upload Backup Scripts to VPS

```bash
# On your VPS
cd /root/Apolo-Dota2-Disc-Bot

# Make scripts executable
chmod +x scripts/backup-postgres.sh
chmod +x scripts/restore-postgres.sh

# Create backup directory
mkdir -p /root/apolo-backups
```

### 2. Configure Cron Job

```bash
# Edit crontab
crontab -e

# Add this line (backup daily at 3 AM)
0 3 * * * /root/Apolo-Dota2-Disc-Bot/scripts/backup-postgres.sh >> /var/log/apolo-backup.log 2>&1
```

**Verify cron is configured:**
```bash
crontab -l
```

### 3. Test Manual Backup

```bash
# Run backup manually
/root/Apolo-Dota2-Disc-Bot/scripts/backup-postgres.sh

# Check backup was created
ls -lh /root/apolo-backups/
```

---

## 📥 Manual Backup

### Create Backup Now

```bash
cd /root/Apolo-Dota2-Disc-Bot
./scripts/backup-postgres.sh
```

**Output:**
```
[2024-12-08 15:30:00] Starting PostgreSQL backup...
[INFO] Dumping database...
[SUCCESS] Backup created: apolo_20241208_153000.sql.gz (2.4M)
[INFO] Cleaning up old backups (keeping last 7 days)...
[INFO] Total backups stored: 5
[2024-12-08 15:30:15] Backup completed successfully!
```

---

## 🔄 Restore Database

### List Available Backups

```bash
cd /root/Apolo-Dota2-Disc-Bot
./scripts/restore-postgres.sh
```

**Output:**
```
Available backups:
/root/apolo-backups/apolo_20241208_030000.sql.gz (2.4M)
/root/apolo-backups/apolo_20241207_030000.sql.gz (2.3M)
/root/apolo-backups/apolo_20241206_030000.sql.gz (2.2M)

Usage: ./scripts/restore-postgres.sh <backup_file.sql.gz>
Example: ./scripts/restore-postgres.sh apolo_20241208_030000.sql.gz
```

### Restore from Backup

```bash
# Restore specific backup
./scripts/restore-postgres.sh apolo_20241208_030000.sql.gz
```

**Confirmation prompt:**
```
⚠️  WARNING: This will OVERWRITE the current database!
Restoring from: /root/apolo-backups/apolo_20241208_030000.sql.gz
Are you sure? (type 'yes' to continue):
```

**Restoration process:**
```
[2024-12-08 16:00:00] Starting database restore...
[INFO] Dropping existing database...
[INFO] Restoring from backup...
[SUCCESS] Database restored successfully!
[INFO] Tables found: 12
[INFO] Restarting bot...
[2024-12-08 16:00:45] Restore completed successfully!
```

---

## 🔍 Verification

### Check Backup Files

```bash
# List all backups
ls -lh /root/apolo-backups/

# Check backup size
du -sh /root/apolo-backups/

# Count backups
ls /root/apolo-backups/apolo_*.sql.gz | wc -l
```

### Verify Database After Restore

```bash
# Connect to database
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d apolo_dota2

# Check tables
\dt

# Count records in users table
SELECT COUNT(*) FROM users;

# Check recent matches
SELECT COUNT(*) FROM matches WHERE played_at > NOW() - INTERVAL '7 days';

# Exit
\q
```

---

## 📊 Monitoring

### Check Backup Logs

```bash
# View backup log
tail -f /var/log/apolo-backup.log

# Last 50 lines
tail -50 /var/log/apolo-backup.log

# Search for errors
grep ERROR /var/log/apolo-backup.log
```

### Disk Space

```bash
# Check backup directory size
du -sh /root/apolo-backups/

# Check VPS disk usage
df -h

# Free space on root partition
df -h / | awk 'NR==2 {print "Free: " $4 " (" $5 " used)"}'
```

---

## 🚨 Recovery Scenarios

### Scenario 1: Accidental Data Deletion

**Problem:** User accidentally deleted important data

**Solution:**
```bash
# 1. Stop bot to prevent new writes
docker-compose -f docker-compose.prod.yml stop bot

# 2. Restore from last backup
./scripts/restore-postgres.sh apolo_20241208_030000.sql.gz

# 3. Bot automatically restarts after restore
```

---

### Scenario 2: Database Corruption

**Problem:** Database is corrupted and bot can't start

**Solution:**
```bash
# 1. Check database status
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SELECT version();"

# 2. If database is corrupted, restore from backup
./scripts/restore-postgres.sh apolo_20241207_030000.sql.gz

# 3. Verify restoration
docker-compose -f docker-compose.prod.yml logs bot
```

---

### Scenario 3: VPS Failure - Migrate to New Server

**Problem:** VPS crashed, need to migrate to new server

**Solution:**

**Before failure (preparation):**
```bash
# 1. Download latest backup to local machine
scp root@vps_ip:/root/apolo-backups/apolo_latest.sql.gz ./backup.sql.gz
```

**After setting up new VPS:**
```bash
# 1. Upload backup to new VPS
scp ./backup.sql.gz root@new_vps_ip:/root/apolo-backups/

# 2. Setup Docker and deploy bot (follow VPS_DEPLOYMENT_GUIDE.md)

# 3. Restore backup
./scripts/restore-postgres.sh backup.sql.gz
```

---

## 🌍 Cloud Backup (Optional)

### Setup Rclone for Off-Site Backup

```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure cloud provider (Google Drive, Dropbox, etc.)
rclone config

# Test upload
rclone copy /root/apolo-backups/apolo_20241208_030000.sql.gz gdrive:apolo-backups/

# Add to backup script (already commented in backup-postgres.sh)
# Uncomment line 45 in scripts/backup-postgres.sh
```

---

## 📋 Backup Checklist

### Weekly Verification

- [ ] Check cron job is running: `crontab -l`
- [ ] Verify last backup exists: `ls -lh /root/apolo-backups/`
- [ ] Check backup log for errors: `tail /var/log/apolo-backup.log`
- [ ] Verify disk space: `df -h`
- [ ] Test restore on staging (optional)

### Monthly Tasks

- [ ] Download backup to local machine
- [ ] Verify backup integrity (test restore locally)
- [ ] Update retention policy if needed
- [ ] Check backup size growth trend

---

## 🔧 Troubleshooting

### Backup Script Fails

**Error:** `PostgreSQL container is not running!`
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Start if stopped
docker-compose -f docker-compose.prod.yml up -d postgres
```

**Error:** `Permission denied`
```bash
# Fix script permissions
chmod +x scripts/backup-postgres.sh
chmod +x scripts/restore-postgres.sh
```

### Disk Full

**Error:** No space left on device
```bash
# Clean old backups manually
rm /root/apolo-backups/apolo_202411*.sql.gz

# Or increase retention in backup script
# Edit scripts/backup-postgres.sh line 14:
RETENTION_DAYS=3  # Keep only 3 days instead of 7
```

### Restore Fails

**Error:** `Backup file not found`
```bash
# Check file exists
ls -lh /root/apolo-backups/

# Use full path
./scripts/restore-postgres.sh /root/apolo-backups/apolo_20241208_030000.sql.gz
```

---

## 📈 Capacity Planning

### Current Setup (100 Servers)

- **Expected DB size:** ~500MB - 2GB
- **Daily backup size:** ~2-5MB compressed
- **7-day retention:** ~14-35MB total
- **Disk space needed:** **1GB minimum**

### Growth Projections

| Servers | DB Size | Backup/Day | 7-Day Total |
|---------|---------|------------|-------------|
| 100 | 2GB | 5MB | 35MB |
| 500 | 10GB | 25MB | 175MB |
| 1000 | 20GB | 50MB | 350MB |

**Recommendation:** Keep **5GB free** on VPS for backups and logs.

---

## 🔒 Security

### Backup File Security

- ✅ Stored in `/root/` (root-only access)
- ✅ Compressed (reduces size and adds obfuscation)
- ✅ Not exposed via web server
- ✅ Not committed to Git (ignored in .gitignore)

### Recommended Enhancements

1. **Encrypt backups:**
```bash
# Add to backup script
gpg --encrypt --recipient your@email.com backup.sql.gz
```

2. **Restrict permissions:**
```bash
chmod 600 /root/apolo-backups/*.sql.gz
```

3. **Cloud backup with encryption:**
```bash
rclone copy --crypt-password="your-password" /root/apolo-backups/ crypt:
```

---

## 📞 Support

**Need help?**
- Check logs: `tail -f /var/log/apolo-backup.log`
- Test manually: `./scripts/backup-postgres.sh`
- Verify cron: `crontab -l`

**Emergency contact:** Check main README.md for support channels

---

**Last Updated:** December 8, 2024  
**Status:** Production Ready ✅
