# 🚀 APOLO Dota 2 Bot - Instalação em VPS Compartilhada

Guia para instalar o APOLO em uma VPS que **já roda outros projetos**.

---

## 📋 Pré-requisitos

- ✅ **Ubuntu 22.04+ / Debian 11+** (OS limpo ou com outros apps)
- ✅ **2GB+ RAM** (4GB recomendado)
- ✅ **20GB+ espaço em disco**
- ✅ **SSH access** (root ou sudo)
- ✅ **Seus tokens** (Discord, Stratz, Steam, Gemini)

---

## 🎯 Características da Instalação

### ✅ O que FAZ:
- Instala Docker/Compose (se não existir)
- Cria diretório isolado: `/opt/apps/apolo`
- Usa rede Docker privada: `apolo-net`
- Containers com nomes únicos: `apolo-postgres`, `apolo-redis`, `apolo-bot`
- Volumes persistentes separados
- Porta Grafana: **3000** (única porta pública)

### ❌ O que NÃO FAZ:
- **NÃO** mexe no firewall (UFW/iptables)
- **NÃO** altera configurações de sistema
- **NÃO** interfere com outros apps Docker
- **NÃO** expõe PostgreSQL/Redis publicamente

---

## 🚀 Instalação (1 Comando)

### SSH na VPS:
```bash
ssh root@SEU_IP_AQUI
```

### Execute o script:
```bash
curl -fsSL https://raw.githubusercontent.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/main/setup-shared-vps.sh | bash
```

**O script vai:**
1. Verificar se Docker existe (instala se necessário)
2. Criar `/opt/apps/apolo`
3. Clonar repositório
4. Copiar `.env.example` → `.env`
5. **PAUSAR** para você editar `.env` com seus tokens
6. Build + start containers
7. Executar migrations
8. Deploy comandos Discord

**Tempo estimado:** 15-20 minutos ⏱️

---

## ⚙️ Configuração do .env

Quando o script pausar, edite:

```bash
nano /opt/apps/apolo/.env
```

### Campos obrigatórios:

```env
# Discord
DISCORD_TOKEN=seu_token_discord
DISCORD_CLIENT_ID=seu_client_id
DISCORD_GUILD_ID=seu_server_id

# Database (senha forte!)
DB_PASSWORD=MinhaS3nh@Sup3rF0rt3!2024

# Redis (senha forte!)
REDIS_PASSWORD=R3dis@P@ssw0rd!S3cur3

# APIs
STRATZ_API_TOKEN_1=seu_token_stratz
STEAM_API_KEY=seu_steam_key
GEMINI_API_KEY_1=seu_gemini_key

# Grafana
GRAFANA_ADMIN_PASSWORD=Gr@f@n@2024!
```

Salve: **Ctrl+X** → **Y** → **Enter**

---

## 📊 Verificação Pós-Instalação

### Status dos containers:
```bash
docker-compose -f /opt/apps/apolo/docker-compose.prod.yml ps
```

Deve mostrar:
```
NAME              STATUS        PORTS
apolo-bot         Up (healthy)  9100/tcp
apolo-postgres    Up (healthy)  
apolo-redis       Up (healthy)  
apolo-prometheus  Up            
apolo-grafana     Up            0.0.0.0:3000->3000/tcp
```

### Ver logs do bot:
```bash
docker-compose -f /opt/apps/apolo/docker-compose.prod.yml logs -f bot
```

Deve mostrar:
```
✅ Connected to PostgreSQL database
✅ Connected to Redis
🤖 Bot online as APOLO - Dota2#1234
📊 Serving X servers
```

---

## 🌐 Acessos

### Grafana (Dashboards):
```
http://SEU_IP:3000

User: admin
Pass: [sua senha do GRAFANA_ADMIN_PASSWORD]
```

### Prometheus (Metrics):
```
http://localhost:9091

⚠️ Somente localhost (não acessível externamente)
```

### Bot Metrics:
```
http://localhost:9100/metrics

⚠️ Somente localhost (não acessível externamente)
```

---

## 📋 Comandos Úteis

### Ver logs:
```bash
cd /opt/apps/apolo
docker-compose -f docker-compose.prod.yml logs -f bot
```

### Parar containers:
```bash
docker-compose -f /opt/apps/apolo/docker-compose.prod.yml down
```

### Reiniciar:
```bash
docker-compose -f /opt/apps/apolo/docker-compose.prod.yml restart
```

