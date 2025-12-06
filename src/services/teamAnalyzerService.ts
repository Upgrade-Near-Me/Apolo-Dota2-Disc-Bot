/**
 * Team Analyzer Service - Team Composition & Synergy Analysis
 * 
 * Provides:
 * - Team composition analysis
 * - Role distribution validation
 * - Synergy scoring
 * - Weakness identification
 * - Strength identification
 */

export interface TeamMember {
  userId: string;
  username: string;
  hero: string;
  role: string;
  mmr?: number;
}

export interface RoleDistribution {
  carry: number;
  mid: number;
  offlane: number;
  soft_support: number;
  hard_support: number;
}

export interface TeamAnalysis {
  team_name?: string;
  members: TeamMember[];
  role_distribution: RoleDistribution;
  avg_mmr?: number;
  total_mmr?: number;
  composition_score: number; // 0-100
  role_balance_score: number; // 0-100
  synergy_score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

/**
 * Optimal role distribution for a 5v5 team
 */
const OPTIMAL_DISTRIBUTION: RoleDistribution = {
  carry: 1,
  mid: 1,
  offlane: 1,
  soft_support: 1,
  hard_support: 1,
};

// Role importance scoring stored for reference
// Future enhancement: weighted balance calculations

/**
 * Analyze team composition and role distribution
 */
export function analyzeTeamComposition(members: TeamMember[]): {
  distribution: RoleDistribution;
  composition_score: number;
  role_balance_score: number;
  is_valid: boolean;
} {
  const distribution: RoleDistribution = {
    carry: 0,
    mid: 0,
    offlane: 0,
    soft_support: 0,
    hard_support: 0,
  };

  // Count roles
  members.forEach((member) => {
    const role = member.role.toLowerCase().replace('-', '_');
    if (role in distribution) {
      distribution[role as keyof RoleDistribution]++;
    }
  });

  // Calculate composition score (how close to optimal)
  let compositionScore = 100;
  const roleErrors = Object.keys(distribution) as Array<keyof RoleDistribution>;

  roleErrors.forEach((role) => {
    const actual = distribution[role];
    const optimal = OPTIMAL_DISTRIBUTION[role];
    const diff = Math.abs(actual - optimal);
    compositionScore -= diff * 10; // -10 points per missing role
  });

  // Calculate role balance score
  let roleBalanceScore = 100;
  const totalMembers = members.length;

  if (totalMembers > 0) {
    // Check if team is properly distributed
    const roleArray = Object.values(distribution);

    roleArray.forEach((count) => {
      if (count === 0 || count > 2) {
        roleBalanceScore -= 15; // Penalty for empty or overstuffed roles
      }
    });
  }

  // Validate team (has 5 members with proper distribution)
  const isValid = totalMembers === 5 && Object.values(distribution).every((v) => v === 1);

  return {
    distribution,
    composition_score: Math.max(0, compositionScore),
    role_balance_score: Math.max(0, roleBalanceScore),
    is_valid: isValid,
  };
}

/**
 * Calculate overall team synergy based on composition
 */
export function calculateTeamSynergy(
  members: TeamMember[],
  heroMatchups?: Map<string, Map<string, number>>
): {
  synergy_score: number;
  role_synergy: number;
  hero_synergy: number;
  breakdown: { [key: string]: number };
} {
  // Analyze role synergy (how well roles complement each other)
  const { distribution } = analyzeTeamComposition(members);

  // Score based on role presence and distribution
  let roleSynergy = 50; // Base score

  // Reward having all 5 core roles
  const hasAllRoles = Object.values(distribution).every((v) => v > 0);
  if (hasAllRoles) roleSynergy += 20;

  // Reward good support pairing (soft + hard support together)
  if (distribution.soft_support > 0 && distribution.hard_support > 0) {
    roleSynergy += 15;
  }

  // Penalize missing core roles
  if (distribution.carry === 0) roleSynergy -= 20;
  if (distribution.mid === 0) roleSynergy -= 15;
  if (distribution.offlane === 0) roleSynergy -= 15;

  // Analyze hero synergy if matchup data provided
  let heroSynergy = 50; // Base score

  if (heroMatchups && members.length > 1) {
    let pairings = 0;
    let synergisticPairs = 0;

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        pairings++;
        const hero1 = members[i]?.hero;
        const hero2 = members[j]?.hero;

        if (hero1 && hero2 && heroMatchups.has(hero1)) {
          const matchup = heroMatchups.get(hero1)?.get(hero2) ?? 50;
          if (matchup > 60) synergisticPairs++;
        }
      }
    }

    if (pairings > 0) {
      heroSynergy = 50 + (synergisticPairs / pairings) * 50; // 50-100 based on synergistic pairings
    }
  }

  // Combine scores (60% role, 40% hero)
  const overallSynergy = roleSynergy * 0.6 + heroSynergy * 0.4;

  return {
    synergy_score: Math.max(0, Math.min(100, overallSynergy)),
    role_synergy: Math.max(0, Math.min(100, roleSynergy)),
    hero_synergy: Math.max(0, Math.min(100, heroSynergy)),
    breakdown: {
      role_synergy: roleSynergy,
      hero_synergy: heroSynergy,
    },
  };
}

