/**
 * Google Gemini AI Service - Dota 2 Coaching
 * 
 * Purpose: Generate personalized gameplay advice using AI
 * Features:
 * - Locale-aware responses (EN/PT/ES)
 * - Redis caching (7-day TTL)
 * - Tactical, encouraging coaching style
 * - Item build analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import { redisService } from './RedisService.js';
import type { ParsedStratzMatch } from '../types/dota.js';
import type { Locale } from '../types/dota.js';
import { checkRateLimit } from '../utils/rateLimiter.js';
import logger from '../utils/logger.js';

// Check if API key is configured
const GEMINI_ENABLED = Boolean(
  config.api.gemini.apiKey && 
  config.api.gemini.apiKey !== 'your_gemini_api_key_here' &&
  config.api.gemini.apiKey.startsWith('AIza') // Valid Google API key format
);

if (!GEMINI_ENABLED) {
  logger.warn('⚠️ WARNING: GEMINI_API_KEY not configured! AI Coach will not work.');
  logger.warn('👉 Get your free key at: https://aistudio.google.com/app/apikey');
  logger.warn(`🔑 Current key: ${config.api.gemini.apiKey ? '***' + config.api.gemini.apiKey.slice(-8) : 'MISSING'}`);
} else {
  logger.info({ model: config.api.gemini.model }, 'Gemini AI Coach enabled');
  logger.info('📊 Free tier limits: 15 req/min, 1500 req/day, 1M tokens/month');
  logger.info('🔗 Monitor usage: https://ai.dev/usage?tab=rate-limit');
}

// Initialize Gemini AI
const genAI = GEMINI_ENABLED 
  ? new GoogleGenerativeAI(config.api.gemini.apiKey)
  : null;

const GEMINI_RATE_LIMITS = {
  perMatch: { prefix: 'rl:gemini:match', limit: 1, windowSeconds: 30 },
  global: { key: 'rl:gemini:global', limit: 15, windowSeconds: 60 },
} as const;

/**
 * Generic coaching tips by performance level (fallback when quota is exceeded)
 */
