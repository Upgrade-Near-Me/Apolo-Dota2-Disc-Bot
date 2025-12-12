# ==========================================
# Deploy Manual Completo - APOLO VPS
# ==========================================
# Simula o workflow GitHub Actions localmente
# ==========================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "DEPLOY MANUAL - APOLO VPS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Build da imagem localmente
Write-Host "[1/5] Building Docker image (Dockerfile.prod)..." -ForegroundColor Yellow
docker build -f Dockerfile.prod -t ghcr.io/upgrade-near-me/apolo-dota2-disc-bot:latest .

if($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Build falhou!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Login no GHCR
Write-Host "[2/5] Login no GitHub Container Registry..." -ForegroundColor Yellow
$token = Read-Host -AsSecureString "GitHub PAT (GHCR_TOKEN)"
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
$plainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

echo $plainToken | docker login ghcr.io -u upgrade-near-me --password-stdin

if($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Login GHCR falhou!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Push da imagem
Write-Host "[3/5] Pushing image to GHCR..." -ForegroundColor Yellow
docker push ghcr.io/upgrade-near-me/apolo-dota2-disc-bot:latest

if($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Push falhou!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. Deploy na VPS
Write-Host "[4/5] Deploying to VPS..." -ForegroundColor Yellow

# Copiar docker-compose
scp docker-compose.shared.yml root@31.97.103.184:/opt/apolo-bot/docker-compose.yml

# Fazer pull e restart
ssh root@31.97.103.184 @"
cd /opt/apolo-bot
docker-compose pull
docker-compose down
docker-compose up -d
"@

Write-Host ""

# 5. Verificar status
Write-Host "[5/5] Verificando status..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$status = ssh root@31.97.103.184 "docker ps --filter name=apolo-bot --format '{{.Status}}'"

if($status -match 'Up') {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "DEPLOY CONCLUIDO!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "Container Status: $status" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Logs do container:" -ForegroundColor Cyan
    ssh root@31.97.103.184 "docker logs --tail=50 apolo-bot"
} else {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "CONTAINER NAO INICIOU" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
    
    Write-Host "Logs de erro:" -ForegroundColor Yellow
    ssh root@31.97.103.184 "docker logs --tail=50 apolo-bot"
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
