# 🚀 Quick Fix: Docker Image Pull Unauthorized

**Problema:** `pull access denied for ghcr.io/upgrade-near-me/apolo-dota2-disc-bot`

**Solução em 3 passos (5 minutos):**

---

## 1️⃣ Criar Personal Access Token no GitHub

1. Acesse: https://github.com/settings/tokens/new
2. Configure:
   - **Note:** `VPS Docker Auth - APOLO`
   - **Expiration:** 90 days
   - **Scopes:**
     - ✅ `read:packages`
     - ✅ `write:packages` (opcional)
3. Clique **Generate token**
4. **COPIE O TOKEN** (ex: `ghp_abc123xyz789...`)

---

## 2️⃣ Configurar Autenticação no VPS

```bash
# SSH para o servidor
ssh root@31.97.103.184

# Fazer login no GitHub Container Registry
echo "ghp_SEU_TOKEN_AQUI" | docker login ghcr.io -u upgrade-near-me --password-stdin

# Saída esperada: "Login Succeeded"
```

**Exemplo real:**
```bash
echo "ghp_1A2B3C4D5E6F7G8H9I0J" | docker login ghcr.io -u upgrade-near-me --password-stdin
```

---

## 3️⃣ Testar e Deploy

```bash
# Testar pull da imagem
docker pull ghcr.io/upgrade-near-me/apolo-dota2-disc-bot:latest

# Se funcionou, fazer deploy
cd /opt/apolo-bot
docker compose pull
docker compose up -d

# Verificar logs
docker logs -f apolo-bot
```

---

## ✅ Verificação

```bash
# Confirmar autenticação
cat ~/.docker/config.json
# Deve conter: "ghcr.io": { "auth": "..." }

# Confirmar container rodando
docker ps | grep apolo-bot
# Deve mostrar: Up X minutes (healthy)
```

---

## 🔄 Automatizar para Futuros Deploys

1. **Adicionar GHCR_TOKEN aos GitHub Secrets:**
   - Vá para: https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/settings/secrets/actions
   - Clique **New repository secret**
   - **Name:** `GHCR_TOKEN`
   - **Value:** `ghp_seu_token_aqui`

2. **Workflow já está configurado!**
   - O workflow `.github/workflows/deploy-vps.yml` já foi atualizado
   - Próximo push para `main` fará login automático

---

## ⚠️ Troubleshooting

**Erro: "token expired"**
```bash
# Gerar novo token em: https://github.com/settings/tokens
# Refazer passo 2 com novo token
```

**Erro: "unauthorized" persiste**
```bash
# Verificar scopes do token
# Deve ter "read:packages" ativado
# Regerar token se necessário
```

**Erro: "repository does not exist"**
```bash
# Confirmar nome da imagem no docker-compose.shared.yml
# Deve ser: ghcr.io/upgrade-near-me/apolo-dota2-disc-bot:latest
```

---

## 📚 Documentação Completa

- [VPS Docker Auth Guide](VPS_DOCKER_AUTH_GUIDE.md) - Guia detalhado
- [VPS Shared Integration](VPS_SHARED_INTEGRATION_GUIDE.md) - Setup completo

---

**Última atualização:** 11 de Dezembro de 2025  
**Tempo de resolução:** 5 minutos