const FALLBACK_TIPS = {
  pt: {
    excellent: (hero: string, kda: number) => 
      `🎯 **Excelente performance com ${hero}!** (KDA: ${kda})\n\n` +
      `✨ **Pontos fortes identificados:**\n` +
      `• Mecânica sólida - você dominou as teamfights\n` +
      `• Posicionamento eficiente durante os confrontos\n` +
      `• Boa pressão no mapa\n\n` +
      `📈 **Próximo nível:**\n` +
      `1. Mantenha esse ritmo e foque em farm eficiente nos primeiros 10min\n` +
      `2. Comunique mais com o time para plays coordenadas\n` +
      `3. Estude timings de power spikes do ${hero} para dominar ainda mais`,
    
    good: (hero: string, kda: number) =>
      `👍 **Boa partida com ${hero}!** (KDA: ${kda})\n\n` +
      `✅ **Você jogou bem:**\n` +
      `• Participação efetiva nas lutas\n` +
      `• Decisões táticas razoáveis\n\n` +
      `📊 **Para melhorar:**\n` +
      `1. Trabalhe na eficiência de farm - mais GPM significa itens mais rápidos\n` +
      `2. Observe o minimap a cada 5 segundos para evitar ganks\n` +
      `3. Pratique combos do ${hero} para maximizar dano em teamfights`,
    
    struggling: (hero: string, kda: number) =>
      `💪 **Continue praticando ${hero}!** (KDA: ${kda})\n\n` +
      `🎯 **Foco principal:**\n` +
      `• Priorize sobrevivência - mortes custam muito ouro e tempo\n` +
      `• Farm seguro é melhor que farm arriscado\n\n` +
      `📚 **Dicas essenciais:**\n` +
      `1. Sempre carregue TP scroll - pode salvar sua vida\n` +
      `2. Assista replays de pros jogando ${hero} para aprender posicionamento\n` +
      `3. Compre itens defensivos quando necessário (BKB, Lotus, etc)\n` +
      `4. Jogue ao redor dos seus power spikes e evite lutas desvantajosas`
  },
  en: {
    excellent: (hero: string, kda: number) =>
      `🎯 **Excellent performance with ${hero}!** (KDA: ${kda})\n\n` +
      `✨ **Strengths identified:**\n` +
      `• Solid mechanics - you dominated teamfights\n` +
      `• Efficient positioning during clashes\n` +
      `• Good map pressure\n\n` +
      `📈 **Next level:**\n` +
      `1. Maintain this pace and focus on efficient farming in the first 10min\n` +
      `2. Communicate more with team for coordinated plays\n` +
      `3. Study ${hero}'s power spike timings to dominate even more`,
    
    good: (hero: string, kda: number) =>
      `👍 **Good match with ${hero}!** (KDA: ${kda})\n\n` +
      `✅ **You played well:**\n` +
      `• Effective fight participation\n` +
      `• Reasonable tactical decisions\n\n` +
      `📊 **To improve:**\n` +
      `1. Work on farming efficiency - more GPM means faster items\n` +
      `2. Check minimap every 5 seconds to avoid ganks\n` +
      `3. Practice ${hero} combos to maximize teamfight damage`,
    
    struggling: (hero: string, kda: number) =>
      `💪 **Keep practicing ${hero}!** (KDA: ${kda})\n\n` +
      `🎯 **Main focus:**\n` +
      `• Prioritize survival - deaths cost lots of gold and time\n` +
      `• Safe farm is better than risky farm\n\n` +
      `📚 **Essential tips:**\n` +
      `1. Always carry TP scroll - can save your life\n` +
      `2. Watch replays of pros playing ${hero} to learn positioning\n` +
      `3. Buy defensive items when needed (BKB, Lotus, etc)\n` +
      `4. Play around your power spikes and avoid disadvantageous fights`
  },
  es: {
    excellent: (hero: string, kda: number) =>
      `🎯 **¡Excelente rendimiento con ${hero}!** (KDA: ${kda})\n\n` +
      `✨ **Fortalezas identificadas:**\n` +
      `• Mecánicas sólidas - dominaste las peleas\n` +
      `• Posicionamiento eficiente durante los enfrentamientos\n` +
      `• Buena presión en el mapa\n\n` +
      `📈 **Siguiente nivel:**\n` +
      `1. Mantén este ritmo y enfócate en farmeo eficiente en los primeros 10min\n` +
      `2. Comunica más con el equipo para jugadas coordinadas\n` +
      `3. Estudia los timings de power spikes de ${hero} para dominar aún más`,
    
    good: (hero: string, kda: number) =>
      `👍 **¡Buena partida con ${hero}!** (KDA: ${kda})\n\n` +
      `✅ **Jugaste bien:**\n` +
      `• Participación efectiva en peleas\n` +
      `• Decisiones tácticas razonables\n\n` +
      `📊 **Para mejorar:**\n` +
      `1. Trabaja en eficiencia de farmeo - más GPM significa items más rápido\n` +
      `2. Mira el minimapa cada 5 segundos para evitar ganks\n` +
      `3. Practica combos de ${hero} para maximizar daño en teamfights`,
    
    struggling: (hero: string, kda: number) =>
      `💪 **¡Sigue practicando ${hero}!** (KDA: ${kda})\n\n` +
      `🎯 **Enfoque principal:**\n` +
      `• Prioriza supervivencia - las muertes cuestan mucho oro y tiempo\n` +
      `• Farmeo seguro es mejor que farmeo arriesgado\n\n` +
      `📚 **Consejos esenciales:**\n` +
      `1. Siempre lleva TP scroll - puede salvarte la vida\n` +
      `2. Mira replays de pros jugando ${hero} para aprender posicionamiento\n` +
      `3. Compra items defensivos cuando sea necesario (BKB, Lotus, etc)\n` +
      `4. Juega alrededor de tus power spikes y evita peleas desventajosas`
  }
};

/**
 * Cache TTL for AI coaching advice: 30 days (2592000 seconds)
 * Rationale: Match data never changes, advice remains relevant
 * Extended to maximize cache hits and minimize API calls
 */
const COACH_CACHE_TTL = 2592000; // 30 days

/**
 * Map locale codes to human-readable language names
 */
const LOCALE_TO_LANGUAGE: Record<Locale, string> = {
  'en': 'English',
  'pt': 'Portuguese (Brazil)',
  'es': 'Spanish',
};

/**
 * Map item IDs to readable names (subset of most common items)
 * Full list: https://github.com/odota/dotaconstants/blob/master/build/items.json
 */
