/**
 * APOLO DOTA 2 BOT - Main Entry Point
 * 
 * Enterprise-grade Discord bot for Dota 2 tactical analysis
 * Features: Match analysis, AI coaching, team balancing, multi-language support
 * 
 * @version 2.0.0
 * @author APOLO Team
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  Interaction,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  Message,
  ChannelType,
} from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import pool from './database/index.js';
import { safeReply, safeEdit, safeDefer, safeUpdate } from './utils/interactionGuard.js';
import { resolveLocale } from './utils/i18n.js';
import { i18nService } from './I18nService.js';
import logger from './utils/logger.js';
import { redisService } from './services/RedisService.js';
import { isValidSteamId } from './utils/validation.js';
import { startMetricsServer } from './server.js';
import { 
  updateDiscordMetrics, 
  updateRedisConnectionState, 
  discordEventsCounter 
} from './services/MetricsService.js';
import { trackCommandLatency, createInteractionTracker } from './utils/commandLatencyTracker.js';

// Import V2.0 Handler Modules
import { handleModalSubmit as handleV2ModalSubmit } from './handlers/modalHandler.js';

import type { Command } from './types/dota.js';

// ES Module directory resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Extended Discord Client with commands Collection
interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
}

let isShuttingDown = false;

async function gracefulShutdown(exitCode = 0): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ exitCode }, 'Graceful shutdown initiated');

  try {
    await Promise.allSettled([
      (async () => {
        if (client) {
          await client.destroy();
          logger.info('Discord client destroyed');
        }
      })(),
      (async () => {
        await pool.end();
        logger.info('PostgreSQL pool closed');
      })(),
      (async () => {
        await redisService.disconnect();
      })(),
    ]);
  } catch (error) {
    logger.error({ error }, 'Error during graceful shutdown');
  } finally {
    process.exit(exitCode);
  }
}

/* ============================================
 * GLOBAL ERROR HANDLING
 * ============================================ */

process.on('unhandledRejection', (error: Error) => {
  logger.error({
    event: 'unhandled_rejection',
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error: Error) => {
  logger.fatal({
    event: 'uncaught_exception',
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  }, 'Uncaught exception');
  void gracefulShutdown(1);
});

/* ============================================
 * INITIALIZE SERVICES
 * ============================================ */

logger.info('🚀 Starting APOLO Dota 2 Bot...');

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    logger.warn({ signal }, 'Received shutdown signal');
    void gracefulShutdown(0);
  });
});

// Test database connection
try {
  await pool.query('SELECT NOW()');
  logger.info('✅ Connected to PostgreSQL database');
} catch (error) {
  logger.fatal({ error }, '❌ Database connection failed');
  process.exit(1);
}

/* ============================================
 * CREATE DISCORD CLIENT
 * ============================================ */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates, // Required for team balancer
  ],
}) as ExtendedClient;

// Initialize commands collection
client.commands = new Collection<string, Command>();

/* ============================================
 * LOAD COMMANDS DYNAMICALLY
 * ============================================ */

const commandsPath = join(__dirname, 'commands');

// Load both .ts and .js files to support mixed development
const allFiles = readdirSync(commandsPath);
const commandFiles = allFiles.filter(
  (file) => file.endsWith('.ts') || file.endsWith('.js')
);

logger.info({ total: commandFiles.length }, '📂 Loading command files');

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  try {
    const commandModule = (await import(`file://${filePath}`)) as { default: Command };
    const command = commandModule.default;

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      logger.info({ command: command.data.name }, '✅ Loaded command');
    } else {
      logger.warn({ filePath }, '⚠️ Command missing data or execute');
    }
  } catch (error) {
    logger.error({ file, error }, '❌ Failed to load command');
  }
}

/* ============================================
 * EVENT: BOT READY
 * ============================================ */

