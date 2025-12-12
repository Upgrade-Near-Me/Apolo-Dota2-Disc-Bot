# 🔐 Secrets Validation Guide

Como verificar se suas GitHub Secrets estão corretas e funcionando.

## 📋 Métodos de Validação

### Método 1: GitHub Actions (Recomendado)

Execute o workflow de teste:

1. **Acesse:** `https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/actions`
2. **Selecione:** `Test Secrets & Connections`
3. **Clique:** `Run workflow`
4. **Configure:**
   - ✅ Test VPS SSH connection
   - ✅ Test API keys
5. **Clique:** `Run workflow` (botão verde)

**O que será testado:**
- ✅ Discord Token e Client ID
- ✅ Database credentials (user, password, name)
- ✅ Redis password
- ✅ Stratz API (com request real)
- ✅ Steam API (com request real)
- ✅ Gemini API (com request real)
- ✅ VPS SSH connection
- ✅ Docker containers na VPS
- ✅ GHCR token (login test)

**Tempo:** ~2-3 minutos

---

### Método 2: Script Local

Execute localmente para testar com suas variáveis `.env`:

```powershell
# Verificar secrets locais
npm run validate:secrets
```

**O que verifica:**
- ✅ Variáveis de ambiente carregadas
- ✅ Formato correto (comprimento, formato)
- ✅ Não contém placeholders

---

### Método 3: Verificação Manual

#### 1. Discord Token

**Teste rápido:**
```powershell
# Windows PowerShell
$token = $env:DISCORD_TOKEN
$headers = @{ Authorization = "Bot $token" }
Invoke-RestMethod -Uri "https://discord.com/api/v10/users/@me" -Headers $headers
```

**Resultado esperado:**
```json
{
  "id": "1445627094716387378",
  "username": "APOLO - Dota2",
  "bot": true,
  "verified": true
}
```

**Se der erro:**
- ❌ Token inválido ou expirado
- ❌ Precisa regenerar no Discord Developer Portal

---

#### 2. Stratz API

**Teste GraphQL:**
```powershell
$token = $env:STRATZ_API_TOKEN_1
$body = @{ query = "{ constants { heroes { id name } } }" } | ConvertTo-Json
$headers = @{ 
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://api.stratz.com/graphql" -Method Post -Headers $headers -Body $body
```

**Resultado esperado:**
```json
{
  "data": {
    "constants": {
      "heroes": [
        { "id": 1, "name": "Anti-Mage" },
        ...
      ]
    }
  }
}
```

**Erros comuns:**
- `401 Unauthorized` → Token inválido
- `429 Too Many Requests` → Rate limit (use outra key ou aguarde)
- `403 Forbidden` → IP bloqueado ou token sem permissão

---

#### 3. Steam API

**Teste API:**
```powershell
$key = $env:STEAM_API_KEY
Invoke-RestMethod -Uri "https://api.steampowered.com/ISteamWebAPIUtil/GetSupportedAPIList/v1/?key=$key"
```

**Resultado esperado:**
```json
{
  "apilist": {
    "interfaces": [ ... ]
  }
}
```

**Erros comuns:**
- `403 Forbidden` → Key inválida ou domínio não autorizado
- `401 Unauthorized` → Key expirada

---

#### 4. Gemini API

**Teste geração de texto:**
```powershell
$key = $env:GEMINI_API_KEY_1
$body = @{
  contents = @(
    @{
      parts = @(
        @{ text = "Hello, this is a test" }
      )
    }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$key" -Method Post -Body $body -ContentType "application/json"
```

**Resultado esperado:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          { "text": "..." }
        ]
      }
    }
  ]
}
```

**Erros comuns:**
- `400 Bad Request` → Formato inválido
- `403 Forbidden` → Key inválida ou API não habilitada
- `429 Too Many Requests` → Quota excedida

---

#### 5. VPS SSH

**Teste conexão:**
```powershell
# Salvar chave em arquivo temporário
$env:VPS_SSH_KEY | Out-File -FilePath "temp_key.pem" -Encoding ASCII
icacls temp_key.pem /inheritance:r
icacls temp_key.pem /grant:r "$env:USERNAME:(R)"

# Testar SSH
ssh -i temp_key.pem $env:VPS_USER@$env:VPS_HOST "echo 'SSH OK'"

