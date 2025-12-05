import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import type { Command } from './types/dota.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands: unknown[] = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

// Load all command definitions
for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`) as { default?: Command };
  if (command.default?.data) {
    commands.push(command.default.data.toJSON());
  }
}

// Specific guild IDs
const guilds = [
  '1380280198540296243',
  '1024803670061236274'
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

try {
  console.log(`🚀 Deploying ${commands.length} commands to ${guilds.length} servers...`);

  for (const guildId of guilds) {
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, guildId),
      { body: commands },
    ) as unknown[];
    console.log(`✅ Server ${guildId}: ${data.length} commands registered`);
  }

  console.log('🎉 All servers updated!');
} catch (error) {
  console.error('❌ Error:', error);
}
