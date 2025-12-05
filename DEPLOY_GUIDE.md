# 🚀 Guia de Deploy Completo - APOLO Dota 2 Bot v2.2

**Data:** 5 de Dezembro de 2025  
**Versão:** 2.2.0 Production Ready  
**Status:** ✅ Pronto para Deploy

---

## 📋 Resumo Rápido

Este guia mostra como fazer o deploy completo do bot em Docker e no repositório GitHub para avaliação de outros profissionais.

**Tempo Total:** ~20-30 minutos (maioria é espera do Docker build)

---

## 🔧 Pré-requisitos

✅ Git instalado e configurado  
✅ Docker Desktop instalado e rodando  
✅ Conta GitHub com acesso ao repositório  
✅ `.env` arquivo configurado com tokens API  

---

## 📍 FASE 1: Git Commit Local (1 min)

**Execute no PowerShell:**

```powershell
cd "x:\UP PROJECT - Bots DISCORD\BOT DISC - APOLO DOTA2"

# Verificar mudanças
git status

# Adicionar todos os arquivos
git add .

# Criar commit
git commit -m "docs: resolve all markdown linting errors and finalize documentation for v2.2 production release"
```

**Resultado esperado:**
```
[main ...] docs: resolve all markdown linting errors...
X files changed
```

---

## 🐳 FASE 2: Docker Build (5-10 min - DEMORADO!)

**⚠️ Este comando vai demorar! Execute e deixe rodar:**

```powershell
docker-compose build --no-cache
```

**Isso vai:**
- ✅ Baixar base Node.js alpine
- ✅ Instalar dependências (npm)
- ✅ Compilar TypeScript
- ✅ Criar imagem Docker otimizada

**Tempo estimado:** 5-10 minutos

**Sinais de sucesso:**
```
Successfully built apolo-bot
Successfully tagged apolo-dota2-bot:latest
```

---

## 🌐 FASE 3: Git Push para GitHub (2 min)

**Depois que Docker terminar:**

```powershell
# Push para main branch
git push origin main
```

**Se pedir credenciais:**
- Use Personal Access Token (PAT) se não tiver SSH configurado
- Ou execute: `gh auth login`

**Verificar no GitHub:**
- Vá em: https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot
- Confirme que os commits aparecem

---

## 🚀 FASE 4: Iniciar Containers (1 min)

```powershell
# Parar containers antigos (se houver)
docker-compose down

# Iniciar novamente com nova build
docker-compose up -d

# Aguardar inicialização
Start-Sleep -Seconds 10

# Verificar status
docker-compose ps
```

**Status esperado:**
```
NAME            STATUS              PORTS
apolo-postgres  Up 5 seconds        5432/tcp
apolo-redis     Up 5 seconds        6379/tcp
apolo-bot       Up 3 seconds        (none)
```

---

## 📊 FASE 5: Verificar Bot Online (2 min)

```powershell
# Ver logs em tempo real
docker-compose logs -f bot

# Procure por estas mensagens:
# ✅ Connected to PostgreSQL database
# ✅ Loading X command files...
# ✅ Loaded command: dashboard
# 🤖 Bot online as APOLO - Dota2#XXXX
# 📊 Serving X servers
```

**Pressione Ctrl+C para sair**

---

## 🎮 FASE 6: Deploy Discord Commands (1 min)

```powershell
# Deploy global dos slash commands
docker-compose exec bot npx tsx src/deploy-commands.ts
```

**Resultado esperado:**
```
Registering command: dashboard
Registering command: setup-apolo-structure
Registering command: remove-apolo-structure
✅ Commands registered successfully
```

**Aguarde 5-10 minutos para o Discord sincronizar globalmente.**

---

## 🏷️ FASE 7: Criar Release (Opcional - 2 min)

Para marcar como versão oficial:

```powershell
# Criar tag local
git tag -a v2.2.0 -m "Production Release v2.2.0 - Tier 1 Features Complete"

# Push da tag
git push origin v2.2.0
```

