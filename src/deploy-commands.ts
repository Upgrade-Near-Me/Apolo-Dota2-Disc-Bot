/**
 * APOLO DOTA 2 BOT - Command Deployment Script
 * 
 * Registers slash commands with Discord API
 * Supports both guild-specific (instant) and global (1 hour delay) deployment
 * 
 * Usage:
 *   npm run deploy:ts         (TypeScript - development)
 *   npm run deploy            (JavaScript - production)
 * 
 * @version 2.0.0
 */

import 'dotenv/config';
import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import type { Command } from './types/dota.js';

// ES Module directory resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ============================================
 * CONFIGURATION VALIDATION
 * ============================================ */

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN is missing in .env file');
  process.exit(1);
}

if (!DISCORD_CLIENT_ID) {
  console.error('❌ DISCORD_CLIENT_ID is missing in .env file');
  process.exit(1);
}

/* ============================================
 * LOAD COMMANDS
 * ============================================ */

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const commandsPath = join(__dirname, 'commands');

// Load both .ts and .js files to support mixed development
const allFiles = readdirSync(commandsPath);
const commandFiles = allFiles.filter(
  (file) => file.endsWith('.ts') || file.endsWith('.js')
);

console.log(`📂 Loading ${commandFiles.length} command files...`);

// Load all command definitions
for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  try {
    const commandModule = (await import(`file://${filePath}`)) as { default: Command };
    const command = commandModule.default;

    if (command?.data) {
      commands.push(command.data.toJSON());
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.warn(`⚠️ Command ${file} is missing "data" property`);
    }
  } catch (error) {
    console.error(`❌ Failed to load command ${file}:`, error);
  }
}

if (commands.length === 0) {
  console.error('❌ No commands found to deploy');
  process.exit(1);
}

/* ============================================
 * DEPLOY COMMANDS TO DISCORD
 * ============================================ */

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

try {
  console.log(`\n🚀 Deploying ${commands.length} slash commands...`);

  // For guild-specific deployment (faster for testing)
  if (
    DISCORD_GUILD_ID &&
    DISCORD_GUILD_ID !== 'your_discord_guild_id_here' &&
    DISCORD_GUILD_ID.trim() !== ''
  ) {
    // Support multiple guild IDs separated by comma
    const guildIds = DISCORD_GUILD_ID.split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    console.log(
      `⏱️ Deploying to ${guildIds.length} guild(s) for instant availability...`
    );

    let successCount = 0;
    let failCount = 0;

    for (const guildId of guildIds) {
      try {
        const data = await rest.put(
          Routes.applicationGuildCommands(DISCORD_CLIENT_ID, guildId),
          { body: commands }
        ) as RESTPostAPIChatInputApplicationCommandsJSONBody[];

        console.log(
          `✅ Successfully deployed ${data.length} commands to guild ${guildId}`
        );
        successCount++;
      } catch (error) {
        console.error(
          `❌ Error deploying to guild ${guildId}:`,
          error instanceof Error ? error.message : String(error)
        );
        failCount++;
      }
    }

    console.log(
      `\n🎉 Deployment complete! Success: ${successCount}, Failed: ${failCount}`
    );
    console.log(
      `💡 Commands are available immediately in ${successCount} server(s).`
    );
  } else {
    // Global deployment (takes ~1 hour to propagate)
    console.log('⏳ Deploying globally (commands will appear in ~1 hour)...');

    const data = await rest.put(
      Routes.applicationCommands(DISCORD_CLIENT_ID),
      { body: commands }
    ) as RESTPostAPIChatInputApplicationCommandsJSONBody[];

    console.log(`✅ Successfully deployed ${data.length} global commands!`);
    console.log('\n💡 TIP: For instant deployment, set DISCORD_GUILD_ID in .env file.');
  }

  console.log('\n✨ Deployment process completed successfully!');
} catch (error) {
  console.error('\n❌ Error deploying commands:', error);
  if (error instanceof Error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
  }
  process.exit(1);
}
