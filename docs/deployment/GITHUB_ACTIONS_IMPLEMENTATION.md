# 🚀 GitHub Actions Professional Implementation Guide

**Complete step-by-step guide to configure and deploy the new CI/CD pipeline.**

---

## 📋 Overview

This guide implements a **professional-grade GitHub Actions workflow** with:

✅ **3-stage pipeline:** CI Tests → Docker Build → VPS Deployment  
✅ **Security best practices:** Minimal permissions, secret masking, SSH hardening  
✅ **Automatic retry:** Handles transient failures gracefully  
✅ **Comprehensive logging:** Debug-friendly output  
✅ **Zero downtime:** Smart deployment strategy  

**Workflow Files:**
- Old (broken): `deploy-vps.yml` (REMOVED ✅)
- Old (partial): `ci.yml` (REMOVED ✅)
- **New (unified):** `main.yml` (ACTIVE NOW)

---

## ⏱️ Time Estimate

| Phase | Duration | Effort |
|-------|----------|--------|
| **Phase 1:** Generate SSH Key | 5 min | ⭐ Easy |
| **Phase 2:** Configure GitHub Secrets | 15 min | ⭐ Easy |
| **Phase 3:** Verify Pre-requisites | 10 min | ⭐⭐ Medium |
| **Phase 4:** Test Workflow Trigger | 5 min | ⭐ Easy |
| **Phase 5:** Verify Deployment | 10 min | ⭐⭐ Medium |
| **TOTAL** | ~45 min | Manageable |

---

## 🔐 Phase 1: Generate SSH Key

### Step 1.1: Create SSH Key Pair

**On Windows (PowerShell):**

```powershell
# Open PowerShell and run:
ssh-keygen -t ed25519 -C "apolo-deploy" -f $env:USERPROFILE\.ssh\apolo_vps -N ""

# Verify files created:
ls $env:USERPROFILE\.ssh\apolo_vps*
# Should show:
# - apolo_vps (private key)
# - apolo_vps.pub (public key)
```

**On Linux/Mac (Bash):**

```bash
ssh-keygen -t ed25519 -C "apolo-deploy" -f ~/.ssh/apolo_vps -N ""
```

### Step 1.2: Display Private Key

**Windows:**

```powershell
# Copy private key to clipboard:
Get-Content $env:USERPROFILE\.ssh\apolo_vps | Set-Clipboard

# Verify it starts with -----BEGIN OPENSSH PRIVATE KEY-----
# You'll paste this into GitHub Secrets as VPS_SSH_KEY
```

**Linux/Mac:**

```bash
cat ~/.ssh/apolo_vps | pbcopy  # macOS
cat ~/.ssh/apolo_vps | xclip   # Linux
```

### Step 1.3: Add Public Key to VPS

```bash
# SSH to VPS:
ssh root@31.97.103.184

# Create .ssh directory if needed:
mkdir -p ~/.ssh

# Add your public key:
cat >> ~/.ssh/authorized_keys << 'EOF'
<paste_your_apolo_vps.pub_content_here>
EOF

# Set correct permissions:
chmod 600 ~/.ssh/authorized_keys

# Verify it works:
exit

# Test SSH (from your local machine):
ssh -i $env:USERPROFILE\.ssh\apolo_vps root@31.97.103.184 "echo ✅ SSH works"
```

---

## 🔐 Phase 2: Configure GitHub Secrets

### Step 2.1: Access Repository Settings

1. Go to: **https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot**
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Step 2.2: Add SSH & VPS Secrets

**Secret 1: VPS_SSH_KEY**
```
Name: VPS_SSH_KEY
Value: [Paste entire private key from Step 1.2]
       (must start with -----BEGIN OPENSSH PRIVATE KEY-----)
       (must end with -----END OPENSSH PRIVATE KEY-----)
```

**Secret 2: VPS_HOST**
```
Name: VPS_HOST
Value: 31.97.103.184
```

**Secret 3: VPS_USER**
```
Name: VPS_USER
Value: root
```

### Step 2.3: Add Discord Secrets

**Secret 4: DISCORD_TOKEN**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select "APOLO - Dota2" application
3. Go to **Bot** → **Token** → Click **Reset Token**
4. Copy token and paste as:

```
Name: DISCORD_TOKEN
Value: [Your Discord bot token]
```

**Secret 5: DISCORD_CLIENT_ID**
1. Same portal, go to **General Information**
2. Copy **Application ID** and paste as:

