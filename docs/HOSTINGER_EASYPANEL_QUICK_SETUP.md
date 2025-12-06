# 🚀 Hostinger EasyPanel + Docker Compose - Quick Deploy Guide

**Para:** APOLO Dota 2 Bot  
**VPS:** Hostinger com Ubuntu + EasyPanel  
**Objetivo:** Deploy completo via SSH terminal

---

## 📋 Pré-requisitos

- [ ] VPS Hostinger com Ubuntu 22.04 LTS ativo
- [ ] EasyPanel instalado na VPS
- [ ] SSH access (chave ou senha)
- [ ] Arquivo `.env` pronto com suas credenciais
- [ ] Docker e Docker Compose prontos para instalar

---

## 🔑 Step 1: Conectar via SSH

### Opção A: SSH com Senha (padrão Hostinger)

```bash
# Hostinger fornece IP, usuário e senha
# Exemplo: ssh root@123.45.67.89

ssh root@YOUR_VPS_IP
```

Quando pedir senha, use a senha fornecida pelo Hostinger.

### Opção B: SSH com Chave (mais seguro)

```bash
# Se configurou chave SSH
ssh -i /caminho/para/sua/chave root@YOUR_VPS_IP
```

---

## 🐳 Step 2: Instalar Docker & Docker Compose

Execute **todos estes comandos em sequência**:

```bash
# 1. Atualizar sistema
apt update && apt upgrade -y

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# 3. Adicionar seu usuário ao grupo docker
sudo usermod -aG docker $USER

# 4. Fazer logout e login (ativa permissões)
exit
# (Reconecte via SSH)

# 5. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 6. Verificar instalações
docker --version
docker-compose --version
```

---

## 📂 Step 3: Clonar Repositório

```bash
# Criar diretório para projetos
mkdir -p ~/projects
cd ~/projects

# Clonar repositório
git clone https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot.git
cd Apolo-Dota2-Disc-Bot

# Verificar se está no branch main
git branch -a
git checkout main
```

---

## ⚙️ Step 4: Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar arquivo
nano .env
```

**Você verá algo assim:**

```env
# Discord
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=

# Database
DB_USER=apolo_bot
DB_PASSWORD=
DB_NAME=apolo_dota2
...
```

**Complete com seus valores:**

```env
# Discord (obtenha em https://discord.com/developers/applications)
DISCORD_TOKEN=SEU_TOKEN_AQUI
DISCORD_CLIENT_ID=SEU_CLIENT_ID
DISCORD_GUILD_ID=SEU_GUILD_ID

# Database (crie SENHAS FORTES!)
DB_USER=apolo_bot
DB_PASSWORD=Tr0p1c@lP@rrots#2024!DB    # MUDE ISTO!
DB_NAME=apolo_dota2

# Redis (SENHA FORTE!)
REDIS_PASSWORD=RedisS3cur3P@ssw0rd!2024    # MUDE ISTO!

# APIs (obtenha em seus respectivos sites)
STRATZ_API_TOKEN_1=SEU_STRATZ_TOKEN
STEAM_API_KEY=SUA_STEAM_KEY
GEMINI_API_KEY_1=SUA_GEMINI_KEY

# Grafana (SENHA FORTE!)
GRAFANA_ADMIN_PASSWORD=Dota2@Monitor2024!Secure    # MUDE ISTO!

# Ambiente
NODE_ENV=production
LOG_LEVEL=info
```

**Para sair do nano:**
- Pressione `Ctrl + X`
- Responda `Y` (yes)
- Pressione `Enter`

---

## 🔐 Step 5: Definir Permissões

```bash
# Restringir acesso ao .env (importante!)
chmod 600 .env

# Criar diretório de logs
mkdir -p logs
chmod 755 logs
```

---

## 🚀 Step 6: Iniciar Aplicação

```bash
# Comando mágico que faz TUDO:
docker-compose -f docker-compose.prod.yml up -d --build

# Aguardar ~1 minuto para os containers iniciarem
sleep 60

# Verificar status de todos os containers
docker-compose -f docker-compose.prod.yml ps
```

**Você deve ver algo assim:**

```
NAME               STATUS
apolo-bot          Up 30 seconds (healthy)
apolo-postgres     Up 40 seconds (healthy)
apolo-redis        Up 40 seconds (healthy)
apolo-prometheus   Up 30 seconds
apolo-grafana      Up 25 seconds
```

Se algum estiver `Exit` ou `Unhealthy`, veja a seção Troubleshooting.

---

## 🗄️ Step 7: Executar Migrações do Banco

```bash
# Criar tabelas no PostgreSQL
docker-compose -f docker-compose.prod.yml exec bot npx tsx src/database/migrate.ts

# Você deve ver:
# ✅ Connected to PostgreSQL database
# ✅ Migrations completed
```

---

## 🤖 Step 8: Deploy Discord Commands

```bash
# Registrar comandos no Discord
docker-compose -f docker-compose.prod.yml exec bot npx tsx src/deploy-commands.ts

# Você deve ver:
# ✅ Commands deployed successfully
```

Verifique no Discord se o bot está online e os comandos aparecem!

---

## 📊 Step 9: Acessar Grafana (Monitoramento)

Abra seu navegador:

```
http://YOUR_VPS_IP:3000
```

**Login:**
- Username: `admin`
- Password: (a que você colocou em `GRAFANA_ADMIN_PASSWORD`)

### ⚠️ PRIMEIRA COISA: Mude a Senha!

1. No menu (ícone de usuário, canto superior direito)
2. "Change Password"
3. Digite uma senha FORTE
4. Salve

---

## 🔍 Verificar Logs

```bash
# Ver últimas 50 linhas
docker-compose -f docker-compose.prod.yml logs --tail=50 bot

