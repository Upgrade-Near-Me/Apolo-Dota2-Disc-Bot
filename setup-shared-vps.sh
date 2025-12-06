#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# APOLO DOTA 2 BOT - SHARED VPS SETUP
# Para VPS que roda múltiplos projetos
# Instalação isolada em Docker
# ═══════════════════════════════════════════════════════════════

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 APOLO DOTA 2 - SHARED VPS DEPLOYMENT                  ║"
echo "║     Instalação isolada em Docker                          ║"
echo "╚════════════════════════════════════════════════════════════╝"

# ═══════════════════════════════════════════════════════════════
# STEP 1: Verificar Docker
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🔍 [1/8] Verificando Docker..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado!"
else
    echo "✅ Docker já instalado: $(docker --version)"
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado!"
else
    echo "✅ Docker Compose já instalado: $(docker-compose --version)"
fi

# ═══════════════════════════════════════════════════════════════
# STEP 2: Criar estrutura de diretórios
# ═══════════════════════════════════════════════════════════════
echo ""
echo "📁 [2/8] Criando estrutura de diretórios..."

# Sugestão: /opt/apps/apolo (padrão para apps em produção)
APP_DIR="/opt/apps/apolo"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER /opt/apps

echo "  ✅ Diretório criado: $APP_DIR"

# ═══════════════════════════════════════════════════════════════
# STEP 3: Clonar repositório
# ═══════════════════════════════════════════════════════════════
echo ""
echo "📥 [3/8] Clonando repositório..."

if [ -d "$APP_DIR/.git" ]; then
    echo "  ⚠️  Repositório já existe. Atualizando..."
    cd $APP_DIR
    git pull origin main
else
    git clone https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot.git $APP_DIR
    cd $APP_DIR
fi

echo "  ✅ Repositório pronto em: $APP_DIR"

# ═══════════════════════════════════════════════════════════════
# STEP 4: Configurar .env
# ═══════════════════════════════════════════════════════════════
echo ""
echo "⚙️  [4/8] Configurando .env..."

if [ ! -f "$APP_DIR/.env" ]; then
    cp $APP_DIR/.env.example $APP_DIR/.env
    chmod 600 $APP_DIR/.env
    echo "  ✅ Arquivo .env criado"
    echo ""
    echo "  ⚠️  IMPORTANTE: EDITE O ARQUIVO .env AGORA!"
    echo ""
    echo "  Abra com:"
    echo "    nano $APP_DIR/.env"
    echo ""
    echo "  Campos obrigatórios:"
    echo "    - DISCORD_TOKEN"
    echo "    - DISCORD_CLIENT_ID"
    echo "    - DISCORD_GUILD_ID"
    echo "    - DB_PASSWORD (mínimo 16 caracteres)"
    echo "    - REDIS_PASSWORD (mínimo 16 caracteres)"
    echo "    - STRATZ_API_TOKEN_1"
    echo "    - GEMINI_API_KEY_1"
    echo "    - GRAFANA_ADMIN_PASSWORD (mínimo 12 caracteres)"
    echo ""
    read -p "  Pressione ENTER quando terminar de editar..."
else
    echo "  ✅ Arquivo .env já existe"
fi

# ═══════════════════════════════════════════════════════════════
# STEP 5: Verificar portas disponíveis
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🔌 [5/8] Verificando portas disponíveis..."

# Portas usadas pelo APOLO:
# 3000 - Grafana (web UI)
# 9091 - Prometheus (interno, localhost only)
# 9100 - Bot metrics (interno, localhost only)

PORTA_GRAFANA=3000

if sudo lsof -i :$PORTA_GRAFANA &> /dev/null; then
    echo "  ⚠️  Porta $PORTA_GRAFANA já em uso!"
    echo "  Você precisa alterar a porta do Grafana no docker-compose.prod.yml"
    echo "  Ou parar o serviço que está usando esta porta."
    read -p "  Deseja continuar mesmo assim? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "  ❌ Instalação cancelada."
        exit 1
    fi
else
    echo "  ✅ Porta $PORTA_GRAFANA disponível"
fi

# ═══════════════════════════════════════════════════════════════
# STEP 6: Build e Start containers
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🐳 [6/8] Iniciando containers Docker..."

cd $APP_DIR
docker-compose -f docker-compose.prod.yml up -d --build

echo ""
echo "  ⏳ Aguardando 60 segundos para containers ficarem healthy..."
sleep 60

# ═══════════════════════════════════════════════════════════════
# STEP 7: Database migrations
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🗄️  [7/8] Executando migrações de banco de dados..."

docker-compose -f docker-compose.prod.yml exec -T bot npx tsx src/database/migrate.ts

# ═══════════════════════════════════════════════════════════════
# STEP 8: Deploy Discord commands
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🤖 [8/8] Deployando comandos Discord..."

docker-compose -f docker-compose.prod.yml exec -T bot npx tsx src/deploy-commands.ts

# ═══════════════════════════════════════════════════════════════
# FIM - Informações úteis
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ APOLO INSTALADO COM SUCESSO!                          ║"
echo "╚════════════════════════════════════════════════════════════╝"

echo ""
echo "📊 STATUS DOS CONTAINERS:"
docker-compose -f $APP_DIR/docker-compose.prod.yml ps

echo ""
echo "📍 INFORMAÇÕES DE ACESSO:"
echo "  ├─ Diretório:  $APP_DIR"
echo "  ├─ Grafana:    http://$(hostname -I | awk '{print $1}'):3000"
echo "  │   User:      admin"
echo "  │   Pass:      [sua senha do GRAFANA_ADMIN_PASSWORD]"
echo "  ├─ Prometheus: http://localhost:9091 (somente localhost)"
echo "  └─ Metrics:    http://localhost:9100/metrics (somente localhost)"

echo ""
echo "📋 COMANDOS ÚTEIS:"
echo "  ├─ Ver logs:     docker-compose -f $APP_DIR/docker-compose.prod.yml logs -f bot"
echo "  ├─ Parar:        docker-compose -f $APP_DIR/docker-compose.prod.yml down"
echo "  ├─ Reiniciar:    docker-compose -f $APP_DIR/docker-compose.prod.yml restart"
echo "  ├─ Status:       docker-compose -f $APP_DIR/docker-compose.prod.yml ps"
echo "  └─ Atualizar:    cd $APP_DIR && git pull && docker-compose -f docker-compose.prod.yml up -d --build"

echo ""
echo "🔒 SEGURANÇA:"
echo "  ├─ PostgreSQL:  Sem porta pública (isolado na rede apolo-net)"
echo "  ├─ Redis:       Sem porta pública (isolado na rede apolo-net)"
echo "  ├─ Grafana:     Porta 3000 pública (protegida por senha)"
echo "  └─ Prometheus:  Apenas localhost (não acessível externamente)"

echo ""
echo "🚀 PRÓXIMOS PASSOS:"
echo "  1. Verifique se o bot está online no Discord"
echo "  2. Acesse Grafana e configure dashboards"
echo "  3. Configure firewall se necessário (UFW/iptables)"
echo "  4. Configure backup automático dos volumes Docker"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎉 Bot APOLO rodando em Docker! Outros projetos não afetados."
echo "═══════════════════════════════════════════════════════════════"
