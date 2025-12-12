# 🔐 GitHub Secrets - Configuração Completa

**Data:** 2025-12-11  
**Problema:** Deploy to VPS falhou - Secrets não configurados

## ⚠️ ERRO IDENTIFICADO

O workflow falhou porque **os GitHub Secrets não estão configurados**. Você precisa adicionar **17 secrets** manualmente no GitHub.

---

## 📋 Lista Completa de Secrets (17)

### 1️⃣ VPS Access (3 secrets)

Acesse: https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/settings/secrets/actions

#### `VPS_HOST`
```
31.97.103.184
```

#### `VPS_USER`
```
root
```

#### `VPS_SSH_KEY`
```
-----BEGIN OPENSSH PRIVATE KEY-----
<sua_chave_privada_ssh_completa>
-----END OPENSSH PRIVATE KEY-----
```

**Como obter:**
```powershell
# Gerar nova chave SSH
ssh-keygen -t ed25519 -C "apolo-deploy" -f apolo_deploy_key

# Copiar chave pública para VPS
type apolo_deploy_key.pub | ssh root@31.97.103.184 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Copiar chave privada (para GitHub Secret)
Get-Content apolo_deploy_key
# Copie TODO o conteúdo (incluindo -----BEGIN e -----END)
```

---

### 2️⃣ Discord (3 secrets)

#### `DISCORD_TOKEN`
```
Seu token atual do .env local
```
**Exemplo:** `MTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### `DISCORD_CLIENT_ID`
```
Seu client ID atual do .env local
```
**Exemplo:** `1445627094716387378`

#### `DISCORD_GUILD_ID` (OPCIONAL)
```
ID do seu servidor de testes
```

**Como obter:**
```
1. Discord Developer Portal: https://discord.com/developers/applications
2. Selecione sua aplicação "APOLO - Dota2"
3. Bot tab → Copy token
4. General Information → Application ID
```

---

### 3️⃣ Database (3 secrets)

#### `APOLO_DB_NAME`
```
apolo_dota2
```

#### `APOLO_DB_USER`
```
apolo_user
```

#### `APOLO_DB_PASSWORD`
```
<gere_senha_forte_minimo_16_caracteres>
```

**Gerar senha forte:**
```powershell
# PowerShell - Gerar senha aleatória
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object {[char]$_})
# Exemplo: ApoloSecure2024!@#ProDB456
```

**IMPORTANTE:** Anote essa senha, você precisará criar o usuário na VPS depois!

---

### 4️⃣ Redis (1 secret)

#### `REDIS_PASSWORD`
```
<senha_atual_do_redis_na_vps>
```

**Como obter da VPS:**
```powershell
# SSH na VPS e verificar senha do Redis
ssh root@31.97.103.184 "grep REDIS_PASSWORD /root/.env"
# Copie a senha exibida
```

---

### 5️⃣ API Keys (6 secrets - 3 obrigatórios)

#### `STRATZ_API_TOKEN_1` (OBRIGATÓRIO)
```
Seu token Stratz atual do .env local
```
**Exemplo:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### `STRATZ_API_TOKEN_2` (OPCIONAL)
```
Token adicional se você tiver
```

#### `STRATZ_API_TOKEN_3` (OPCIONAL)
```
Token adicional se você tiver
```

#### `STEAM_API_KEY` (OBRIGATÓRIO)
```
Sua chave Steam Web API do .env local
```
**Exemplo:** `A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6`

#### `GEMINI_API_KEY_1` (OBRIGATÓRIO)
```
Sua chave Gemini API do .env local
```
**Exemplo:** `AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### `GEMINI_API_KEY_2` (OPCIONAL)
```
Chave adicional se você tiver
```

**Como obter:**
- Stratz: https://stratz.com/api
- Steam: https://steamcommunity.com/dev/apikey
- Gemini: https://aistudio.google.com/app/apikey

---

### 6️⃣ Container Registry (1 secret)

#### `GHCR_TOKEN`
```
<github_personal_access_token>
```

**Como criar:**
1. Acesse: https://github.com/settings/tokens/new
2. Nome: `APOLO GHCR Access`
3. Expiration: `No expiration` (ou 1 year)
4. Permissions:
   - ✅ `write:packages` (Push/pull packages)
   - ✅ `read:packages` (Download packages)
5. Clique em `Generate token`
6. **COPIE O TOKEN IMEDIATAMENTE** (não aparece novamente)