# Limpar
Remove-Item temp_key.pem
```

**Resultado esperado:**
```
SSH OK
```

**Erros comuns:**
- `Permission denied` → Chave pública não está em `~/.ssh/authorized_keys` na VPS
- `Connection refused` → Firewall bloqueando porta 22
- `Host key verification failed` → Adicionar host em `known_hosts`

---

#### 6. Database (PostgreSQL)

**Teste conexão na VPS:**
```bash
ssh root@31.97.103.184 "docker exec postgres psql -U apolo_user -d apolo_dota2 -c 'SELECT 1;'"
```

**Resultado esperado:**
```
 ?column? 
----------
        1
```

**Erros comuns:**
- `FATAL: password authentication failed` → Senha incorreta
- `FATAL: database "apolo_dota2" does not exist` → Database não criada
- `could not connect to server` → Container não rodando

---

#### 7. Redis

**Teste conexão na VPS:**
```bash
ssh root@31.97.103.184 "docker exec redis redis-cli -a YOUR_REDIS_PASSWORD PING"
```

**Resultado esperado:**
```
PONG
```

**Erros comuns:**
- `NOAUTH Authentication required` → Senha não fornecida
- `ERR invalid password` → Senha incorreta
- `Could not connect` → Container não rodando

---

## 🔍 Checklist de Secrets

### GitHub Secrets (17 secrets)

Acesse: `https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/settings/secrets/actions`

**VPS Access (3):**
- [ ] `VPS_HOST` = 31.97.103.184
- [ ] `VPS_USER` = root
- [ ] `VPS_SSH_KEY` = (chave privada completa)

**Discord (3):**
- [ ] `DISCORD_TOKEN` = (MTxxxxxxxxx.xxxxxx.xxxxxxxxxxx)
- [ ] `DISCORD_CLIENT_ID` = (18-19 dígitos)
- [ ] `DISCORD_GUILD_ID` = (opcional - 18-19 dígitos)

**Database (3):**
- [ ] `APOLO_DB_NAME` = apolo_dota2
- [ ] `APOLO_DB_USER` = apolo_user
- [ ] `APOLO_DB_PASSWORD` = (mínimo 16 chars)

**Redis (2):**
- [ ] `REDIS_PASSWORD` = (senha forte)
- [ ] `REDIS_PREFIX` = apolo

**APIs (3+):**
- [ ] `STRATZ_API_TOKEN_1` = (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....)
- [ ] `STEAM_API_KEY` = (32 caracteres hexadecimais)
- [ ] `GEMINI_API_KEY_1` = (AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
- [ ] `STRATZ_API_TOKEN_2` = (opcional - rotação)
- [ ] `GEMINI_API_KEY_2` = (opcional - rotação)

**Container Registry (1):**
- [ ] `GHCR_TOKEN` = (ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)

**Ambiente (2):**
- [ ] `NODE_ENV` = production
- [ ] `LOG_LEVEL` = info

---

## 🚨 Troubleshooting

### Secret aparece no GitHub mas workflow falha

**Causa:** Secret pode estar com espaços extras ou quebras de linha

**Solução:**
```powershell
# Copiar secret sem espaços
$token = "MTxxxxxxxxx.xxxxxx.xxxxxxxxxxx".Trim()
echo $token  # Copiar e colar no GitHub
```

### VPS SSH falha no workflow mas funciona localmente

**Causa:** Chave SSH com formato Windows (CRLF)

**Solução:**
```powershell
# Converter para formato Unix (LF)
(Get-Content temp_key.pem -Raw) -replace "`r`n", "`n" | Set-Content -NoNewline temp_key_unix.pem
# Copiar conteúdo de temp_key_unix.pem para GitHub Secret
```

### API retorna 429 (Too Many Requests)

**Causa:** Rate limit atingido

**Solução:**
- Aguardar cooldown (10-60 minutos)
- Adicionar mais keys (STRATZ_API_TOKEN_2, etc)
- Bot automaticamente rotaciona keys

### Database connection failed

**Causa:** Database não existe

**Solução:**
```bash
# Criar database na VPS
ssh root@31.97.103.184 "docker exec postgres psql -U postgres -c 'CREATE DATABASE apolo_dota2;'"
```

---

## ✅ Validação Completa

Execute este checklist antes do deploy:

```bash
# 1. Test GitHub Actions workflow
# https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/actions
# → Run "Test Secrets & Connections"

# 2. Verificar todos os secrets configurados
# Settings → Secrets and variables → Actions
# Deve ter 17 secrets

# 3. Test local (opcional)
npm run validate:secrets

# 4. Build TypeScript
npm run build  # Deve passar sem erros

# 5. Deploy
# Se todos os testes passarem, fazer deploy:
git push origin main
```

**Se todos os testes passarem:** ✅ Pronto para deploy!

**Se algum falhar:** ❌ Corrigir o secret e testar novamente

---

**Última atualização:** 2025-12-11
