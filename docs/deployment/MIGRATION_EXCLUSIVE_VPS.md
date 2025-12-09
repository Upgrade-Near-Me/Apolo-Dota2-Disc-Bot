# 🚀 Migração Futura - APOLO para VPS Exclusiva

## 📋 Overview

Este guia cobre a migração do APOLO de VPS compartilhada (zapclaudio.com) para VPS exclusiva no futuro.

**Tempo Estimado:** 30 minutos  
**Downtime:** ~5 minutos (com estratégia blue-green: 0 minutos)

---

## 🎯 Por que Migrar?

### Benefícios de VPS Exclusiva

1. **Recursos Dedicados**
   - CPU/RAM 100% para APOLO
   - Sem competição com outros projetos
   - Performance previsível

2. **Isolamento Total**
   - PostgreSQL exclusivo (sem riscos de outros projetos)
   - Redis exclusivo (cache ilimitado)
   - Atualizações independentes

3. **Escalabilidade**
   - Vertical: Upgrade de recursos sem afetar outros
   - Horizontal: Múltiplas instâncias (sharding futuro)

4. **Segurança**
   - Firewall dedicado
   - Backups isolados
   - Zero risco de interferência

---

## 📊 Comparação: Compartilhada vs Exclusiva

| Aspecto | VPS Compartilhada (Atual) | VPS Exclusiva (Futuro) |
|---------|---------------------------|------------------------|
| **PostgreSQL** | Shared 16 (apolo_dota2 database) | Dedicated 16 (servidor inteiro) |
| **Redis** | Shared 7 (apolo:* namespace) | Dedicated 7 (todos namespaces) |
| **CPU** | Max 1 core (limit) | Todos os cores (4-8) |
| **RAM** | Max 1GB (limit) | Toda RAM (4-8GB) |
| **Downtime de Outros** | Zero (isolado) | N/A (sem outros projetos) |
| **Backup** | Compartilhado | Exclusivo (diário) |
| **Custo** | Compartilhado (~$5/mês) | Exclusivo (~$20-40/mês) |

---

## 🛠️ Pré-requisitos para Migração

### Nova VPS (Recomendações)

**Especificações Mínimas:**
- OS: Ubuntu 22.04 LTS ou 24.04 LTS
- CPU: 2 vCPUs (4 recomendado)
- RAM: 4GB (8GB recomendado para cache Redis)
- Disk: 50GB SSD
- Network: 1 Gbps

**Software Necessário:**
```bash
# Docker Engine 28.2+
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose v2.29+
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker --version
docker-compose --version
```

**Firewall (UFW):**
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (se usar web dashboard)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 📋 Plano de Migração (Passo a Passo)

### **Fase 1: Preparação Nova VPS (30 min)**

#### 1.1. Instalar Dependências
```bash
# SSH na nova VPS
ssh root@nova-vps-ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 1.2. Criar Estrutura de Diretórios
```bash
# Criar diretório APOLO
mkdir -p /root/apolo
cd /root/apolo

# Criar network
docker network create proxy
```

#### 1.3. Criar PostgreSQL Exclusivo
```bash
# Criar volume para dados
docker volume create postgres_data

# Rodar PostgreSQL 16
docker run -d \
  --name postgres \
  --network proxy \
  --restart always \
  -e POSTGRES_PASSWORD=SENHA_SEGURA_AQUI \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16

# Aguardar inicialização
sleep 10

# Criar database APOLO
docker exec -it postgres psql -U postgres -c "CREATE DATABASE apolo_dota2;"
docker exec -it postgres psql -U postgres -c "CREATE USER apolo_user WITH ENCRYPTED PASSWORD 'SENHA_APOLO';"
docker exec -it postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE apolo_dota2 TO apolo_user;"
```

#### 1.4. Criar Redis Exclusivo
```bash
# Criar volume para dados
docker volume create redis_data

# Rodar Redis 7
docker run -d \
  --name redis \
  --network proxy \
  --restart always \
  -v redis_data:/data \
  -p 6379:6379 \
  redis:7 redis-server --requirepass SENHA_REDIS_AQUI
```

---

### **Fase 2: Backup VPS Compartilhada (10 min)**

#### 2.1. Backup Database
```bash
# SSH na VPS compartilhada (zapclaudio.com)
ssh root@31.97.103.184

# Backup database APOLO
docker exec postgres pg_dump -U apolo_user apolo_dota2 > /root/apolo_backup_$(date +%Y%m%d).sql

# Compactar
gzip /root/apolo_backup_$(date +%Y%m%d).sql

