/**
 * Skill Build Optimizer Service - Dynamic ability progression
 * 
 * Provides:
 * - Optimal skill build paths based on situation
 * - Early/Mid/Late game progression
 * - Role-specific ability priorities
 * - Counter-matchup adjustments
 */

export interface SkillBuild {
  hero: string;
  role: string;
  situation: 'early_game' | 'mid_game' | 'late_game' | 'counter';
  sequence: Array<{
    level: number;
    ability: string;
    notes: string;
  }>;
  reasoning: string;
  power_spikes: Array<{
    level: number;
    spike: string;
  }>;
}

/**
 * Skill build database by hero and situation
 */
const SKILL_BUILDS: Record<string, Record<string, SkillBuild>> = {
  'Invoker': {
    'mid_standard': {
      hero: 'Invoker',
      role: 'Mid',
      situation: 'mid_game',
      sequence: [
        { level: 1, ability: 'Exort', notes: 'Damage for last hitting' },
        { level: 2, ability: 'Wex', notes: 'Attack speed early' },
        { level: 3, ability: 'Exort', notes: 'Max damage combo' },
        { level: 4, ability: 'Quas', notes: 'Survivability' },
        { level: 5, ability: 'Exort', notes: 'Maximize EQ damage' },
        { level: 6, ability: 'Invoke', notes: 'Get Sunstrike' },
        { level: 7, ability: 'Wex', notes: 'Movement speed + attack' },
        { level: 8, ability: 'Exort', notes: 'Max damage' },
        { level: 9, ability: 'Wex', notes: 'Max attack speed' },
        { level: 10, ability: '+200 HP', notes: 'Survivability bonus' },
      ],
      reasoning: 'Prioritize Exort for early game harassment and farming. Get Invoke at 6 for Sunstrike combos.',
      power_spikes: [
        { level: 3, spike: 'EQ combo ready for ganks' },
        { level: 6, spike: 'Sunstrike available - roaming potential' },
        { level: 9, spike: 'Multiple invokes available' },
      ],
    },
    'support_counter': {
      hero: 'Invoker',
      role: 'Support',
      situation: 'counter',
      sequence: [
        { level: 1, ability: 'Quas', notes: 'Survivability in aggressive lane' },
        { level: 2, ability: 'Wex', notes: 'Movement to escape' },
        { level: 3, ability: 'Quas', notes: 'Cold Snap setup' },
        { level: 4, ability: 'Exort', notes: 'Tornado for utility' },
        { level: 5, ability: 'Quas', notes: 'Max Cold Snap' },
        { level: 6, ability: 'Invoke', notes: 'Get Cold Snap + Tornado' },
        { level: 7, ability: 'Wex', notes: 'Movement control' },
        { level: 8, ability: 'Quas', notes: 'Emp damage' },
        { level: 9, ability: 'Wex', notes: 'EMP spam ready' },
        { level: 10, ability: '+30 Attack Speed', notes: 'Trading in lane' },
      ],
      reasoning: 'Build defensively with Quas for Cold Snap harass. Focus on disables and utility.',
      power_spikes: [
        { level: 3, spike: 'Cold Snap combo for trading' },
        { level: 6, spike: 'Full control rotation available' },
        { level: 9, spike: 'EMP spam for mana denial' },
      ],
    },
  },
  'Phantom-Assassin': {
    'carry_standard': {
      hero: 'Phantom-Assassin',
      role: 'Carry',
      situation: 'early_game',
      sequence: [
        { level: 1, ability: 'Stifling Dagger', notes: 'Ranged harass' },
        { level: 2, ability: 'Phantom Strike', notes: 'Escape + chase' },
        { level: 3, ability: 'Stifling Dagger', notes: 'Max harass' },
        { level: 4, ability: 'Blur', notes: 'Survivability' },
        { level: 5, ability: 'Stifling Dagger', notes: 'Max damage' },
        { level: 6, ability: 'Coup de Grace', notes: 'Crit potential' },
        { level: 7, ability: 'Blur', notes: 'Evasion' },
        { level: 8, ability: 'Phantom Strike', notes: 'Mobility' },
        { level: 9, ability: 'Stifling Dagger', notes: 'Max everything' },
        { level: 10, ability: '+10 Armor', notes: 'Early tankiness' },
      ],
      reasoning: 'Max Dagger for consistent farming and harass. Build Blur for survivability vs aggression.',
      power_spikes: [
        { level: 6, spike: 'Crit chance - first kill potential' },
        { level: 8, spike: 'High mobility for roaming' },
        { level: 11, spike: 'Coup de Grace upgrade increases kill potential' },
      ],
    },
    'carry_defensive': {
      hero: 'Phantom-Assassin',
      role: 'Carry',
      situation: 'counter',
      sequence: [
        { level: 1, ability: 'Blur', notes: 'Evasion vs aggression' },
        { level: 2, ability: 'Phantom Strike', notes: 'Escape tool' },
        { level: 3, ability: 'Blur', notes: 'Max evasion early' },
        { level: 4, ability: 'Stifling Dagger', notes: 'Farming tool' },
        { level: 5, ability: 'Blur', notes: 'Max evasion' },
        { level: 6, ability: 'Coup de Grace', notes: 'Crit potential' },
        { level: 7, ability: 'Phantom Strike', notes: 'Repositioning' },
        { level: 8, ability: 'Stifling Dagger', notes: 'Farm acceleration' },
        { level: 9, ability: 'Blur', notes: 'Keep evasion maxed' },
        { level: 10, ability: '+15% Evasion', notes: 'Additional survivability' },
      ],
      reasoning: 'Priority is survival with maxed Blur early. Escape with Strike when needed.',
      power_spikes: [
        { level: 3, spike: '50% evasion - very hard to kill' },
        { level: 6, spike: 'Crit potential increases' },
        { level: 9, spike: 'High evasion + mobility combo' },
      ],
    },
  },
  'Earthshaker': {
    'support_standard': {
      hero: 'Earthshaker',
      role: 'Support',
      situation: 'early_game',
      sequence: [
        { level: 1, ability: 'Fissure', notes: 'Disable for kills' },
        { level: 2, ability: 'Totem', notes: 'Damage' },
        { level: 3, ability: 'Fissure', notes: 'Max disable' },
        { level: 4, ability: 'Aftershock', notes: 'AoE stun setup' },
        { level: 5, ability: 'Fissure', notes: 'Max stun duration' },
        { level: 6, ability: 'Echo Slam', notes: 'Initiate teamfights' },
        { level: 7, ability: 'Totem', notes: 'Damage output' },
        { level: 8, ability: 'Aftershock', notes: 'Teamfight impact' },
        { level: 9, ability: 'Totem', notes: 'Max damage' },
        { level: 10, ability: '+20 Movement Speed', notes: 'Positioning' },
      ],
      reasoning: 'Max Fissure for ganking potential. Echo Slam enables aggressive teamfighting.',
      power_spikes: [
        { level: 2, spike: 'First kill potential with Fissure stun' },
        { level: 6, spike: 'Echo Slam - AoE stun for teamfights' },
        { level: 8, spike: 'Both stuns high level - strong engages' },
      ],
    },
  },
};

