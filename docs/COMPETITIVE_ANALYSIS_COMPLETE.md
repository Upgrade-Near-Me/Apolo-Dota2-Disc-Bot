# 🎮 Análise Competitiva Completa - APOLO Dota 2 Bot

**Data:** 5 de Dezembro de 2025  
**Objetivo:** Identificar features competitivas adaptáveis de outros jogos para Dota 2

---

## 📊 Sumário Executivo

Analisamos **8 plataformas de bots** (Dota 2, LoL, Valorant, CS2, Discord genéricos) e identificamos **35+ features** adaptáveis ao APOLO, organizadas em **7 categorias estratégicas**.

### Plataformas Analisadas

1. **Dota 2 Ecosystem**
   - ✅ Stratz (Premium Analytics)
   - ✅ OpenDota (Open Source)

2. **Competitors (Outros Jogos)**
   - ✅ Tracker.gg (Valorant/CS2/Multi-game)
   - ✅ Leetify (CS2 Premium)
   - ✅ U.gg / Blitz.gg (League of Legends)

3. **Discord Bot Leaders**
   - ✅ MEE6 (21M+ servidores)
   - ✅ Arcane.bot (2.5M+ servidores)
   - ✅ Top.gg Marketplace (análise de 50+ bots)

---

## 🏆 CATEGORIA 1: Sistema de Performance Individual (IMP Score Alternative)

### 📌 Features Identificadas

#### 1.1. IMP Score (Stratz) - **PRIORIDADE MÁXIMA**
**O Que É:**
- Métrica única -100 a +100 para avaliar performance individual
- Normalizada por rank tier (Herald vs Immortal)
- Considera: KDA, farm, building damage, team fight participation, vision score

**Adaptação para APOLO:**
```typescript
// src/utils/impScore.ts
interface IMPScoreFactors {
  kda: number;          // (K+A)/D ratio
  gpm: number;          // Gold per minute
  xpm: number;          // Experience per minute
  heroDamage: number;   // Hero damage %
  towerDamage: number;  // Building damage
  visionScore: number;  // Wards placed/killed
  teamfightPart: number; // Teamfight participation %
  farmEfficiency: number; // Last hits vs game duration
}

function calculateIMPScore(match: DotaMatch, playerRank: number): number {
  const weights = getRankTierWeights(playerRank); // Herald=1, Immortal=8
  
  // KDA Component (30% weight)
  const kdaScore = normalizeKDA(match.kills, match.deaths, match.assists, weights.kda);
  
  // Farm Component (25% weight)
  const farmScore = normalizeGPM(match.gpm, match.heroId, weights.farm);
  
  // Impact Component (20% weight)
  const impactScore = normalizeHeroDamage(match.heroDamage, match.duration, weights.impact);
  
  // Objective Component (15% weight)
  const objectiveScore = normalizeTowerDamage(match.towerDamage, weights.objective);
  
  // Vision Component (10% weight)
  const visionScore = normalizeVision(match.obsPlaced, match.sensPlaced, weights.vision);
  
  // Total: -100 to +100
  return Math.round(
    (kdaScore * 0.3) + 
    (farmScore * 0.25) + 
    (impactScore * 0.2) + 
    (objectiveScore * 0.15) + 
    (visionScore * 0.1)
  ) * 2 - 100;
}
```

**ROI:**
- ⏱️ **Tempo:** 2-3 dias
- 📈 **Impacto:** ALTO (diferenciador único no mercado BR)
- 💰 **Valor Comercial:** Premium feature ($5/mês)

---

#### 1.2. Leetify Rating (CS2) - Adaptável
**O Que É:**
- Rating dinâmico baseado em over/underperformance
- "Você teve 8.96° crosshair placement (melhor da sua história!)"
- Notificações de Personal Bests em tempo real

