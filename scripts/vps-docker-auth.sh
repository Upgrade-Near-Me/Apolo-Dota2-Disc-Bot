#!/bin/bash

# ==========================================
# VPS Docker Authentication Helper
# ==========================================
# Este script configura autenticação Docker
# no servidor VPS para acessar imagens privadas
# do GitHub Container Registry (GHCR)
# ==========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  APOLO - VPS Docker Auth Setup            ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo ""

# Verificar se está rodando no VPS
if [ ! -f "/etc/os-release" ]; then
    echo -e "${RED}❌ Este script deve ser executado no servidor VPS${NC}"
    exit 1
fi

# Solicitar credenciais
echo -e "${YELLOW}📝 Configuração de Autenticação GHCR${NC}"
echo ""
read -p "GitHub Username (ex: upgrade-near-me): " GITHUB_USER
read -sp "GitHub Personal Access Token (com scope read:packages): " GITHUB_TOKEN
echo ""
echo ""

# Validar entrada
if [ -z "$GITHUB_USER" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Username e Token são obrigatórios${NC}"
    exit 1
fi

# Fazer login no GHCR
echo -e "${YELLOW}🔐 Autenticando no GitHub Container Registry...${NC}"
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Login bem-sucedido!${NC}"
else
    echo -e "${RED}❌ Falha na autenticação. Verifique suas credenciais.${NC}"
    exit 1
fi

# Testar pull da imagem
echo ""
echo -e "${YELLOW}🧪 Testando acesso à imagem privada...${NC}"
docker pull ghcr.io/upgrade-near-me/apolo-dota2-disc-bot:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Imagem puxada com sucesso!${NC}"
else
    echo -e "${RED}❌ Falha ao puxar imagem. Verifique permissões do token.${NC}"
    exit 1
fi

# Verificar configuração
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Configuração Completa                     ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${GREEN}✓${NC} Docker login configurado em: ~/.docker/config.json"
echo -e "${GREEN}✓${NC} Imagem privada acessível"
echo -e "${GREEN}✓${NC} Pronto para deploy!"
echo ""

# Verificar validade do token (aproximado)
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "• Personal Access Tokens expiram (geralmente em 90 dias)"
echo "• Rotacione o token antes da expiração"
echo "• Adicione GHCR_TOKEN aos GitHub Secrets para deploy automático"
echo ""

# Mostrar próximos passos
echo -e "${GREEN}📋 Próximos Passos:${NC}"
echo "1. Adicionar GHCR_TOKEN aos GitHub Secrets:"
echo "   https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/settings/secrets/actions"
echo ""
echo "2. Executar deploy:"
echo "   cd /opt/apolo-bot"
echo "   docker compose pull"
echo "   docker compose up -d"
echo ""

exit 0