/**
 * Get optimal skill build for hero + situation
 */
export function getSkillBuild(
  heroName: string,
  role: string,
  situation: 'early_game' | 'mid_game' | 'late_game' | 'counter' = 'mid_game'
): SkillBuild | null {
  const heroBuilds = SKILL_BUILDS[heroName];
  if (!heroBuilds) return null;

  // Try to find exact match
  const buildKey = Object.keys(heroBuilds).find(key =>
    key.toLowerCase().includes(role.toLowerCase()) &&
    (situation === 'mid_game' || key.toLowerCase().includes(situation))
  );

  if (buildKey) {
    return heroBuilds[buildKey];
  }

  // Fallback to first available build
  return Object.values(heroBuilds)[0] || null;
}

/**
 * Get all available skill builds for a hero
 */
export function getAvailableBuilds(heroName: string): string[] {
  const heroBuilds = SKILL_BUILDS[heroName];
  if (!heroBuilds) return [];
  return Object.keys(heroBuilds);
}

/**
 * Get hero list with available skill builds
 */
export function getHeroesWithSkillBuilds(): string[] {
  return Object.keys(SKILL_BUILDS);
}

/**
 * Get skill progression for leveling
 */
export function getSkillProgression(heroName: string, role: string) {
  const build = getSkillBuild(heroName, role);
  if (!build) return null;

  return {
    hero: heroName,
    role,
    progression: build.sequence.map(s => s.ability),
    sequence: build.sequence,
    power_spikes: build.power_spikes,
    reasoning: build.reasoning,
  };
}

/**
 * Compare two skill builds
 */
export function compareBuilds(
  heroName: string,
  build1Role: string,
  build2Role: string
) {
  const build1 = getSkillBuild(heroName, build1Role);
  const build2 = getSkillBuild(heroName, build2Role);

  if (!build1 || !build2) return null;

  return {
    build1,
    build2,
    differences: {
      early_priority: `${build1.sequence[0].ability} vs ${build2.sequence[0].ability}`,
      reasoning: {
        build1: build1.reasoning,
        build2: build2.reasoning,
      },
    },
  };
}

export default {
  getSkillBuild,
  getAvailableBuilds,
  getHeroesWithSkillBuilds,
  getSkillProgression,
  compareBuilds,
};
