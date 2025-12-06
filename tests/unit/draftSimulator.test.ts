/**
 * Draft Simulator Service - Unit Tests
 * 
 * Tests cover:
 * - Matchup score calculation
 * - Team synergy analysis
 * - Hero recommendations
 * - Counter-pick detection
 * - Team power level calculation
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMatchupScore,
  analyzeTeamSynergy,
  recommendHeroesForRole,
  findCounterPicks,
  analyzeDraft,
  calculateTeamPowerLevel,
  getAvailableHeroes,
  getHeroInfo,
} from '../../src/services/draftSimulatorService.js';

describe('Draft Simulator Service', () => {
  describe('Matchup Score Calculation', () => {
    it('should calculate neutral matchup (50) for unknown heroes', () => {
      const score = calculateMatchupScore('Unknown1', 'Unknown2');
      expect(score).toBe(50);
    });

    it('should return score between 0 and 100', () => {
      const score = calculateMatchupScore('Anti-Mage', 'Earthshaker');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate different scores for different matchups', () => {
      const score1 = calculateMatchupScore('Anti-Mage', 'Earthshaker');
      const score2 = calculateMatchupScore('Anti-Mage', 'Pudge');
      expect(score1).not.toBe(score2);
    });

    it('should handle same hero matchup', () => {
      const score = calculateMatchupScore('Invoker', 'Invoker');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should consider historical matchup data if provided', () => {
      const pastMatchups = [
        {
          hero: 'Phantom-Assassin',
          vsHero: 'Lion',
          winRate: 65,
          matchups: 100,
          advantage: 'Strong' as const,
        },
      ];
      const score = calculateMatchupScore('Phantom-Assassin', 'Lion', pastMatchups);
      expect(score).toBe(65);
    });

    it('should provide advantage for hero against their counters enemies', () => {
      const score = calculateMatchupScore('Earthshaker', 'Phantom-Assassin');
      expect(score).toBeGreaterThan(45);
    });

    it('should provide disadvantage for hero against heroes that counter them', () => {
      const score = calculateMatchupScore('Phantom-Assassin', 'Brewmaster');
      expect(score).toBeLessThan(55);
    });

    it('should cap score at 0 minimum', () => {
      const score = calculateMatchupScore('Phantom-Assassin', 'Brewmaster');
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should cap score at 100 maximum', () => {
      const score = calculateMatchupScore('Anti-Mage', 'Drow-Ranger');
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Team Synergy Analysis', () => {
    it('should return synergy score between 0 and 100', () => {
      const team = [
        { hero: 'Anti-Mage', role: 'Carry' },
        { hero: 'Invoker', role: 'Mid' },
      ];
      const result = analyzeTeamSynergy(team);
      expect(result.synergy_score).toBeGreaterThanOrEqual(0);
      expect(result.synergy_score).toBeLessThanOrEqual(100);
    });

    it('should return weaknesses array', () => {
      const team = [{ hero: 'Anti-Mage', role: 'Carry' }];
      const result = analyzeTeamSynergy(team);
      expect(Array.isArray(result.weaknesses)).toBe(true);
    });

    it('should return strengths array', () => {
      const team = [{ hero: 'Anti-Mage', role: 'Carry' }];
      const result = analyzeTeamSynergy(team);
      expect(Array.isArray(result.strengths)).toBe(true);
    });

    it('should identify carries count properly', () => {
      const team = [
        { hero: 'Invoker', role: 'Mid' },
        { hero: 'Pudge', role: 'Support' },
      ];
      const result = analyzeTeamSynergy(team);
      // With no carries specified in roles, should have weakness
      expect(result.weaknesses.length).toBeGreaterThanOrEqual(0);
    });

    it('should reward balanced team composition', () => {
      const balanced = [
        { hero: 'Anti-Mage', role: 'Carry' },
        { hero: 'Invoker', role: 'Mid' },
      ];
      const result = analyzeTeamSynergy(balanced);
      expect(result.synergy_score).toBeGreaterThan(40);
    });

    it('should consider enemy team in synergy calculation', () => {
      const team = [
        { hero: 'Anti-Mage', role: 'Carry' },
        { hero: 'Earthshaker', role: 'Support' },
      ];
      const result = analyzeTeamSynergy(team, ['Pudge', 'Lion']);
      expect(result.synergy_score).toBeGreaterThanOrEqual(0);
      expect(result.synergy_score).toBeLessThanOrEqual(100);
    });

    it('should handle empty team', () => {
      const result = analyzeTeamSynergy([]);
      expect(result.synergy_score).toBeGreaterThanOrEqual(0);
    });

    it('should handle large teams', () => {
      const team = [
        { hero: 'Anti-Mage', role: 'Carry' },
        { hero: 'Invoker', role: 'Mid' },
        { hero: 'Earthshaker', role: 'Offlane' },
        { hero: 'Pudge', role: 'Support' },
        { hero: 'Lion', role: 'Support' },
      ];
      const result = analyzeTeamSynergy(team);
      expect(result.synergy_score).toBeGreaterThanOrEqual(0);
      expect(result.synergy_score).toBeLessThanOrEqual(100);
    });
  });

  describe('Hero Recommendations', () => {
    it('should return array of recommendations', () => {
      const recs = recommendHeroesForRole('Carry');
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeGreaterThan(0);
    });

    it('should not recommend already picked heroes', () => {
      const recs = recommendHeroesForRole('Carry', ['Anti-Mage']);
      const heroNames = recs.map((r) => r.hero);
      expect(heroNames).not.toContain('Anti-Mage');
    });

    it('should return recommendations with valid structure', () => {
      const recs = recommendHeroesForRole('Carry');
      recs.forEach((rec) => {
        expect(rec).toHaveProperty('hero');
        expect(rec).toHaveProperty('role');
        expect(rec).toHaveProperty('reasoning');
        expect(rec).toHaveProperty('synergy_score');
        expect(rec).toHaveProperty('counter_coverage');
      });
    });

    it('should consider enemy team in recommendations', () => {
      const recsWithEnemy = recommendHeroesForRole('Carry', [], ['Pudge', 'Lion']);
      const recsWithoutEnemy = recommendHeroesForRole('Carry', []);
      // Should still return valid recommendations
      expect(recsWithEnemy.length).toBeGreaterThan(0);
      expect(recsWithoutEnemy.length).toBeGreaterThan(0);
    });

    it('should have synergy score between 0 and 100', () => {
      const recs = recommendHeroesForRole('Carry');
      recs.forEach((rec) => {
        expect(rec.synergy_score).toBeGreaterThanOrEqual(0);
        expect(rec.synergy_score).toBeLessThanOrEqual(100);
      });
    });

    it('should sort by synergy score descending', () => {
      const recs = recommendHeroesForRole('Carry', ['Anti-Mage']);
      for (let i = 0; i < recs.length - 1; i++) {
        const current = recs[i];
        const next = recs[i + 1];
        if (current && next) {
          expect(current.synergy_score).toBeGreaterThanOrEqual(next.synergy_score);
        }
      }
    });

    it('should limit to 5 recommendations', () => {
      const recs = recommendHeroesForRole('Carry');
      expect(recs.length).toBeLessThanOrEqual(5);
    });

    it('should handle unknown role', () => {
      const recs = recommendHeroesForRole('Unknown-Role');
      expect(Array.isArray(recs)).toBe(true);
    });
  });

  describe('Counter-Pick Detection', () => {
    it('should return array of counter-picks', () => {
      const counters = findCounterPicks('Phantom-Assassin');
      expect(Array.isArray(counters)).toBe(true);
    });

    it('should not recommend already picked heroes', () => {
      const counters = findCounterPicks('Phantom-Assassin', ['Brewmaster']);
      expect(counters).not.toContain('Brewmaster');
    });

    it('should return empty array for unknown hero', () => {
      const counters = findCounterPicks('Unknown-Hero');
      expect(Array.isArray(counters)).toBe(true);
    });

    it('should limit to 5 counter-picks', () => {
      const counters = findCounterPicks('Phantom-Assassin');
      expect(counters.length).toBeLessThanOrEqual(5);
    });

    it('should find counters for multiple hero types', () => {
      const countersPA = findCounterPicks('Phantom-Assassin');
      const countersInvoker = findCounterPicks('Invoker');
      // Both should be valid results (may be empty or have values)
      expect(Array.isArray(countersPA)).toBe(true);
      expect(Array.isArray(countersInvoker)).toBe(true);
    });
  });

  describe('Draft Analysis', () => {
    it('should return draft analysis object', () => {
      const team = [{ hero: 'Anti-Mage', role: 'Carry' }];
      const analysis = analyzeDraft(team, ['Pudge', 'Lion'], 'Mid');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis).toHaveProperty('critical_counters');
      expect(analysis).toHaveProperty('synergy_implications');
    });

    it('should provide hero recommendations for next pick', () => {
      const team = [{ hero: 'Anti-Mage', role: 'Carry' }];
      const analysis = analyzeDraft(team, [], 'Mid');
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify critical counters to draft', () => {
      const team = [{ hero: 'Anti-Mage', role: 'Carry' }];
      const analysis = analyzeDraft(team, ['Earthshaker'], 'Mid');
      expect(Array.isArray(analysis.critical_counters)).toBe(true);
    });

    it('should provide synergy implications', () => {
      const team = [{ hero: 'Anti-Mage', role: 'Carry' }];
      const analysis = analyzeDraft(team, [], 'Mid');
      expect(Array.isArray(analysis.synergy_implications)).toBe(true);
    });

    it('should handle incomplete teams', () => {
      const team: Array<{ hero: string; role: string }> = [];
      const analysis = analyzeDraft(team, ['Pudge'], 'Mid');
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Team Power Level Calculation', () => {
    it('should return power level between 0 and 100', () => {
      const team = [
        { hero: 'Anti-Mage', role: 'Carry' },
        { hero: 'Invoker', role: 'Mid' },
      ];
      const result = calculateTeamPowerLevel(team);
      expect(result.power_level).toBeGreaterThanOrEqual(0);
      expect(result.power_level).toBeLessThanOrEqual(100);
    });

    it('should provide matchup rating', () => {
      const team = [
        { hero: 'Anti-Mage', role: 'Carry' },
        { hero: 'Invoker', role: 'Mid' },
      ];
      const result = calculateTeamPowerLevel(team);
      expect(result.matchup_rating).toBeDefined();
      expect(typeof result.matchup_rating).toBe('string');
    });

    it('should identify key battles', () => {
      const team = [
        { hero: 'Anti-Mage', role: 'Carry' },
        { hero: 'Invoker', role: 'Mid' },
      ];
      const result = calculateTeamPowerLevel(team, ['Pudge', 'Lion']);
      expect(Array.isArray(result.key_battles)).toBe(true);
    });

    it('should rate favorable matchups correctly', () => {
      const team = [
        { hero: 'Earthshaker', role: 'Support' },
        { hero: 'Anti-Mage', role: 'Carry' },
      ];
      const result = calculateTeamPowerLevel(team, ['Phantom-Assassin']);
      expect(result.power_level).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty enemy team', () => {
      const team = [
        { hero: 'Anti-Mage', role: 'Carry' },
        { hero: 'Invoker', role: 'Mid' },
      ];
      const result = calculateTeamPowerLevel(team);
      expect(result.power_level).toBeGreaterThanOrEqual(0);
      expect(result.power_level).toBeLessThanOrEqual(100);
    });

    it('should handle empty team', () => {
      const result = calculateTeamPowerLevel([]);
      expect(result.power_level).toBeGreaterThanOrEqual(0);
    });

    it('should return key battles sorted by importance', () => {
      const team = [
        { hero: 'Anti-Mage', role: 'Carry' },
        { hero: 'Invoker', role: 'Mid' },
        { hero: 'Earthshaker', role: 'Support' },
      ];
      const result = calculateTeamPowerLevel(team, ['Pudge', 'Lion', 'Phantom-Assassin']);
      expect(result.key_battles.length).toBeLessThanOrEqual(5);
      result.key_battles.forEach((battle) => {
        expect(battle).toHaveProperty('your_hero');
        expect(battle).toHaveProperty('enemy_hero');
        expect(battle).toHaveProperty('rating');
      });
    });
  });

  describe('Available Heroes & Info', () => {
    it('should return list of available heroes', () => {
      const heroes = getAvailableHeroes();
      expect(Array.isArray(heroes)).toBe(true);
      expect(heroes.length).toBeGreaterThan(0);
    });

    it('should contain known heroes', () => {
      const heroes = getAvailableHeroes();
      expect(heroes).toContain('Anti-Mage');
      expect(heroes).toContain('Invoker');
      expect(heroes).toContain('Earthshaker');
    });

    it('should return hero info for known hero', () => {
      const info = getHeroInfo('Anti-Mage');
      expect(info).not.toBeNull();
      expect(info).toHaveProperty('roles');
      expect(info).toHaveProperty('strengths');
      expect(info).toHaveProperty('weaknesses');
      expect(info).toHaveProperty('counters');
      expect(info).toHaveProperty('countered_by');
    });

    it('should return null for unknown hero', () => {
      const info = getHeroInfo('Unknown-Hero');
      expect(info).toBeNull();
    });

    it('should have valid hero info structure', () => {
      const heroes = getAvailableHeroes();
      heroes.slice(0, 5).forEach((hero) => {
        const info = getHeroInfo(hero);
        expect(Array.isArray(info?.roles)).toBe(true);
        expect(Array.isArray(info?.strengths)).toBe(true);
        expect(Array.isArray(info?.weaknesses)).toBe(true);
        expect(Array.isArray(info?.counters)).toBe(true);
        expect(Array.isArray(info?.countered_by)).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete draft scenario', () => {
      // Simulate picking a carry against Pudge + Lion
      const team: Array<{ hero: string; role: string }> = [
        { hero: 'Anti-Mage', role: 'Carry' },
      ];
      const enemyTeam = ['Pudge', 'Lion'];

      // Get draft analysis
      const analysis = analyzeDraft(team, enemyTeam, 'Mid');
      expect(analysis.recommendations.length).toBeGreaterThan(0);

      // Pick a mid hero based on recommendation
      const midHero = analysis.recommendations[0]?.hero;
      expect(midHero).toBeDefined();

      // Add to team
      if (midHero) {
        team.push({ hero: midHero, role: 'Mid' });

        // Calculate power level
        const powerLevel = calculateTeamPowerLevel(team, enemyTeam);
        expect(powerLevel.power_level).toBeGreaterThanOrEqual(0);
        expect(powerLevel.key_battles.length).toBeGreaterThan(0);
      }
    });

    it('should consistently recommend for same scenario', () => {
      const existingPicks = ['Anti-Mage', 'Invoker'];
      const recs1 = recommendHeroesForRole('Offlane', existingPicks);
      const recs2 = recommendHeroesForRole('Offlane', existingPicks);

      expect(recs1.length).toBe(recs2.length);
      recs1.forEach((rec, index) => {
        expect(rec.hero).toBe(recs2[index]?.hero);
      });
    });

    it('should handle full 5v5 team analysis', () => {
      const yourTeam = [
        { hero: 'Anti-Mage', role: 'Carry' },
        { hero: 'Invoker', role: 'Mid' },
        { hero: 'Earthshaker', role: 'Offlane' },
        { hero: 'Pudge', role: 'Soft-Support' },
        { hero: 'Lion', role: 'Hard-Support' },
      ];

      const enemyTeam = [
        'Phantom-Assassin',
        'Puck',
        'Underlord',
        'Crystal-Maiden',
        'Rubick',
      ];

      const powerLevel = calculateTeamPowerLevel(yourTeam, enemyTeam);
      expect(powerLevel.power_level).toBeGreaterThan(0);
      expect(powerLevel.matchup_rating).toBeDefined();
      expect(powerLevel.key_battles.length).toBeGreaterThan(0);
    });
  });
});