client.once(Events.ClientReady, () => {
  void (async () => {
    if (!client.user) {
      logger.error('❌ Client user is null');
      return;
    }

    logger.info({ tag: client.user.tag }, '🤖 Bot online');
    logger.info({ servers: client.guilds.cache.size }, '📊 Serving servers');

    // Load language preferences for all guilds
    logger.info('🌍 Loading guild language preferences...');
    let loadedCount = 0;
    for (const guild of client.guilds.cache.values()) {
      try {
        // Try to load existing locale
        const result = await pool.query(
          'SELECT locale FROM guild_settings WHERE guild_id = $1',
          [guild.id]
        );
        
        // If no locale configured, set default to Portuguese
        if (!result.rows || result.rows.length === 0) {
          await pool.query(
            `INSERT INTO guild_settings (guild_id, locale, created_at, updated_at)
             VALUES ($1, 'pt', NOW(), NOW())`,
            [guild.id]
          );
            logger.info({ guildId: guild.id, guildName: guild.name }, '🇧🇷 Auto-configured guild to Portuguese');
        } else {
            logger.info({ guildId: guild.id, guildName: guild.name, locale: result.rows[0]?.locale || 'pt' }, '🌍 Loaded guild locale');
        }
        
        loadedCount++;
      } catch (error) {
          logger.error({ guildId: guild.id, error }, '❌ Failed to load locale for guild');
    }
  }
    logger.info({ loadedCount }, '✅ Loaded guild locale preferences');

    logger.info('🎉 Bot fully initialized and ready!');
    
    // Start Prometheus metrics server
    startMetricsServer();
    
    // Update initial Discord metrics
    const guildsCount = client.guilds.cache.size;
    const usersCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    updateDiscordMetrics(guildsCount, usersCount);
    
    // Update Redis connection state
    updateRedisConnectionState(true);
    
    // Update Discord metrics every 60 seconds
    setInterval(() => {
      const guildsCount = client.guilds.cache.size;
      const usersCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      updateDiscordMetrics(guildsCount, usersCount);
    }, 60000);
  })();
});

/* ============================================
 * EVENT: INTERACTION CREATE
 * ============================================ */

client.on(Events.InteractionCreate, (interaction: Interaction) => {
    // Track Discord event
    discordEventsCounter.inc({ event: 'interactionCreate' });
  
  void (async () => {
    try {
      // Handle slash commands
      if (interaction.isChatInputCommand()) {
        await handleSlashCommand(interaction);
      }
      // Handle button interactions
      else if (interaction.isButton()) {
        // Dashboard buttons (connect, profile, match, ai, etc)
        if (interaction.customId.startsWith('dashboard_')) {
          const dashboardCommand = client.commands.get('dashboard');
          if (dashboardCommand?.handleButton) {
            await dashboardCommand.handleButton(interaction);
          } else {
            logger.error('❌ Dashboard command handleButton method not found');
          }
        } else {
          // Fallback to legacy handlers
          await handleButtonInteraction(interaction);
        }
      }
      // Handle modal submissions
      else if (interaction.isModalSubmit()) {
        // Try V2.0 handlers first (new modals)
        if (interaction.customId.startsWith('modal_')) {
          await handleV2ModalSubmit(interaction);
        } else {
          // Fallback to legacy handlers
          await handleModalSubmit(interaction);
        }
      }
    } catch (error) {
      logger.error({
        type: interaction.type,
        customId: 'customId' in interaction ? interaction.customId : 'N/A',
        error: error instanceof Error ? error.message : String(error),
      }, '❌ Error in interactionCreate handler');

      // Attempt to send error message to user
      try {
        await safeReply(interaction, {
          content: '❌ An unexpected error occurred. Please try again.',
          ephemeral: true,
        });
      } catch (replyError) {
        logger.error({ error: replyError }, '❌ Failed to send error reply');
      }
    }
  })();
});

/* ============================================
 * SLASH COMMAND HANDLER
 * ============================================ */

async function handleSlashCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`❌ No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    // Track command latency and execution time
    const tracker = createInteractionTracker(interaction);
    await trackCommandLatency(interaction.commandName, interaction.guildId, () => command.execute(interaction));
    tracker.end('success');
  } catch (error) {
    console.error(`❌ Error executing ${interaction.commandName}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorMessage = {
      content: '❌ Error executing command!',
      ephemeral: true,
    };

    await safeReply(interaction, errorMessage);
  }
}