# Transferir para nova VPS
scp /root/apolo_backup_*.sql.gz root@nova-vps-ip:/root/
```

#### 2.2. Backup Redis (Cache - Opcional)
```bash
# Backup Redis keys APOLO (namespace apolo:*)
docker exec redis redis-cli -a ${REDIS_PASSWORD} --scan --pattern "apolo:*" > /root/apolo_redis_keys.txt

# Backup RDB (snapshot)
docker exec redis redis-cli -a ${REDIS_PASSWORD} BGSAVE
docker cp redis:/data/dump.rdb /root/apolo_redis.rdb

# Transferir
scp /root/apolo_redis.rdb root@nova-vps-ip:/root/
```

#### 2.3. Backup Configuração
```bash
# Copiar docker-compose e .env
cd /root/apolo
tar -czf /root/apolo_config.tar.gz docker-compose.yml .env logs/

# Transferir
scp /root/apolo_config.tar.gz root@nova-vps-ip:/root/apolo/
```

---

### **Fase 3: Restaurar na Nova VPS (10 min)**

#### 3.1. Restaurar Database
```bash
# SSH na nova VPS
ssh root@nova-vps-ip

# Descompactar backup
gunzip /root/apolo_backup_*.sql.gz

# Restaurar database
docker exec -i postgres psql -U apolo_user apolo_dota2 < /root/apolo_backup_*.sql

# Verificar
docker exec -it postgres psql -U apolo_user apolo_dota2 -c "\dt"
# Expected: users, guild_settings, matches, server_stats, etc.
```

#### 3.2. Restaurar Redis (Opcional)
```bash
# Parar Redis
docker stop redis

# Copiar RDB para container
docker cp /root/apolo_redis.rdb redis:/data/dump.rdb

# Restart Redis (carrega RDB)
docker start redis

# Verificar keys
docker exec redis redis-cli -a ${REDIS_PASSWORD} KEYS "apolo:*"
```

#### 3.3. Restaurar Configuração
```bash
# Descompactar
cd /root/apolo
tar -xzf apolo_config.tar.gz

# Editar .env (ajustar senhas para nova VPS)
nano .env
```

---

### **Fase 4: Deploy APOLO na Nova VPS (5 min)**

#### 4.1. Atualizar docker-compose.yml
```yaml
# /root/apolo/docker-compose.yml
# Pode usar o MESMO docker-compose.shared.yml da VPS compartilhada
# Apenas ajustar .env com novas senhas
```

#### 4.2. Deploy
```bash
cd /root/apolo

# Pull imagem GHCR (mesma imagem da VPS compartilhada)
docker pull ghcr.io/upgrade-near-me/apolo:latest

# Deploy
docker-compose up -d

# Verificar
docker ps | grep apolo-bot
docker logs -f apolo-bot
```

#### 4.3. Executar Migrations (se necessário)
```bash
# Migrations já aplicadas no backup, mas validar
docker exec -it apolo-bot npx tsx src/database/migrate.ts
```

#### 4.4. Deploy Comandos Discord
```bash
docker exec -it apolo-bot npx tsx src/deploy-commands.ts
```

---

### **Fase 5: Validação (5 min)**

#### 5.1. Testes de Conectividade
```bash
# Health check
curl http://localhost:9100/health
# Expected: {"status":"ok","uptime":123}

# Database
docker exec -it postgres psql -U apolo_user apolo_dota2 -c "SELECT COUNT(*) FROM users;"

# Redis
docker exec redis redis-cli -a ${REDIS_PASSWORD} KEYS "apolo:*"
```

#### 5.2. Testes Discord
1. Bot deve aparecer **Online** no Discord
2. Testar `/dashboard` - deve abrir painel
3. Testar `/setup-apolo-structure` - criar canais
4. Testar botões (Connect, Match, Profile)

#### 5.3. Testes de Performance
```bash
# Recursos (sem limites agora - VPS exclusiva)
docker stats apolo-bot --no-stream
# Expected: CPU < 20%, MEM < 500MB (sem limites)

# Logs (sem erros)
docker logs --tail=100 apolo-bot | grep -i error
# Expected: nenhum erro
```

---

### **Fase 6: Switch DNS/IP (Zero Downtime)**

#### 6.1. Estratégia Blue-Green (Recomendada)

**Opção A: DNS Switch (se usar domínio)**
```bash
# Atualizar DNS A record:
# bot.seudominio.com → nova-vps-ip
# TTL: 300 seconds (5 min)
# Propagação: 5-60 minutos
```

**Opção B: IP Switch (se usar IP direto)**
```bash
# Desabilitar bot na VPS compartilhada
ssh root@31.97.103.184
cd /root/apolo
docker-compose down

