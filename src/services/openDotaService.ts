// OpenDota fallback service (no auth required)
// Node 20 has global fetch

interface HeroCache {
  map: Map<number, string>;
  lastLoaded: number;
}

const HEROES_CACHE: HeroCache = {
  map: new Map(),
  lastLoaded: 0,
};

interface OpenDotaHero {
  id: number;
  localized_name?: string;
  name?: string;
}

interface OpenDotaMatch {
  match_id: number;
  player_slot: number;
  radiant_win?: boolean;
  hero_id: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  gold_per_min?: number;
  xp_per_min?: number;
  duration?: number;
  start_time?: number;
}

interface OpenDotaProfile {
  profile?: {
    personaname?: string;
    avatarfull?: string;
  };
  rank_tier?: number;
}

interface OpenDotaWinLoss {
  win?: number;
  lose?: number;
}

interface OpenDotaHeroStat {
  hero_id: number;
  games?: number;
  win?: number;
}

interface OpenDotaHeroStats {
  id: number;
  localized_name?: string;
  pro_pick?: number;
  pro_ban?: number;
  pro_win?: number;
}

interface ParsedMatch {
  matchId: number;
  result: 'WIN' | 'LOSS';
  heroName: string;
  heroId: number;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  netWorth: number;
  duration: number;
  playedAt: Date;
  items: unknown[];
}

interface PlayerProfile {
  name: string;
  avatar: string;
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: string;
  rank: string;
  topHeroes: TopHero[];
}

interface TopHero {
  name: string;
  matches: number;
  wins: number;
  winRate: string;
}

interface MatchHistory {
  matchId: number;
  won: boolean;
  heroId: number;
  heroName: string;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  duration: number;
}

interface MetaHero {
  id: number;
  name: string;
  pickRate: string;
  winRate: string;
  picks: number;
  bans: number;
  wins: number;
}

interface HeroBuild {
  heroId: number;
  heroName: string;
  builds: {
    starting: string[];
    early: string[];
    core: string[];
    luxury: string[];
  };
  itemsData: unknown;
}

async function ensureHeroes(): Promise<void> {
  const now = Date.now();
  if (HEROES_CACHE.map.size > 0 && now - HEROES_CACHE.lastLoaded < 6 * 60 * 60 * 1000) return; // 6h cache
  const res = await fetch('https://api.opendota.com/api/heroes');
  const heroes: OpenDotaHero[] = await res.json() as OpenDotaHero[];
  HEROES_CACHE.map.clear();
  heroes.forEach(h => HEROES_CACHE.map.set(h.id, h.localized_name || h.name || `Hero ${h.id}`));
  HEROES_CACHE.lastLoaded = now;
}

function isRadiant(player_slot: number): boolean {
  return (player_slot & 0x80) === 0; // bit 7
}

export async function getLastMatch(steam32Id: string): Promise<ParsedMatch> {
  await ensureHeroes();
  const res = await fetch(`https://api.opendota.com/api/players/${steam32Id}/recentMatches?limit=1`);
  const arr: OpenDotaMatch[] = await res.json() as OpenDotaMatch[];
  if (!Array.isArray(arr) || arr.length === 0) throw new Error('No recent matches');
  const m = arr[0]!;
  const playerIsRadiant = isRadiant(m.player_slot);
  const won = playerIsRadiant ? !!m.radiant_win : !m.radiant_win;

  return {
    matchId: m.match_id,
    result: won ? 'WIN' : 'LOSS',
    heroName: HEROES_CACHE.map.get(m.hero_id) || `Hero ${m.hero_id}`,
    heroId: m.hero_id,
    kills: m.kills ?? 0,
    deaths: m.deaths ?? 0,
    assists: m.assists ?? 0,
    gpm: m.gold_per_min ?? 0,
    xpm: m.xp_per_min ?? 0,
    netWorth: 0,
    duration: m.duration ?? 0,
    playedAt: new Date((m.start_time ?? 0) * 1000),
    items: [],
  };
}

