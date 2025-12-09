export type AwardKey =
  | 'godlike_streak'
  | 'unstoppable_kda'
  | 'support_savior'
  | 'tank_master'
  | 'flash_farmer'
  | 'assist_king'
  | 'comeback_win'
  | 'iron_wall'
  | 'rapid_game'
  | 'marathon_game'
  | 'precision_striker'
  | 'performance_peak'
  | 'team_player'
  | 'carry_dominance'
  | 'rampage_master'
  | 'rising_star';

export interface AwardResult {
  keys: AwardKey[];
}

export interface AwardInput {
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  netWorth: number;
  duration: number;
  victory: boolean;
  damageTaken?: number;
}

export function calculateAwards(input: AwardInput): AwardResult {
  const keys: AwardKey[] = [];

  if (input.kills >= 15 && input.deaths <= 3) keys.push('godlike_streak');
  if ((input.kills + input.assists) / Math.max(1, input.deaths) >= 6) keys.push('unstoppable_kda');
  if (input.assists >= 20) keys.push('assist_king');
  if (input.deaths <= 2 && input.victory) keys.push('iron_wall');
  if (input.gpm >= 700) keys.push('flash_farmer');
  if (input.duration <= 1800) keys.push('rapid_game');
  if (input.duration >= 3000) keys.push('marathon_game');
  if (input.assists >= 15 && input.deaths <= 5) keys.push('support_savior');
  if (input.netWorth >= 25000 && input.victory) keys.push('comeback_win');
  if (input.damageTaken && input.damageTaken >= 30000) keys.push('tank_master');

  return { keys };
}
