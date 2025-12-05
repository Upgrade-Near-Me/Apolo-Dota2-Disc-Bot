/**
 * Mock Google Gemini AI Responses
 * Used for AI coaching and analysis features
 */

// ✅ Happy Path: Coaching Advice (English)
export const mockGeminiCoachingAdviceEN = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `## Your Dota 2 Performance Analysis

### Strengths 💪
1. **Excellent Map Awareness** - Your positioning in team fights shows you understand when and where to contribute
2. **Strong Farming Efficiency** - Your 542 GPM is above average for your role, indicating good farming patterns
3. **Low Death Count** - Only 3 deaths across 45 matches shows excellent survival instincts

### Areas for Improvement 📈
1. **Early Game Impact** - Your kills per minute could be higher in the first 15 minutes
2. **Objective Control** - Focus more on securing Roshan timing windows
3. **Item Timing** - Consider rushing core items faster in certain matchups

### Actionable Tips 🎯
1. **Farm More Efficiently** - Aim for 600+ GPM by focusing on camp rotation
2. **Team Fight Timing** - Group up for objectives at 20, 40, and 60 minute marks
3. **Adapt Your Itemization** - Recognize enemy team composition and adjust items accordingly
4. **Watch Pro Replays** - Study how pros play your hero in similar situations
5. **Practice Last-Hitting** - Dedicate 10 minutes daily to hone your cs skills

Keep grinding! You're on the right track. 🚀`,
          },
        ],
      },
    },
  ],
};

// ✅ Happy Path: Coaching Advice (Portuguese)
export const mockGeminiCoachingAdvicePT = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `## Sua Análise de Performance no Dota 2

### Pontos Fortes 💪
1. **Excelente Map Awareness** - Sua posição nos team fights mostra que você entende quando e onde contribuir
2. **Alta Eficiência de Farm** - Seu 542 GPM está acima da média para sua posição
3. **Baixa Taxa de Mortes** - Apenas 3 mortes em 45 partidas mostra instintos excelentes de sobrevivência

### Áreas para Melhorar 📈
1. **Impacto no Early Game** - Suas mortes por minuto poderiam ser maiores nos primeiros 15 minutos
2. **Controle de Objetivos** - Foque mais em windows de Roshan
3. **Timing de Itens** - Considere apressar itens core em certos matchups

### Dicas Acionáveis 🎯
1. **Farm Mais Eficientemente** - Aponte para 600+ GPM focando em rotação de camps
2. **Timing de Team Fight** - Agrupe-se para objetivos aos 20, 40 e 60 minutos
3. **Adapte Sua Itemização** - Reconheça a composição inimiga e ajuste itens
4. **Assista Replays de Pros** - Estude como os profissionais jogam seu herói
5. **Pratique Last-Hitting** - Dedique 10 minutos diários para afinar suas habilidades de cs

Continua o bom trabalho! 🚀`,
          },
        ],
      },
    },
  ],
};

// ✅ Happy Path: Quick Tip
export const mockGeminiQuickTip = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `⚡ **Quick Tip:** Your Death Prophet has a 45% win rate across 12 games. Try focusing on early teamfights and maximizing your ult damage by positioning behind your team.`,
          },
        ],
      },
    },
  ],
};

// ✅ Happy Path: Performance Analysis
export const mockGeminiPerformanceAnalysis = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `📊 **Performance Summary:**
- Overall KDA: 8.3 (Good)
- Farm Efficiency: Above Average (542 GPM)
- Team Fight Participation: 78% (Excellent)
- Win Rate: 52% (Above Average)

Your recent 3-game win streak shows improvement in decision-making!`,
          },
        ],
      },
    },
  ],
};

// ✅ Happy Path: Trend Analysis
export const mockGeminiTrendAnalysis = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `📈 **Your Trends:**
- GPM Trend: ↑ Improving (+15 GPM in last 10 games)
- XPM Trend: → Stable (610 average)
- Win Rate Trend: ↑ Rising (55% in last 5 games)
- Deaths Trend: ↓ Decreasing (Better positioning)

You're on an upward trajectory! Keep maintaining this form.`,
          },
        ],
      },
    },
  ],
};

// ✅ Happy Path: Weakness Analysis
export const mockGeminiWeaknessAnalysis = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `⚠️ **Your Weaknesses:**
1. **Early Game Farming** - 15% of your games end in <15 minutes with low farm
2. **Support Synergy** - Your support heroes have 48% win rate with you (below average)
3. **High Ground Farming** - You tend to farm too much in late game instead of team fighting
4. **Mana Management** - Several games show mana issues in mid game

Recommendation: Focus on grouping with team earlier and warding more aggressively.`,
          },
        ],
      },
    },
  ],
};

