/**
 * DASHBOARD REFACTOR PLAN
 * 
 * Original: dashboard.ts (1093 lines)
 * Goal: Split into 8 focused modules
 * 
 * STRUCTURE:
 * dashboard.ts (70 lines) - Main command export
 * ├── modules/
 * │   ├── embed.ts (200 lines) - Embed building
 * │   ├── buttons.ts (150 lines) - Button definitions
 * │   ├── handlers.ts (450 lines) - Click/Modal handlers
 * │   └── utils.ts (100 lines) - Helper functions
 */

// CURRENT STRUCTURE IN dashboard.ts:
// Lines 1-57:     Imports + initialization
// Lines 58-182:   async execute() - Main dashboard display
// Lines 183-954:  async handleButton() - All button logic
// Lines 955-1093: async handleModal() - All modal logic

// AFTER REFACTOR:
// dashboard.ts:    Only SlashCommandBuilder + execute wrapper
// embed.ts:        createDashboardEmbed()
// buttons.ts:      getActionRows()
// handlers.ts:     handleButton(), handleModal()
// utils.ts:        Helper functions (validateSteamId, etc.)
