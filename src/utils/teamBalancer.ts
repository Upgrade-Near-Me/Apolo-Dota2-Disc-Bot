/**
 * Team Balancer Utility
 * 
 * Implements MMR-based snake draft algorithm to create balanced Dota 2 teams.
 * Used for voice channel distribution and competitive match setup.
 */

export interface Player {
  id: string;
  mmr: number;
  username?: string;
}

export interface BalancedTeams {
  team1: Player[];
  team2: Player[];
  stats: {
    team1Avg: number;
    team2Avg: number;
    difference: number;
  };
}

/**
 * Calculate average MMR for a team
 */
function calculateTeamAverage(players: Player[]): number {
  if (players.length === 0) return 0;
  const sum = players.reduce((acc, p) => acc + p.mmr, 0);
  return Math.round(sum / players.length);
}

/**
 * Balance teams using snake draft algorithm
 * 
 * Algorithm:
 * 1. Sort players by MMR descending
 * 2. Alternate picking: Team1 → Team2 → Team2 → Team1 (snake pattern)
 * 3. This minimizes average MMR difference
 * 
 * @param players - Array of players with MMR
 * @returns Balanced teams with statistics
 * 
 * @example
 * const players = [
 *   { id: '1', mmr: 6000 },
 *   { id: '2', mmr: 5500 },
 *   { id: '3', mmr: 5000 },
 *   { id: '4', mmr: 4500 },
 * ];
 * const { team1, team2 } = balanceTeams(players);
 * // team1: [6000, 5000], team2: [5500, 4500]
 */
export function balanceTeams(players: Player[]): BalancedTeams {
  // Validate input
  if (!Array.isArray(players) || players.length === 0) {
    return { team1: [], team2: [], stats: { team1Avg: 0, team2Avg: 0, difference: 0 } };
  }

  // Separate linked (mmr > 0) and unlinked (mmr = 0) players
  const linked = players.filter((p) => p.mmr > 0).sort((a, b) => b.mmr - a.mmr);
  const unlinked = players.filter((p) => p.mmr === 0);

  const team1: Player[] = [];
  const team2: Player[] = [];

  // Snake draft: alternate picking in reverse order for second half
  linked.forEach((player, index) => {
    if (index < Math.ceil(linked.length / 2)) {
      // First half: pick in order
      if (index % 2 === 0) {
        team1.push(player);
      } else {
        team2.push(player);
      }
    } else {
      // Second half: reverse order (snake)
      if (index % 2 === 0) {
        team2.push(player);
      } else {
        team1.push(player);
      }
    }
  });

  // Distribute unlinked players alternately
  unlinked.forEach((player, index) => {
    if (index % 2 === 0) {
      team1.push(player);
    } else {
      team2.push(player);
    }
  });

  const team1Avg = calculateTeamAverage(team1);
  const team2Avg = calculateTeamAverage(team2);

  return {
    team1,
    team2,
    stats: {
      team1Avg,
      team2Avg,
      difference: Math.abs(team1Avg - team2Avg),
    },
  };
}

/**
 * Validate if teams are reasonably balanced
 * 
 * @param teams - Balanced teams from balanceTeams()
 * @param maxDifference - Maximum allowed MMR difference (default 500)
 * @returns true if balance is acceptable
 */
export function isBalanced(teams: BalancedTeams, maxDifference = 500): boolean {
  return teams.stats.difference <= maxDifference;
}

/**
 * Get team balance quality score
 * 
 * @param teams - Balanced teams from balanceTeams()
 * @returns Score 0-100 (100 = perfect balance)
 */
export function getBalanceScore(teams: BalancedTeams): number {
  const maxDiff = 1000; // MMR scale
  const score = Math.max(0, 100 - (teams.stats.difference / maxDiff) * 100);
  return Math.round(score);
}

export default {
  balanceTeams,
  isBalanced,
  getBalanceScore,
};