/* ============================================
 * BUTTON INTERACTION HANDLER
 * ============================================ */

async function handleButtonInteraction(
  interaction: ButtonInteraction
): Promise<void> {
  const customId = interaction.customId;
  const tracker = createInteractionTracker(interaction);

  try {
    // Connect Steam button
    if (customId === 'connect_steam_button') {
      const connectCommand = client.commands.get('connectsteamaccount');
      if (connectCommand?.handleButton) {
        await connectCommand.handleButton(interaction);
      }
      tracker.end('success');
      return;
    }

    // Confirm Steam link
    if (customId.startsWith('confirm_steam_')) {
      await handleConfirmSteamLink(interaction, customId);
      tracker.end('success');
      return;
    }

  // Cancel Steam link
  if (customId === 'cancel_steam') {
    await safeUpdate(interaction, {
      content: '❌ Steam account linking cancelled.',
      embeds: [],
      components: [],
    });
    return;
  }

  // Dashboard buttons
  if (customId.startsWith('dashboard_')) {
    const dashboardCommand = client.commands.get('dashboard');
    if (dashboardCommand?.handleButton) {
      await dashboardCommand.handleButton(interaction);
    }
    return;
  }

  // Meta buttons (position and bracket selection)
  if (customId.startsWith('meta_')) {
    await handleMetaButton(interaction, customId);
    return;
  }

  // Build buttons (hero selection)
  if (customId.startsWith('build_')) {
    await handleBuildButton(interaction, customId);
    return;
  }

  // AI Assistant buttons (pre-made questions)
  if (customId.startsWith('ai_')) {
    await handleAiButton(interaction, customId);
    return;
  }

  // Remove structure buttons (confirm/cancel)
  if (
    customId === 'confirm_remove_structure' ||
    customId === 'cancel_remove_structure'
  ) {
    const removeCommand = client.commands.get('remove-apolo-structure');
    if (removeCommand?.handleButton) {
      await removeCommand.handleButton(interaction);
    }
    return;
  }

  logger.warn({ customId }, '⚠️ Unhandled button interaction');
  } catch (error) {
    tracker.end('error');
    throw error;
  }
}

/* ============================================
 * MODAL SUBMIT HANDLER
 * ============================================ */

async function handleModalSubmit(
  interaction: ModalSubmitInteraction
): Promise<void> {
  const customId = interaction.customId;
  const tracker = createInteractionTracker(interaction);

  try {
    // Connect Steam modal
    if (customId === 'connect_steam_modal') {
      const dashboardCommand = client.commands.get('dashboard');
      if (dashboardCommand?.handleModal) {
        await trackCommandLatency(
          'dashboard_modal_connect',
          interaction.guildId,
          async () => {
            const handler = dashboardCommand.handleModal;
            if (handler) {
              await handler(interaction);
            }
          }
        );
        tracker.end('success');
      }
      return;
    }

    // AI custom question modal
    if (customId === 'ai_custom_modal') {
      await trackCommandLatency(
        'ai_custom_modal',
        interaction.guildId,
        () => handleAiCustomModal(interaction)
      );
      tracker.end('success');
      return;
    }
    // Announce modal
    if (customId === 'announce_modal') {
      await trackCommandLatency(
        'announce_modal',
        interaction.guildId,
        () => handleAnnounceModal(interaction)
      );
      tracker.end('success');
      return;
    }

    logger.warn({ customId }, '⚠️ Unhandled modal submit');
    tracker.end('error');
  } catch (error) {
    tracker.end('error');
    throw error;
  }
}

/* ============================================
 * SPECIFIC BUTTON HANDLERS
 * ============================================ */