# Bot já rodando na nova VPS
# Discord reconecta automaticamente (Gateway WebSocket)
# Downtime: ~5 segundos (tempo de reconexão)
```

#### 6.2. Monitoramento Pós-Migração
```bash
# SSH na nova VPS
ssh root@nova-vps-ip

# Monitorar logs por 1 hora
docker logs -f apolo-bot

# Verificar métricas
curl http://localhost:9100/metrics | grep discord_commands_total
```

---

## 🔄 Estratégia de Rollback (Se Necessário)

### Se migração falhar, voltar para VPS compartilhada:

```bash
# 1. Parar nova VPS
ssh root@nova-vps-ip
cd /root/apolo
docker-compose down

# 2. Reativar VPS compartilhada
ssh root@31.97.103.184
cd /root/apolo
docker-compose up -d

# 3. Verificar
docker logs -f apolo-bot

# Downtime total: ~2 minutos
```

---

## 📊 Checklist de Migração

### Pré-Migração
- [ ] Nova VPS provisionada (Ubuntu 22.04+, Docker instalado)
- [ ] PostgreSQL 16 rodando na nova VPS
- [ ] Redis 7 rodando na nova VPS
- [ ] Network `proxy` criada
- [ ] Backup database VPS compartilhada
- [ ] Backup Redis (opcional)
- [ ] Backup configuração (.env, docker-compose)

### Migração
- [ ] Database restaurado na nova VPS
- [ ] Redis restaurado (opcional)
- [ ] docker-compose.yml configurado
- [ ] .env atualizado (novas senhas)
- [ ] APOLO deployado na nova VPS
- [ ] Migrations executadas
- [ ] Comandos Discord deployados

### Validação
- [ ] Health check OK (`/health`)
- [ ] Database acessível
- [ ] Redis acessível
- [ ] Bot online no Discord
- [ ] `/dashboard` funciona
- [ ] Buttons funcionam
- [ ] Sem erros nos logs
- [ ] Performance normal (CPU/RAM)

### Pós-Migração
- [ ] Monitorar logs por 24 horas
- [ ] Verificar métricas Prometheus
- [ ] Backup diário configurado (nova VPS)
- [ ] Desativar APOLO na VPS compartilhada
- [ ] Limpar dados APOLO na VPS compartilhada (após 7 dias)

---

## 💰 Custos Estimados

### VPS Compartilhada (Atual)
- Custo: ~$5/mês (rateado entre projetos)
- Recursos: 1 CPU core, 1GB RAM (limits)

### VPS Exclusiva (Futuro)
- **Opção Econômica:** $20/mês
  - 2 vCPUs, 4GB RAM, 50GB SSD
  - Providers: DigitalOcean, Linode, Vultr
  
- **Opção Recomendada:** $40/mês
  - 4 vCPUs, 8GB RAM, 100GB SSD
  - Suporta crescimento futuro (sharding)

- **Opção Premium:** $80/mês
  - 8 vCPUs, 16GB RAM, 200GB SSD
  - Escala para 10k+ servidores Discord

---

## 🔐 Segurança Pós-Migração

### Firewall (UFW)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (se usar dashboard web)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### SSH Hardening
```bash
# Desabilitar root login
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no

# Usar SSH keys apenas
sudo systemctl restart sshd
```

### Backups Automáticos
```bash
# Criar script de backup diário
cat > /root/backup_apolo.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
docker exec postgres pg_dump -U apolo_user apolo_dota2 | gzip > /root/backups/apolo_${DATE}.sql.gz
docker exec redis redis-cli -a ${REDIS_PASSWORD} BGSAVE
find /root/backups -name "apolo_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /root/backup_apolo.sh

# Cron (diário às 3AM)
crontab -e
# 0 3 * * * /root/backup_apolo.sh
```

---

## 📞 Suporte

**Migração Sugerida:** Após APOLO atingir 100+ servidores Discord ou apresentar degradação de performance na VPS compartilhada.

**Documentação:**
- `docs/deployment/SAFE_VPS_DEPLOYMENT.md` - Deploy atual (compartilhado)
- `docs/deployment/VPS_SHARED_INTEGRATION_GUIDE.md` - Guia VPS compartilhada
- `README.md` - Documentação geral

---

**Última Atualização:** 9 de Dezembro de 2025  
**Estratégia:** Blue-Green Migration (Zero Downtime)  
**Tempo Estimado:** 30 minutos + monitoramento
