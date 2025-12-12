# 📦 Deployment Sessions Archive

**Last Updated:** December 12, 2025

Este diretório contém documentação histórica de sessões de deployment e configuração do bot APOLO.

## 📁 Arquivos Arquivados

### Sessões de Deployment Antigas

Estes documentos foram criados durante o processo de configuração inicial do VPS e GitHub Actions. Estão aqui para referência histórica, mas **não refletem a configuração atual do sistema**.

| Arquivo | Data Original | Descrição | Status |
|---------|---------------|-----------|--------|
| **COPILOT_VPS_QUERIES.md** | Dec 2025 | Perguntas para Copilot sobre estrutura VPS | 🗃️ ARQUIVADO |
| **GITHUB_ACTIONS_DELIVERY_REPORT.md** | Dec 9, 2025 | Relatório de implementação do CI/CD | 🗃️ ARQUIVADO |
| **GITHUB_SECRETS_SETUP.md** | Dec 11, 2025 | Guia de configuração de secrets (versão antiga) | 🗃️ ARQUIVADO |
| **VPS_SETUP_INSTRUCTIONS.md** | Dec 2025 | Instruções iniciais de setup VPS | 🗃️ ARQUIVADO |

---

## ⚠️ IMPORTANTE

**NÃO USE ESTES DOCUMENTOS PARA CONFIGURAR O BOT!**

Eles contêm:
- ❌ Credenciais incorretas (senha antiga: `mYH-$j9t=COJU5T!#MZs`)
- ❌ Estrutura de diretórios desatualizada (`/root/apolo/` - agora é `/opt/apolo-bot`)
- ❌ Usuário de banco incorreto (`apolo_user` - agora usa `postgres`)
- ❌ Network name incorreta (`zapclaudio-network` - agora é `proxy`)

---

## ✅ Documentação Atual (Use Estas)

Para configurar ou deployar o bot, consulte a documentação atualizada:

### Deployment
- **[VPS Deployment Status](../VPS_DEPLOYMENT_STATUS.md)** - Status atual do sistema (LIVE)
- **[VPS Shared Integration Guide](../VPS_SHARED_INTEGRATION_GUIDE.md)** - Guia completo atualizado
- **[Secrets Configuration](../SECRETS_CONFIGURATION.md)** - Configuração atual de secrets

### Setup & Configuration
- **[Setup Guide](../../setup/SETUP.md)** - Guia de instalação completo
- **[Launch Checklist](../LAUNCH_CHECKLIST.md)** - Checklist de produção

---

## 📊 Configuração Atual (Referência Rápida)

**VPS Host:** zapclaudio.com (31.97.103.184)  
**Deployment:** `/opt/apolo-bot`  
**Network:** `proxy` (external)  
**Database:** `apolo_dota2` (user: `postgres`, password: `ZapclaudioVPS2024@Secure!`)  
**Redis:** Shared container (password: `RedisVPS2024@Secure!`, namespace: `apolo:*`)

**Bot Status:** ✅ ONLINE - APOLO - Dota2#0567  
**Servidores:** 2 ativos (PKT GAMERS 🇧🇷, DOTA NÚCLEO COMUNIDADE)

---

## 🗑️ Por Que Arquivamos?

Estes documentos foram criados durante o processo iterativo de deployment, quando testamos diferentes abordagens:

1. **Tentativa Inicial:** Criar usuário dedicado `apolo_user` → Falhou (30+ tentativas de reset de senha)
2. **Descoberta:** Outro Copilot estava usando credenciais erradas
3. **Solução Final:** Usar superuser `postgres` existente → **SUCESSO** ✅

Os documentos antigos refletem essas tentativas. Mantemos aqui para:
- 📚 Histórico de decisões técnicas
- 🔍 Referência de troubleshooting
- 📖 Aprendizado para futuros projetos

---

## 📞 Suporte

Dúvidas sobre a configuração atual? Consulte:
- [VPS Deployment Status](../VPS_DEPLOYMENT_STATUS.md)
- [Main README](../../../README.md)
- [GitHub Issues](https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/issues)

---

**Desenvolvido por PKT Gamers & Upgrade Near ME** 🎮