const ITEM_NAMES: Record<number, string> = {
  1: 'Blink Dagger',
  2: 'Blades of Attack',
  3: 'Broadsword',
  4: 'Chainmail',
  5: 'Claymore',
  6: 'Helm of Iron Will',
  7: 'Javelin',
  8: 'Mithril Hammer',
  9: 'Platemail',
  10: 'Quarterstaff',
  11: 'Quelling Blade',
  13: 'Ring of Health',
  15: 'Gloves of Haste',
  16: 'Hand of Midas',
  17: 'Boots of Speed',
  29: 'Boots of Travel',
  36: 'Bottle',
  40: 'Drum of Endurance',
  41: 'Magic Stick',
  42: 'Magic Wand',
  43: 'Observer Ward',
  44: 'Sentry Ward',
  46: 'Town Portal Scroll',
  50: 'Bracer',
  51: 'Wraith Band',
  52: 'Null Talisman',
  63: 'Buckler',
  73: 'Ring of Basilius',
  75: 'Soul Ring',
  77: 'Ring of Aquila',
  79: 'Tranquil Boots',
  86: 'Urn of Shadows',
  88: 'Headdress',
  90: 'Vladmir\'s Offering',
  92: 'Mekansm',
  96: 'Arcane Boots',
  100: 'Spirit Vessel',
  102: 'Power Treads',
  108: 'Guardian Greaves',
  110: 'Aether Lens',
  112: 'Octarine Core',
  114: 'Solar Crest',
  116: 'Glimmer Cape',
  119: 'Lotus Orb',
  121: 'Aghanim\'s Scepter',
  123: 'Moon Shard',
  125: 'Silver Edge',
  127: 'Black King Bar',
  129: 'Blade Mail',
  131: 'Vanguard',
  133: 'Crimson Guard',
  135: 'Shiva\'s Guard',
  137: 'Heart of Tarrasque',
  139: 'Assault Cuirass',
  141: 'Heaven\'s Halberd',
  145: 'Force Staff',
  147: 'Eul\'s Scepter',
  149: 'Scythe of Vyse',
  151: 'Orchid Malevolence',
  152: 'Bloodthorn',
  154: 'Rod of Atos',
  156: 'Hurricane Pike',
  158: 'Dagon',
  160: 'Necronomicon',
  166: 'Refresher Orb',
  168: 'Linken\'s Sphere',
  170: 'Mjollnir',
  172: 'Maelstrom',
  174: 'Desolator',
  176: 'Yasha',
  178: 'Mask of Madness',
  180: 'Diffusal Blade',
  181: 'Manta Style',
  185: 'Ethereal Blade',
  187: 'Sange and Yasha',
  190: 'Divine Rapier',
  194: 'Monkey King Bar',
  196: 'Radiance',
  198: 'Butterfly',
  200: 'Daedalus',
  202: 'Skull Basher',
  204: 'Battle Fury',
  206: 'Morbid Mask',
  208: 'Vladimir\'s Offering',
  210: 'Satanic',
  212: 'Eye of Skadi',
  214: 'Sange',
  216: 'Kaya',
  218: 'Yasha and Kaya',
  220: 'Kaya and Sange',
  232: 'Abyssal Blade',
  235: 'Bloodstone',
  242: 'Aghanim\'s Shard',
  257: 'Arcane Blink',
  259: 'Swift Blink',
  261: 'Overwhelming Blink',
};

/**
 * Get item name from ID, or return 'Unknown Item' if not found
 */
function getItemName(itemId: number): string {
  return ITEM_NAMES[itemId] || `Item #${itemId}`;
}

/**
 * Format items array into readable string
 */
function formatItems(items: number[]): string {
  if (items.length === 0) {
    return 'No items recorded';
  }
  
  return items
    .map(id => getItemName(id))
    .join(', ');
}

/**
 * Calculate KDA ratio
 */
function calculateKDA(kills: number, deaths: number, assists: number): number {
  if (deaths === 0) {
    return kills + assists; // Perfect KDA
  }
  return parseFloat(((kills + assists) / deaths).toFixed(2));
}

/**
 * Determine performance level based on KDA
 */
function getPerformanceLevel(kda: number): string {
  if (kda >= 5) return 'excellent';
  if (kda >= 3) return 'good';
  if (kda >= 2) return 'decent';
  if (kda >= 1) return 'struggling';
  return 'difficult';
}

/**
 * Build system prompt for Gemini AI
 * Includes match context, locale instruction, and coaching guidelines
 */