async function handleConfirmSteamLink(
  interaction: ButtonInteraction,
  customId: string
): Promise<void> {
  const steam32Id = customId.replace('confirm_steam_', '');

  if (!isValidSteamId(steam32Id)) {
    logger.warn({ steam32Id }, 'Invalid Steam ID received');
    await safeDefer(interaction, { ephemeral: true });
    await safeEdit(interaction, {
      content: '❌ Invalid Steam ID. Please check and try again.',
      embeds: [],
      components: [],
    });
    return;
  }

  await safeDefer(interaction, { ephemeral: true });

  try {
    // Save to database
    await pool.query(
      `INSERT INTO users (discord_id, steam_id, linked_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (discord_id) 
       DO UPDATE SET steam_id = $2, last_updated = NOW()`,
      [interaction.user.id, steam32Id]
    );

    const locale = await resolveLocale(interaction);
    const successMessage =
      i18nService.t(locale, 'connect_success') ||
      `✅ Steam account linked successfully!\n\n🆔 Steam ID: ${steam32Id}\n\n📊 You can now use:\n• Profile - View your stats\n• Match - Analyze your last match\n• Progress - Track your improvement`;

    await safeEdit(interaction, {
      content: successMessage,
      embeds: [],
      components: [],
    });
  } catch (error) {
    logger.error({ error }, '❌ Error saving Steam connection');
    await safeEdit(interaction, {
      content: '❌ Error saving to database. Please try again.',
      embeds: [],
      components: [],
    });
  }
}

async function handleMetaButton(
  interaction: ButtonInteraction,
  customId: string
): Promise<void> {
  const metaCommand = client.commands.get('meta');
  if (!metaCommand) return;

  await interaction.deferReply({ ephemeral: true });

  // Parse position and bracket from button ID
  const parts = customId.split('_');
  const type = parts[1] || 'all'; // pos1, pos2, herald, legend, immortal, all

  let position: string | null = null;
  let bracket = 'immortal'; // default

  if (type === 'all') {
    position = null;
  } else if (type.startsWith('pos')) {
    position = type.replace('pos', '');
  } else {
    bracket = type;
  }

  // Create fake interaction with options
  const fakeInteraction = {
    ...interaction,
    options: {
      getString: (name: string) => {
        if (name === 'position') return position;
        if (name === 'bracket') return bracket;
        return null;
      },
    },
  } as unknown as ChatInputCommandInteraction;

  await metaCommand.execute(fakeInteraction);
}

async function handleBuildButton(
  interaction: ButtonInteraction,
  customId: string
): Promise<void> {
  const buildCommand = client.commands.get('build');
  if (!buildCommand) return;

  await interaction.deferReply({ ephemeral: true });

  // Map button ID to hero name
  const heroMap: Record<string, string> = {
    build_antimage: 'Anti-Mage',
    build_invoker: 'Invoker',
    build_mars: 'Mars',
    build_earthshaker: 'Earthshaker',
    build_crystalmaiden: 'Crystal Maiden',
  };

  const heroName = heroMap[customId];

  if (heroName) {
    const fakeInteraction = {
      ...interaction,
      options: {
        getString: (name: string) => {
          if (name === 'hero') return heroName;
          if (name === 'situation') return 'standard';
          return null;
        },
      },
    } as unknown as ChatInputCommandInteraction;

    await buildCommand.execute(fakeInteraction);
  }
}

async function handleAiButton(
  interaction: ButtonInteraction,
  customId: string
): Promise<void> {
  // Show modal for custom question
  if (customId === 'ai_custom') {
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } =
      await import('discord.js');

    const modal = new ModalBuilder()
      .setCustomId('ai_custom_modal')
      .setTitle('🤖 Ask AI Coach');

    const questionInput = new TextInputBuilder()
      .setCustomId('ai_question')
      .setLabel('Your question')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Example: How can I improve my farming efficiency?')
      .setRequired(true)
      .setMaxLength(500);

    const row = new ActionRowBuilder().addComponents(questionInput);
    // @ts-expect-error - Discord.js ModalBuilder type inference issue
    modal.addComponents(row);

    await interaction.showModal(modal);
    return;
  }

  // Pre-made questions
  const askCommand = client.commands.get('ask');
  if (!askCommand) return;

  await interaction.deferReply({ ephemeral: true });

  const questionMap: Record<string, string> = {
    ai_analyze_recent:
      'Analyze my last 10 games in detail and tell me what patterns you see. What am I doing well and what needs improvement?',
    ai_improve_tips:
      'Based on my current stats and recent performance, give me 3 specific and actionable tips to improve my gameplay.',
    ai_hero_suggest:
      "Looking at my playstyle, win rates, and current meta, which 5 heroes should I focus on to climb rank? Explain why for each.",
    ai_video_ideas:
      "I'm a content creator. Generate 5 creative video ideas based on my recent best performances and current trending topics in Dota2.",
    ai_meta_analysis:
      'Analyze the current patch meta and tell me which heroes and strategies would work best with MY playstyle and hero pool.',
  };

  const question = questionMap[customId];

  if (question) {
    const fakeInteraction = {
      ...interaction,
      options: {
        getString: (name: string) => (name === 'question' ? question : null),
      },
    } as unknown as ChatInputCommandInteraction;

    await askCommand.execute(fakeInteraction);
  }
}