**Adaptação para APOLO:**
```typescript
// src/utils/leetifyRating.ts
interface PersonalBest {
  metric: 'gpm' | 'xpm' | 'kda' | 'hero_damage' | 'vision_score';
  value: number;
  previousBest: number;
  improvement: number; // percentage
  achievedAt: Date;
}

async function checkPersonalBests(match: DotaMatch, userId: string): Promise<PersonalBest[]> {
  const history = await getPlayerHistory(userId);
  const bests: PersonalBest[] = [];
  
  // Check GPM
  if (match.gpm > history.maxGpm) {
    bests.push({
      metric: 'gpm',
      value: match.gpm,
      previousBest: history.maxGpm,
      improvement: ((match.gpm - history.maxGpm) / history.maxGpm) * 100,
      achievedAt: new Date()
    });
  }
  
  // Check Vision Score (new metric!)
  const visionScore = calculateVisionScore(match);
  if (visionScore > history.maxVisionScore) {
    bests.push({
      metric: 'vision_score',
      value: visionScore,
      previousBest: history.maxVisionScore,
      improvement: ((visionScore - history.maxVisionScore) / history.maxVisionScore) * 100,
      achievedAt: new Date()
    });
  }
  
  return bests;
}
```

**Exemplo de Notificação:**
```
🎉 **NOVO RECORDE PESSOAL!**

Maior GPM: **745** (anterior: 682)
Melhoria: +9.2%

Maior Vision Score: **28** (anterior: 22)
Melhoria: +27.3%

Continue assim! 🚀
```

---

## 🎯 CATEGORIA 2: Hero Performance Tracking (Benchmarks)

### 📌 Features Identificadas

#### 2.1. OpenDota Benchmarks - **PRIORIDADE ALTA**
**O Que É:**
- Percentil do jogador por hero por skill bracket
- "Você está no top 15% de Invokers no seu rank"
- Benchmark de GPM/XPM/KDA/Hero Damage por hero

**Adaptação para APOLO:**
```sql
-- migrations/003_hero_benchmarks.sql
CREATE TABLE hero_benchmarks (
  id SERIAL PRIMARY KEY,
  hero_id INT NOT NULL,
  rank_tier INT NOT NULL, -- 1=Herald, 8=Immortal
  metric VARCHAR(20) NOT NULL, -- 'gpm', 'xpm', 'kda', 'hero_damage'
  p50 DECIMAL(10,2), -- Median
  p75 DECIMAL(10,2), -- Top 25%
  p90 DECIMAL(10,2), -- Top 10%
  p95 DECIMAL(10,2), -- Top 5%
  p99 DECIMAL(10,2), -- Top 1%
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hero_id, rank_tier, metric)
);

CREATE INDEX idx_hero_benchmarks_lookup ON hero_benchmarks(hero_id, rank_tier, metric);
```

```typescript
// src/services/benchmarkService.ts
interface HeroBenchmark {
  heroId: number;
  metric: string;
  playerValue: number;
  percentile: number; // 0-100
  rank: string; // "Top 15%"
}

async function getHeroPerformanceRank(
  heroId: number, 
  metric: 'gpm' | 'xpm' | 'kda', 
  value: number,
  rankTier: number
): Promise<HeroBenchmark> {
  const benchmarks = await pool.query(
    `SELECT p50, p75, p90, p95, p99 
     FROM hero_benchmarks 
     WHERE hero_id = $1 AND rank_tier = $2 AND metric = $3`,
    [heroId, rankTier, metric]
  );
  
  const { p50, p75, p90, p95, p99 } = benchmarks.rows[0];
  
  let percentile: number;
  if (value >= p99) percentile = 99;
  else if (value >= p95) percentile = 95;
  else if (value >= p90) percentile = 90;
  else if (value >= p75) percentile = 75;
  else if (value >= p50) percentile = 50;
  else percentile = 25;
  
  return {
    heroId,
    metric,
    playerValue: value,
    percentile,
    rank: percentile >= 90 ? `Top ${100 - percentile}%` : `Percentil ${percentile}`
  };
}
```

**Exemplo de Embed:**
```
🦸 **Performance de Hero: Invoker**

📊 Suas Estatísticas (Legend IV):
- GPM: 645 → **Top 12%** 🔥
- XPM: 712 → Top 28%
- KDA: 4.2 → Top 35%
- Hero Damage: 28.5k → **Top 8%** 🔥

💡 Você domina farm e damage, mas pode melhorar KDA!
```

---

#### 2.2. Hero Pool Analysis (OpenDota + Tracker.gg)
**O Que É:**
- Grid visual de todos os heroes com win rate
- Identificação de "Comfort Picks" (>70% WR, 10+ games)
- "Counter Picks" (heroes contra os quais você joga bem)

