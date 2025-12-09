# 💻 APOLO MODERN MENU - NAVIGATION LOGIC & PSEUDOCODE

---

## 🏗️ ARCHITECTURE OVERVIEW

```typescript
/**
 * Modern Menu Architecture (v2.3.0)
 * 
 * Pattern: Hierarchical Navigation
 * Structure: Main Menu (6) → Submenus (5-7 each) → Actions
 * 
 * Folder Structure:
 * src/
 *   ├── commands/
 *   │   └── dashboard.ts          (Main entry point - shows main menu)
 *   ├── handlers/
 *   │   ├── mainMenuHandler.ts    (NEW - routes category buttons)
 *   │   ├── meSubmenuHandler.ts   (NEW - ME submenu logic)
 *   │   ├── improveSubmenuHandler.ts (NEW - IMPROVE submenu logic)
 *   │   ├── matchSubmenuHandler.ts (NEW - MATCH submenu logic)
 *   │   ├── metaSubmenuHandler.ts (NEW - META submenu logic)
 *   │   ├── teamSubmenuHandler.ts (NEW - TEAM submenu logic)
 *   │   └── settingsSubmenuHandler.ts (NEW - SETTINGS submenu logic)
 *   └── utils/
 *       ├── menuBuilder.ts        (NEW - Reusable menu embed builder)
 *       └── navigationRouter.ts   (NEW - Smart button routing)
 */
```

---

## 📝 STEP 1: MAIN MENU BUILDER

```typescript
// src/utils/menuBuilder.ts

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { t } from './i18n.js';

/**
 * Build the main menu dashboard
 * Returns: { embed, components }
 */
export async function buildMainMenu(interaction) {
  const locale = resolveLocale(interaction);
  
  // Main embed
  const embed = new EmbedBuilder()
    .setTitle(t(interaction, 'menu.main_title'))
    .setDescription(t(interaction, 'menu.main_description'))
    .setColor('#5865F2')
    .setThumbnail('https://cdn.discordapp.com/app-icons/[DISCORD_APPLICATION_ID]/[ICON_HASH].png')
    .addFields(
      {
        name: `🟦 ${t(interaction, 'category.me.label')}`,
        value: t(interaction, 'category.me.description'),
        inline: true
      },
      {
        name: `🟪 ${t(interaction, 'category.improve.label')}`,
        value: t(interaction, 'category.improve.description'),
        inline: true
      },
      {
        name: `🟦 ${t(interaction, 'category.match.label')}`,
        value: t(interaction, 'category.match.description'),
        inline: true
      },
      {
        name: `🟩 ${t(interaction, 'category.meta.label')}`,
        value: t(interaction, 'category.meta.description'),
        inline: true
      },
      {
        name: `🟧 ${t(interaction, 'category.team.label')}`,
        value: t(interaction, 'category.team.description'),
        inline: true
      },
      {
        name: `⬜ ${t(interaction, 'category.settings.label')}`,
        value: t(interaction, 'category.settings.description'),
        inline: true
      }
    )
    .setFooter({
      text: `${t(interaction, 'menu.language')}: ${locale.toUpperCase()} | ${t(interaction, 'menu.last_updated')}: ${new Date().toLocaleTimeString(getLocaleCode(locale))}`
    });

  // Button row
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('menu_me')
      .setLabel(t(interaction, 'category.me.label'))
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🟦'),
      
    new ButtonBuilder()
      .setCustomId('menu_improve')
      .setLabel(t(interaction, 'category.improve.label'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🟪'),
      
    new ButtonBuilder()
      .setCustomId('menu_match')
      .setLabel(t(interaction, 'category.match.label'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🟦'),
      
    new ButtonBuilder()
      .setCustomId('menu_meta')
      .setLabel(t(interaction, 'category.meta.label'))
      .setStyle(ButtonStyle.Success)
      .setEmoji('🟩'),
      
    new ButtonBuilder()
      .setCustomId('menu_team')
      .setLabel(t(interaction, 'category.team.label'))
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🟧'),
      
    new ButtonBuilder()
      .setCustomId('menu_settings')
      .setLabel(t(interaction, 'category.settings.label'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('⬜')
  );

  return { embed, components: [row] };
}
```

---

## 📋 STEP 2: MAIN MENU HANDLER