function buildSystemPrompt(matchData: ParsedStratzMatch, locale: Locale): string {
  const language = LOCALE_TO_LANGUAGE[locale];
  const kda = calculateKDA(matchData.kills, matchData.deaths, matchData.assists);
  const performance = getPerformanceLevel(kda);
  const matchResult = matchData.result === 'WIN' ? 'won' : 'lost';
  const durationMinutes = Math.floor(matchData.duration / 60);
  const items = formatItems(matchData.items);
  
  return `You are a professional Dota 2 coach and analyst with years of experience.

**CRITICAL INSTRUCTION: You MUST respond ONLY in ${language}. Do NOT use any other language.**

**Match Context:**
- Player: Played ${matchData.heroName}
- Result: ${matchResult.toUpperCase()} the match
- KDA: ${matchData.kills}/${matchData.deaths}/${matchData.assists} (KDA Ratio: ${kda})
- Performance: ${performance}
- Duration: ${durationMinutes} minutes
- GPM: ${matchData.gpm} (Gold Per Minute)
- XPM: ${matchData.xpm} (Experience Per Minute)
- Net Worth: ${matchData.netWorth}
- Items: ${items}

**Your Task:**
Provide personalized coaching advice for this player. Your response should:

1. **Acknowledge their performance** (be encouraging if they won, supportive if they lost)
2. **Analyze their statistics** (GPM, XPM, KDA) and what they indicate
3. **Evaluate their item build** (were the items appropriate for ${matchData.heroName}?)
4. **Give 2-3 specific, actionable tips** to improve their gameplay

**Coaching Style:**
- Be tactical and specific (mention actual game mechanics, timings, strategies)
- Be encouraging and positive (focus on growth, not criticism)
- Keep it concise (maximum 3 paragraphs, around 150-200 words total)
- Use simple, clear language
- Reference the hero name naturally

**Example Structure (adapt to the actual match):**
- Paragraph 1: Acknowledge their performance and key stats
- Paragraph 2: Analyze their item choices and farm efficiency
- Paragraph 3: 2-3 specific tips for improvement

**REMEMBER: Write ONLY in ${language}. This is non-negotiable.**`;
}

function buildCooldownMessage(locale: Locale, waitSeconds: number): string {
  const seconds = Math.max(Math.ceil(waitSeconds), 1);

  if (locale === 'pt') {
    return `⏱️ **Aguarde ${seconds} segundos**

Para economizar a quota gratuita, existe um limite de solicitações.

💡 Dica: A análise fica salva em cache por 30 dias!`;
  }

  if (locale === 'es') {
    return `⏱️ **Espera ${seconds} segundos**

Para ahorrar la cuota gratuita, existe un límite de solicitudes.

💡 Consejo: ¡El análisis se guarda en caché por 30 días!`;
  }

  return `⏱️ **Wait ${seconds} seconds**

To preserve free quota, there is a request limit.

💡 Tip: Analysis is cached for 30 days!`;
}

/**
 * Generate coaching advice using Google Gemini AI
 * Includes Redis caching to avoid redundant API calls
 * 
 * @param matchData - Last match data from Stratz
 * @param locale - User's language preference (en/pt/es)
 * @returns AI-generated coaching advice in the specified language
 */