export async function getPlayerProfile(steam32Id: string): Promise<PlayerProfile> {
  await ensureHeroes();
  const [profileRes, wlRes, heroesRes] = await Promise.all([
    fetch(`https://api.opendota.com/api/players/${steam32Id}`),
    fetch(`https://api.opendota.com/api/players/${steam32Id}/wl`),
    fetch(`https://api.opendota.com/api/players/${steam32Id}/heroes`),
  ]);

  const profileJson: OpenDotaProfile = await profileRes.json() as OpenDotaProfile;
  const wl: OpenDotaWinLoss = await wlRes.json() as OpenDotaWinLoss;
  const heroes: OpenDotaHeroStat[] = await heroesRes.json() as OpenDotaHeroStat[];

  const totalMatches = (wl.win ?? 0) + (wl.lose ?? 0);
  const winRate = totalMatches > 0 ? ((wl.win! / totalMatches) * 100).toFixed(1) : '0.0';

  const topHeroes: TopHero[] = (Array.isArray(heroes) ? heroes : [])
    .sort((a, b) => (b.games ?? 0) - (a.games ?? 0))
    .slice(0, 5)
    .map(h => ({
      name: HEROES_CACHE.map.get(h.hero_id) || `Hero ${h.hero_id}`,
      matches: h.games ?? 0,
      wins: h.win ?? 0,
      winRate: (h.games ? ((h.win! / h.games) * 100).toFixed(1) : '0.0'),
    }));

  return {
    name: profileJson?.profile?.personaname || 'Unknown',
    avatar: profileJson?.profile?.avatarfull || '',
    wins: wl.win ?? 0,
    losses: wl.lose ?? 0,
    totalMatches,
    winRate,
    rank: profileJson?.rank_tier ? String(profileJson.rank_tier) : 'Unranked',
    topHeroes,
  };
}

export async function getMatchHistory(steam32Id: string, limit = 20): Promise<MatchHistory[]> {
  await ensureHeroes();
  const res = await fetch(`https://api.opendota.com/api/players/${steam32Id}/recentMatches?limit=${limit}`);
  const arr: OpenDotaMatch[] = await res.json() as OpenDotaMatch[];
  const mapped: MatchHistory[] = (Array.isArray(arr) ? arr : []).map(m => {
    const playerIsRadiant = isRadiant(m.player_slot);
    const won = playerIsRadiant ? !!m.radiant_win : !m.radiant_win;
    const heroName = HEROES_CACHE.map.get(m.hero_id) || `Hero ${m.hero_id}`;
    return {
      matchId: m.match_id,
      won,
      heroId: m.hero_id,
      heroName,
      kills: m.kills ?? 0,
      deaths: m.deaths ?? 0,
      assists: m.assists ?? 0,
      gpm: m.gold_per_min ?? 0,
      xpm: m.xp_per_min ?? 0,
      duration: m.duration ?? 0,
    };
  });
  return mapped.reverse();
}

export async function getMetaHeroes(): Promise<MetaHero[]> {
  await ensureHeroes();
  const res = await fetch('https://api.opendota.com/api/heroStats');
  const stats: OpenDotaHeroStats[] = await res.json() as OpenDotaHeroStats[];
  
  if (!Array.isArray(stats)) return [];
  
  return stats
    .map(h => ({
      id: h.id,
      name: h.localized_name || HEROES_CACHE.map.get(h.id) || `Hero ${h.id}`,
      pickRate: ((h.pro_pick || 0) / Math.max((h.pro_ban || 0) + (h.pro_pick || 0), 1) * 100).toFixed(1),
      winRate: ((h.pro_win || 0) / Math.max(h.pro_pick || 0, 1) * 100).toFixed(1),
      picks: h.pro_pick || 0,
      bans: h.pro_ban || 0,
      wins: h.pro_win || 0,
    }))
    .filter(h => h.picks > 0)
    .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
    .slice(0, 15);
}

export async function getHeroBuild(heroId: number): Promise<HeroBuild> {
  await ensureHeroes();
  const heroName = HEROES_CACHE.map.get(heroId) || `Hero ${heroId}`;
  
  // Fetch item builds from guide data (simplified)
  const itemsRes = await fetch(`https://api.opendota.com/api/constants/items`);
  const items: unknown = await itemsRes.json();
  
  // Common item builds (hardcoded for now - ideally from API)
  const commonBuilds = {
    starting: ['tango', 'branches', 'circlet', 'clarity'],
    early: ['magic_wand', 'boots', 'bracer'],
    core: ['power_treads', 'black_king_bar', 'blink'],
    luxury: ['aghanims_scepter', 'heart', 'assault'],
  };
  
  return {
    heroId,
    heroName,
    builds: commonBuilds,
    itemsData: items,
  };
}

export default {
  getLastMatch,
  getPlayerProfile,
  getMatchHistory,
  getMetaHeroes,
  getHeroBuild,
};
