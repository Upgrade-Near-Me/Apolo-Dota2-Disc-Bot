import { describe, it, expect } from 'vitest';
import {
  analyzeTeamComposition,
  calculateTeamSynergy,
  identifyTeamStrengths,
  identifyTeamWeaknesses,
  generateTeamRecommendations,
  analyzeTeamSkillLevel,
  analyzeCompleteTeam,
  compareTeams,
  TeamMember,
  RoleDistribution,
  TeamAnalysis,
} from '../../src/services/teamAnalyzerService';

/**
 * Test Suite: Team Analyzer Service
 *
 * Coverage:
 * - Team composition analysis
 * - Role distribution validation
 * - Synergy calculation
 * - Strength/weakness identification
 * - Recommendations generation
 * - Skill level analysis
 * - Complete team analysis
 * - Team comparison
 */

describe('Team Analyzer Service', () => {
  /**
   * Test Suite 1: Team Composition Analysis (8 tests)
   */
  describe('analyzeTeamComposition', () => {
    it('should analyze valid 5-member team with optimal distribution', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const result = analyzeTeamComposition(members);

      expect(result.distribution).toEqual({
        carry: 1,
        mid: 1,
        offlane: 1,
        soft_support: 1,
        hard_support: 1,
      });
      expect(result.composition_score).toBeGreaterThan(80);
      expect(result.is_valid).toBe(true);
    });

    it('should detect missing roles', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
      ];

      const result = analyzeTeamComposition(members);

      expect(result.distribution.carry).toBe(1);
      expect(result.distribution.mid).toBe(1);
      expect(result.composition_score).toBeLessThanOrEqual(70);
    });

    it('should penalize duplicate roles', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Drow-Ranger', role: 'Carry' },
        { userId: 'u3', username: 'Player3', hero: 'Invoker', role: 'Mid' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const result = analyzeTeamComposition(members);

      expect(result.distribution.carry).toBe(2);
      expect(result.composition_score).toBeLessThanOrEqual(90);
      expect(result.is_valid).toBe(false);
    });

    it('should handle case-insensitive role names', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'CARRY' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'MID' },
      ];

      const result = analyzeTeamComposition(members);

      expect(result.distribution.carry).toBe(1);
      expect(result.distribution.mid).toBe(1);
    });

    it('should handle role names with hyphens', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u2', username: 'Player2', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const result = analyzeTeamComposition(members);

      expect(result.distribution.hard_support).toBe(1);
      expect(result.distribution.soft_support).toBe(1);
    });

    it('should have role balance score as percentage', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const result = analyzeTeamComposition(members);

      expect(result.role_balance_score).toBeGreaterThanOrEqual(0);
      expect(result.role_balance_score).toBeLessThanOrEqual(100);
    });

    it('should handle empty team', () => {
      const members: TeamMember[] = [];
      const result = analyzeTeamComposition(members);

      expect(result.distribution.carry).toBe(0);
      expect(result.is_valid).toBe(false);
    });

    it('should handle single member team', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
      ];

      const result = analyzeTeamComposition(members);

      expect(result.distribution.carry).toBe(1);
      expect(result.is_valid).toBe(false);
    });
  });

  /**
   * Test Suite 2: Team Synergy Calculation (8 tests)
   */
  describe('calculateTeamSynergy', () => {
    it('should calculate synergy for complete team', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const result = calculateTeamSynergy(members);

      expect(result.synergy_score).toBeGreaterThan(0);
      expect(result.synergy_score).toBeLessThanOrEqual(100);
      expect(result.role_synergy).toBeGreaterThan(0);
      expect(result.hero_synergy).toBeGreaterThan(0);
    });

    it('should reward having all core roles', () => {
      const allRolesTeam: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const incompleteTeam: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
      ];

      const allRolesResult = calculateTeamSynergy(allRolesTeam);
      const incompleteResult = calculateTeamSynergy(incompleteTeam);

      expect(allRolesResult.synergy_score).toBeGreaterThan(
        incompleteResult.synergy_score
      );
    });

    it('should penalize missing hard support', () => {
      const noHardSupportTeam: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const result = calculateTeamSynergy(noHardSupportTeam);

      expect(result.role_synergy).toBeLessThan(70);
    });

    it('should have synergy score in valid range', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const result = calculateTeamSynergy(members);

      expect(result.synergy_score).toBeGreaterThanOrEqual(0);
      expect(result.synergy_score).toBeLessThanOrEqual(100);
    });

    it('should provide breakdown object', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
      ];

      const result = calculateTeamSynergy(members);

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown['role_synergy']).toBeDefined();
      expect(result.breakdown['hero_synergy']).toBeDefined();
    });

    it('should handle empty team', () => {
      const result = calculateTeamSynergy([]);

      expect(result.synergy_score).toBeGreaterThanOrEqual(0);
      expect(result.synergy_score).toBeLessThanOrEqual(100);
    });

    it('should work with hero matchup data', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
      ];

      const heroMatchups = new Map<string, Map<string, number>>();
      const antiMageMatchups = new Map<string, number>();
      antiMageMatchups.set('Invoker', 65); // Good matchup

      heroMatchups.set('Anti-Mage', antiMageMatchups);

      const result = calculateTeamSynergy(members, heroMatchups);

      expect(result.synergy_score).toBeGreaterThan(0);
    });
  });

  /**
   * Test Suite 3: Strength Identification (5 tests)
   */
  describe('identifyTeamStrengths', () => {
    it('should identify strengths for complete team', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const strengths = identifyTeamStrengths(members);

      expect(strengths.length).toBeGreaterThan(0);
      expect(Array.isArray(strengths)).toBe(true);
    });

    it('should include late-game potential for carry', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
      ];

      const strengths = identifyTeamStrengths(members);

      expect(strengths.some((s) => s.includes('late-game'))).toBe(true);
    });

    it('should identify well-balanced composition', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const strengths = identifyTeamStrengths(members);

      expect(strengths.some((s) => s.includes('balanced'))).toBe(true);
    });

    it('should not have duplicate strengths', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const strengths = identifyTeamStrengths(members);
      const uniqueStrengths = new Set(strengths);

      expect(strengths.length).toBe(uniqueStrengths.size);
    });

    it('should return array for empty team', () => {
      const strengths = identifyTeamStrengths([]);

      expect(Array.isArray(strengths)).toBe(true);
    });
  });

  /**
   * Test Suite 4: Weakness Identification (5 tests)
   */
  describe('identifyTeamWeaknesses', () => {
    it('should identify weaknesses for incomplete team', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
      ];

      const weaknesses = identifyTeamWeaknesses(members);

      expect(weaknesses.length).toBeGreaterThan(0);
      expect(weaknesses.some((w) => w.includes('Offlane') || w.includes('support'))).toBe(true);
    });

    it('should detect missing carry', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Invoker', role: 'Mid' },
        { userId: 'u2', username: 'Player2', hero: 'Earthshaker', role: 'Offlane' },
      ];

      const weaknesses = identifyTeamWeaknesses(members);

      expect(weaknesses.some((w) => w.includes('carry'))).toBe(true);
    });

    it('should detect multiple carries', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Drow-Ranger', role: 'Carry' },
        { userId: 'u3', username: 'Player3', hero: 'Pudge', role: 'Hard-Support' },
      ];

      const weaknesses = identifyTeamWeaknesses(members);

      expect(weaknesses.some((w) => w.includes('carries'))).toBe(true);
    });

    it('should not have duplicate weaknesses', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
      ];

      const weaknesses = identifyTeamWeaknesses(members);
      const uniqueWeaknesses = new Set(weaknesses);

      expect(weaknesses.length).toBe(uniqueWeaknesses.size);
    });

    it('should return array for complete team (no weaknesses)', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const weaknesses = identifyTeamWeaknesses(members);

      expect(Array.isArray(weaknesses)).toBe(true);
    });
  });

  /**
   * Test Suite 5: Team Recommendations (4 tests)
   */
  describe('generateTeamRecommendations', () => {
    it('should generate recommendations for incomplete team', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
      ];

      const recommendations = generateTeamRecommendations(members);

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should recommend adding carry if missing', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Invoker', role: 'Mid' },
      ];

      const recommendations = generateTeamRecommendations(members);

      expect(recommendations.some((r) => r.includes('carry'))).toBe(true);
    });

    it('should recommend fixing multiple carries', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Drow-Ranger', role: 'Carry' },
      ];

      const recommendations = generateTeamRecommendations(members);

      expect(recommendations.some((r) => r.includes('carries'))).toBe(true);
    });

    it('should not have duplicate recommendations', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
      ];

      const recommendations = generateTeamRecommendations(members);
      const uniqueRecommendations = new Set(recommendations);

      expect(recommendations.length).toBe(uniqueRecommendations.size);
    });
  });

  /**
   * Test Suite 6: Team Skill Level Analysis (4 tests)
   */
  describe('analyzeTeamSkillLevel', () => {
    it('should calculate average MMR', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry', mmr: 5000 },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid', mmr: 6000 },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane', mmr: 4000 },
      ];

      const result = analyzeTeamSkillLevel(members);

      expect(result.avg_mmr).toBe(5000);
    });

    it('should calculate total MMR', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry', mmr: 5000 },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid', mmr: 5000 },
      ];

      const result = analyzeTeamSkillLevel(members);

      expect(result.total_mmr).toBe(10000);
    });

    it('should categorize players by skill tier', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry', mmr: 2500 },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid', mmr: 4500 },
      ];

      const result = analyzeTeamSkillLevel(members);

      expect(result.skill_distribution.length).toBeGreaterThan(0);
    });

    it('should determine balance status', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry', mmr: 5000 },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid', mmr: 5200 },
      ];

      const result = analyzeTeamSkillLevel(members);

      expect(result.balance).toBeDefined();
      expect(['Balanced', 'Somewhat imbalanced', 'Imbalanced', 'Highly imbalanced']).toContain(
        result.balance
      );
    });
  });

  /**
   * Test Suite 7: Complete Team Analysis (3 tests)
   */
  describe('analyzeCompleteTeam', () => {
    it('should return complete team analysis', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const analysis = analyzeCompleteTeam(members, 'Team Radiant');

      expect(analysis.team_name).toBe('Team Radiant');
      expect(analysis.members).toEqual(members);
      expect(analysis.composition_score).toBeGreaterThan(0);
      expect(analysis.synergy_score).toBeGreaterThan(0);
      expect(Array.isArray(analysis.strengths)).toBe(true);
      expect(Array.isArray(analysis.weaknesses)).toBe(true);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it('should handle team without name', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
      ];

      const analysis = analyzeCompleteTeam(members);

      expect(analysis.team_name).toBeUndefined();
    });

    it('should provide role distribution in analysis', () => {
      const members: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
      ];

      const analysis = analyzeCompleteTeam(members);

      expect(analysis.role_distribution.carry).toBe(1);
      expect(analysis.role_distribution.mid).toBe(1);
    });
  });

  /**
   * Test Suite 8: Team Comparison (3 tests)
   */
  describe('compareTeams', () => {
    it('should compare two teams', () => {
      const team1: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry', mmr: 6000 },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid', mmr: 6000 },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane', mmr: 5000 },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support', mmr: 5000 },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support', mmr: 5000 },
      ];

      const team2: TeamMember[] = [
        { userId: 'u6', username: 'Player6', hero: 'Phantom-Assassin', role: 'Carry', mmr: 5000 },
        { userId: 'u7', username: 'Player7', hero: 'Puck', role: 'Mid', mmr: 5000 },
        { userId: 'u8', username: 'Player8', hero: 'Dark-Seer', role: 'Offlane', mmr: 4000 },
        { userId: 'u9', username: 'Player9', hero: 'Bane', role: 'Hard-Support', mmr: 4000 },
        { userId: 'u10', username: 'Player10', hero: 'Enchantress', role: 'Soft-Support', mmr: 4000 },
      ];

      const comparison = compareTeams(team1, team2, 'Team Radiant', 'Team Dire');

      expect(comparison.team1_analysis).toBeDefined();
      expect(comparison.team2_analysis).toBeDefined();
      expect(comparison.comparison.overall_winner).toBeDefined();
    });

    it('should identify skill advantage', () => {
      const team1: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry', mmr: 7000 },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid', mmr: 7000 },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane', mmr: 6000 },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support', mmr: 6000 },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support', mmr: 6000 },
      ];

      const team2: TeamMember[] = [
        { userId: 'u6', username: 'Player6', hero: 'Phantom-Assassin', role: 'Carry', mmr: 4000 },
        { userId: 'u7', username: 'Player7', hero: 'Puck', role: 'Mid', mmr: 4000 },
        { userId: 'u8', username: 'Player8', hero: 'Dark-Seer', role: 'Offlane', mmr: 3000 },
        { userId: 'u9', username: 'Player9', hero: 'Bane', role: 'Hard-Support', mmr: 3000 },
        { userId: 'u10', username: 'Player10', hero: 'Enchantress', role: 'Soft-Support', mmr: 3000 },
      ];

      const comparison = compareTeams(team1, team2, 'HighMMR', 'LowMMR');

      expect(comparison.comparison.skill_advantage).toBe('HighMMR');
    });

    it('should provide all comparison metrics', () => {
      const team1: TeamMember[] = [
        { userId: 'u1', username: 'Player1', hero: 'Anti-Mage', role: 'Carry' },
        { userId: 'u2', username: 'Player2', hero: 'Invoker', role: 'Mid' },
        { userId: 'u3', username: 'Player3', hero: 'Earthshaker', role: 'Offlane' },
        { userId: 'u4', username: 'Player4', hero: 'Pudge', role: 'Hard-Support' },
        { userId: 'u5', username: 'Player5', hero: 'Windranger', role: 'Soft-Support' },
      ];

      const team2: TeamMember[] = [
        { userId: 'u6', username: 'Player6', hero: 'Phantom-Assassin', role: 'Carry' },
        { userId: 'u7', username: 'Player7', hero: 'Puck', role: 'Mid' },
        { userId: 'u8', username: 'Player8', hero: 'Dark-Seer', role: 'Offlane' },
        { userId: 'u9', username: 'Player9', hero: 'Bane', role: 'Hard-Support' },
        { userId: 'u10', username: 'Player10', hero: 'Enchantress', role: 'Soft-Support' },
      ];

      const comparison = compareTeams(team1, team2);

      expect(comparison.comparison.composition_advantage).toBeDefined();
      expect(comparison.comparison.role_balance_advantage).toBeDefined();
      expect(comparison.comparison.synergy_advantage).toBeDefined();
      expect(comparison.comparison.skill_advantage).toBeDefined();
      expect(comparison.comparison.overall_winner).toBeDefined();
    });
  });
});