**Adaptação para APOLO:**
```typescript
// src/utils/heroPoolAnalyzer.ts
interface HeroPoolAnalysis {
  comfortPicks: Hero[];  // >65% WR, 10+ games
  avoidPicks: Hero[];    // <40% WR, 5+ games
  learningPicks: Hero[]; // 3-9 games
  counterStrength: Array<{
    enemyHero: Hero;
    yourHero: Hero;
    winRate: number;
    games: number;
  }>;
}

async function analyzeHeroPool(steamId: string): Promise<HeroPoolAnalysis> {
  const heroStats = await pool.query(
    `SELECT hero_id, COUNT(*) as games, 
            SUM(CASE WHEN victory THEN 1 ELSE 0 END) as wins
     FROM matches
     WHERE discord_id = (SELECT discord_id FROM users WHERE steam_id = $1)
     GROUP BY hero_id
     HAVING COUNT(*) >= 3`,
    [steamId]
  );
  
  const comfortPicks = heroStats.rows
    .filter(h => h.games >= 10 && (h.wins / h.games) >= 0.65)
    .map(h => ({ heroId: h.hero_id, winRate: (h.wins / h.games) * 100 }));
  
  const avoidPicks = heroStats.rows
    .filter(h => h.games >= 5 && (h.wins / h.games) < 0.40)
    .map(h => ({ heroId: h.hero_id, winRate: (h.wins / h.games) * 100 }));
  
  return { comfortPicks, avoidPicks, learningPicks: [], counterStrength: [] };
}
```

**Exemplo de Visualização:**
```
🎮 **Análise de Hero Pool**

✅ **COMFORT PICKS** (Domínio)
1. Invoker - 72% WR (18 jogos)
2. Storm Spirit - 68% WR (15 jogos)
3. Puck - 67% WR (12 jogos)

❌ **AVOID PICKS** (Evite!)
1. Meepo - 25% WR (8 jogos)
2. Chen - 33% WR (6 jogos)

📚 **APRENDENDO**
- Tinker (6 jogos) - Continue praticando!
- Arc Warden (4 jogos) - Potencial!
```

---

## 🏅 CATEGORIA 3: Match Awards & Gamification (CS2/Valorant/MEE6)

### 📌 Features Identificadas

#### 3.1. Match Awards (Leetify + Stratz)
**O Que É:**
- Auto-detecção de conquistas únicas em cada partida
- "MVP", "Top Core", "Top Support", "Clutch King", "Entry Fragger"
- Sistema de badges/achievements permanentes

**Adaptação para APOLO:**
```typescript
// src/utils/matchAwards.ts
enum AwardType {
  MVP = 'mvp',                    // Highest IMP score
  TOP_CORE = 'top_core',          // Highest GPM in team
  TOP_SUPPORT = 'top_support',    // Highest vision score
  RAMPAGE = 'rampage',            // 5+ kills in teamfight
  CLUTCH_KING = 'clutch_king',    // Won 1v2+ situations
  FIRST_BLOOD = 'first_blood',    // Got first blood
  COURIER_SNIPER = 'courier_sniper', // Killed enemy courier
  WARD_MASTER = 'ward_master',    // 20+ wards placed
  NINJA_DEFUSE = 'ninja_defuse',  // Backdoor throne
  COMEBACK_HERO = 'comeback_hero' // Won after 20k+ gold deficit
}

interface MatchAward {
  type: AwardType;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  emoji: string;
}

async function detectMatchAwards(match: DotaMatch): Promise<MatchAward[]> {
  const awards: MatchAward[] = [];
  
  // MVP Detection (highest IMP score)
  const impScore = calculateIMPScore(match, match.rankTier);
  if (impScore >= 75) {
    awards.push({
      type: AwardType.MVP,
      title: 'MVP da Partida',
      description: `IMP Score: +${impScore} (Excepcional!)`,
      rarity: 'legendary',
      emoji: '👑'
    });
  }
  
  // Rampage Detection
  if (match.kills >= 5 && match.duration < 600) { // 5+ kills in <10min
    awards.push({
      type: AwardType.RAMPAGE,
      title: 'Rampage Master',
      description: `${match.kills} kills nos primeiros 10 minutos!`,
      rarity: 'epic',
      emoji: '💀'
    });
  }
  
  // Ward Master (Support)
  const wardsPlaced = match.obsPlaced + match.sensPlaced;
  if (wardsPlaced >= 20) {
    awards.push({
      type: AwardType.WARD_MASTER,
      title: 'Ward Master',
      description: `${wardsPlaced} wards colocados (Top 5% supports)`,
      rarity: 'rare',
      emoji: '👁️'
    });
  }
  
  return awards;
}
```

