# 🤖 AI Coach - Guia de Uso

## ✅ Implementação Completa

O **AI Coach** foi implementado usando **Google Gemini AI (gemini-1.5-flash)** integrado diretamente no dashboard.

---

## 🎯 Como Usar

### 1️⃣ **Configurar API Key (Admin)**

Antes de usar, adicione a chave do Gemini no arquivo `.env`:

```env
# Google Gemini AI (get free key at https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=sua_chave_aqui
```

**Como obter a chave:**
1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com conta Google
3. Clique em **"Create API Key"**
4. Copie a chave gerada
5. Cole no `.env`
6. Reinicie o bot: `docker-compose restart bot`

---

### 2️⃣ **Conectar Conta Steam**

O AI Coach precisa da sua conta Steam conectada:

```
/dashboard → 🔗 Connect Steam
```

1. Digite seu Steam ID
2. Aguarde verificação do perfil
3. Clique em **✅ Confirm**

---

### 3️⃣ **Usar o AI Coach**

```
/dashboard → 🤖 AI Coach
```

**O que acontece:**
1. Bot analisa seu perfil completo
2. Busca suas últimas 10 partidas
3. Envia dados para Google Gemini AI
4. IA analisa e gera conselhos personalizados

**Tempo de resposta:** 10-15 segundos

---

## 📊 O que o AI Coach Analisa

### Dados do Perfil
- Total de partidas jogadas
- Win Rate geral
- Top heróis mais jogados

### Últimas 10 Partidas
- Resultado (Vitória/Derrota)
- K/D/A de cada partida
- GPM e XPM médios
- Tendência recente (últimas 5 partidas)

### Análise Gerada
1. **Avaliação Geral** - Nível de habilidade atual
2. **Pontos Fortes** - O que você está fazendo bem
3. **Áreas para Melhorar** - Fraquezas específicas
4. **Dicas Práticas** - 3-4 sugestões concretas para melhorar MMR

---

## 🌍 Suporte Multi-idioma

O AI Coach responde no idioma do servidor:

- 🇺🇸 **English** - `/language locale:en`
- 🇧🇷 **Português** - `/language locale:pt`
- 🇪🇸 **Español** - `/language locale:es`

A análise completa é gerada no idioma selecionado!

---

## 🎨 Exemplo de Resposta

```
🤖 AI Coach Analysis

Overall Performance
You're showing solid fundamentals with a 52% win rate over 237 matches. 
Your recent form (3W-2L) indicates positive momentum.

Key Strengths
✅ Consistent farming - 450 GPM average shows good efficiency
✅ Team fight participation - 2.8 KDA ratio is above average
✅ Hero pool diversity - Top 3 heroes all viable in current meta

Areas for Improvement
⚠️ Death count - Averaging 7.2 deaths per game (aim for <6)
⚠️ Vision game - Consider more ward purchases as support
⚠️ Objective focus - GPM drops suggest missed tower opportunities

Actionable Tips
1. Practice minimap awareness - Set goal to check every 10 seconds
2. Learn one meta hero per role to 100 games minimum
3. Focus on not dying rather than getting kills (KDA > KD)
4. Review replays - Identify your 3 most common death patterns

Keep grinding! You're on the right track to Ancient rank.
```

---

## ⚙️ Configurações Técnicas

### Modelo AI
- **Modelo:** `gemini-1.5-flash`
- **Max Tokens:** 1000
- **Temperature:** 0.7
- **Prompt:** Otimizado para coaching profissional

### Rate Limits (Free Tier)
- **60 requisições/minuto**
- **1,500 requisições/dia**
- **1 milhão tokens/mês**

Suficiente para até **~1500 análises/dia** no servidor!

---

## 🐛 Troubleshooting

### ❌ "API key not configured"

**Problema:** Chave do Gemini não está no `.env`

**Solução:**
1. Adicione `GEMINI_API_KEY` no `.env`
2. Reinicie: `docker-compose restart bot`

### ❌ "No Steam account linked"

**Problema:** Usuário não conectou a conta Steam

**Solução:**
```
/dashboard → 🔗 Connect Steam
```

### ❌ "Unable to generate AI coaching advice"

**Possíveis causas:**
- Rate limit excedido (espere 1 minuto)
- API key inválida (verifique no Google AI Studio)
- Problema de conexão (tente novamente)

### ⏱️ Resposta muito lenta (>30s)

**Causas:**
- Muitos usuários usando ao mesmo tempo
- API Gemini sobrecarregada

**Solução:** Espere alguns minutos e tente novamente

---

## 📈 Próximas Implementações

Funcionalidades planejadas:

- [ ] **Hero-Specific Advice** - Dicas para heróis específicos
- [ ] **Live Match Coaching** - Análise durante a partida
- [ ] **Replay Analysis** - Upload de replay para análise detalhada
- [ ] **Training Drills** - Exercícios personalizados
- [ ] **Meta Insights** - Análise de meta com base no seu estilo

---

## 💡 Dicas de Uso

### Para Jogadores
- Use após perder 2+ partidas seguidas para identificar padrões
- Peça análise semanalmente para acompanhar progresso
- Compare conselhos com seus top heróis

### Para Admins
- Monitore uso da API no Google AI Studio
- Configure limites se necessário
- Considere upgrade para mais requisições

### Para Streamers
- Mostre análise AI ao vivo para viewers
- Use como conteúdo para vídeos educativos
- Crie desafios baseados nas dicas do AI

---

## 🔒 Privacidade

**Dados Enviados para Google:**
- Estatísticas de Dota 2 (públicas via OpenDota)
- Nenhum dado pessoal além de stats do jogo

**Não enviamos:**
- ❌ Discord ID
- ❌ Nome de usuário
- ❌ Informações do servidor
- ❌ Mensagens de chat

---

## 📚 Recursos

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [OpenDota API](https://docs.opendota.com/)
- [Dota 2 Game Coordinator](https://dev.dota2.com/)

---

## ✅ Checklist de Teste

Antes de usar em produção, teste:

- [ ] API key configurada no `.env`
- [ ] Conta Steam conectada via `/dashboard`
- [ ] Botão AI Coach aparece no dashboard
- [ ] Análise é gerada em 10-15 segundos
- [ ] Resposta está no idioma correto do servidor
- [ ] Embed mostra perfil e estatísticas
- [ ] Erro amigável se API key ausente

---

**Última Atualização:** Dezembro 2025  
**Versão do Bot:** 1.0 com AI Coach
