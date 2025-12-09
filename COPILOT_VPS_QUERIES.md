#  PERGUNTAS PARA O COPILOT DA VPS

## Repositório: Upgrade-Near-Me/VPS-UPGRADE-VKM4-01-HTG-ZCB

### 1. Verificar nome correto da network Docker
@workspace Qual é o nome exato da network Docker usada por todos os serviços na VPS? É 'proxy' ou 'zapclaudio-network'?

### 2. Confirmar containers PostgreSQL e Redis
@workspace Os containers 'postgres' e 'redis' estão rodando como serviços externos na VPS? Quais são os nomes exatos desses containers?

### 3. Verificar estrutura do docker-compose principal
@workspace Pode me mostrar o arquivo docker-compose.yml principal da VPS que define a network e os serviços compartilhados?

### 4. Validar diretório de deploy do APOLO
@workspace Qual é o diretório correto na VPS onde o APOLO deve ser deployado? É /root/apolo/?

### 5. Ver exemplo de outro serviço
@workspace Pode me mostrar como o 'api-node-template' ou 'discord-bot-template' está configurado no docker-compose? Quero usar como referência para o APOLO.

##  RESPOSTA ESPERADA:

Baseado na análise do repositório VPS, aqui está o que descobri:

### Network Docker
- **Nome**: 'proxy'
- **Tipo**: external (criada com 'docker network create proxy')
- **Usado por**: Todos os serviços (Traefik, n8n, Portainer, API templates, etc)

### Containers Compartilhados
- **PostgreSQL 16**: Container 'postgres' (porta 5432)
- **Redis 7**: Container 'redis' (porta 6379)
- **Ambos**: Acessíveis via network 'proxy'

### Estrutura de Deploy
`
/root/
 docker/  (ou /root/docker/)
    docker-compose.yml  (serviços principais)
    .env
    traefik/
    databases/
    ...
 projects/  (ou /root/)
     apolo/  (seu bot aqui)
         docker-compose.yml
         .env
`

##  CORREÇÃO APLICADA NO APOLO:

1. Network: proxy (external: true)
2. Sem depends_on (postgres/redis são externos)
3. DATABASE_URL: postgresql://user:pass@postgres:5432/apolo_dota2
4. REDIS_URL: redis://:pass@redis:6379