```
Name: DISCORD_CLIENT_ID
Value: [Your application ID]
```

### Step 2.4: Add Database Secrets

**Secret 6: DATABASE_URL**
```
Name: DATABASE_URL
Value: postgresql://apolo_user:YOUR_PASSWORD@postgres:5432/apolo_dota2

Note: Replace YOUR_PASSWORD with the one set on VPS
      Password should match what was used when creating apolo_user
```

**Secret 7: REDIS_URL**
```
Name: REDIS_URL
Value: redis://:YOUR_PASSWORD@redis:6379/0

Note: Replace YOUR_PASSWORD with Redis password on VPS
```

### Step 2.5: Add API Keys

**Secret 8: STRATZ_API_TOKEN_1**
1. Go to [stratz.com/api](https://stratz.com/api)
2. Sign up/login (use Discord)
3. Generate API token
4. Paste as:

```
Name: STRATZ_API_TOKEN_1
Value: [Your Stratz API token]
```

**Secret 9: GEMINI_API_KEY_1**
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with Google
3. Create API key
4. Paste as:

```
Name: GEMINI_API_KEY_1
Value: [Your Gemini API key]
```

**Optional Secret 10: STEAM_API_KEY**
```
Name: STEAM_API_KEY
Value: [Your Steam API key - optional]
```

### Step 2.6: Verify All Secrets

In GitHub Secrets page, you should see:

```
✅ DATABASE_URL
✅ DISCORD_CLIENT_ID
✅ DISCORD_TOKEN
✅ GEMINI_API_KEY_1
✅ REDIS_URL
✅ STEAM_API_KEY (optional)
✅ STRATZ_API_TOKEN_1
✅ VPS_HOST
✅ VPS_SSH_KEY
✅ VPS_USER
```

---

## ✅ Phase 3: Verify Pre-requisites

### Step 3.1: Test VPS Connectivity

```powershell
# Test SSH connection:
ssh -i $env:USERPROFILE\.ssh\apolo_vps root@31.97.103.184 "echo ✅ SSH works"

# Expected output: ✅ SSH works
```

### Step 3.2: Verify VPS Database Setup

```powershell
# SSH to VPS:
ssh -i $env:USERPROFILE\.ssh\apolo_vps root@31.97.103.184

# Inside VPS shell, run:
# Check PostgreSQL
docker exec postgres psql -U postgres -c "\l" | grep apolo_dota2
# Should show: apolo_dota2 | apolo_user | UTF8 | ...

# Check Redis
docker exec redis redis-cli -a YOUR_PASSWORD ping
# Should show: PONG

# Exit SSH
exit
```

### Step 3.3: Validate Local Secrets

```powershell
# Test locally with npm script:
npm run validate:secrets

# Expected output:
# ✅ VPS_HOST
# ✅ VPS_USER
# ✅ VPS_SSH_KEY
# ✅ DISCORD_TOKEN
# ✅ DISCORD_CLIENT_ID
# ✅ DATABASE_URL
# ✅ REDIS_URL
# ✅ STRATZ_API_TOKEN_1
# ✅ GEMINI_API_KEY_1
#
# Required secrets: 9/9
# Optional secrets: 0/1
# ✅ Ready for deployment
```

### Step 3.4: Check Workflow File

```powershell
# Verify workflow syntax is valid:
cd x:\UP\ PROJECT\ -\ Bots\ DISCORD\BOT\ DISC\ -\ APOLO\ DOTA2

# View workflow:
cat .github\workflows\main.yml | head -20

# Should show:
# name: APOLO CI/CD Pipeline
# on:
#   push:
#     branches: [main, develop]
#   pull_request:
#     branches: [main, develop]
#   workflow_dispatch:
```

---

## 🧪 Phase 4: Test Workflow Trigger

### Step 4.1: Manual Workflow Trigger (Recommended First Test)

1. Go to GitHub repository
2. Click **Actions** → **APOLO CI/CD Pipeline**
3. Click **Run workflow** dropdown
4. Select Branch: **main**
5. Click **Run workflow** button (green)

### Step 4.2: Monitor Workflow Execution

1. In GitHub, click **Actions** (top navigation)
2. Click the latest run (should show your trigger)
3. Watch the 3 jobs:

**Job 1: CI - Tests & Lint**
- [ ] Checkout code
- [ ] Setup Node.js
- [ ] Install dependencies
- [ ] Run ESLint
- [ ] Type check
- [ ] Build TypeScript
- [ ] Run migrations (test DB)
- [ ] Run unit tests
- [ ] Expected: ✅ All green

**Job 2: Build Docker Image**
- [ ] Checkout code
- [ ] Setup Docker Buildx
- [ ] Log in to GHCR
- [ ] Extract metadata
- [ ] Build & push image
- [ ] Expected: ✅ Image pushed to ghcr.io

**Job 3: Deploy to VPS**
- [ ] Validate secrets
- [ ] Setup SSH key
- [ ] Copy docker-compose file
- [ ] Deploy to VPS
- [ ] Run migrations
- [ ] Verify deployment
- [ ] Expected: ✅ Container running on VPS

### Step 4.3: Check Logs for Errors

If any job fails:

1. Click the failed job
2. Click **Logs** tab
3. Scroll to find the error line
4. Common errors:

| Error | Solution |
|-------|----------|
| `authentication failed` | Check SSH key in secrets |
| `Connection refused` | Check VPS_HOST IP address |
| `Missing secrets` | Verify all secrets configured |
| `Docker pull: 401 Unauthorized` | Check GITHUB_TOKEN permissions |
| `Database connection error` | Verify DATABASE_URL format |

---

## 🎉 Phase 5: Verify Deployment

### Step 5.1: Check Bot is Running on VPS

```powershell
# SSH to VPS:
ssh -i $env:USERPROFILE\.ssh\apolo_vps root@31.97.103.184

# Check container status:
docker ps | grep apolo-bot

# Should show:
# apolo-bot  ghcr.io/upgrade-near-me/apolo:latest  Up 2 minutes
```

### Step 5.2: Check Bot Logs

```bash
# Inside VPS SSH:
docker logs -f apolo-bot

# Should show (within 10 seconds):
# 🚀 Starting APOLO Dota 2 Bot...
# ✅ Connected to PostgreSQL database
# ✅ Connected to Redis
# 🤖 Bot online as APOLO - Dota2#XXXX
# 📊 Serving 1 servers
# 🎉 Bot fully initialized and ready!
```

### Step 5.3: Verify Discord Bot

In Discord server:

```
/dashboard
```

Should show: APOLO Dashboard embed with buttons

### Step 5.4: Check Health Endpoint

```bash
# Inside VPS SSH:
docker exec apolo-bot curl http://localhost:9100/health

# Should return:
# {"status":"ok","uptime":123}
```

### Step 5.5: Verify Database Connectivity

```bash
# Inside VPS SSH:
docker exec apolo-bot npx tsx -e "
import pool from './dist/database/index.js';
pool.query('SELECT 1').then(() => {
  console.log('✅ Database OK');
  process.exit(0);
}).catch(e => {
  console.log('❌ Database Error:', e.message);
  process.exit(1);
});
"
```

---

## 🔄 Phase 6: Test with Real Code Change

### Step 6.1: Make a Test Change

```powershell
# Create a test branch:
git checkout -b test/workflow-validation

# Make a small change (e.g., update a comment):
# Edit src/index.ts - add a comment on line 1

# Commit:
git add .
git commit -m "test: workflow validation"

# Push:
git push origin test/workflow-validation
```

### Step 6.2: Create Pull Request

1. Go to GitHub repository
2. Click **Pull requests** → **New pull request**
3. Compare: `test/workflow-validation` → `main`
4. Create PR

### Step 6.3: Watch Workflow Run

- CI tests should run automatically
- Expected: 2 jobs run (CI & Build - not Deploy for PR)
- Deploy should NOT run for pull requests (only on main push)

### Step 6.4: Merge to Main and Verify Deploy

1. If PR checks pass: Click **Merge pull request**
2. Go to **Actions** → Watch workflow
3. All 3 jobs should run including **Deploy to VPS**
4. Verify bot still running: `docker ps | grep apolo-bot`

---

## 🔍 Validation Checklist

Complete this before considering deployment ready:

### Pre-Deployment
- [ ] SSH key generated and tested
- [ ] All 9 required secrets configured in GitHub
- [ ] `npm run validate:secrets` outputs "✅ Ready for deployment"
- [ ] Workflow file exists at `.github/workflows/main.yml`
- [ ] Old workflows removed (deploy-vps.yml, ci.yml)

### Workflow Trigger
- [ ] Manual trigger test: workflow runs all 3 jobs ✅
- [ ] Job 1 (CI): All tests pass ✅
- [ ] Job 2 (Build): Docker image pushed to GHCR ✅
- [ ] Job 3 (Deploy): VPS deployment succeeds ✅

### Deployment Verification
- [ ] Bot container running on VPS: `docker ps | grep apolo-bot`
- [ ] Bot logs show healthy startup: `docker logs apolo-bot | head -20`
- [ ] Discord slash commands work: `/dashboard` responds
- [ ] Database migrations completed: No SQL errors in logs
- [ ] Health endpoint responds: `curl http://localhost:9100/health`

### Real Code Test
- [ ] Pull request created with code change
- [ ] CI workflow runs (no deploy for PR) ✅
- [ ] Merge PR to main
- [ ] Full pipeline runs (including deploy) ✅
- [ ] Bot still online and working after merge

---

## 📱 Daily Operations

### Push New Changes

```powershell
# Make changes:
vim src/commands/dashboard.ts

# Commit:
git add .
git commit -m "feat: add new feature"

# Push to main (auto-triggers workflow):
git push origin main

# Monitor in GitHub Actions:
# - Workflow runs automatically
# - All 3 jobs execute
# - Deployment to VPS happens
# - Bot restarts with new code
```

### Monitor Deployment

```powershell
# Check latest run:
npm run monitor:ci

# Watch logs:
ssh -i ~/.ssh/apolo_vps root@31.97.103.184 "docker logs -f apolo-bot"

# Health check:
ssh -i ~/.ssh/apolo_vps root@31.97.103.184 "docker exec apolo-bot curl http://localhost:9100/health"
```

### Rollback if Needed

```bash
# SSH to VPS:
ssh root@31.97.103.184

# Stop current deployment:
docker-compose -p apolo down

# Pull previous image:
docker pull ghcr.io/upgrade-near-me/apolo:latest  # or specific tag

# Restart:
docker-compose -p apolo up -d

# Verify:
docker logs -f apolo-bot
```

---

## 🚨 Troubleshooting

### Workflow Doesn't Trigger After Push

**Problem:** Push to main but workflow doesn't run

**Solutions:**
1. Check file changes: non-.md files changed?
2. Verify branch is `main` (not typo like `Main`)
3. Check workflow file syntax: `.github/workflows/main.yml` exists?
4. Manually trigger: **Actions** → **Run workflow** button

### SSH Connection Fails in Workflow

**Problem:** `ssh: connect to host 31.97.103.184 port 22: Connection refused`

**Solutions:**
1. Verify VPS is online: `ping 31.97.103.184`
2. Test SSH locally: `ssh -i ~/.ssh/apolo_vps root@31.97.103.184`
3. Check VPS_SSH_KEY secret: must contain full key (BEGIN...END)
4. Regenerate SSH key if needed

### Docker Pull Fails (401 Unauthorized)

**Problem:** `docker pull ghcr.io/upgrade-near-me/apolo:latest: 401 Unauthorized`

**Solutions:**
1. Verify GITHUB_TOKEN is available (automatic)
2. Check image was pushed: Go to GitHub → Packages
3. Verify Docker login succeeded
4. Check registry login step in logs

### Database Migrations Error

**Problem:** `Error: password authentication failed for user "apolo_user"`

**Solutions:**
1. Verify `DATABASE_URL` format is correct
2. Test on VPS: `psql postgresql://apolo_user:PASSWORD@postgres:5432/apolo_dota2`
3. Recreate database user if needed
4. Check password doesn't have special chars needing escaping

### Redis Connection Error

**Problem:** `NOAUTH Authentication required`

**Solutions:**
1. Verify `REDIS_URL` includes password
2. Test on VPS: `redis-cli -a PASSWORD ping`
3. Check Redis password is correct
4. Ensure Redis container is running

---

## 📞 Support

If stuck:

1. **Check logs:** GitHub Actions shows detailed error messages
2. **Test locally:** `npm run validate:secrets` before deployment
3. **Manual SSH test:** Verify VPS connectivity manually
4. **Review docs:** See `/docs/deployment/SECRETS_CONFIGURATION.md`

---

**You're all set! 🎉**

The workflow is ready for production deployment. Every push to `main` will automatically:
1. Run CI tests
2. Build Docker image
3. Deploy to VPS
4. Run migrations
5. Start the bot

Enjoy automated, reliable deployments! 🚀