```typescript
// src/handlers/mainMenuHandler.ts

import { ButtonInteraction } from 'discord.js';
import { buildMeSubmenu } from './meSubmenuHandler.js';
import { buildImproveSubmenu } from './improveSubmenuHandler.js';
import { buildMatchSubmenu } from './matchSubmenuHandler.js';
import { buildMetaSubmenu } from './metaSubmenuHandler.js';
import { buildTeamSubmenu } from './teamSubmenuHandler.js';
import { buildSettingsSubmenu } from './settingsSubmenuHandler.js';

/**
 * Route main menu button clicks to appropriate submenu
 */
export async function handleMainMenuButton(interaction: ButtonInteraction) {
  const buttonId = interaction.customId;
  
  try {
    switch (buttonId) {
      case 'menu_me':
        await interaction.deferUpdate();
        const meMenu = await buildMeSubmenu(interaction);
        await interaction.editReply(meMenu);
        break;

      case 'menu_improve':
        await interaction.deferUpdate();
        const improveMenu = await buildImproveSubmenu(interaction);
        await interaction.editReply(improveMenu);
        break;

      case 'menu_match':
        await interaction.deferUpdate();
        const matchMenu = await buildMatchSubmenu(interaction);
        await interaction.editReply(matchMenu);
        break;

      case 'menu_meta':
        await interaction.deferUpdate();
        const metaMenu = await buildMetaSubmenu(interaction);
        await interaction.editReply(metaMenu);
        break;

      case 'menu_team':
        await interaction.deferUpdate();
        const teamMenu = await buildTeamSubmenu(interaction);
        await interaction.editReply(teamMenu);
        break;

      case 'menu_settings':
        await interaction.deferUpdate();
        const settingsMenu = await buildSettingsSubmenu(interaction);
        await interaction.editReply(settingsMenu);
        break;

      default:
        console.warn(`Unknown main menu button: ${buttonId}`);
    }
  } catch (error) {
    console.error(`Error handling main menu button: ${error.message}`);
    await interaction.reply({
      content: '❌ An error occurred. Please try again.',
      ephemeral: true
    });
  }
}
```

---

## 👤 STEP 3: ME SUBMENU HANDLER

```typescript
// src/handlers/meSubmenuHandler.ts

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { t } from '../utils/i18n.js';
import { buildMainMenu } from '../utils/menuBuilder.js';
import { getPlayerProfile } from '../services/stratzService.js';
import { getUserSteamId } from '../database/index.js';

/**
 * Build ME submenu (Account & Statistics)
 */
export async function buildMeSubmenu(interaction) {
  const locale = resolveLocale(interaction);
  const discordId = interaction.user.id;
  
  // Check if user has Steam account linked
  const steamId = await getUserSteamId(discordId);
  
  let subtitle = '';
  if (steamId) {
    try {
      const profile = await getPlayerProfile(steamId);
      subtitle = `${t(interaction, 'status.connected')}: ${profile.steamId} | MMR: ${profile.rank} ${profile.mmr}`;
    } catch (error) {
      subtitle = `${t(interaction, 'status.error')}: Could not fetch profile`;
    }
  } else {
    subtitle = `${t(interaction, 'status.disconnected')}: No Steam account linked`;
  }

  const embed = new EmbedBuilder()
    .setTitle(t(interaction, 'category.me.title'))
    .setDescription(subtitle)
    .setColor('#5865F2');

  // Add field descriptions
  embed.addFields(
    {
      name: `🔗 ${t(interaction, 'category.me.buttons.connect')}`,
      value: t(interaction, 'category.me.buttons.connect_desc'),
      inline: true
    },
    {
      name: `👤 ${t(interaction, 'category.me.buttons.profile')}`,
      value: t(interaction, 'category.me.buttons.profile_desc'),
      inline: true
    },
    {
      name: `📊 ${t(interaction, 'category.me.buttons.last_match')}`,
      value: t(interaction, 'category.me.buttons.last_match_desc'),
      inline: true
    },
    {
      name: `📈 ${t(interaction, 'category.me.buttons.builds')}`,
      value: t(interaction, 'category.me.buttons.builds_desc'),
      inline: true
    },
    {
      name: `🏆 ${t(interaction, 'category.me.buttons.achievements')}`,
      value: t(interaction, 'category.me.buttons.achievements_desc'),
      inline: true
    }
  );

  // Button row for actions
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('submenu_me_connect')
      .setLabel(t(interaction, 'category.me.buttons.connect'))
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🔗'),
      
    new ButtonBuilder()
      .setCustomId('submenu_me_profile')
      .setLabel(t(interaction, 'category.me.buttons.profile'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('👤')
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('submenu_me_lastmatch')
      .setLabel(t(interaction, 'category.me.buttons.last_match'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📊'),
      
    new ButtonBuilder()
      .setCustomId('submenu_me_builds')
      .setLabel(t(interaction, 'category.me.buttons.builds'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📈')
  );

  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('submenu_me_achievements')
      .setLabel(t(interaction, 'category.me.buttons.achievements'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🏆'),
      
    new ButtonBuilder()
      .setCustomId('menu_back')
      .setLabel(t(interaction, 'menu.back'))
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2, row3] };
}

/**
 * Handle ME submenu button clicks
 */
export async function handleMeSubmenuButton(interaction) {
  const buttonId = interaction.customId;
  
  switch (buttonId) {
    case 'submenu_me_connect':
      // Show steam ID modal
      await showSteamConnectionModal(interaction);
      break;

    case 'submenu_me_profile':
      // Show player profile
      await showPlayerProfile(interaction);
      break;

    case 'submenu_me_lastmatch':
      // Show last match
      await showLastMatch(interaction);
      break;

    case 'submenu_me_builds':
      // Show saved builds
      await showSavedBuilds(interaction);
      break;

    case 'submenu_me_achievements':
      // Show achievements
      await showAchievements(interaction);
      break;

    case 'menu_back':
      // Go back to main menu
      await interaction.deferUpdate();
      const mainMenu = await buildMainMenu(interaction);
      await interaction.editReply(mainMenu);
      break;

    default:
      console.warn(`Unknown ME submenu button: ${buttonId}`);
  }
}

// Implementation functions (expand each as needed)
async function showSteamConnectionModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('modal_steam_connect')
    .setTitle('Connect Steam Account');
  
  // Add text input fields for Steam ID/URL
  // Handle modal submission...
}

async function showPlayerProfile(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  const discordId = interaction.user.id;
  const steamId = await getUserSteamId(discordId);
  
  if (!steamId) {
    await interaction.editReply('❌ No Steam account linked. Use Connect first.');
    return;
  }
  
  const profile = await getPlayerProfile(steamId);
  // Build profile embed...
  // Send response...
}

async function showLastMatch(interaction) {
  // Similar pattern: defer, fetch data, send response
}

async function showSavedBuilds(interaction) {
  // Similar pattern
}

async function showAchievements(interaction) {
  // Similar pattern
}
```

