import { describe, it, expect } from 'vitest';
import {
  createDrillDownButtons,
  createComparisonButtons,
  createTimeRangeButtons,
  createHeroSelectionMenu,
  createAnalysisDepthButtons,
  createMetricSelectionButtons,
  createFeedbackButtons,
  createPaginationButtons,
  createActionButtons,
  createRoleFilterButtons,
  createSortButtons,
} from '../../src/utils/advancedButtons.js';
import { ActionRowBuilder } from 'discord.js';

describe('advancedButtons', () => {
  const locale = 'en' as const;
  const baseId = 'test_button';

  describe('Button Creation', () => {
    it('should create drill-down buttons', () => {
      const buttons = createDrillDownButtons(locale, baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
      expect(buttons.components).toHaveLength(4);
    });

    it('should create comparison buttons', () => {
      const buttons = createComparisonButtons(locale, baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
      expect(buttons.components).toHaveLength(4);
    });

    it('should create time range buttons', () => {
      const buttons = createTimeRangeButtons(locale, baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
      expect(buttons.components).toHaveLength(4);
    });

    it('should create analysis depth buttons', () => {
      const buttons = createAnalysisDepthButtons(locale, baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
      expect(buttons.components).toHaveLength(4);
    });

    it('should create feedback buttons', () => {
      const buttons = createFeedbackButtons(locale, baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
      expect(buttons.components).toHaveLength(4);
    });

    it('should create action buttons', () => {
      const buttons = createActionButtons(locale, baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
      expect(buttons.components).toHaveLength(4);
    });

    it('should create role filter buttons', () => {
      const buttons = createRoleFilterButtons(locale, baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
      expect(buttons.components).toHaveLength(4);
    });

    it('should create sort buttons', () => {
      const buttons = createSortButtons(locale, baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
      expect(buttons.components).toHaveLength(4);
    });
  });

  describe('Metric Selection', () => {
    it('should create 2 rows of metric buttons', () => {
      const buttons = createMetricSelectionButtons(locale, baseId);
      expect(buttons).toHaveLength(2);
      buttons.forEach((row) => {
        expect(row).toBeInstanceOf(ActionRowBuilder);
        expect(row.components).toHaveLength(4);
      });
    });

    it('should have core metrics in first row', () => {
      const buttons = createMetricSelectionButtons(locale, baseId);
      expect(buttons[0]).toBeDefined();
      expect(buttons[0]?.components).toHaveLength(4);
    });

    it('should have advanced metrics in second row', () => {
      const buttons = createMetricSelectionButtons(locale, baseId);
      expect(buttons[1]).toBeDefined();
      expect(buttons[1]?.components).toHaveLength(4);
    });
  });

  describe('Hero Selection Menu', () => {
    it('should create hero selection menu', () => {
      const heroes = [
        { id: '1', name: 'Antimage', games: 50 },
        { id: '2', name: 'Axe', games: 35 },
      ];
      const menu = createHeroSelectionMenu(locale, heroes, baseId);
      expect(menu).toBeInstanceOf(ActionRowBuilder);
      expect(menu.components).toHaveLength(1);
    });

    it('should handle 25+ heroes by limiting to 25', () => {
      const heroes = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        name: `Hero ${i}`,
        games: i,
      }));
      const menu = createHeroSelectionMenu(locale, heroes, baseId);
      expect(menu.components).toHaveLength(1);
    });

    it('should handle empty hero list', () => {
      const menu = createHeroSelectionMenu(locale, [], baseId);
      expect(menu.components).toHaveLength(1);
    });
  });

  describe('Pagination Buttons', () => {
    it('should disable prev buttons on first page', () => {
      const buttons = createPaginationButtons(locale, baseId, 1, 5);
      expect(buttons.components).toHaveLength(5);
    });

    it('should disable next buttons on last page', () => {
      const buttons = createPaginationButtons(locale, baseId, 5, 5);
      expect(buttons.components).toHaveLength(5);
    });

    it('should show current page information', () => {
      const buttons = createPaginationButtons(locale, baseId, 3, 10);
      expect(buttons.components).toHaveLength(5);
    });

    it('should enable all navigation on middle page', () => {
      const buttons = createPaginationButtons(locale, baseId, 3, 10);
      expect(buttons.components).toHaveLength(5);
    });

    it('should handle single page', () => {
      const buttons = createPaginationButtons(locale, baseId, 1, 1);
      expect(buttons.components).toHaveLength(5);
    });
  });

  describe('Locale Support', () => {
    it('should work with en locale', () => {
      const buttons = createDrillDownButtons('en', baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
    });

    it('should work with pt locale', () => {
      const buttons = createDrillDownButtons('pt', baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
    });

    it('should work with es locale', () => {
      const buttons = createDrillDownButtons('es', baseId);
      expect(buttons).toBeInstanceOf(ActionRowBuilder);
    });
  });

  describe('Custom ID Generation', () => {
    it('should include base ID in custom IDs', () => {
      const buttons = createDrillDownButtons(locale, 'myid');
      expect(buttons.components).toHaveLength(4);
    });

    it('should create unique custom IDs', () => {
      const buttons = createDrillDownButtons(locale, baseId);
      expect(buttons.components).toHaveLength(4);
    });
  });

  describe('Integration', () => {
    it('should export all button creators', () => {
      expect(createDrillDownButtons).toBeDefined();
      expect(createComparisonButtons).toBeDefined();
      expect(createTimeRangeButtons).toBeDefined();
      expect(createHeroSelectionMenu).toBeDefined();
      expect(createAnalysisDepthButtons).toBeDefined();
      expect(createMetricSelectionButtons).toBeDefined();
      expect(createFeedbackButtons).toBeDefined();
      expect(createPaginationButtons).toBeDefined();
      expect(createActionButtons).toBeDefined();
      expect(createRoleFilterButtons).toBeDefined();
      expect(createSortButtons).toBeDefined();
    });

    it('should handle rapid creation without errors', () => {
      for (let i = 0; i < 100; i++) {
        const buttons = createDrillDownButtons(locale, `id_${i}`);
        expect(buttons.components).toHaveLength(4);
      }
    });
  });
});