**Exemplo de Embed:**
```
🏆 **CONQUISTAS DA PARTIDA**

👑 **MVP da Partida** (Lendário)
IMP Score: +82 (Excepcional!)

💀 **Rampage Master** (Épico)
7 kills nos primeiros 10 minutos!

👁️ **Ward Master** (Raro)
24 wards colocados (Top 5% supports)

🎉 +150 XP de bônus por conquistas!
```

---

#### 3.2. Sistema de Níveis/XP (MEE6/Arcane.bot) - **PRIORIDADE ALTA**
**O Que É:**
- Sistema de leveling baseado em atividade
- Role rewards automáticos ao atingir levels
- Leaderboard semanal/mensal
- Voice XP + Text XP

**Adaptação para APOLO:**
```sql
-- migrations/004_leveling_system.sql
CREATE TABLE user_levels (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL,
  discord_id VARCHAR(20) NOT NULL,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  voice_minutes INT DEFAULT 0,
  matches_analyzed INT DEFAULT 0,
  last_xp_gain TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(guild_id, discord_id)
);

CREATE TABLE level_roles (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL,
  level_required INT NOT NULL,
  role_id VARCHAR(20) NOT NULL,
  UNIQUE(guild_id, level_required)
);
```

```typescript
// src/utils/levelingSystem.ts
const XP_PER_MESSAGE = 15;
const XP_PER_VOICE_MINUTE = 10;
const XP_PER_MATCH_ANALYZED = 50;
const XP_REQUIRED_BASE = 100;
const XP_MULTIPLIER = 1.5;

function calculateXpForLevel(level: number): number {
  return Math.floor(XP_REQUIRED_BASE * Math.pow(level, XP_MULTIPLIER));
}

async function addXp(
  guildId: string, 
  discordId: string, 
  xpAmount: number, 
  source: 'message' | 'voice' | 'match'
): Promise<{ leveledUp: boolean; newLevel?: number }> {
  const user = await pool.query(
    `SELECT level, xp FROM user_levels WHERE guild_id = $1 AND discord_id = $2`,
    [guildId, discordId]
  );
  
  if (user.rows.length === 0) {
    // Create new user
    await pool.query(
      `INSERT INTO user_levels (guild_id, discord_id, xp, total_xp) VALUES ($1, $2, $3, $3)`,
      [guildId, discordId, xpAmount]
    );
    return { leveledUp: false };
  }
  
  const currentLevel = user.rows[0].level;
  const currentXp = user.rows[0].xp + xpAmount;
  const xpNeeded = calculateXpForLevel(currentLevel);
  
  if (currentXp >= xpNeeded) {
    // Level up!
    const newLevel = currentLevel + 1;
    await pool.query(
      `UPDATE user_levels 
       SET level = $1, xp = $2, total_xp = total_xp + $3
       WHERE guild_id = $4 AND discord_id = $5`,
      [newLevel, currentXp - xpNeeded, xpAmount, guildId, discordId]
    );
    
    // Check role rewards
    await assignLevelRole(guildId, discordId, newLevel);
    
    return { leveledUp: true, newLevel };
  } else {
    // No level up
    await pool.query(
      `UPDATE user_levels 
       SET xp = $1, total_xp = total_xp + $2
       WHERE guild_id = $3 AND discord_id = $4`,
      [currentXp, xpAmount, guildId, discordId]
    );
    return { leveledUp: false };
  }
}
```

**Triggers de XP:**
- ✅ Analisar match → **+50 XP**
- ✅ Enviar mensagem → **+15 XP** (cooldown 1min)
- ✅ Voz ativa (1min) → **+10 XP**
- ✅ Completar achievement → **+100 XP**
- ✅ Ganhar partida → **+75 XP**

**Exemplo de Level Up:**
```
🎉 **LEVEL UP!**

@Jogador subiu para **Level 12**!

🎁 **Recompensas:**
- Role: 🌟 Veteran Player
- Acesso ao canal: #vip-lounge
- +5% XP boost em matches

📊 Progresso: 450/1800 XP até Level 13
```