---

## 🤖 STEP 4: IMPROVE SUBMENU HANDLER

```typescript
// src/handlers/improveSubmenuHandler.ts

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { t } from '../utils/i18n.js';
import { generateAIAnalysis } from '../services/GeminiService.js';

/**
 * Build IMPROVE submenu (AI Coaching)
 */
export async function buildImproveSubmenu(interaction) {
  const embed = new EmbedBuilder()
    .setTitle(t(interaction, 'category.improve.title'))
    .setDescription(t(interaction, 'category.improve.subtitle'))
    .setColor('#9B59B6') // Purple
    .addFields(
      {
        name: `💡 ${t(interaction, 'category.improve.buttons.quick_tip')}`,
        value: t(interaction, 'category.improve.buttons.quick_tip_desc'),
        inline: true
      },
      {
        name: `📊 ${t(interaction, 'category.improve.buttons.full_report')}`,
        value: t(interaction, 'category.improve.buttons.full_report_desc'),
        inline: true
      },
      {
        name: `✅ ${t(interaction, 'category.improve.buttons.strengths')}`,
        value: t(interaction, 'category.improve.buttons.strengths_desc'),
        inline: true
      },
      {
        name: `⚠️ ${t(interaction, 'category.improve.buttons.weaknesses')}`,
        value: t(interaction, 'category.improve.buttons.weaknesses_desc'),
        inline: true
      },
      {
        name: `📈 ${t(interaction, 'category.improve.buttons.trends')}`,
        value: t(interaction, 'category.improve.buttons.trends_desc'),
        inline: true
      },
      {
        name: `⚖️ ${t(interaction, 'category.improve.buttons.compare')}`,
        value: t(interaction, 'category.improve.buttons.compare_desc'),
        inline: true
      },
      {
        name: `🦸 ${t(interaction, 'category.improve.buttons.hero_guide')}`,
        value: t(interaction, 'category.improve.buttons.hero_guide_desc'),
        inline: true
      }
    );

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('submenu_improve_quicktip')
      .setLabel(t(interaction, 'category.improve.buttons.quick_tip'))
      .setStyle(ButtonStyle.Primary)
      .setEmoji('💡'),
      
    new ButtonBuilder()
      .setCustomId('submenu_improve_fullreport')
      .setLabel(t(interaction, 'category.improve.buttons.full_report'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📊')
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('submenu_improve_strengths')
      .setLabel(t(interaction, 'category.improve.buttons.strengths'))
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
      
    new ButtonBuilder()
      .setCustomId('submenu_improve_weaknesses')
      .setLabel(t(interaction, 'category.improve.buttons.weaknesses'))
      .setStyle(ButtonStyle.Danger)
      .setEmoji('⚠️')
  );

  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('submenu_improve_trends')
      .setLabel(t(interaction, 'category.improve.buttons.trends'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📈'),
      
    new ButtonBuilder()
      .setCustomId('submenu_improve_compare')
      .setLabel(t(interaction, 'category.improve.buttons.compare'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('⚖️')
  );

  const row4 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('submenu_improve_heroguide')
      .setLabel(t(interaction, 'category.improve.buttons.hero_guide'))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🦸'),
      
    new ButtonBuilder()
      .setCustomId('menu_back')
      .setLabel(t(interaction, 'menu.back'))
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2, row3, row4] };
}

/**
 * Handle IMPROVE submenu button clicks
 * All AI responses go to DM (ephemeral) for privacy
 */
export async function handleImproveSubmenuButton(interaction) {
  const buttonId = interaction.customId;
  
  const discordId = interaction.user.id;
  const steamId = await getUserSteamId(discordId);
  
  if (!steamId) {
    await interaction.reply({
      content: '❌ Connect your Steam account first!',
      ephemeral: true
    });
    return;
  }

  try {
    switch (buttonId) {
      case 'submenu_improve_quicktip':
        await interaction.deferReply({ ephemeral: true });
        const quickTip = await generateAIAnalysis(steamId, 'quick_tip', interaction);
        await interaction.editReply(quickTip);
        break;

      case 'submenu_improve_fullreport':
        await interaction.deferReply({ ephemeral: true });
        const fullReport = await generateAIAnalysis(steamId, 'full_report', interaction);
        await interaction.editReply(fullReport);
        break;

      case 'submenu_improve_strengths':
        await interaction.deferReply({ ephemeral: true });
        const strengths = await generateAIAnalysis(steamId, 'strengths', interaction);
        await interaction.editReply(strengths);
        break;

      case 'submenu_improve_weaknesses':
        await interaction.deferReply({ ephemeral: true });
        const weaknesses = await generateAIAnalysis(steamId, 'weaknesses', interaction);
        await interaction.editReply(weaknesses);
        break;

      case 'submenu_improve_trends':
        await interaction.deferReply({ ephemeral: true });
        const trends = await generateAIAnalysis(steamId, 'trends', interaction);
        await interaction.editReply(trends);
        break;

      case 'submenu_improve_compare':
        await interaction.deferReply({ ephemeral: true });
        const compare = await generateAIAnalysis(steamId, 'compare', interaction);
        await interaction.editReply(compare);
        break;

      case 'submenu_improve_heroguide':
        await interaction.deferReply({ ephemeral: true });
        const heroGuide = await generateAIAnalysis(steamId, 'hero_guide', interaction);
        await interaction.editReply(heroGuide);
        break;

      case 'menu_back':
        await interaction.deferUpdate();
        const menu = await buildImproveSubmenu(interaction);
        await interaction.editReply(menu);
        break;

      default:
        console.warn(`Unknown IMPROVE submenu button: ${buttonId}`);
    }
  } catch (error) {
    console.error(`Error in IMPROVE submenu: ${error.message}`);
    await interaction.editReply('❌ Error generating analysis. Please try again.');
  }
}
```