### Atualizar código:
```bash
cd /opt/apps/apolo
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

### Ver status:
```bash
docker-compose -f /opt/apps/apolo/docker-compose.prod.yml ps
```

---

## 🔒 Segurança

### Portas Expostas:
| Serviço | Porta | Acesso |
|---------|-------|--------|
| Grafana | 3000 | Público (senha protegido) |
| Prometheus | 9091 | Localhost only |
| Bot Metrics | 9100 | Localhost only |
| PostgreSQL | - | **Não exposta** (rede interna) |
| Redis | - | **Não exposta** (rede interna) |

### Firewall (Opcional):
Se você usa UFW/iptables, permita apenas:
```bash
sudo ufw allow 3000/tcp  # Grafana (se quiser acesso externo)
```

---

## 🐳 Isolamento Docker

### Rede Privada:
```
apolo-net (bridge)
  ├─ apolo-postgres   (10.0.x.2)
  ├─ apolo-redis      (10.0.x.3)
  ├─ apolo-bot        (10.0.x.4)
  ├─ apolo-prometheus (10.0.x.5)
  └─ apolo-grafana    (10.0.x.6)
```

### Volumes Persistentes:
```
/var/lib/docker/volumes/
  ├─ apolo_postgres_data/
  ├─ apolo_redis_data/
  ├─ apolo_prometheus_data/
  └─ apolo_grafana_data/
```

**Outros projetos Docker não são afetados!**

---

## 🔧 Convivência com Outros Apps

### ✅ Compatível com:
- Nginx (reverso proxy)
- Apache
- Outros bots Discord
- Aplicações Node.js/Python/PHP
- Bancos de dados externos (MySQL, Mongo, etc)

### ⚠️ Possíveis Conflitos:
| Serviço | Porta | Solução |
|---------|-------|---------|
| Outro app na porta 3000 | 3000 | Altere `GRAFANA_PORT` em docker-compose |
| Outro Postgres | 5432 | Sem conflito (APOLO não expõe porta) |
| Outro Redis | 6379 | Sem conflito (APOLO não expõe porta) |

---

## 📦 Backup e Restauração

### Backup volumes:
```bash
# Parar containers
docker-compose -f /opt/apps/apolo/docker-compose.prod.yml down

# Backup
sudo tar -czf apolo-backup-$(date +%Y%m%d).tar.gz \
  /var/lib/docker/volumes/apolo_postgres_data \
  /var/lib/docker/volumes/apolo_redis_data \
  /opt/apps/apolo/.env

# Restart
docker-compose -f /opt/apps/apolo/docker-compose.prod.yml up -d
```

### Restaurar:
```bash
# Extrair
sudo tar -xzf apolo-backup-YYYYMMDD.tar.gz -C /

# Restart containers
docker-compose -f /opt/apps/apolo/docker-compose.prod.yml up -d
```

---

## 🆘 Troubleshooting

### Bot não inicia:
```bash
# Ver logs detalhados
docker-compose -f /opt/apps/apolo/docker-compose.prod.yml logs --tail=50 bot

# Verificar .env
cat /opt/apps/apolo/.env | grep DISCORD_TOKEN
```

### Postgres não conecta:
```bash
# Verificar health
docker ps | grep apolo-postgres

# Testar conexão
docker exec -it apolo-postgres psql -U apolo_bot -d apolo_dota2
```

### Redis não conecta:
```bash
# Testar
docker exec -it apolo-redis redis-cli -a "SUA_SENHA" ping
```

### Porta 3000 em uso:
```bash
# Ver quem está usando
sudo lsof -i :3000

# Altere no docker-compose.prod.yml:
# - "3001:3000"  (expõe na porta 3001)
```

---

## 🚀 Próximos Passos

1. ✅ Configure Grafana dashboards
2. ✅ Teste comandos Discord no servidor
3. ✅ Configure backup automático (cron)
4. ✅ Monitore logs: `/opt/apps/apolo/logs/`
5. ✅ Configure alertas Prometheus (opcional)

---

## 📞 Suporte

- **GitHub Issues:** [Reportar bug](https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/issues)
- **Documentação:** [README.md](../README.md)
- **VPS Guide:** [VPS_DEPLOYMENT_GUIDE.md](VPS_DEPLOYMENT_GUIDE.md)

---

**Desenvolvido por PKT Gamers & Upgrade Near ME** 🎮