// ✅ Happy Path: Strength Analysis
export const mockGeminiStrengthAnalysis = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `✅ **Your Strengths:**
1. **Positioning** - Your team fight positioning is 75th percentile (excellent)
2. **Farming** - Your GPM efficiency is in top 20% for your bracket
3. **Game Sense** - You rarely get caught out of position
4. **Itemization** - You adapt items well to enemy team composition

These strengths are what's carrying your games!`,
          },
        ],
      },
    },
  ],
};

// ✅ Happy Path: Hero Pool Analysis
export const mockGeminiHeroPoolAnalysis = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `🦸 **Your Hero Pool Analysis:**
- Best Hero: Anti-Mage (58% win rate, 15 games)
- Most Played: Death Prophet (25 games, 45% wr)
- Comfort Hero: Phantom Lancer (52% wr, 18 games)

Recommendation: Focus on your top 3 heroes to climb faster!`,
          },
        ],
      },
    },
  ],
};

// ✅ Happy Path: Comparison to Bracket
export const mockGeminiComparisonAnalysis = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `⚖️ **Comparison to Your Bracket (Divine):**
- Your GPM: 542 vs Bracket Avg: 520 (+4.2% above average)
- Your XPM: 612 vs Bracket Avg: 600 (+2% above average)
- Your KDA: 8.3 vs Bracket Avg: 7.5 (+10.7% above average)
- Your Win Rate: 52% vs Bracket Avg: 50% (+2% above average)

You're performing above average in almost all metrics!`,
          },
        ],
      },
    },
  ],
};

// ❌ Error: Rate Limit
export const mockGeminiRateLimit = {
  error: {
    code: 429,
    message: 'Resource has been exhausted (e.g. check quota).',
    status: 'RESOURCE_EXHAUSTED',
  },
};

// ❌ Error: Invalid API Key
export const mockGeminiInvalidKey = {
  error: {
    code: 401,
    message: 'Invalid API key.',
    status: 'UNAUTHENTICATED',
  },
};

// ❌ Error: Server Error
export const mockGeminiServerError = {
  error: {
    code: 500,
    message: 'Internal Server Error',
    status: 'INTERNAL',
  },
};

// ❌ Error: Invalid Input
export const mockGeminiInvalidInput = {
  error: {
    code: 400,
    message: 'Invalid request body',
    status: 'INVALID_ARGUMENT',
  },
};

// 🧪 Edge Case: Empty profile (new player)
export const mockGeminiNewPlayerAnalysis = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `👶 **New Player Analysis:**
You're just getting started! Here are tips for your first 100 games:
1. Focus on learning 1-2 heroes deeply
2. Understand your hero's timings and power spikes
3. Practice last-hitting in demo mode
4. Watch beginner guides for your role
5. Play with friends to learn faster

Good luck on your Dota 2 journey!`,
          },
        ],
      },
    },
  ],
};

// 🧪 Edge Case: Extremely high MMR analysis
export const mockGeminiProAnalysis = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: `🏆 **Pro-Level Analysis:**
You're competing at the highest level! Consider:
1. Streaming your games for coaching
2. Joining competitive teams
3. Studying meta shifts more carefully
4. Analyzing opponent drafts in advance
5. Working with a coach on decision-making

You have pro-level mechanics!`,
          },
        ],
      },
    },
  ],
};

/**
 * Gemini API Response Format Template
 */

export const geminiResponseTemplate = {
  candidates: [
    {
      content: {
        role: 'model',
        parts: [
          {
            text: 'Your response text here',
          },
        ],
      },
      finishReason: 'STOP',
      index: 0,
      safetyRatings: [
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          probability: 'NEGLIGIBLE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          probability: 'NEGLIGIBLE',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          probability: 'NEGLIGIBLE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          probability: 'NEGLIGIBLE',
        },
      ],
    },
  ],
  usageMetadata: {
    promptTokenCount: 200,
    candidatesTokenCount: 150,
    totalTokenCount: 350,
  },
};

export default {
  mockGeminiCoachingAdviceEN,
  mockGeminiCoachingAdvicePT,
  mockGeminiQuickTip,
  mockGeminiPerformanceAnalysis,
  mockGeminiTrendAnalysis,
  mockGeminiWeaknessAnalysis,
  mockGeminiStrengthAnalysis,
  mockGeminiHeroPoolAnalysis,
  mockGeminiComparisonAnalysis,
  mockGeminiRateLimit,
  mockGeminiInvalidKey,
  mockGeminiServerError,
  mockGeminiInvalidInput,
  mockGeminiNewPlayerAnalysis,
  mockGeminiProAnalysis,
};