**Criar Release no GitHub:**
1. Vá em: Releases → Draft a new release
2. Selecione a tag `v2.2.0`
3. Título: `v2.2.0 - Production Release`
4. Descrição:
   ```
   # APOLO Dota 2 Bot v2.2.0 - Production Ready
   
   ## ✨ Tier 1 Features Complete
   - ✅ IMP Score System (-100 to +100)
   - ✅ Match Awards (10 achievement types)
   - ✅ XP & Leveling (dynamic progression)
   - ✅ Hero Benchmarks (OpenDota percentiles)
   - ✅ 8 AI Analysis Tools (Google Gemini)
   - ✅ Multi-language Support (EN/PT/ES)
   
   ## 🏗️ Infrastructure
   - ✅ Docker Production Build
   - ✅ PostgreSQL + Redis Stack
   - ✅ Prometheus Metrics + Grafana
   - ✅ 100+ Tests (Unit + E2E)
   - ✅ Zero Markdown Linting Errors
   
   ## 📊 Documentation Complete
   - Professional README.md
   - Complete Feature Guide
   - Setup & Docker guides
   - Troubleshooting guides
   - Enterprise scaling roadmap
   
   Ready for professional evaluation! 🚀
   ```
5. Click "Publish release"

---

## 🔍 Verificação Final

✅ **Local:**
```powershell
# Verificar container status
docker-compose ps

# Verificar logs sem travamento
docker-compose logs --tail=20 bot
```

✅ **GitHub:**
- Vá em: https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot
- Confirme commits em `main`
- Confirme release em `Releases`

✅ **Discord:**
- Bot online no servidor
- Slash commands `/dashboard` disponível
- Responde a interações

---

## 📝 Variáveis de Ambiente Necessárias

Crie `.env` baseado em `.env.example`:

```env
# Discord
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_test_server_id

# Database (Docker auto-configura)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/apolo_dota2

# Redis (Docker auto-configura)
REDIS_URL=redis://redis:6379

# APIs (Recomendado para features completas)
STRATZ_API_TOKEN=your_token
STEAM_API_KEY=your_key
GEMINI_API_KEY=your_key
```

---

## 🆘 Troubleshooting

### Docker build falhou?
```powershell
# Limpar cache e tentar novamente
docker-compose build --no-cache --pull
```

### Bot não inicia?
```powershell
# Ver logs detalhados
docker-compose logs bot

# Reiniciar
docker-compose restart bot
```

### Git push falhou?
```powershell
# Verificar remote
git remote -v

# Atualizar e tentar novamente
git fetch origin
git push origin main
```

### Discord commands não aparecem?
```powershell
# Re-deploy commands
docker-compose exec bot npx tsx src/deploy-commands.ts

# Aguarde 5-10 minutos e restart Discord
```

---

## 📊 Checklist Final

- [ ] Fase 1: Git commit criado
- [ ] Fase 2: Docker build completado com sucesso
- [ ] Fase 3: Git push para GitHub feito
- [ ] Fase 4: Containers iniciados
- [ ] Fase 5: Bot online (verificado nos logs)
- [ ] Fase 6: Discord commands deployed
- [ ] Fase 7: Release criada no GitHub (opcional)
- [ ] ✅ Todos os passos completos!

---

## 🎉 Próximos Passos

Depois do deploy:

1. **Teste as Features:**
   - `/dashboard` - Abrir painel
   - `/setup-apolo-structure` - Criar canais
   - Conectar Steam account

2. **Compartilhe com Profissionais:**
   - GitHub link: Código-fonte completo
   - Release notes: Feature list detalhada
   - Documentation: Guides técnicas
   - Docker: Deployment pronto

3. **Feedback:**
   - Peça code review
   - Sugestões de melhorias
   - Issues encontradas

---

**Status:** ✅ Pronto para Deploy Profissional!  
**Desenvolvido por:** PKT Gamers & Upgrade Near ME  
**Data:** 5 de Dezembro de 2025