/**
 * Identify team strengths based on composition
 */
export function identifyTeamStrengths(members: TeamMember[]): string[] {
  const strengths: string[] = [];
  const { distribution } = analyzeTeamComposition(members);

  // Check for role-based strengths
  if (distribution.carry > 0) strengths.push('Strong late-game potential');
  if (distribution.mid > 0) strengths.push('Mid-lane dominance capability');
  if (distribution.hard_support > 0) strengths.push('Strong initiation and crowd control');
  if (distribution.soft_support > 0) strengths.push('Flexible support coverage');
  if (distribution.offlane > 0) strengths.push('Offlane resistance and durability');

  // Check for balanced composition
  if (distribution.carry === 1 && distribution.mid === 1 && distribution.offlane === 1) {
    strengths.push('Well-balanced core lineup');
  }

  // Check for support synergy
  if (distribution.hard_support > 0 && distribution.soft_support > 0) {
    strengths.push('Dual support coordination potential');
  }

  // Check for defensive capabilities
  const defensiveRoles = ['Offlane', 'Hard-Support'];
  const defenseCount = members.filter((m) => defensiveRoles.includes(m.role)).length;
  if (defenseCount >= 2) {
    strengths.push('Strong defensive coordination');
  }

  // Remove duplicates
  return Array.from(new Set(strengths));
}

/**
 * Identify team weaknesses based on composition
 */
export function identifyTeamWeaknesses(members: TeamMember[]): string[] {
  const weaknesses: string[] = [];
  const { distribution } = analyzeTeamComposition(members);

  // Check for missing roles
  if (distribution.carry === 0) weaknesses.push('No dedicated carry - weak late-game scaling');
  if (distribution.mid === 0) weaknesses.push('No mid-laner - lack of early game tempo');
  if (distribution.offlane === 0)
    weaknesses.push('No offlaner - weak laning phase defense');

  if (distribution.hard_support === 0)
    weaknesses.push('No hard support - weak initiation capability');
  if (distribution.soft_support === 0) weaknesses.push('No soft support - limited flexibility');

  // Check for overstacking
  if (distribution.carry > 1) weaknesses.push('Multiple carries - economy pressure');
  if (distribution.mid > 1) weaknesses.push('Multiple mids - potential farm conflict');

  // Check for all-damage teams
  const damageRoles = ['Carry', 'Mid'];
  const damageCount = members.filter((m) => damageRoles.includes(m.role)).length;
  if (damageCount >= 4) {
    weaknesses.push('Lacks defensive items - vulnerable to burst damage');
  }

  // Check for missing support
  const supportCount = distribution.hard_support + distribution.soft_support;
  if (supportCount === 0) weaknesses.push('No support presence - minimal map control');
  else if (supportCount === 1) weaknesses.push('Single support - limited roaming potential');

  // Remove duplicates
  return Array.from(new Set(weaknesses));
}

/**
 * Generate team improvement recommendations
 */
export function generateTeamRecommendations(members: TeamMember[]): string[] {
  const recommendations: string[] = [];
  const { distribution } = analyzeTeamComposition(members);
  const weaknesses = identifyTeamWeaknesses(members);

  // Role-based recommendations
  if (distribution.carry === 0 && members.length < 5) {
    recommendations.push('⚠️ Add a dedicated carry for late-game potential');
  }

  if (distribution.hard_support === 0 && members.length < 5) {
    recommendations.push('⚠️ Consider adding a hard support for team initiation');
  }

  // Positioning recommendations
  if (distribution.offlane === 0 && members.length === 5) {
    recommendations.push('🔄 Reassign someone to offlane role for lane stability');
  }

  // Economy recommendations
  if (distribution.carry > 1) {
    recommendations.push('💰 Too many carries - consider moving one to support or mid');
  }

  // Strategy recommendations
  if (weaknesses.length > 3) {
    recommendations.push('🎯 Major team composition issues - consider complete team restructuring');
  }

  // Farm efficiency
  if (distribution.carry === 1 && distribution.mid === 1) {
    recommendations.push('📊 Ensure carry gets priority farm - adjust mid laner economy');
  }

  // Remove duplicates
  return Array.from(new Set(recommendations));
}

/**
 * Analyze average team skill level
 */
