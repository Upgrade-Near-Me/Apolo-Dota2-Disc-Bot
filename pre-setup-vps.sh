#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# APOLO DOTA 2 BOT - PRE-SETUP VPS
# Preparação ANTES de instalar Docker
# Ubuntu 22.04+ (Hostinger)
# ═══════════════════════════════════════════════════════════════

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔧 PRE-SETUP: Preparando VPS para APOLO                  ║"
echo "╚════════════════════════════════════════════════════════════╝"

# ═══════════════════════════════════════════════════════════════
# PASSO 1: Update Sistema Operacional
# ═══════════════════════════════════════════════════════════════
echo ""
echo "📦 [1/5] Atualizando sistema operacional..."
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git ca-certificates

# ═══════════════════════════════════════════════════════════════
# PASSO 2: Remover Docker Antigo (se existir)
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🗑️  [2/5] Removendo versões antigas de Docker (se existirem)..."
sudo apt remove -y docker.io docker-compose docker-compose-v2 docker-doc podman-docker || true
sudo rm -rf /var/lib/docker || true
sudo rm -rf /var/lib/containerd || true

# ═══════════════════════════════════════════════════════════════
# PASSO 3: Instalar Dependências Necessárias
# ═══════════════════════════════════════════════════════════════
echo ""
echo "⚙️  [3/5] Instalando dependências necessárias..."
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https

# ═══════════════════════════════════════════════════════════════
# PASSO 4: Configurar Firewall (UFW)
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🔥 [4/5] Configurando Firewall (UFW)..."

# Habilitar UFW se não estiver
if ! sudo ufw status | grep -q "Status: active"; then
  echo "  Habilitando UFW..."
  sudo ufw --force enable
fi

# Abrir portas necessárias
echo "  Abrindo portas para SSH, HTTP, HTTPS, Grafana..."
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 3000/tcp    # Grafana
sudo ufw default deny incoming
sudo ufw default allow outgoing

echo "  ✅ UFW configurado!"

# ═══════════════════════════════════════════════════════════════
# PASSO 5: Verificar Requisitos do Sistema
# ═══════════════════════════════════════════════════════════════
echo ""
echo "✅ [5/5] Verificando requisitos do sistema..."

echo ""
echo "Sistema Information:"
echo "  OS: $(lsb_release -ds)"
echo "  Kernel: $(uname -r)"
echo "  Arquitetura: $(uname -m)"
echo "  CPU Cores: $(nproc)"
echo "  RAM Total: $(free -h | awk 'NR==2 {print $2}')"
echo "  Espaço em Disco: $(df -h / | awk 'NR==2 {print $2}')"

# ═══════════════════════════════════════════════════════════════
# FIM
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ PRÉ-SETUP COMPLETO!                                   ║"
echo "╚════════════════════════════════════════════════════════════╝"

echo ""
echo "🚀 PRÓXIMO PASSO:"
echo ""
echo "Agora execute o script de deployment:"
echo ""
echo "  curl -fsSL https://raw.githubusercontent.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/main/deploy-vps.sh | bash"
echo ""
echo "═══════════════════════════════════════════════════════════════"
