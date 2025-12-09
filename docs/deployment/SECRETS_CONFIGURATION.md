# 🔐 GitHub Actions Secrets Configuration Checklist

**Este documento lista TODOS os secrets necessários** para o deployment funcionar.

## ✅ ANTES DE COMEÇAR

- [ ] Você tem acesso às settings da repository
- [ ] Você pode criar/editar repository secrets
- [ ] Todos os valores estão prontos (não copiar durante setup)
- [ ] Nenhuma informação sensível está em plaintext no git

---

## 📋 Secrets Necessários (15 total)

### 1. Docker & GitHub Container Registry (2 secrets)

| Secret | Description | How to Get | Required |
|--------|-------------|-----------|----------|
| `GITHUB_TOKEN` | Automatic token for GHCR access | Provided by GitHub (no action needed) | ✅ Auto |
| `VPS_SSH_KEY` | Private SSH key for VPS deployment | `ssh-keygen -t ed25519` → copy private key | ✅ **MANUAL** |

**VPS_SSH_KEY Setup:**
```bash
# Generate on your local machine:
ssh-keygen -t ed25519 -C "apolo-deploy" -f ~/.ssh/apolo_vps -N ""

# Show the private key:
cat ~/.ssh/apolo_vps

# Copy entire output (-----BEGIN OPENSSH PRIVATE KEY-----...-----END OPENSSH PRIVATE KEY-----)
# Paste into GitHub Secrets as VPS_SSH_KEY

# Copy public key to VPS:
ssh-copy-id -i ~/.ssh/apolo_vps.pub root@31.97.103.184
```

### 2. VPS Connection (2 secrets)

| Secret | Description | Example | Required |
|--------|-------------|---------|----------|
| `VPS_HOST` | VPS IP address | `31.97.103.184` | ✅ **MANUAL** |
| `VPS_USER` | SSH user on VPS | `root` | ✅ **MANUAL** |

### 3. Discord Configuration (2 secrets)

