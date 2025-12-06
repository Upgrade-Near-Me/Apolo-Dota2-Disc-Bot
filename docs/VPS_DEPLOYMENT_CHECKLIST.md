# ✅ VPS Deployment Checklist

Complete checklist before deploying to production VPS.

## Pre-Deployment (Local)

### Code Review
- [ ] All 27 TypeScript errors reviewed
- [ ] Dockerfile tested locally
- [ ] docker-compose.prod.yml validated
- [ ] All services start without errors
- [ ] Bot connects to Discord
- [ ] Prometheus scrapes metrics
- [ ] Grafana dashboards display data

### Security Audit
- [ ] No credentials in .env (all empty templates)
- [ ] API keys ready (Stratz, Steam, Gemini)
- [ ] Discord token valid
- [ ] Database password generated (16+ chars, mixed case)
- [ ] Redis password generated (16+ chars, mixed case)
- [ ] Grafana password generated (12+ chars, mixed case)
- [ ] .gitignore includes .env and secrets

### Documentation
- [ ] VPS_DEPLOYMENT_GUIDE.md reviewed
- [ ] docker-compose.prod.yml commented
- [ ] .env.example complete with all fields
- [ ] Backup strategy documented
- [ ] Restore procedure tested

### Commit & Push
- [ ] All files committed
- [ ] docker-compose.prod.yml in repo
- [ ] VPS_DEPLOYMENT_GUIDE.md in repo
- [ ] .env.example updated
- [ ] Changes pushed to GitHub

---

## VPS Setup

### Initial Access
- [ ] Hostinger VPS purchased
- [ ] SSH key configured (not password)
- [ ] Can SSH without password
- [ ] Root access verified

### System Preparation
- [ ] Ubuntu 22.04 LTS confirmed (`lsb_release -a`)
- [ ] System updated (`apt update && apt upgrade -y`)
- [ ] Essential tools installed (curl, wget, git, htop)
- [ ] Non-root user created (apolo)
- [ ] sudo access verified for new user

### Firewall
- [ ] UFW enabled (`sudo ufw enable`)
- [ ] SSH allowed (port 22)
- [ ] HTTP allowed (port 80)
- [ ] HTTPS allowed (port 443)
- [ ] Grafana allowed (port 3000)
- [ ] Prometheus NOT public (port 9091)
- [ ] PostgreSQL NOT public (port 5432)
- [ ] Redis NOT public (port 6379)

### Docker Installation
- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Docker daemon running (`sudo systemctl status docker`)
- [ ] Docker service enabled on boot
- [ ] Non-root user added to docker group
- [ ] Hello-world test passed

---

## Application Deployment

### Repository
- [ ] Code cloned to ~/projects/Apolo-Dota2-Disc-Bot
- [ ] Branch is main
- [ ] Latest changes pulled (`git pull origin main`)

### Environment Configuration
- [ ] .env created from .env.example
- [ ] All required variables filled:
  - [ ] DISCORD_TOKEN
  - [ ] DISCORD_CLIENT_ID
  - [ ] DB_PASSWORD (strong, 16+ chars)
  - [ ] REDIS_PASSWORD (strong, 16+ chars)
  - [ ] STRATZ_API_TOKEN_1
  - [ ] STEAM_API_KEY
  - [ ] GEMINI_API_KEY_1
  - [ ] GRAFANA_ADMIN_PASSWORD (strong, 12+ chars)
- [ ] NODE_ENV=production
- [ ] .env has 600 permissions (`chmod 600 .env`)
- [ ] .env NOT committed to Git
- [ ] Backup of .env made (`cp .env ~/backup.env`)

### Docker Compose Build
- [ ] infra/ directories created
- [ ] prometheus.yml in place
- [ ] postgres init.sql in place
- [ ] docker-compose.prod.yml has latest changes
- [ ] Build successful (`docker-compose -f docker-compose.prod.yml build`)

### Service Startup
- [ ] All containers started (`docker-compose -f docker-compose.prod.yml up -d`)
- [ ] All containers healthy (check with `ps`)
- [ ] Postgres healthy (wait ~30 seconds)
- [ ] Redis healthy
- [ ] Bot healthy
- [ ] Prometheus running
- [ ] Grafana running

### Database Initialization
- [ ] Migrations ran successfully:
  ```bash
  docker-compose -f docker-compose.prod.yml exec bot npx tsx src/database/migrate.ts
  ```