---

## 🗺️ CATEGORIA 4: Mapas e Visualizações (Valorant/CS2)

### 📌 Features Identificadas

#### 4.1. Ward Heatmap (OpenDota + Tracker.gg Lineups)
**O Que É:**
- Mapa de calor mostrando posições de wards mais comuns
- Comparação: "Suas wards" vs "Pro players wards"
- Sugestões de spots otimizados

**Adaptação para APOLO:**
```typescript
// src/utils/wardHeatmap.ts
interface WardPlacement {
  x: number;
  y: number;
  type: 'observer' | 'sentry';
  placedAt: number; // game time in seconds
  duration: number; // how long it stayed
}

async function generateWardHeatmap(steamId: string, mapRegion: string): Promise<Buffer> {
  const wards = await pool.query(
    `SELECT obs_log, sen_log FROM matches 
     WHERE discord_id = (SELECT discord_id FROM users WHERE steam_id = $1)
     ORDER BY played_at DESC LIMIT 20`,
    [steamId]
  );
  
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');
  
  // Draw Dota 2 map
  const mapImage = await loadImage('./assets/dota2_map.png');
  ctx.drawImage(mapImage, 0, 0, 1024, 1024);
  
  // Draw ward heatmap (red = your wards, green = pro spots)
  const yourWards = parseWardLog(wards.rows);
  const proWards = await getProWardSpots(mapRegion);
  
  // Your wards (red heatmap)
  yourWards.forEach(ward => {
    const mapX = convertGameCoordToCanvas(ward.x);
    const mapY = convertGameCoordToCanvas(ward.y);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(mapX, mapY, 20, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Pro spots (green circles)
  proWards.forEach(ward => {
    const mapX = convertGameCoordToCanvas(ward.x);
    const mapY = convertGameCoordToCanvas(ward.y);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mapX, mapY, 15, 0, Math.PI * 2);
    ctx.stroke();
  });
  
  return canvas.toBuffer('image/png');
}
```

**Exemplo de Imagem:**
```
🗺️ **Ward Heatmap - Últimas 20 Partidas**

🔴 Vermelho = Suas wards
🟢 Verde = Spots profissionais

📊 Vision Score: 23/partida (Média)
💡 Sugestão: Coloque mais wards no Roshan pit!
```

---

#### 4.2. Teamfight Replay Visualization (Stratz Playback)
**O Que É:**
- Timeline visual de teamfights
- "Em 25:43, você matou 3 heroes em 8 segundos"
- GIF/replay de melhores plays

**Adaptação para APOLO (Futuro):**
- Usar Stratz Playback API
- Gerar GIFs de highlights automáticos
- "Top 3 Plays da Semana" (competição)

---

## 🎨 CATEGORIA 5: Customização & UX (MEE6/Discord Bots)

### 📌 Features Identificadas

#### 5.1. Custom Bot Personalizer (MEE6/Arcane)
**O Que É:**
- Personalizar nome/avatar/banner do bot
- Cor de embeds customizada por servidor
- Mensagens de boas-vindas personalizadas

**Adaptação para APOLO:**
```sql
-- migrations/005_custom_bot.sql
ALTER TABLE guild_settings ADD COLUMN custom_name VARCHAR(32);
ALTER TABLE guild_settings ADD COLUMN custom_avatar_url VARCHAR(255);
ALTER TABLE guild_settings ADD COLUMN embed_color VARCHAR(7) DEFAULT '#7289DA';
ALTER TABLE guild_settings ADD COLUMN welcome_message TEXT;
```

```typescript
// src/utils/customBot.ts
async function applyCustomBotSettings(guildId: string, client: Client) {
  const settings = await pool.query(
    `SELECT custom_name, custom_avatar_url, embed_color 
     FROM guild_settings WHERE guild_id = $1`,
    [guildId]
  );
  
  if (settings.rows[0]?.custom_name) {
    const guild = client.guilds.cache.get(guildId);
    await guild?.members.me?.setNickname(settings.rows[0].custom_name);
  }
  
  // Embed color applied in createEmbed()
}
```