---

## 📊 STEP 5: MATCH SUBMENU (Similar Pattern)

```typescript
// src/handlers/matchSubmenuHandler.ts

export async function buildMatchSubmenu(interaction) {
  // Similar structure to IMPROVE
  // Buttons: Last Match, History, Search, Trends, Best Games, Win Streak, Compare
  // Each button fetches match data and displays in embed
}

export async function handleMatchSubmenuButton(interaction) {
  // Route to appropriate match handler
  switch (buttonId) {
    case 'submenu_match_lastmatch':
      await showLastMatchAnalysis(interaction);
      break;
    case 'submenu_match_history':
      await showMatchHistory(interaction);
      break;
    // ... etc
  }
}
```

---

## 🎯 STEP 6: META SUBMENU (Similar Pattern)

```typescript
// src/handlers/metaSubmenuHandler.ts

export async function buildMetaSubmenu(interaction) {
  // Similar structure
  // Buttons: Carry Meta, Mid Meta, Off Meta, Support Meta, Hero Build, Counter Matrix, Patch Notes
}

export async function handleMetaSubmenuButton(interaction) {
  switch (buttonId) {
    case 'submenu_meta_carry':
      await showCarryMeta(interaction);
      break;
    case 'submenu_meta_mid':
      await showMidMeta(interaction);
      break;
    // ... Modal for hero selection when needed
  }
}
```