| Secret | Description | Where to Get | Required |
|--------|-------------|--------------|----------|
| `DISCORD_TOKEN` | Discord bot token (production) | [Discord Dev Portal](https://discord.com/developers/applications) → Bot → Token | ✅ **MANUAL** |
| `DISCORD_CLIENT_ID` | Discord application ID | [Discord Dev Portal](https://discord.com/developers/applications) → General Information | ✅ **MANUAL** |

**Optional:**
| Secret | Description | Required |
|--------|-------------|----------|
| `DISCORD_GUILD_ID` | Test server ID (for instant deploy) | ❌ Optional |

### 4. Database Configuration (2 secrets - Shared PostgreSQL 16)

| Secret | Description | Setup | Required |
|--------|-------------|-------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Format: `postgresql://apolo_user:PASSWORD@postgres:5432/apolo_dota2` | ✅ **MANUAL** |
| - | Already created on VPS | SSH to VPS and verify: `psql -U postgres -c "\l"` | ✅ Check |

**On VPS, already created:**
```sql
-- Created during VPS setup
CREATE DATABASE apolo_dota2 OWNER apolo_user;
```

### 5. Redis Configuration (1 secret - Shared Redis 7)

| Secret | Description | Setup | Required |
|--------|-------------|-------|----------|
| `REDIS_URL` | Redis connection URL | Format: `redis://:PASSWORD@redis:6379/0` | ✅ **MANUAL** |

**Note:** REDIS_PREFIX is hardcoded as `apolo` in code (namespace isolation)

### 6. Dota 2 API Keys (Stratz - 3 optional secrets)

| Secret | Description | Required? | Get from |
|--------|-------------|-----------|----------|
| `STRATZ_API_TOKEN_1` | Primary Stratz API token | ✅ **REQUIRED** | [stratz.com/api](https://stratz.com/api) |
| `STRATZ_API_TOKEN_2` | Secondary Stratz token (for rotation) | ❌ Optional | stratz.com/api |
| `STRATZ_API_TOKEN_3` | Tertiary Stratz token (for rotation) | ❌ Optional | stratz.com/api |

**Workflow rotates** between tokens to avoid rate limits (1000 requests/day per token).

### 7. AI & Third-party APIs (4+ secrets)

| Secret | Description | Required | Get from |
|--------|-------------|----------|----------|
| `STEAM_API_KEY` | Steam Web API key | ❌ Optional (OpenDota fallback exists) | [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey) |
| `GEMINI_API_KEY_1` | Primary Google Gemini API key | ✅ **REQUIRED** | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| `GEMINI_API_KEY_2` | Secondary Gemini key (for rotation) | ❌ Optional | aistudio.google.com/app/apikey |
| `GEMINI_API_KEY_3` | Tertiary Gemini key (for rotation) | ❌ Optional | aistudio.google.com/app/apikey |

---

## 🚀 Step-by-Step Configuration

### Step 1: Generate SSH Key Pair

```powershell
# Open PowerShell, run:
ssh-keygen -t ed25519 -C "apolo-deploy" -f $env:USERPROFILE\.ssh\apolo_vps -N ""

# Show private key (copy this entire output):
Get-Content $env:USERPROFILE\.ssh\apolo_vps | Set-Clipboard
# Output should be: -----BEGIN OPENSSH PRIVATE KEY----- ... -----END OPENSSH PRIVATE KEY-----
```

### Step 2: Add SSH Public Key to VPS

```bash
# SSH to VPS:
ssh root@31.97.103.184

# Run on VPS (paste your public key):
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
<your_public_key_content_from_apolo_vps.pub>
EOF
chmod 600 ~/.ssh/authorized_keys
exit
```

### Step 3: Create GitHub Secrets

Go to: **Settings → Secrets and variables → Actions**

**Add each secret individually:**

```
Name: VPS_SSH_KEY
Value: [Paste entire private key from Step 1]

Name: VPS_HOST
Value: 31.97.103.184

Name: VPS_USER
Value: root

Name: DISCORD_TOKEN
Value: [Get from Discord Dev Portal]

Name: DISCORD_CLIENT_ID
Value: [Get from Discord Dev Portal]

Name: DATABASE_URL
Value: postgresql://apolo_user:YOUR_PASSWORD@postgres:5432/apolo_dota2

Name: REDIS_URL
Value: redis://:YOUR_PASSWORD@redis:6379/0

Name: STRATZ_API_TOKEN_1
Value: [Get from stratz.com/api]

Name: GEMINI_API_KEY_1
Value: [Get from aistudio.google.com/app/apikey]

Name: STEAM_API_KEY (optional)
Value: [Get from steamcommunity.com/dev/apikey]
```

### Step 4: Verify Secrets are Configured

In GitHub: **Settings → Secrets and variables → Actions**

Should see:
```
✅ DATABASE_URL (configured)
✅ DISCORD_CLIENT_ID (configured)
✅ DISCORD_TOKEN (configured)
✅ GEMINI_API_KEY_1 (configured)
✅ REDIS_URL (configured)
✅ STRATZ_API_TOKEN_1 (configured)
✅ STEAM_API_KEY (configured)
✅ VPS_HOST (configured)
✅ VPS_SSH_KEY (configured)
✅ VPS_USER (configured)
```

---

## 🧪 Test Workflow Before Production

### Test 1: Verify Secrets Exist

```bash
# SSH to VPS and test connection:
ssh -i ~/.ssh/apolo_vps root@31.97.103.184 "echo ✅ SSH key works"
```

Expected: `✅ SSH key works`

### Test 2: Manual Workflow Trigger

1. Go to GitHub: **Actions → APOLO CI/CD Pipeline**
2. Click **"Run workflow"** → Branch: **main**
3. Click **green "Run workflow" button**
4. Monitor: Should see 3 jobs run:
   - ✅ CI - Tests & Lint
   - ✅ Build Docker Image
   - ✅ Deploy to VPS

### Test 3: Verify Deployment

After workflow completes:

```bash
# SSH to VPS:
ssh root@31.97.103.184

# Check container status:
docker ps | grep apolo-bot
# Should show: apolo-bot     <image>    Up X seconds    ...

# Check logs:
docker logs -f apolo-bot
# Should show:
# 🚀 Starting APOLO Dota 2 Bot...
# ✅ Connected to PostgreSQL database
# 🤖 Bot online as APOLO - Dota2#XXXX
```

### Test 4: Verify Discord Bot

In Discord server:

```
/dashboard
```

Expected: Bot responds with dashboard embed

---

## 🚨 Troubleshooting

### "Missing secrets" Error

**Problem:** Workflow fails with missing secrets

**Fix:**
1. Go to Settings → Secrets and variables → Actions
2. Verify all required secrets exist (check names exactly)
3. Secrets are case-sensitive: `DISCORD_TOKEN` ≠ `discord_token`

### SSH Connection Refused

**Problem:** `ssh: connect to host ... refused`

**Fix:**
1. Verify VPS IP is correct: `VPS_HOST = 31.97.103.184`
2. Verify SSH key is correct: regenerate and add to VPS
3. Check VPS is running: `ping 31.97.103.184`

### Docker Pull Fails (401 Unauthorized)

**Problem:** `docker pull ghcr.io/... 401 Unauthorized`

**Fix:**
1. Verify `GITHUB_TOKEN` is enabled (automatic)
2. Check repo visibility: must be accessible to the token
3. Workflow uses `actions/checkout@v4` (auto-authenticated)

### Database Connection Error

**Problem:** `failed to connect to database`

**Fix:**
1. Verify `DATABASE_URL` is correct format
2. SSH to VPS and test: `psql -U apolo_user -d apolo_dota2 -c "SELECT 1"`
3. Check PostgreSQL is running: `docker ps | grep postgres`

### Redis Connection Error

**Problem:** `failed to connect to redis`

**Fix:**
1. Verify `REDIS_URL` is correct format
2. SSH to VPS and test: `docker exec redis redis-cli -a PASSWORD ping`
3. Check Redis is running: `docker ps | grep redis`

---

## 📊 Secrets Summary Table

| # | Secret Name | Type | Required | How Often Used |
|---|------------|------|----------|---|
| 1 | GITHUB_TOKEN | Auth | Auto | Every build (GHCR push) |
| 2 | VPS_SSH_KEY | Auth | ✅ | Every deployment |
| 3 | VPS_HOST | Config | ✅ | Every deployment |
| 4 | VPS_USER | Config | ✅ | Every deployment |
| 5 | DISCORD_TOKEN | Auth | ✅ | Bot startup |
| 6 | DISCORD_CLIENT_ID | Config | ✅ | Bot startup |
| 7 | DATABASE_URL | Connection | ✅ | Bot startup + migrations |
| 8 | REDIS_URL | Connection | ✅ | Bot startup |
| 9 | STRATZ_API_TOKEN_1 | Auth | ✅ | Every API call (rotate if 429) |
| 10 | GEMINI_API_KEY_1 | Auth | ✅ | AI Coach feature (rotate if 429) |
| 11 | STRATZ_API_TOKEN_2 | Auth | ❌ | Optional fallback |
| 12 | STRATZ_API_TOKEN_3 | Auth | ❌ | Optional fallback |
| 13 | GEMINI_API_KEY_2 | Auth | ❌ | Optional fallback |
| 14 | GEMINI_API_KEY_3 | Auth | ❌ | Optional fallback |
| 15 | STEAM_API_KEY | Auth | ❌ | Profile fallback |

---

## ✅ Final Checklist

Before pushing code to trigger workflow:

- [ ] All 10 **required** secrets configured in GitHub
- [ ] SSH key pair generated and tested
- [ ] SSH public key added to VPS authorized_keys
- [ ] VPS connectivity verified (`ping 31.97.103.184`)
- [ ] Discord bot token copied from Dev Portal
- [ ] Stratz API token copied from stratz.com/api
- [ ] Gemini API key copied from aistudio.google.com
- [ ] DATABASE_URL verified (correct format)
- [ ] REDIS_URL verified (correct format)
- [ ] No secrets in plaintext in git history
- [ ] All secrets are unique and strong (min 16 chars for passwords)
- [ ] Team members notified of new deployment system

---

**Last Updated:** December 8, 2025  
**Workflow Version:** main.yml (unified CI/CD pipeline)  
**Status:** Ready for production deployment