**Exemplo de Customização:**
```
⚙️ **Configurações de Personalização**

🤖 Nome do Bot: APOLO Gaming
🎨 Cor dos Embeds: #FF6B35 (Laranja)
📸 Avatar: [Upload personalizado]
💬 Mensagem de Boas-Vindas:
"Bem-vindo ao servidor! Use /dashboard para começar."
```

---

#### 5.2. Reaction Roles (MEE6/Arcane/Bot Genérico)
**O Que É:**
- Usuários ganham roles reagindo a mensagens
- Self-assign roles (escolha seu rank, posição favorita, região)

**Adaptação para APOLO:**
```typescript
// src/handlers/reactionRoleHandler.ts
interface ReactionRole {
  messageId: string;
  emoji: string;
  roleId: string;
}

async function setupReactionRoles(guildId: string, channelId: string) {
  const embed = new EmbedBuilder()
    .setTitle('Escolha Suas Posições Favoritas')
    .setDescription('Reaja para receber o role correspondente!')
    .setColor('#7289DA')
    .addFields(
      { name: '🛡️ Carry', value: 'Role: Carry Player' },
      { name: '⚔️ Mid', value: 'Role: Mid Player' },
      { name: '🏃 Offlane', value: 'Role: Offlane Player' },
      { name: '💊 Support', value: 'Role: Support Player' }
    );
  
  const channel = await client.channels.fetch(channelId);
  const message = await channel.send({ embeds: [embed] });
  
  await message.react('🛡️');
  await message.react('⚔️');
  await message.react('🏃');
  await message.react('💊');
  
  // Save to database
  await pool.query(
    `INSERT INTO reaction_roles (guild_id, message_id, emoji, role_id) VALUES 
     ($1, $2, '🛡️', $3),
     ($1, $2, '⚔️', $4),
     ($1, $2, '🏃', $5),
     ($1, $2, '💊', $6)`,
    [guildId, message.id, carryRoleId, midRoleId, offRoleId, supRoleId]
  );
}
```

---

## 📱 CATEGORIA 6: Social & Community (Multi-platform)

### 📌 Features Identificadas

#### 6.1. Social Alerts (MEE6/Arcane)
**O Que É:**
- Notificações automáticas de streams (Twitch/YouTube)
- Posts de Twitter/Instagram no Discord
- "Fulano foi ao vivo!" com preview

**Adaptação para APOLO:**
```typescript
// src/services/socialAlertsService.ts
async function checkTwitchStream(twitchUsername: string, guildId: string) {
  const stream = await fetch(`https://api.twitch.tv/helix/streams?user_login=${twitchUsername}`, {
    headers: { 'Client-ID': TWITCH_CLIENT_ID, 'Authorization': `Bearer ${TWITCH_TOKEN}` }
  }).then(r => r.json());
  
  if (stream.data.length > 0) {
    const alertChannel = await getAlertChannel(guildId);
    const embed = new EmbedBuilder()
      .setTitle(`🔴 ${twitchUsername} está AO VIVO!`)
      .setDescription(stream.data[0].title)
      .setURL(`https://twitch.tv/${twitchUsername}`)
      .setThumbnail(stream.data[0].thumbnail_url)
      .setColor('#9146FF');
    
    await alertChannel.send({ content: '@everyone', embeds: [embed] });
  }
}
```

---

#### 6.2. Server Counters (Arcane.bot)
**O Que É:**
- Canais de voz que mostram estatísticas em tempo real
- "👥 Membros: 1,234", "🤖 Bots: 12", "🚀 Boosts: 7"

**Adaptação para APOLO:**
```typescript
// src/utils/serverCounters.ts
async function updateServerCounters(guild: Guild) {
  const counters = await pool.query(
    `SELECT channel_id, counter_type FROM server_counters WHERE guild_id = $1`,
    [guild.id]
  );
  
  for (const counter of counters.rows) {
    const channel = guild.channels.cache.get(counter.channel_id);
    if (!channel || channel.type !== ChannelType.GuildVoice) continue;
    
    let name: string;
    switch (counter.counter_type) {
      case 'members':
        name = `👥 Membros: ${guild.memberCount}`;
        break;
      case 'online':
        name = `🟢 Online: ${guild.members.cache.filter(m => m.presence?.status === 'online').size}`;
        break;
      case 'linked_users':
        const linked = await pool.query(`SELECT COUNT(*) FROM users WHERE guild_id = $1`, [guild.id]);
        name = `🔗 Conectados: ${linked.rows[0].count}`;
        break;
    }
    
    await channel.setName(name);
  }
}
```

**Exemplo:**
```
Voice Channels:
├── 📊 ESTATÍSTICAS
│   ├── 👥 Membros: 1,234
│   ├── 🟢 Online: 456
│   ├── 🔗 Steam Conectado: 789
│   └── 🏆 Immortal Players: 23
```

---

## 🎲 CATEGORIA 7: Gamification & Economy (LoL Bots)

### 📌 Features Identificadas

#### 7.1. Card Collection Game (Mudae/Karuta/Gachapon)
**O Que É:**
- Coleção de cartas de heroes/skins
- Trading entre players
- Raridade (comum, raro, épico, lendário)
- Gacha system (pull cards)

**Adaptação para APOLO (Futuro Premium):**
```typescript
// src/utils/cardSystem.ts
enum CardRarity {
  COMMON = 'common',       // 60% chance
  RARE = 'rare',           // 25% chance
  EPIC = 'epic',           // 10% chance
  LEGENDARY = 'legendary'  // 5% chance
}