---

## 👥 STEP 7: TEAM SUBMENU (With Voice Integration)

```typescript
// src/handlers/teamSubmenuHandler.ts

export async function buildTeamSubmenu(interaction) {
  // Similar structure
  // Buttons: Balance Team, Team Analyzer, Draft Sim, Find Duo, Position Guide, Team Stats
}

export async function handleTeamSubmenuButton(interaction) {
  switch (buttonId) {
    case 'submenu_team_balance':
      // Check if user is in voice channel
      const voiceChannel = interaction.member?.voice?.channel;
      if (!voiceChannel) {
        await interaction.reply({
          content: '❌ You must be in a voice channel to use this feature!',
          ephemeral: true
        });
        return;
      }
      
      await interaction.deferReply({ ephemeral: true });
      
      // Get all members in voice channel
      const members = voiceChannel.members;
      
      // Fetch MMR for each member
      const teams = await balanceTeamByMMR(members, interaction);
      
      // Move players to designated channels (if provided)
      // Show results
      break;

    case 'submenu_team_analyzer':
      // Show modal for hero selection
      await showTeamAnalyzerModal(interaction);
      break;

    case 'submenu_team_draftsim':
      // Show draft simulator interface
      await showDraftSimulator(interaction);
      break;

    // ... etc
  }
}
```

---

## ⚙️ STEP 8: SETTINGS SUBMENU

```typescript
// src/handlers/settingsSubmenuHandler.ts

export async function buildSettingsSubmenu(interaction) {
  const locale = resolveLocale(interaction);
  
  const embed = new EmbedBuilder()
    .setTitle(t(interaction, 'category.settings.title'))
    .setDescription(`${t(interaction, 'menu.language')}: ${locale.toUpperCase()} | ${t(interaction, 'menu.last_updated')}: ${new Date().toLocaleTimeString()}`)
    .setColor('#72767D'); // Gray

  // Buttons for language selection, refresh, help, about, status, etc.
}

export async function handleSettingsSubmenuButton(interaction) {
  switch (buttonId) {
    case 'submenu_settings_language':
      // Show language selection buttons (PT/EN/ES)
      await showLanguageSelector(interaction);
      break;

    case 'submenu_settings_refresh':
      // Refresh entire menu
      await interaction.deferUpdate();
      const menu = await buildMainMenu(interaction);
      await interaction.editReply(menu);
      break;

    case 'submenu_settings_help':
      // Show help information
      await showHelpMenu(interaction);
      break;

    // ... etc
  }
}
```

---

## 🔗 STEP 9: MAIN DASHBOARD.TS UPDATE

```typescript
// src/commands/dashboard.ts (Updated)

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { buildMainMenu } from '../utils/menuBuilder.js';
import { handleMainMenuButton } from '../handlers/mainMenuHandler.js';
import { handleMeSubmenuButton } from '../handlers/meSubmenuHandler.js';
// ... import all other handlers

export const data = new SlashCommandBuilder()
  .setName('dashboard')
  .setDescription('Open the APOLO tactical dashboard');

export async function execute(interaction) {
  try {
    // Build and display main menu
    const { embeds, components } = await buildMainMenu(interaction);
    
    await interaction.reply({
      embeds,
      components,
      ephemeral: false // Make it visible to all (change if needed)
    });
  } catch (error) {
    console.error(`Error in dashboard command: ${error.message}`);
    await interaction.reply({
      content: '❌ Error loading dashboard. Please try again.',
      ephemeral: true
    });
  }
}

/**
 * Handle all button interactions from modern menu
 * Called from main bot event handler
 */
export async function handleButton(interaction) {
  const buttonId = interaction.customId;

  // Route to appropriate handler based on button ID prefix
  if (buttonId.startsWith('menu_')) {
    await handleMainMenuButton(interaction);
  } else if (buttonId.startsWith('submenu_me_')) {
    await handleMeSubmenuButton(interaction);
  } else if (buttonId.startsWith('submenu_improve_')) {
    await handleImproveSubmenuButton(interaction);
  } else if (buttonId.startsWith('submenu_match_')) {
    await handleMatchSubmenuButton(interaction);
  } else if (buttonId.startsWith('submenu_meta_')) {
    await handleMetaSubmenuButton(interaction);
  } else if (buttonId.startsWith('submenu_team_')) {
    await handleTeamSubmenuButton(interaction);
  } else if (buttonId.startsWith('submenu_settings_')) {
    await handleSettingsSubmenuButton(interaction);
  } else {
    console.warn(`Unknown button ID: ${buttonId}`);
  }
}
```

