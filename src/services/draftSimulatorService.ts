/**
 * Draft Simulator Service - Hero Matchup Analysis & Draft Recommendations
 * 
 * Provides:
 * - Hero counter-pick analysis
 * - Team synergy calculations
 * - Draft recommendations
 * - Matchup win rate predictions
 */

/**
 * Hero attributes and counters
 * Based on Dota 2 role-based analysis
 */
const HERO_DATABASE: Record<
  string,
  {
    roles: string[];
    strengths: string[];
    weaknesses: string[];
    counters: string[];
    countered_by: string[];
  }
> = {
  'Anti-Mage': {
    roles: ['Carry'],
    strengths: ['Phantom-Assassin', 'Ember-Spirit', 'Spectre'],
    weaknesses: ['Earthshaker', 'Slardar', 'Monkey-King'],
    counters: ['Mana-Burn', 'Disables', 'Early-Game-Pressure'],
    countered_by: ['Lion', 'Earthshaker', 'Leshrac'],
  },
  'Invoker': {
    roles: ['Mid', 'Support'],
    strengths: ['Supports', 'Mages', 'Heroes-Without-Escape'],
    weaknesses: ['Melee-Carries', 'Gankers', 'Silence-Heroes'],
    counters: ['Silences', 'Ganks', 'Burst-Damage'],
    countered_by: ['Spirit-Breaker', 'Bounty-Hunter', 'Night-Stalker'],
  },
  'Earthshaker': {
    roles: ['Support'],
    strengths: ['Clustered-Enemies', 'Low-Mobility-Teams', 'Farm-Dependent'],
    weaknesses: ['Spread-Out-Teams', 'Mobile-Heroes', 'Silences'],
    counters: ['Initiation', 'Disable', 'Area-Control'],
    countered_by: ['Puck', 'Storm-Spirit', 'Faceless-Void'],
  },
  'Phantom-Assassin': {
    roles: ['Carry'],
    strengths: ['Mobile-Carries', 'Supports', 'High-Evasion-Stacking'],
    weaknesses: ['Disables', 'Vision', 'True-Sight'],
    counters: ['True-Strike', 'Detection', 'Disables'],
    countered_by: ['Brewmaster', 'Slardar', 'Bounty-Hunter'],
  },
  'Pudge': {
    roles: ['Support', 'Offlane'],
    strengths: ['Isolated-Targets', 'Supports', 'Positioning-Dependent'],
    weaknesses: ['Positioning', 'Team-Fights', 'Kiting'],
    counters: ['Hooks', 'Positioning-Weakness', 'Ganks'],
    countered_by: ['Windrunner', 'Phantom-Assassin', 'Slark'],
  },
  'Drow-Ranger': {
    roles: ['Carry'],
    strengths: ['Physical-Damage-Stacking', 'Range-Advantage', 'Positioning'],
    weaknesses: ['Melee-Gap-Closers', 'Silences', 'Disables'],
    counters: ['Gap-Close', 'Initiation', 'Silence'],
    countered_by: ['Bloodseeker', 'Storm-Spirit', 'Lifestealer'],
  },
};

/**
 * Role definitions and typical heroes per role
 */
const ROLE_HERO_POOLS: Record<string, string[]> = {
  'Carry': [
    'Anti-Mage',
    'Phantom-Assassin',
    'Drow-Ranger',
    'Spectre',
    'Void-Spirit',
    'Luna',
    'Juggernaut',
  ],
  'Mid': [
    'Invoker',
    'Puck',
    'Storm-Spirit',
    'Leshrac',
    'Tinker',
    'Outworld-Destroyer',
    'Templar-Assassin',
  ],
  'Offlane': [
    'Dark-Seer',
    'Underlord',
    'Earthshaker',
    'Bristleback',
    'Omniknight',
    'Centaur-Warrunner',
    'Legion-Commander',
  ],
  'Soft-Support': [
    'Windranger',
    'Morphling',
    'Tidehunter',
    'Enchantress',
    'Crystal-Maiden',
    'Lion',
    'Lina',
  ],
  'Hard-Support': [
    'Pudge',
    'Earthshaker',
    'Bane',
    'Shadow-Shaman',
    'Lich',
    'Rubick',
    'Ancient-Apparition',
  ],
};

export interface HeroMatchup {
  hero: string;
  vsHero: string;
  winRate: number; // 0-100 percentage
  matchups: number; // number of matches
  advantage: 'Strong' | 'Favorable' | 'Even' | 'Unfavorable' | 'Counter';
}

export interface DraftRecommendation {
  hero: string;
  role: string;
  reasoning: string;
  synergy_score: number; // 0-100
  counter_coverage: string[]; // enemies this covers
}