interface HeroCard {
  id: string;
  heroId: number;
  skinId?: number;
  rarity: CardRarity;
  owner: string; // discord_id
  level: number; // 1-10 (upgrade with duplicates)
}

async function pullCard(userId: string): Promise<HeroCard> {
  const rng = Math.random();
  let rarity: CardRarity;
  
  if (rng < 0.60) rarity = CardRarity.COMMON;
  else if (rng < 0.85) rarity = CardRarity.RARE;
  else if (rng < 0.95) rarity = CardRarity.EPIC;
  else rarity = CardRarity.LEGENDARY;
  
  const card: HeroCard = {
    id: generateCardId(),
    heroId: getRandomHeroByRarity(rarity),
    rarity,
    owner: userId,
    level: 1
  };
  
  await pool.query(
    `INSERT INTO hero_cards (id, hero_id, rarity, owner, level) VALUES ($1, $2, $3, $4, $5)`,
    [card.id, card.heroId, card.rarity, card.owner, card.level]
  );
  
  return card;
}
```

**Exemplo:**
```
🎴 **Você puxou uma carta!**

⭐⭐⭐⭐ **LENDÁRIO!**

🦸 **Invoker - Arcana: Dark Artistry**

✨ Stats:
- Raridade: Lendária (0.5% chance)
- Level: 1/10
- Valor de Mercado: 500 coins

🎉 Esta é sua 1ª carta lendária!
```

---

#### 7.2. Server Economy (OwO Bot)
**O Que É:**
- Moeda virtual (coins)
- Daily rewards
- Betting/gambling mini-games
- Shop com itens cosméticos

**Adaptação para APOLO:**
```sql
-- migrations/006_economy.sql
CREATE TABLE user_economy (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL,
  discord_id VARCHAR(20) NOT NULL,
  coins INT DEFAULT 0,
  last_daily TIMESTAMP,
  total_earned INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  UNIQUE(guild_id, discord_id)
);