export async function generateCoachingAdvice(
  matchData: ParsedStratzMatch,
  locale: Locale
): Promise<string> {
  // Validate Gemini is enabled
  if (!GEMINI_ENABLED || !genAI) {
    return locale === 'pt' 
      ? '⚠️ O AI Coach não está configurado. Configure GEMINI_API_KEY no arquivo .env.'
      : locale === 'es'
      ? '⚠️ El AI Coach no está configurado. Configure GEMINI_API_KEY en el archivo .env.'
      : '⚠️ AI Coach is not configured. Please set GEMINI_API_KEY in your .env file.';
  }

  // Check cache first (advice doesn't change for same match)
  const cacheKey = `coach:${matchData.matchId}:${locale}`;
  const cached = await redisService.get<string>(cacheKey);
  
  if (cached) {
    logger.info({ matchId: matchData.matchId, locale }, 'Cache hit: coaching advice');
    return cached;
  }

  const perMatchKey = `${GEMINI_RATE_LIMITS.perMatch.prefix}:${matchData.matchId}`;
  const perMatchRate = await checkRateLimit({
    key: perMatchKey,
    limit: GEMINI_RATE_LIMITS.perMatch.limit,
    windowSeconds: GEMINI_RATE_LIMITS.perMatch.windowSeconds,
    context: 'geminiService.perMatch',
  });

  if (!perMatchRate.allowed) {
    return buildCooldownMessage(locale, perMatchRate.retryAfter);
  }

  const globalRate = await checkRateLimit({
    key: GEMINI_RATE_LIMITS.global.key,
    limit: GEMINI_RATE_LIMITS.global.limit,
    windowSeconds: GEMINI_RATE_LIMITS.global.windowSeconds,
    context: 'geminiService.global',
  });

  if (!globalRate.allowed) {
    return buildCooldownMessage(locale, globalRate.retryAfter);
  }

  // Generate new coaching advice
  logger.info({ matchId: matchData.matchId, locale }, 'Generating coaching advice');
  
  try {
    // Build the prompt
    const systemPrompt = buildSystemPrompt(matchData, locale);
    
    // Initialize model
    logger.info({ model: config.api.gemini.model }, 'Initializing Gemini model');
    const model = genAI.getGenerativeModel({ 
      model: config.api.gemini.model,
      generationConfig: {
        temperature: config.api.gemini.temperature,
        maxOutputTokens: config.api.gemini.maxTokens,
      },
    });
    
    // Generate content
    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const advice = response.text();
    
    if (!advice || advice.trim().length === 0) {
      throw new Error('Gemini returned empty response');
    }
    
    // Cache the advice (7 days)
    await redisService.set(cacheKey, advice, COACH_CACHE_TTL);
    
    logger.info({ matchId: matchData.matchId }, 'Coaching advice generated and cached');
    
    return advice;
    
  } catch (error) {
    logger.error({ error, matchId: matchData.matchId, locale }, 'Gemini API error');
    
    const errorMessage = (error as Error).message || String(error);
    
    // Check for quota exceeded - use fallback tips
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
      console.log('⚠️ Quota exceeded, using fallback coaching tips');
      
      // Calculate KDA and performance level
      const kda = calculateKDA(matchData.kills, matchData.deaths, matchData.assists);
      const performance = getPerformanceLevel(kda);
      
      // Get appropriate fallback tip
      const tips = FALLBACK_TIPS[locale] || FALLBACK_TIPS['en'];
      let fallbackAdvice = '';
      
      if (kda >= 3) {
        fallbackAdvice = tips.excellent(matchData.heroName, kda);
      } else if (kda >= 1.5) {
        fallbackAdvice = tips.good(matchData.heroName, kda);
      } else {
        fallbackAdvice = tips.struggling(matchData.heroName, kda);
      }
      
      // Add quota info
      const quotaInfo = locale === 'pt'
        ? '\n\n💡 **Dica:** Esta é uma análise rápida. Para análise completa com IA, aguarde reset da quota ou gere nova chave em: https://aistudio.google.com/app/apikey'
        : locale === 'es'
        ? '\n\n💡 **Consejo:** Este es un análisis rápido. Para análisis completo con IA, espera el reset de cuota o genera nueva clave en: https://aistudio.google.com/app/apikey'
        : '\n\n💡 **Tip:** This is a quick analysis. For full AI analysis, wait for quota reset or generate new key at: https://aistudio.google.com/app/apikey';
      
      // Cache fallback advice (shorter TTL - 1 day)
      await redisService.set(cacheKey, fallbackAdvice + quotaInfo, 86400);
      
      return fallbackAdvice + quotaInfo;
    }
    
    // Generic fallback error message in user's language
    if (locale === 'pt') {
      return '❌ Desculpe, não consegui gerar conselhos no momento. Tente novamente em alguns minutos.\n\n' +
             `🔍 Erro: ${errorMessage.substring(0, 100)}`;
    } else if (locale === 'es') {
      return '❌ Lo siento, no pude generar consejos en este momento. Inténtalo de nuevo en unos minutos.\n\n' +
             `🔍 Error: ${errorMessage.substring(0, 100)}`;
    } else {
      return '❌ Sorry, I couldn\'t generate advice at this time. Please try again in a few minutes.\n\n' +
             `🔍 Error: ${errorMessage.substring(0, 100)}`;
    }
  }
}

/**
 * Invalidate coaching cache for a specific match
 * Useful if advice needs to be regenerated
 * 
 * @param matchId - Match ID to invalidate
 */
export async function invalidateCoachingCache(matchId: string): Promise<void> {
  await redisService.delPattern(`coach:${matchId}:*`);
  console.log(`🗑️ Coaching cache invalidated for match ${matchId}`);
}

// Default export
export default {
  generateCoachingAdvice,
  invalidateCoachingCache,
};