export function analyzeTeamSkillLevel(members: TeamMember[]): {
  avg_mmr: number;
  total_mmr: number;
  skill_distribution: { tier: string; count: number }[];
  balance: string;
} {
  const mmrs = members.map((m) => m.mmr || 0).filter((m) => m > 0);

  const avgMmr = mmrs.length > 0 ? Math.round(mmrs.reduce((a, b) => a + b) / mmrs.length) : 0;
  const totalMmr = mmrs.length > 0 ? mmrs.reduce((a, b) => a + b) : 0;

  // Categorize by skill tier
  const tiers = {
    'Herald (0-770)': 0,
    'Guardian (770-1540)': 0,
    'Crusader (1540-2310)': 0,
    'Archon (2310-3080)': 0,
    'Legend (3080-3850)': 0,
    'Ancient (3850-4620)': 0,
    'Divine (4620-5420)': 0,
    'Immortal (5420+)': 0,
  };

  mmrs.forEach((mmr) => {
    if (mmr < 770) {
      tiers['Herald (0-770)']++;
    } else if (mmr < 1540) {
      tiers['Guardian (770-1540)']++;
    } else if (mmr < 2310) {
      tiers['Crusader (1540-2310)']++;
    } else if (mmr < 3080) {
      tiers['Archon (2310-3080)']++;
    } else if (mmr < 3850) {
      tiers['Legend (3080-3850)']++;
    } else if (mmr < 4620) {
      tiers['Ancient (3850-4620)']++;
    } else if (mmr < 5420) {
      tiers['Divine (4620-5420)']++;
    } else {
      tiers['Immortal (5420+)']++;
    }
  });

  const skillDistribution = Object.entries(tiers)
    .filter(([, count]) => count > 0)
    .map(([tier, count]) => ({ tier, count }));

  // Determine balance
  let balance = 'Balanced';
  if (mmrs.length > 1) {
    const maxMmr = Math.max(...mmrs);
    const minMmr = Math.min(...mmrs);
    const spread = maxMmr - minMmr;

    if (spread > 1500) balance = 'Highly imbalanced';
    else if (spread > 1000) balance = 'Imbalanced';
    else if (spread > 500) balance = 'Somewhat imbalanced';
  }

  return {
    avg_mmr: avgMmr,
    total_mmr: totalMmr,
    skill_distribution: skillDistribution,
    balance,
  };
}

/**
 * Perform complete team analysis
 */
export function analyzeCompleteTeam(
  members: TeamMember[],
  teamName?: string
): TeamAnalysis {
  const { distribution, composition_score, role_balance_score } =
    analyzeTeamComposition(members);

  const { synergy_score } = calculateTeamSynergy(members);

  const strengths = identifyTeamStrengths(members);
  const weaknesses = identifyTeamWeaknesses(members);
  const recommendations = generateTeamRecommendations(members);

  const skillAnalysis = analyzeTeamSkillLevel(members);

  return {
    team_name: teamName,
    members,
    role_distribution: distribution,
    avg_mmr: skillAnalysis.avg_mmr,
    total_mmr: skillAnalysis.total_mmr,
    composition_score,
    role_balance_score,
    synergy_score,
    strengths,
    weaknesses,
    recommendations,
  };
}

/**
 * Compare two teams
 */
export function compareTeams(
  team1: TeamMember[],
  team2: TeamMember[],
  team1Name = 'Team 1',
  team2Name = 'Team 2'
): {
  team1_analysis: TeamAnalysis;
  team2_analysis: TeamAnalysis;
  comparison: {
    composition_advantage: string;
    role_balance_advantage: string;
    synergy_advantage: string;
    skill_advantage: string;
    overall_winner: string;
  };
} {
  const analysis1 = analyzeCompleteTeam(team1, team1Name);
  const analysis2 = analyzeCompleteTeam(team2, team2Name);

  const compositionAdvantage =
    analysis1.composition_score > analysis2.composition_score ? team1Name : team2Name;
  const roleBalanceAdvantage =
    analysis1.role_balance_score > analysis2.role_balance_score ? team1Name : team2Name;
  const synergyAdvantage = analysis1.synergy_score > analysis2.synergy_score ? team1Name : team2Name;

  const skillAdvantage =
    (analysis1.avg_mmr || 0) > (analysis2.avg_mmr || 0) ? team1Name : team2Name;

  // Calculate overall winner
  const overallScore1 = analysis1.composition_score * 0.25 +
    analysis1.role_balance_score * 0.25 +
    analysis1.synergy_score * 0.4 +
    ((analysis1.avg_mmr || 0) / 5000) * 10 * 0.1; // MMR normalized to 0-10 scale

  const overallScore2 = analysis2.composition_score * 0.25 +
    analysis2.role_balance_score * 0.25 +
    analysis2.synergy_score * 0.4 +
    ((analysis2.avg_mmr || 0) / 5000) * 10 * 0.1;

  const overallWinner = overallScore1 > overallScore2 ? team1Name : team2Name;

  return {
    team1_analysis: analysis1,
    team2_analysis: analysis2,
    comparison: {
      composition_advantage: compositionAdvantage,
      role_balance_advantage: roleBalanceAdvantage,
      synergy_advantage: synergyAdvantage,
      skill_advantage: skillAdvantage,
      overall_winner: overallWinner,
    },
  };
}

export default {
  analyzeTeamComposition,
  calculateTeamSynergy,
  identifyTeamStrengths,
  identifyTeamWeaknesses,
  generateTeamRecommendations,
  analyzeTeamSkillLevel,
  analyzeCompleteTeam,
  compareTeams,
};