# Ver logs em tempo real (Ctrl+C para sair)
docker-compose -f docker-compose.prod.yml logs -f bot

# Ver logs específicos (últimas 2 horas)
docker-compose -f docker-compose.prod.yml logs --since 2h bot
```

---

## 🛑 Parar Aplicação

```bash
# Para tudo com segurança
docker-compose -f docker-compose.prod.yml down

# Para tudo E remove volumes (CUIDADO: deleta dados!)
docker-compose -f docker-compose.prod.yml down -v
```

---

## ♻️ Reiniciar Serviços

```bash
# Reiniciar tudo
docker-compose -f docker-compose.prod.yml restart

# Reiniciar só o bot
docker-compose -f docker-compose.prod.yml restart bot

# Reiniciar Postgres
docker-compose -f docker-compose.prod.yml restart postgres
```

---

## 🚨 Troubleshooting Rápido

### Bot não inicia

```bash
# Ver o erro
docker-compose -f docker-compose.prod.yml logs bot | tail -30

# Problemas comuns:
# 1. DISCORD_TOKEN inválido ou vazio
# 2. DATABASE_URL incorreto
# 3. Postgres não está healthy
```

### Postgres não conecta

```bash
# Verificar se Postgres está healthy
docker-compose -f docker-compose.prod.yml ps postgres

# Se não estiver healthy, reiniciar
docker-compose -f docker-compose.prod.yml restart postgres

# Aguardar 30 segundos e verificar novamente
sleep 30
docker-compose -f docker-compose.prod.yml ps postgres
```

### Sem espaço em disco

```bash
# Ver quanto espaço tem
df -h

# Limpar Docker (remova imagens/containers não usados)
docker system prune -a

# Se ainda tight, deletar backups antigos
rm -rf ~/backups/apolo_dota2_*.sql.gz
```

### Esqueci a senha do Grafana

```bash
# Resetar para admin/admin (padrão)
docker-compose -f docker-compose.prod.yml down
docker volume rm apolo-dota2_grafana_data  # ⚠️ Deleta dados Grafana!
docker-compose -f docker-compose.prod.yml up -d grafana
# Aguarde 30 segundos
# Acesse em http://vps_ip:3000 com admin/admin
```

---

## 📋 Verificação Pós-Deployment

Depois de tudo rodando, verifique:

```bash
# ✓ Bot está online?
docker-compose -f docker-compose.prod.yml logs bot | grep "Bot online"

# ✓ Banco conectado?
docker-compose -f docker-compose.prod.yml logs bot | grep "Connected to PostgreSQL"

# ✓ Comandos registrados?
docker-compose -f docker-compose.prod.yml logs bot | grep "Commands deployed"

# ✓ Prometheus coletando métricas?
curl http://localhost:9091/api/v1/targets 2>/dev/null | grep bot

# ✓ Grafana acessível?
curl http://localhost:3000/api/health 2>/dev/null
```

---

## 🔄 Atualizar Aplicação

Quando houver novas atualizações:

```bash
# 1. Ir para o diretório
cd ~/projects/Apolo-Dota2-Disc-Bot

# 2. Puxar novas mudanças
git pull origin main

# 3. Rebuild e restart
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Ver logs
docker-compose -f docker-compose.prod.yml logs -f bot
```

---

## 💾 Backup Manual

```bash
# Fazer backup do banco
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U apolo_bot -d apolo_dota2 > ~/backup_$(date +%Y-%m-%d_%H-%M-%S).sql

# Comprimir backup
gzip ~/backup_*.sql

# Ver backups
ls -lh ~/backup_*.sql.gz
```

---

## ✅ Checklist Final

- [ ] Docker & Docker Compose instalados
- [ ] Repositório clonado
- [ ] .env configurado com TODOS os valores
- [ ] .env tem permissões 600 (`chmod 600 .env`)
- [ ] Containers estão healthy (`docker-compose ps`)
- [ ] Migrations rodaram com sucesso
- [ ] Discord commands deployados
- [ ] Bot está online no Discord
- [ ] Pode acessar Grafana (http://vps_ip:3000)
- [ ] Senha Grafana foi alterada

---

## 🎯 Próximos Passos

1. **Monitorar:** Acesse Grafana e veja as métricas do bot
2. **Testar:** Use o bot no Discord, execute comandos
3. **Backup:** Configure backup automático diário
4. **Firewall:** Configure UFW se necessário (veja guia completo)
5. **Certificado SSL:** Se quiser Grafana público com HTTPS

---

## 📞 Precisa de Ajuda?

Se algo der errado:

1. **Veja os logs:** `docker-compose logs -f bot`
2. **Verifique .env:** `cat .env` (não mostre para ninguém!)
3. **Reinicie:** `docker-compose restart`
4. **Consulte:** VPS_DEPLOYMENT_GUIDE.md para mais detalhes

---

**Status:** ✅ Pronto para seu Hostinger + EasyPanel!

Execute step-by-step e tudo vai funcionar. Qualquer dúvida, consulte os logs! 🚀
