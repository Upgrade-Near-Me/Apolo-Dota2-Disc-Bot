import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from 'discord.js';
import pool from '../database/index.js';
import { grantXp } from '../services/levelingService.js';
import { tInteraction } from '../utils/i18n.js';

export default {
  data: new SlashCommandBuilder()
    .setName('xp-admin')
    .setDescription("Adjust a user's XP (admins only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Target user')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('XP amount to add (must be positive)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Optional reason for the adjustment')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    const reasonRaw = interaction.options.getString('reason') ?? '';
    const reason = reasonRaw.trim();

    if (amount <= 0) {
      const msg = await tInteraction(interaction, 'xp_admin_invalid_amount');
      await interaction.editReply({ content: msg });
      return;
    }

    try {
      const levelState = await grantXp(pool, {
        discordId: target.id,
        source: 'admin',
        amount,
      });

      const base = await tInteraction(interaction, 'xp_admin_success', {
        amount,
        user: target.tag,
        level: levelState.level,
        xp: levelState.xp,
      });

      const withReason = reason
        ? `${base}\n${await tInteraction(interaction, 'xp_admin_reason', { reason })}`
        : base;

      await interaction.editReply({ content: withReason });
    } catch (error) {
      const msg = await tInteraction(interaction, 'xp_admin_error');
      await interaction.editReply({ content: msg });
      throw error;
    }
  },
};