/* ============================================
 * SPECIFIC MODAL HANDLERS
 * ============================================ */

async function handleAiCustomModal(
  interaction: ModalSubmitInteraction
): Promise<void> {
  const question = interaction.fields.getTextInputValue('ai_question');
  const askCommand = client.commands.get('ask');

  if (askCommand) {
    await interaction.deferReply({ ephemeral: true });
    const fakeInteraction = {
      ...interaction,
      options: {
        getString: (name: string) => (name === 'question' ? question : null),
      },
    } as unknown as ChatInputCommandInteraction;

    await askCommand.execute(fakeInteraction);
  }
}

async function handleAnnounceModal(
  interaction: ModalSubmitInteraction
): Promise<void> {
  const text = interaction.fields.getTextInputValue('announce_text');
  const announceCommand = client.commands.get('announce');

  if (announceCommand) {
    const fakeInteraction = {
      ...interaction,
      options: {
        getString: (name: string) => {
          if (name === 'text') return text;
          if (name === 'voice') return 'en-US-JennyNeural'; // Default voice
          return null;
        },
      },
      member: interaction.member,
      guild: interaction.guild,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reply: async (options: any) => await interaction.reply(options),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      followUp: async (options: any) => await interaction.followUp(options),
    } as unknown as ChatInputCommandInteraction;

    await announceCommand.execute(fakeInteraction);
  }
}

/* ============================================
 * EVENT: MESSAGE CREATE (AI ASSISTANT)
 * ============================================ */

client.on(Events.MessageCreate, (message: Message) => {
  void (async () => {
    // Ignore bot messages and DMs
    if (message.author.bot || !message.guild) return;

    // Check if message is in AI assistant channel
    const isAiChannel =
      message.channel.type === ChannelType.GuildText && // Text channel (ChannelType.GuildText)
      (message.channel.name === '🤖┃ai-assistant' ||
        message.channel.topic?.includes('AI-powered Dota2 assistant'));

    if (!isAiChannel) return;

    try {
      // Show typing indicator
      await message.channel.sendTyping();

    // Get the ask command and execute it
    const askCommand = client.commands.get('ask');
    if (askCommand) {
      // Create fake interaction object for natural messages
      const fakeInteraction = {
        ...message,
        options: {
          getString: (name: string) =>
            name === 'question' ? message.content : null,
        },
        deferReply: async (options?: { ephemeral?: boolean }) => {
          // For natural messages, we don't defer, just send typing
          // eslint-disable-next-line @typescript-eslint/require-await
          return Promise.resolve({ ephemeral: options?.ephemeral || false });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editReply: async (options: any) => {
          if (typeof options === 'string') {
            return await message.reply(options);
          }
          return await message.reply(options);
        },
        user: message.author,
        guild: message.guild,
        channel: message.channel,
        deferred: false,
        replied: false,
      } as unknown as ChatInputCommandInteraction;

      await askCommand.execute(fakeInteraction);
    }
  } catch (error) {
    console.error('❌ Error in AI message handler:', error);
    await message.reply(
      '❌ Sorry, I encountered an error. Please try again or use `/ask` command.'
    );
  }
  })();
});

/* ============================================
 * LOGIN TO DISCORD
 * ============================================ */

try {
  await client.login(process.env.DISCORD_TOKEN);
} catch (error) {
  console.error('❌ Failed to login to Discord:', error);
  process.exit(1);
}