- [ ] Tables created (`docker-compose ... exec postgres psql ... \dt`)
- [ ] Bot connected to database

### Discord Commands
- [ ] Commands deployed:
  ```bash
  docker-compose -f docker-compose.prod.yml exec bot npx tsx src/deploy-commands.ts
  ```
- [ ] Checked bot logs for confirmation
- [ ] Commands visible in Discord

---

## Verification & Testing

### Services Health Check
- [ ] Bot logs show "Bot online" message
- [ ] Bot shows "fully initialized and ready!"
- [ ] Prometheus scraping bot metrics
- [ ] Grafana has datasource configured
- [ ] Dashboard shows metrics

### Discord Bot Testing
- [ ] Bot appears online in Discord
- [ ] Slash commands available
- [ ] Can run /dashboard command
- [ ] No errors in bot logs

### Monitoring Access
- [ ] Grafana accessible at http://vps_ip:3000
- [ ] Can login with admin credentials
- [ ] Default dashboard shows data
- [ ] Changed admin password

### Data Persistence
- [ ] Docker volumes created
- [ ] Data survives container restart:
  ```bash
  docker-compose -f docker-compose.prod.yml restart
  ```
- [ ] Bot reconnects after restart
- [ ] Database data intact

---

## Backup & Recovery Setup

### Backup Script
- [ ] Backup directory created (`mkdir -p ~/backups`)
- [ ] Backup script created (`~/backup-apolo.sh`)
- [ ] Backup script executable (`chmod +x ~/backup-apolo.sh`)
- [ ] Manual backup tested:
  ```bash
  ~/backup-apolo.sh
  ```
- [ ] Backup file created and compressed

### Automated Backups
- [ ] Crontab entry added (daily 2 AM)
- [ ] Crontab verified (`crontab -l`)
- [ ] Cron logs monitored

### Recovery Testing
- [ ] Restore procedure documented
- [ ] Tested restore from backup (on test instance)
- [ ] Data verified after restore

---

## Security Hardening

### SSH Security
- [ ] SSH key authentication only (no password)
- [ ] SSH port 22 in firewall whitelist
- [ ] root SSH login disabled
- [ ] SSH timeout configured

### Application Security
- [ ] .env file permissions: 600
- [ ] PostgreSQL not publicly accessible
- [ ] Redis not publicly accessible
- [ ] Prometheus not publicly accessible
- [ ] API keys not logged anywhere
- [ ] Secrets not in error messages

### Container Security
- [ ] Containers run as non-root user
- [ ] Read-only filesystem where possible
- [ ] tmpfs for temp files
- [ ] Resource limits set (if needed)

### Updates & Patches
- [ ] System updated (`apt update && apt upgrade`)
- [ ] Docker images from official sources
- [ ] Regular update schedule planned

---

## Monitoring & Maintenance

### Log Monitoring
- [ ] Bot logs reviewed for errors
- [ ] System logs reviewed (`journalctl`)
- [ ] Container logs rotation configured

### Performance Monitoring
- [ ] Memory usage acceptable (`docker stats`)
- [ ] CPU usage acceptable
- [ ] Disk space available (20%+ free)
- [ ] Network connectivity stable

### Alerting (Optional)
- [ ] Prometheus alerts configured (if needed)
- [ ] Notification channels configured
- [ ] Test alert sent

### Scheduled Tasks
- [ ] Daily backup cron job running
- [ ] Update check schedule planned
- [ ] Log rotation configured

---

## Go-Live Checklist

- [ ] All checks above completed
- [ ] Backup verified and restorable
- [ ] Discord bot fully tested
- [ ] Grafana accessible and configured
- [ ] Team notified of deployment
- [ ] Post-deployment rollback plan documented
- [ ] Support contact info shared
- [ ] Monitoring dashboard accessible

---

## Post-Deployment (Week 1)

- [ ] Monitor bot performance
- [ ] Check error rates in Grafana
- [ ] Verify backup completion
- [ ] Test disaster recovery
- [ ] Document any issues encountered
- [ ] Optimize resource allocation if needed
- [ ] Schedule security audit
- [ ] Plan maintenance windows

---

## Post-Deployment (Monthly)

- [ ] Review logs for errors
- [ ] Update dependencies
- [ ] Backup integrity test
- [ ] Security patches applied
- [ ] Performance review
- [ ] Disaster recovery drill
- [ ] Access log audit

---

**Status:** Ready for deployment ✅  
**Date:** December 6, 2025  
**Next Review:** January 6, 2026