---

## 🤖 STEP 10: BOT INDEX.TS UPDATE

```typescript
// src/index.ts (Updated to use new handlers)

import { Events } from 'discord.js';
import { commands } from './commands/index.js';

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  try {
    // Get the dashboard command
    const dashboardCommand = commands.get('dashboard');
    
    if (dashboardCommand && dashboardCommand.handleButton) {
      await dashboardCommand.handleButton(interaction);
    }
  } catch (error) {
    console.error(`Error handling button interaction: ${error}`);
    await interaction.reply({
      content: '❌ An error occurred.',
      ephemeral: true
    });
  }
});
```

---

## 📊 SUMMARY: FILE STRUCTURE

```
src/
├── commands/
│   └── dashboard.ts (UPDATED - exports handleButton)
│
├── handlers/
│   ├── mainMenuHandler.ts (NEW)
│   ├── meSubmenuHandler.ts (NEW)
│   ├── improveSubmenuHandler.ts (NEW)
│   ├── matchSubmenuHandler.ts (NEW)
│   ├── metaSubmenuHandler.ts (NEW)
│   ├── teamSubmenuHandler.ts (NEW)
│   └── settingsSubmenuHandler.ts (NEW)
│
└── utils/
    └── menuBuilder.ts (NEW)
```

---

## 🚀 IMPLEMENTATION CHECKLIST

- [ ] Create `menuBuilder.ts` with `buildMainMenu()`
- [ ] Create `mainMenuHandler.ts` with routing logic
- [ ] Create `meSubmenuHandler.ts` with 5 buttons
- [ ] Create `improveSubmenuHandler.ts` with 7 AI buttons
- [ ] Create `matchSubmenuHandler.ts` with 7 analysis buttons
- [ ] Create `metaSubmenuHandler.ts` with 7 meta buttons
- [ ] Create `teamSubmenuHandler.ts` with 6 team buttons
- [ ] Create `settingsSubmenuHandler.ts` with 7 settings buttons
- [ ] Update `dashboard.ts` to use new `buildMainMenu()`
- [ ] Add `handleButton()` export to `dashboard.ts`
- [ ] Update `index.ts` to call new button handler
- [ ] Add all translation keys (180+) to locale files
- [ ] Test all navigation paths
- [ ] Test responsive layout on mobile
- [ ] Deploy v2.3.0

---

## 🧪 TESTING CHECKLIST

```
Main Menu:
  [ ] All 6 buttons visible and clickable
  [ ] Colors match design (blue, purple, green, orange, gray)
  [ ] Descriptions display correctly

ME Submenu:
  [ ] Back button returns to main menu
  [ ] All 5 buttons work correctly
  [ ] Connect modal appears when clicked
  [ ] Profile displays if connected

IMPROVE Submenu:
  [ ] All 7 AI buttons trigger responses
  [ ] Responses appear in ephemeral mode
  [ ] Locale is respected in responses

MATCH Submenu:
  [ ] All 7 analysis buttons work
  [ ] Data displays in proper format

META Submenu:
  [ ] Meta data displays correctly
  [ ] Hero selection modal works

TEAM Submenu:
  [ ] Voice channel detection works
  [ ] Team balancing executes correctly
  [ ] Players are moved to correct channels

SETTINGS Submenu:
  [ ] Language selector shows 3 options
  [ ] Refresh button updates menu
  [ ] Help displays correctly

Mobile:
  [ ] Menu stacks vertically
  [ ] Buttons are properly sized
  [ ] No horizontal scrolling needed
```

---

**Version:** v2.3.0 (Navigation Logic)
**Complexity:** Medium-High
**Est. Dev Time:** 24-36 hours
**Status:** Ready for Implementation

