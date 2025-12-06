# 🎯 ROTEIRO SIMPLIFICADO - Hostinger VPS em 5 Minutos

## 🚀 Fluxo Rápido (Copie e Cole os Comandos)

### 1️⃣ CONECTAR NA VPS

```bash
ssh root@YOUR_VPS_IP
# Digite a senha quando pedir
```

---

### 2️⃣ INSTALAR DOCKER (3 comandos)

```bash
apt update && apt upgrade -y

curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh && rm get-docker.sh

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose
```

---

### 3️⃣ VERIFICAR INSTALAÇÃO

```bash
docker --version
docker-compose --version
```

**Resultado esperado:**
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

### 4️⃣ CLONAR PROJETO

```bash
cd ~
mkdir -p projects
cd projects

git clone https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot.git
cd Apolo-Dota2-Disc-Bot
```

---

### 5️⃣ CONFIGURAR AMBIENTE

```bash
cp .env.example .env
nano .env
```

**Preencha ESTES CAMPOS (mínimo obrigatório):**

```env
DISCORD_TOKEN=SEU_TOKEN
DISCORD_CLIENT_ID=SEU_CLIENT_ID
DB_PASSWORD=SenhaForte123!@#
REDIS_PASSWORD=OutraSenha456!@#
STRATZ_API_TOKEN_1=SEU_TOKEN_STRATZ
GRAFANA_ADMIN_PASSWORD=SenhaGrafana789!@#
```

**Salvar:** `Ctrl+X` → `Y` → `Enter`

---

### 6️⃣ PROTEGER .env

```bash
chmod 600 .env
```

---

### 7️⃣ RODAR TUDO 🚀

```bash
docker-compose -f docker-compose.prod.yml up -d --build
sleep 60
docker-compose -f docker-compose.prod.yml ps
```

**Todos devem estar "Up":**
```
apolo-bot       Up (healthy) ✓
apolo-postgres  Up (healthy) ✓
apolo-redis     Up (healthy) ✓
apolo-prometheus Up ✓
apolo-grafana   Up ✓
```

---

### 8️⃣ CRIAR BANCO DE DADOS

```bash
docker-compose -f docker-compose.prod.yml exec bot npx tsx src/database/migrate.ts
```

---

### 9️⃣ REGISTRAR COMANDOS DISCORD

```bash
docker-compose -f docker-compose.prod.yml exec bot npx tsx src/deploy-commands.ts
```

---

### 🔟 ACESSAR GRAFANA

Abra no navegador:
```
http://YOUR_VPS_IP:3000
```

**Login:**
- User: `admin`
- Pass: (a senha que você colocou)

---

## ✅ PRONTO! O Bot Está Rodando! 🎉

### Verificações Rápidas:

```bash
# Bot online?
docker-compose -f docker-compose.prod.yml logs bot | grep "Bot online"

# Banco ok?
docker-compose -f docker-compose.prod.yml logs bot | grep "PostgreSQL"

# Ver tudo
docker-compose -f docker-compose.prod.yml logs -f bot
```

---

## 🆘 ALGO DEU ERRADO?

### Problema: Bot não inicia

```bash
docker-compose -f docker-compose.prod.yml logs bot
# Procure por erro no resultado
```

### Problema: Postgres não healthy

```bash
docker-compose -f docker-compose.prod.yml restart postgres
sleep 30
docker-compose -f docker-compose.prod.yml ps postgres
```

### Problema: Grafana acesso negado

```bash
# Reset para padrão admin/admin
docker-compose -f docker-compose.prod.yml down
docker volume rm apolo-dota2_grafana_data
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📋 CHECKLIST PÓS-DEPLOY

- [ ] Conectei na VPS via SSH
- [ ] Docker + Compose instalados (verificou versão)
- [ ] Projeto clonado em ~/projects
- [ ] .env configurado com TODOS os campos
- [ ] .env tem permissão 600
- [ ] `docker-compose ps` mostra tudo "Up"
- [ ] Migrations rodaram sem erro
- [ ] Discord commands deployados
- [ ] Bot aparece online no Discord
- [ ] Posso acessar Grafana em http://vps_ip:3000
- [ ] Troquei senha padrão do Grafana

---

## 🔄 COMANDOS FREQUENTES

```bash
# Ver status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f bot

# Parar tudo
docker-compose -f docker-compose.prod.yml down

# Reiniciar bot
docker-compose -f docker-compose.prod.yml restart bot

# Atualizar código
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📞 MAIS DETALHES

Guias completos disponíveis em:
- `docs/HOSTINGER_EASYPANEL_QUICK_SETUP.md` - Guia detalhado
- `docs/VPS_DEPLOYMENT_GUIDE.md` - Guia super completo (500+ linhas)
- `docs/VPS_DEPLOYMENT_CHECKLIST.md` - Checklist de verificação

---

**Pronto? Comece do Step 1 e execute cada comando.** ✅

Se tiver dúvida em algum passo, consulte o guia detalhado. Boa sorte! 🚀
