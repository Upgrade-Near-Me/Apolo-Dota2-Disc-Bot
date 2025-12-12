# 🔐 Guia de Autenticação Docker no VPS

## Problema Identificado

A imagem `ghcr.io/upgrade-near-me/apolo-dota2-disc-bot:latest` é **privada** no GitHub Container Registry (GHCR). O servidor VPS precisa autenticar para puxar a imagem.

**Erro típico:**
```
Error response from daemon: pull access denied for ghcr.io/upgrade-near-me/apolo-dota2-disc-bot, 
repository does not exist or may require 'docker login': denied: unauthorized
```

---

## 🛠️ Solução: Configurar Autenticação no VPS

### Opção 1: GitHub Personal Access Token (Recomendado)

#### 1.1 Criar Personal Access Token (PAT)

1. Acesse: [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. Configure:
   - **Note:** `VPS Docker Auth - APOLO Bot`
   - **Expiration:** 90 days (ou conforme política da empresa)
   - **Scopes:**
     - ✅ `read:packages` (OBRIGATÓRIO)
     - ✅ `write:packages` (opcional, se quiser push futuro)
3. Clique em **Generate token**
4. **COPIE O TOKEN IMEDIATAMENTE** (não será mostrado novamente)

Exemplo de token: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 1.2 Fazer Login no VPS

```bash
# SSH para o servidor
ssh root@31.97.103.184

# Fazer login no GHCR
echo "ghp_SEU_TOKEN_AQUI" | docker login ghcr.io -u SEU_USUARIO_GITHUB --password-stdin
```

**Exemplo real:**
```bash
echo "ghp_abc123xyz789" | docker login ghcr.io -u upgrade-near-me --password-stdin
```

**Saída esperada:**
```
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```

#### 1.3 Verificar Autenticação

```bash
# Testar pull manual
docker pull ghcr.io/upgrade-near-me/apolo-dota2-disc-bot:latest

# Deve funcionar sem erro "unauthorized"
```

---

### Opção 2: Automatizar via GitHub Actions (Mais Seguro)

#### 2.1 Adicionar Secret ao GitHub

1. Vá para: `https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/settings/secrets/actions`
2. Clique em **New repository secret**
3. Adicione:
   - **Name:** `GHCR_TOKEN`
   - **Value:** `ghp_seu_token_aqui` (PAT criado no passo 1.1)

#### 2.2 Atualizar Workflow de Deploy

Edite `.github/workflows/deploy-vps.yml`:

```yaml
- name: Deploy to VPS
  run: |
    # Autenticar Docker no VPS antes do deploy
    ssh -i private_key -o StrictHostKeyChecking=no \
      ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} << 'EOF'
      # Login no GHCR usando o token
      echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u ${{ github.repository_owner }} --password-stdin
    EOF

    # Copiar docker-compose
    scp -i private_key -o StrictHostKeyChecking=no \
      docker-compose.shared.yml \
      ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }}:/opt/apolo-bot/docker-compose.yml

    # Deploy normal
    ssh -i private_key -o StrictHostKeyChecking=no \
      ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} << 'EOF'
      cd /opt/apolo-bot
      docker compose pull
      docker compose up -d
      echo "✅ Deploy concluído!"
    EOF
```

---

## 🔒 Segurança: Configurar Credential Helper (Opcional)

Para evitar armazenar senha em texto plano em `/root/.docker/config.json`:

```bash
# Instalar pass (password manager)
apt-get update
apt-get install -y pass gnupg2

# Configurar GPG key
gpg --generate-key
# Siga as instruções (use email do projeto)

# Inicializar pass
pass init <GPG_KEY_ID>

# Configurar Docker Credential Helper
wget https://github.com/docker/docker-credential-helpers/releases/download/v0.8.0/docker-credential-pass-v0.8.0.linux-amd64
chmod +x docker-credential-pass-v0.8.0.linux-amd64
mv docker-credential-pass-v0.8.0.linux-amd64 /usr/local/bin/docker-credential-pass

# Configurar Docker para usar pass
mkdir -p ~/.docker
cat > ~/.docker/config.json << 'EOF'
{
  "credsStore": "pass"
}
EOF

# Fazer login novamente (senha será armazenada em pass)
echo "ghp_SEU_TOKEN" | docker login ghcr.io -u upgrade-near-me --password-stdin
```

---

## 🧪 Testar Configuração

### 1. Testar Pull Manual

```bash
# SSH para VPS
ssh root@31.97.103.184

# Puxar imagem
docker pull ghcr.io/upgrade-near-me/apolo-dota2-disc-bot:latest

# Verificar
docker images | grep apolo
```

**Saída esperada:**
```
ghcr.io/upgrade-near-me/apolo-dota2-disc-bot   latest    abc123def456   2 hours ago   500MB
```

### 2. Testar Docker Compose

```bash
cd /opt/apolo-bot
docker compose pull
docker compose up -d

# Verificar logs
docker logs apolo-bot
```

### 3. Verificar Autenticação Persistente

```bash
# Verificar config.json
cat ~/.docker/config.json

# Deve conter:
# {
#   "auths": {
#     "ghcr.io": {
#       "auth": "base64_encoded_credentials"
#     }
#   }
# }
```

---

## 🚨 Troubleshooting

### Erro: "unauthorized" persiste

**Causa:** Token sem permissões corretas

**Solução:**
1. Gere novo PAT com scope `read:packages`
2. Faça logout e login novamente:
   ```bash
   docker logout ghcr.io
   echo "NOVO_TOKEN" | docker login ghcr.io -u SEU_USUARIO --password-stdin
   ```

### Erro: "token expired"

**Causa:** PAT expirou (default: 90 dias)

**Solução:**
1. Gere novo token em GitHub Settings
2. Atualize no VPS:
   ```bash
   echo "NOVO_TOKEN" | docker login ghcr.io -u SEU_USUARIO --password-stdin
   ```
3. Atualize o Secret `GHCR_TOKEN` no GitHub

### Erro: "repository does not exist"

**Causa:** Nome da imagem incorreto ou repositório realmente não existe

**Solução:**
1. Verifique se a imagem foi publicada:
   - Vá para: `https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/pkgs/container/apolo-dota2-disc-bot`
2. Confirme que o nome está correto em `docker-compose.shared.yml`:
   ```yaml
   image: ghcr.io/upgrade-near-me/apolo-dota2-disc-bot:latest
   ```

### Erro: "authentication required"

**Causa:** Não está logado ou credenciais inválidas

**Solução:**
```bash
# Verificar status de login
docker system info | grep -i registry

# Re-fazer login
echo "TOKEN" | docker login ghcr.io -u USERNAME --password-stdin
```

---

## 📋 Checklist de Deploy

Antes de executar deploy no VPS:

- [ ] Personal Access Token criado com scope `read:packages`
- [ ] Docker login executado no VPS
- [ ] Pull manual da imagem bem-sucedido
- [ ] `GHCR_TOKEN` adicionado aos GitHub Secrets
- [ ] Workflow atualizado para autenticar antes do pull
- [ ] Teste de deploy via GitHub Actions funcionando
- [ ] Logs do container sem erros de autenticação

---

## 🔄 Rotação de Tokens (Boa Prática)

Configure lembrete para rotação de tokens a cada 90 dias:

1. **30 dias antes da expiração:**
   - Gere novo PAT
   - Teste em ambiente de staging
2. **7 dias antes da expiração:**
   - Atualize `GHCR_TOKEN` no GitHub
   - Execute deploy para verificar
3. **No dia da expiração:**
   - Atualize login no VPS manualmente (se necessário)
   - Revogue token antigo no GitHub

---

## 📚 Referências

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [Docker Login Documentation](https://docs.docker.com/engine/reference/commandline/login/)
- [GitHub PAT Guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Docker Credential Helpers](https://github.com/docker/docker-credential-helpers)

---

**Última atualização:** 11 de Dezembro de 2025  
**Mantido por:** PKT Gamers & Upgrade Near ME
