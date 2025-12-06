#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# APOLO DOTA 2 BOT - FULL DEPLOYMENT (PRE-SETUP + DEPLOY)
# Tudo em um script! Execute uma vez e tudo roda.
# ═══════════════════════════════════════════════════════════════

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 APOLO DOTA 2 - FULL VPS SETUP (ALL-IN-ONE)            ║"
echo "║     Tudo vai rodar automaticamente!                        ║"
echo "╚════════════════════════════════════════════════════════════╝"

# ═══════════════════════════════════════════════════════════════
# PARTE 1: PRE-SETUP
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PARTE 1: PRE-SETUP (Sistema + Firewall)                  ║"
echo "╚════════════════════════════════════════════════════════════╝"

echo ""
echo "📦 [1/15] Atualizando sistema..."
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git ca-certificates

echo ""
echo "🗑️  [2/15] Limpando Docker antigo..."
sudo apt remove -y docker.io docker-compose docker-compose-v2 docker-doc podman-docker || true
sudo rm -rf /var/lib/docker || true
sudo rm -rf /var/lib/containerd || true

echo ""
echo "⚙️  [3/15] Instalando dependências..."
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https

echo ""
echo "🔥 [4/15] Configurando Firewall..."
if ! sudo ufw status | grep -q "Status: active"; then
  sudo ufw --force enable
fi
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw default deny incoming
sudo ufw default allow outgoing

echo ""
echo "✅ [5/15] Pre-setup concluído!"

# ═══════════════════════════════════════════════════════════════
# PARTE 2: DOCKER INSTALLATION
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PARTE 2: INSTALANDO DOCKER                               ║"
echo "╚════════════════════════════════════════════════════════════╝"

echo ""
echo "🐳 [6/15] Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker root

echo ""
echo "🎯 [7/15] Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo ""
echo "✅ Verificando Docker..."
docker --version
docker-compose --version

# ═══════════════════════════════════════════════════════════════
# PARTE 3: APLICAÇÃO
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PARTE 3: CLONANDO E CONFIGURANDO APOLO                   ║"
echo "╚════════════════════════════════════════════════════════════╝"

echo ""
echo "📥 [8/15] Clonando repositório..."
cd /root
git clone https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot.git apolo
cd apolo

echo ""
echo "⚙️  [9/15] Configurando .env..."
cp .env.example .env
chmod 600 .env

echo ""
echo "⚠️  ATENÇÃO! AGORA VOCÊ PRECISA EDITAR O ARQUIVO .env"
echo ""
echo "Abra o arquivo com:"
echo "  nano /root/apolo/.env"
echo ""
echo "Edite estes campos com SUS VALORES:"
echo "  - DISCORD_TOKEN"
echo "  - DISCORD_CLIENT_ID"
echo "  - DISCORD_GUILD_ID"
echo "  - STRATZ_API_TOKEN_1"
echo "  - DATABASE_PASSWORD"
echo "  - REDIS_PASSWORD"
echo "  - GEMINI_API_KEY_1"
echo "  - GRAFANA_ADMIN_PASSWORD"
echo ""
echo "Salve com: Ctrl+X -> Y -> Enter"
echo ""
read -p "✋ Pressione ENTER quando terminar de editar o .env..."

# ═══════════════════════════════════════════════════════════════
# PARTE 4: DOCKER CONTAINERS
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PARTE 4: INICIANDO DOCKER CONTAINERS                     ║"
echo "╚════════════════════════════════════════════════════════════╝"

echo ""
echo "🔨 [10/15] Construindo e iniciando containers..."
docker-compose -f docker-compose.prod.yml up -d --build

echo ""
echo "⏳ [11/15] Aguardando 60 segundos para containers ficarem healthy..."
sleep 60

echo ""
echo "📊 [12/15] Status dos containers:"
docker-compose -f docker-compose.prod.yml ps

# ═══════════════════════════════════════════════════════════════
# PARTE 5: DATABASE E BOT
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PARTE 5: BANCO DE DADOS E BOT                            ║"
echo "╚════════════════════════════════════════════════════════════╝"

echo ""
echo "🗄️  [13/15] Executando migrações de banco de dados..."
docker-compose -f docker-compose.prod.yml exec -T bot npx tsx src/database/migrate.ts

echo ""
echo "🤖 [14/15] Deployando comandos Discord..."
docker-compose -f docker-compose.prod.yml exec -T bot npx tsx src/deploy-commands.ts

# ═══════════════════════════════════════════════════════════════
# FIM
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ DEPLOYMENT COMPLETO!                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"

echo ""
echo "🎉 Seu bot está rodando!"
echo ""
echo "📍 ACESSO AO GRAFANA:"
echo "   URL: http://31.97.103.184:3000"
echo "   User: admin"
echo "   Pass: [sua senha do GRAFANA_ADMIN_PASSWORD]"
echo ""
echo "📋 COMANDOS ÚTEIS:"
echo "   Ver status:     docker-compose -f docker-compose.prod.yml ps"
echo "   Ver logs bot:   docker-compose -f docker-compose.prod.yml logs -f bot"
echo "   Reiniciar:      docker-compose -f docker-compose.prod.yml restart"
echo "   Parar tudo:     docker-compose -f docker-compose.prod.yml down"
echo ""
echo "🔍 VERIFICAR BOT ONLINE:"
docker-compose -f docker-compose.prod.yml logs --tail=10 bot
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎮 APOLO DOTA 2 está ONLINE e pronto para usar!"
echo "═══════════════════════════════════════════════════════════════"