**Exemplo:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🚀 Passo a Passo: Como Adicionar Secrets

### Via GitHub Web

1. **Acesse:** https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/settings/secrets/actions

2. **Clique:** `New repository secret`

3. **Para cada secret:**
   - Name: `VPS_HOST` (exatamente como escrito acima)
   - Secret: `31.97.103.184` (valor correspondente)
   - Clique `Add secret`

4. **Repita para TODOS os 17 secrets**

5. **Verifique:**
   - Settings → Secrets and variables → Actions
   - Deve mostrar **17 secrets** configurados

---

## 🔍 Checklist de Validação

Antes de fazer deploy, marque todos:

### VPS Access
- [ ] `VPS_HOST` = 31.97.103.184
- [ ] `VPS_USER` = root
- [ ] `VPS_SSH_KEY` = Chave privada completa (com BEGIN/END)

### Discord
- [ ] `DISCORD_TOKEN` = Token completo (~70+ chars)
- [ ] `DISCORD_CLIENT_ID` = 18-19 dígitos
- [ ] `DISCORD_GUILD_ID` = (opcional)

### Database
- [ ] `APOLO_DB_NAME` = apolo_dota2
- [ ] `APOLO_DB_USER` = apolo_user
- [ ] `APOLO_DB_PASSWORD` = Senha forte (16+ chars)

### Redis
- [ ] `REDIS_PASSWORD` = Senha do Redis na VPS

### API Keys
- [ ] `STRATZ_API_TOKEN_1` = Token Stratz (JWT format)
- [ ] `STEAM_API_KEY` = 32 caracteres hexadecimais
- [ ] `GEMINI_API_KEY_1` = AIzaSy... (39 chars)

### Container Registry
- [ ] `GHCR_TOKEN` = ghp_... (40 chars)

---

## ⚙️ Após Configurar Secrets

### Opção 1: Re-run do Workflow (Recomendado)

1. Acesse: https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/actions/runs/20154469335
2. Clique: `Re-run all jobs`
3. Aguarde ~5-7 minutos

### Opção 2: Novo Push

```powershell
# Fazer pequena alteração
echo "" >> README.md

# Commit e push
git add README.md
git commit -m "chore: trigger deploy with secrets configured"
git push origin main
```

---

## 🔐 Criar Usuário de Database na VPS

**IMPORTANTE:** Depois de configurar secrets, você precisa criar o usuário no PostgreSQL:

```bash
# SSH na VPS
ssh root@31.97.103.184

# Criar usuário e database
docker exec postgres psql -U postgres << EOF
CREATE USER apolo_user WITH PASSWORD 'SUA_SENHA_DO_SECRET_APOLO_DB_PASSWORD';
CREATE DATABASE apolo_dota2 OWNER apolo_user;
GRANT ALL PRIVILEGES ON DATABASE apolo_dota2 TO apolo_user;
\q
EOF

# Verificar
docker exec postgres psql -U postgres -c "\du"
docker exec postgres psql -U postgres -c "\l"
```

---

## ❓ Troubleshooting

### Secret não funciona após adicionar

**Causa:** Secret com espaços extras ou quebras de linha

**Solução:**
```powershell
# Copiar secret sem espaços
$token = "MTxxxxxxxxx".Trim()
echo $token  # Copiar e colar no GitHub
```

### SSH Key inválido

**Causa:** Chave com formato Windows (CRLF)

**Solução:**
```powershell
# Converter para Unix (LF)
(Get-Content apolo_deploy_key -Raw) -replace "`r`n", "`n" | Set-Content -NoNewline apolo_deploy_key_unix
# Copiar conteúdo de apolo_deploy_key_unix para GitHub
```

### GHCR Token sem permissão

**Causa:** Token criado sem `write:packages`

**Solução:**
1. Delete o token antigo em https://github.com/settings/tokens
2. Crie novo com permissões corretas
3. Atualize secret `GHCR_TOKEN` no GitHub

---

## 🎯 Próximos Passos

Depois de configurar TODOS os secrets:

1. ✅ Configurar os 17 secrets no GitHub
2. ✅ Criar usuário PostgreSQL na VPS
3. ✅ Re-run do workflow ou novo push
4. ✅ Aguardar deploy (~5-7 min)
5. ✅ Testar bot no Discord: `/dashboard`

---

**Última atualização:** 2025-12-11  
**Status:** Aguardando configuração de secrets
