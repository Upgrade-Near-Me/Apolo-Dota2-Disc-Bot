# 🖥️ Instruções para Copilot - Preparação VPS para APOLO Bot

## Contexto
Preciso preparar o VPS (31.97.103.184) para receber o deploy automatizado do bot APOLO Dota 2. O VPS já tem PostgreSQL 16 e Redis 7 rodando em containers compartilhados.

## Objetivo
Criar o database e usuário PostgreSQL específicos para o APOLO, e preparar o diretório de deploy.

---

## 📋 Tarefas para Executar no VPS

### 1. Conectar no VPS via SSH
```bash
ssh root@31.97.103.184
```

### 2. Criar Database e User no PostgreSQL

Execute estes comandos **dentro do container PostgreSQL**:

```bash
# Conectar no container PostgreSQL
docker exec -it postgres psql -U postgres

# Dentro do psql, execute um por vez:
CREATE DATABASE apolo_dota2;
CREATE USER apolo_user WITH PASSWORD 'mYH-$j9t=COJU5T!#MZs';
GRANT ALL PRIVILEGES ON DATABASE apolo_dota2 TO apolo_user;

# Verificar se foi criado corretamente
\l
# Deve aparecer "apolo_dota2" na lista

\du
# Deve aparecer "apolo_user" na lista

# Testar conexão com o novo usuário
\c apolo_dota2 apolo_user
# Se conectar sem erro, está correto!

# Sair do psql
\q
```

### 3. Criar Diretório para Deploy do APOLO

```bash
# Criar diretório com permissões corretas
mkdir -p /root/apolo
chmod 755 /root/apolo

# Verificar
ls -la /root/ | grep apolo
# Deve mostrar: drwxr-xr-x  2 root root  4096 [data] apolo
```

### 4. Verificar Network Docker Existe

```bash
# Verificar se a network zapclaudio-network existe
docker network ls | grep zapclaudio-network

# Se NÃO existir, criar:
docker network create zapclaudio-network
```

### 5. Verificar PostgreSQL e Redis Estão Rodando

```bash
# Verificar containers ativos
docker ps | grep -E "postgres|redis"

# Deve mostrar:
# - Container "postgres" (PostgreSQL 16)
# - Container "redis" (Redis 7)

# Se não estiverem rodando, iniciar:
cd /root/VPS-UPGRADE-VKM4-01-HTG-ZCB
docker-compose up -d postgres redis
```

### 6. Sair do VPS

```bash
exit
```

---

## ✅ Validação Final

Após executar todos os comandos, confirme:

- [x] Database `apolo_dota2` criado
- [x] User `apolo_user` criado com permissões
- [x] Diretório `/root/apolo` existe
- [x] Network `zapclaudio-network` existe
- [x] Containers `postgres` e `redis` estão rodando

---

## ⚠️ Informações Importantes

**Senha do apolo_user:** `mYH-$j9t=COJU5T!#MZs`

**Isolation:**
- Database: `apolo_dota2` (separado de n8n_db, api_node_db, discord_bot_db)
- Redis namespace: `apolo:*` (configurado no docker-compose.shared.yml)
- Network: `zapclaudio-network` (compartilhada com outros projetos)

**Próximo Passo após esta preparação:**
- GitHub Actions vai fazer deploy automaticamente quando você fizer `git push origin main`
- O workflow vai:
  1. Buildar a imagem Docker
  2. Fazer push para GHCR
  3. Conectar no VPS via SSH
  4. Fazer pull da imagem
  5. Subir o container apolo-bot
  6. Rodar migrations
  7. Verificar saúde do bot

---

## 🚨 Se Houver Erros

**Erro: "database apolo_dota2 already exists"**
- Não tem problema! Significa que já foi criado antes
- Apenas verifique com: `docker exec -it postgres psql -U postgres -c "\l"`

**Erro: "role apolo_user already exists"**
- Não tem problema! Significa que já foi criado antes
- Apenas verifique permissões com: `docker exec -it postgres psql -U postgres -c "\du"`

**Erro: "directory already exists"**
- Não tem problema! Use o diretório existente

**Erro ao conectar SSH:**
- Verifique se a chave SSH está configurada corretamente
- Tente: `ssh -i ~/.ssh/id_ed25519 root@31.97.103.184`

---

## 📝 Copie e Cole para a Copilot

**Prompt sugerido:**

```
Olá Copilot do projeto cubir! Preciso preparar o VPS para receber o bot APOLO.

Por favor, execute as tarefas descritas no arquivo VPS_SETUP_INSTRUCTIONS.md:
1. Conecte no VPS (31.97.103.184)
2. Crie o database "apolo_dota2" no PostgreSQL
3. Crie o user "apolo_user" com a senha especificada
4. Crie o diretório /root/apolo
5. Verifique se a network e containers estão rodando

Após concluir, confirme que tudo foi criado corretamente.

Obrigado!
```

---

**Arquivo criado em:** 2025-12-08  
**Para:** Preparação VPS antes do deploy automatizado via GitHub Actions