export interface TeamComposition {
  picks: Array<{ hero: string; role: string }>;
  roles: string[];
  synergy_score: number; // 0-100
  coverage: string[]; // which enemy heroes this counters
  weaknesses: string[]; // vulnerable to these playstyles
  recommendations: DraftRecommendation[];
}

/**
 * Calculate matchup advantage between two heroes
 * Returns a score from 0 (bad matchup) to 100 (great matchup)
 */
export function calculateMatchupScore(
  pickedHero: string,
  enemyHero: string,
  pastMatchups: HeroMatchup[] = []
): number {
  // Check historical matchup data first
  const historicalData = pastMatchups.find(
    (m) =>
      m.hero === pickedHero &&
      m.vsHero === enemyHero
  );

  if (historicalData) {
    // Scale to 0-100
    return Math.max(0, Math.min(100, historicalData.winRate));
  }

  // Fallback to hero database analysis
  const picked = HERO_DATABASE[pickedHero];
  const enemy = HERO_DATABASE[enemyHero];

  if (!picked || !enemy) {
    return 50; // Neutral if data not found
  }

  let score = 50; // Start at neutral

  // Check if enemy hero is in our counters list
  if (picked.counters && picked.counters.some((c) => enemy.roles.includes(c))) {
    score += 15;
  }

  // Check if we counter this hero
  if (picked.countered_by && picked.countered_by.includes(enemyHero)) {
    score -= 20;
  }

  // Check role advantages
  if (picked.strengths && enemy.roles.some((r) => picked.strengths.includes(r))) {
    score += 10;
  }

  if (picked.weaknesses && enemy.roles.some((r) => picked.weaknesses.includes(r))) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Analyze team composition synergy
 * Returns synergy score (0-100) and identifies weaknesses
 */
export function analyzeTeamSynergy(
  teamPicks: Array<{ hero: string; role: string }>,
  enemyTeam: string[] = []
): {
  synergy_score: number;
  weaknesses: string[];
  strengths: string[];
} {
  let synergyScore = 50; // Base score
  const weaknesses: string[] = [];
  const strengths: string[] = [];

  // Check role balance (optimal: 1 carry, 1 mid, 1 offlane, 2 supports)
  const roles = teamPicks.map((p) => p.role);
  const roleCount = roles.reduce(
    (acc, role) => {
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Reward balanced team composition
  if (roleCount['Carry'] === 1) synergyScore += 5;
  else if (roleCount['Carry'] === 0) weaknesses.push('No-Carry');
  else weaknesses.push('Multiple-Carries');

  if (roleCount['Mid'] === 1) synergyScore += 5;
  else if (roleCount['Mid'] === 0) weaknesses.push('No-Mid');

  // Check against enemy team
  if (enemyTeam.length > 0) {
    const avgCounterCoverage = teamPicks.reduce((sum, pick) => {
      const avgMatchup =
        enemyTeam.reduce((pickSum, enemy) => {
          return pickSum + calculateMatchupScore(pick.hero, enemy);
        }, 0) / enemyTeam.length;
      return sum + avgMatchup;
    }, 0) / teamPicks.length;

    // Scale matchup performance to synergy bonus
    synergyScore += (avgCounterCoverage - 50) * 0.3; // -15 to +15 bonus
  }

  return {
    synergy_score: Math.max(0, Math.min(100, synergyScore)),
    weaknesses,
    strengths,
  };
}

/**
 * Generate hero recommendations for a given role and team context
 */
export function recommendHeroesForRole(
  role: string,
  existingPicks: string[] = [],
  enemyTeam: string[] = []
): DraftRecommendation[] {
  const heroPool = ROLE_HERO_POOLS[role] || [];
  const available = heroPool.filter((h) => !existingPicks.includes(h));

  const recommendations = available.map((hero) => {
    // Calculate synergy with existing team
    const synergy = existingPicks.length > 0
      ? existingPicks.reduce((sum, pick) => {
          return sum + calculateMatchupScore(hero, pick, []) * 0.5; // Self-synergy lower weight
        }, 0) / (existingPicks.length || 1)
      : 50;

    // Calculate counter coverage
    const counterCoverage = enemyTeam.length > 0
      ? enemyTeam.filter((enemy) => calculateMatchupScore(hero, enemy) > 55)
      : [];

    const heroDb = HERO_DATABASE[hero];
    const reasoning = heroDb
      ? `${hero} excels against ${heroDb.strengths?.slice(0, 2).join(', ')}`
      : `${hero} is a strong pick for ${role}`;

    return {
      hero,
      role,
      reasoning,
      synergy_score: Math.min(100, synergy),
      counter_coverage: counterCoverage,
    };
  });

  // Sort by synergy score descending
  return recommendations.sort((a, b) => b.synergy_score - a.synergy_score).slice(0, 5);
}

/**
 * Find counter-picks for enemy heroes
 */
export function findCounterPicks(
  enemyHero: string,
  existingPicks: string[] = []
): string[] {
  const heroDb = HERO_DATABASE[enemyHero];
  if (!heroDb) return [];

  // Get heroes that counter this enemy
  const counters = heroDb.countered_by || [];
  const available = counters.filter((h) => !existingPicks.includes(h));

  return available.slice(0, 5);
}

/**
 * Analyze draft progression and suggest next picks
 */
export function analyzeDraft(
  yourTeam: Array<{ hero: string; role: string }>,
  enemyTeam: string[],
  nextRole: string
): {
  recommendations: DraftRecommendation[];
  critical_counters: string[];
  synergy_implications: string[];
} {
  const yourHeroes = yourTeam.map((p) => p.hero);

  // Get base recommendations for role
  const roleRecommendations = recommendHeroesForRole(nextRole, yourHeroes, enemyTeam);

  // Find critical counter-picks needed
  const criticalCounters = enemyTeam
    .flatMap((enemy) => findCounterPicks(enemy, yourHeroes))
    .filter((hero, index, self) => self.indexOf(hero) === index)
    .slice(0, 3);

  // Analyze synergy implications
  const synergyAnalysis = analyzeTeamSynergy(yourTeam, enemyTeam);
  const synergyImplications = [];

  if (synergyAnalysis.weaknesses.length > 0) {
    synergyImplications.push(`Weaknesses: ${synergyAnalysis.weaknesses.join(', ')}`);
  }

  if (synergyAnalysis.synergy_score < 40) {
    synergyImplications.push('⚠️ Team synergy is low - consider complementary picks');
  }

  return {
    recommendations: roleRecommendations,
    critical_counters: criticalCounters,
    synergy_implications: synergyImplications,
  };
}

/**
 * Calculate overall team power level
 * Considers: synergy, counter-coverage, role distribution, matchups
 */
export function calculateTeamPowerLevel(
  team: Array<{ hero: string; role: string }>,
  enemyTeam: string[] = []
): {
  power_level: number; // 0-100
  matchup_rating: string; // "Strong Advantage" to "Major Disadvantage"
  key_battles: Array<{ your_hero: string; enemy_hero: string; rating: string }>;
} {
  const { synergy_score } = analyzeTeamSynergy(team, enemyTeam);

  let powerLevel = synergy_score;

  // Calculate matchup-based adjustments
  const matchups = team.flatMap((pick) =>
    enemyTeam.map((enemy) => ({
      your_hero: pick.hero,
      enemy_hero: enemy,
      matchupScore: calculateMatchupScore(pick.hero, enemy),
    }))
  );

  if (matchups.length > 0) {
    const avgMatchupScore =
      matchups.reduce((sum, m) => sum + m.matchupScore, 0) / matchups.length;
    powerLevel = powerLevel * 0.6 + avgMatchupScore * 0.4; // 60% synergy, 40% matchups
  }

  // Determine rating
  let matchupRating = 'Even';
  if (powerLevel > 65) matchupRating = 'Strong Advantage';
  else if (powerLevel > 55) matchupRating = 'Slight Advantage';
  else if (powerLevel < 35) matchupRating = 'Major Disadvantage';
  else if (powerLevel < 45) matchupRating = 'Slight Disadvantage';

  // Get key 1v1 battles
  const keyBattles = matchups
    .sort((a, b) => Math.abs(b.matchupScore - 50) - Math.abs(a.matchupScore - 50))
    .slice(0, 5)
    .map((m) => ({
      your_hero: m.your_hero,
      enemy_hero: m.enemy_hero,
      rating:
        m.matchupScore > 60
          ? 'Favorable'
          : m.matchupScore > 45
            ? 'Even'
            : 'Unfavorable',
    }));

  return {
    power_level: Math.max(0, Math.min(100, powerLevel)),
    matchup_rating: matchupRating,
    key_battles: keyBattles,
  };
}

/**
 * Get all available heroes (from database)
 */
export function getAvailableHeroes(): string[] {
  return Object.keys(HERO_DATABASE);
}

/**
 * Get hero detailed information
 */
export function getHeroInfo(heroName: string) {
  return HERO_DATABASE[heroName] || null;
}

export default {
  calculateMatchupScore,
  analyzeTeamSynergy,
  recommendHeroesForRole,
  findCounterPicks,
  analyzeDraft,
  calculateTeamPowerLevel,
  getAvailableHeroes,
  getHeroInfo,
};