CREATE TABLE shop_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  item_type VARCHAR(20), -- 'role', 'badge', 'boost', 'card_pack'
  stock INT DEFAULT -1 -- -1 = unlimited
);
```

---

## 📋 Resumo de Priorização (ROI Analysis)

### 🔴 TIER 1 - IMPLEMENTAR AGORA (0-2 semanas)

| Feature | Tempo | Impacto | Dificuldade | Comercial |
|---------|-------|---------|-------------|-----------|
| **IMP Score System** | 2-3 dias | 🔥🔥🔥🔥🔥 | Média | Premium |
| **Hero Benchmarks** | 1-2 dias | 🔥🔥🔥🔥 | Baixa | Free |
| **Match Awards** | 1 dia | 🔥🔥🔥🔥 | Baixa | Free |
| **Leveling System** | 2 dias | 🔥🔥🔥🔥 | Média | Free |
| **Personal Bests** | 1 dia | 🔥🔥🔥 | Baixa | Free |

**Total:** ~7-9 dias de desenvolvimento

---

### 🟡 TIER 2 - PRÓXIMA SPRINT (2-4 semanas)

| Feature | Tempo | Impacto | Dificuldade | Comercial |
|---------|-------|---------|-------------|-----------|
| **Ward Heatmap** | 2 dias | 🔥🔥🔥 | Média | Premium |
| **Hero Pool Analysis** | 1 dia | 🔥🔥🔥 | Baixa | Free |
| **Reaction Roles** | 1 dia | 🔥🔥 | Baixa | Free |
| **Social Alerts (Twitch)** | 1 dia | 🔥🔥 | Média | Free |
| **Server Counters** | 1 dia | 🔥🔥 | Baixa | Free |

**Total:** ~6 dias de desenvolvimento

---

### 🟢 TIER 3 - FUTURO (1-3 meses)

| Feature | Tempo | Impacto | Dificuldade | Comercial |
|---------|-------|---------|-------------|-----------|
| **Custom Bot** | 2 dias | 🔥🔥 | Baixa | Premium |
| **Card Collection** | 5 dias | 🔥🔥🔥 | Alta | Premium |
| **Server Economy** | 3 dias | 🔥🔥 | Média | Free |
| **Teamfight Replay** | 7 dias | 🔥🔥🔥🔥 | Alta | Premium |
| **Pro Player Tracking** | 3 dias | 🔥🔥 | Média | Free |

---

## 💰 Modelo de Monetização Sugerido

### Free Tier
- ✅ Match Analysis (3/dia)
- ✅ Hero Benchmarks
- ✅ Match Awards
- ✅ Leveling System
- ✅ Hero Pool Analysis
- ✅ Personal Bests (basic)

### Premium ($5/mês)
- ✅ IMP Score System
- ✅ Ward Heatmap
- ✅ Unlimited Match Analysis
- ✅ Advanced Personal Bests
- ✅ Custom Bot Personalizer
- ✅ Priority Support

### Ultimate ($10/mês)
- ✅ Todo Premium +
- ✅ Card Collection System
- ✅ Teamfight Replay
- ✅ Advanced AI Analysis
- ✅ Private Coaching Sessions

---

## 🎯 Roadmap de Implementação (Next 60 Days)

### Semana 1-2: Foundation (IMP Score + Benchmarks)
- [ ] Implementar IMP Score algorithm
- [ ] Criar tabela `hero_benchmarks`
- [ ] Popular benchmarks com dados OpenDota
- [ ] Integrar IMP no Match Analysis

### Semana 3: Gamification (Awards + Leveling)
- [ ] Sistema de Match Awards
- [ ] Leveling System com XP
- [ ] Personal Bests notifications
- [ ] Achievement badges

### Semana 4: Dashboard Redesign
- [ ] Reorganizar botões por categoria
- [ ] Cores consistentes
- [ ] Breadcrumb navigation
- [ ] Loading states visuais

### Semana 5-6: Advanced Features
- [ ] Ward Heatmap
- [ ] Hero Pool Analysis
- [ ] Reaction Roles
- [ ] Social Alerts (Twitch)

### Semana 7-8: Premium Launch
- [ ] Paywall integration
- [ ] Subscription management
- [ ] Premium dashboard
- [ ] Marketing campaign

---

## 📊 KPIs de Sucesso

### Métricas de Engajamento
- **Objetivo:** +50% em Daily Active Users
- **Métrica:** Usuários analisando matches/dia
- **Target:** 1,000+ análises/dia (vs 200 atual)

### Métricas de Retenção
- **Objetivo:** +30% em 30-day retention
- **Métrica:** Usuários retornando após 30 dias
- **Target:** 60% retention (vs 40% atual)

### Métricas de Monetização
- **Objetivo:** $500/mês em MRR (Month Recurring Revenue)
- **Métrica:** Assinaturas Premium
- **Target:** 100 assinantes @ $5/mês

---

## 🚀 Próximos Passos IMEDIATOS

1. ✅ **Aprovar este documento**
2. ⏳ **Escolher features TIER 1** para implementar
3. ⏳ **Criar issues no GitHub** para tracking
4. ⏳ **Começar com IMP Score** (2-3 dias)
5. ⏳ **Deploy incremental** (feature flags)

---

**Documento criado por:** APOLO Development Team  
**Última atualização:** 5 de Dezembro de 2025  
**Status:** Aguardando aprovação para implementação
