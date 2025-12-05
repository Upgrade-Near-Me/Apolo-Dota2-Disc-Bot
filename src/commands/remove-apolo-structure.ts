/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * ============================================
 * REMOVE APOLO STRUCTURE - COMPLETE CLEANUP
 * ============================================
 * 
 * Properly removes ALL APOLO channels and categories
 * - Deletes all child channels first
 * - Then deletes parent categories
 * - Leaves ZERO traces
 * 
 * SAFE TO RUN: Asks for confirmation before deletion
 */

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  CategoryChannel,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-apolo-structure')
    .setDescription('🗑️ Remove ALL APOLO channels and categories (Complete cleanup)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ 
        content: '❌ Este comando só pode ser usado em servidores.', 
        ephemeral: true 
      });
      return;
    }

    // Find APOLO categories
    const dashboardCategory = interaction.guild.channels.cache.find(
      (ch) => ch.name === '📊 APOLO DASHBOARD' && ch.type === ChannelType.GuildCategory
    ) as CategoryChannel | undefined;

    const arenaCategory = interaction.guild.channels.cache.find(
      (ch) => ch.name === '🔊 APOLO ARENA' && ch.type === ChannelType.GuildCategory
    ) as CategoryChannel | undefined;

    if (!dashboardCategory && !arenaCategory) {
      await interaction.reply({
        content: '⚠️ **Nenhuma estrutura APOLO encontrada**\n\nNão há canais para remover.',
        ephemeral: true,
      });
      return;
    }

    // Count channels to delete
    const dashboardChildCount = dashboardCategory ? dashboardCategory.children.cache.size : 0;
    const arenaChildCount = arenaCategory ? arenaCategory.children.cache.size : 0;
    const totalChannels = dashboardChildCount + arenaChildCount + (dashboardCategory ? 1 : 0) + (arenaCategory ? 1 : 0);

    // Confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle('⚠️ CONFIRMAÇÃO DE REMOÇÃO')
      .setDescription(`**Você está prestes a deletar:**\n\n${dashboardCategory ? `📊 **APOLO DASHBOARD**\n• Categoria principal\n• ${dashboardChildCount} canais de texto\n\n` : ''}${arenaCategory ? `🔊 **APOLO ARENA**\n• Categoria principal\n• ${arenaChildCount} canais de voz\n\n` : ''}**Total:** ${totalChannels} canais serão PERMANENTEMENTE deletados.\n\n⚠️ **AVISO:** Todo o histórico de mensagens será perdido!\n\nTem certeza que deseja continuar?`)
      .setFooter({ text: 'Esta ação NÃO pode ser desfeita!' })
      .setTimestamp();

    const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_remove_apolo')
        .setLabel('✅ SIM, DELETAR TUDO')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('cancel_remove_apolo')
        .setLabel('❌ Cancelar')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [confirmRow],
      ephemeral: true,
    });

    // Wait for button click
    const filter = (i: any) => 
      i.user.id === interaction.user.id && 
      (i.customId === 'confirm_remove_apolo' || i.customId === 'cancel_remove_apolo');

    try {
      const confirmation = await interaction.channel?.awaitMessageComponent({
        filter,
        time: 30000, // 30 seconds
      });

      if (!confirmation || confirmation.customId === 'cancel_remove_apolo') {
        await interaction.editReply({
          content: '✅ **Operação cancelada**\n\nNenhum canal foi deletado.',
          embeds: [],
          components: [],
        });
        return;
      }

      // User confirmed deletion
      await confirmation.deferUpdate();
      await interaction.editReply({
        content: '🗑️ **Deletando estrutura APOLO...**\n\n⏳ Aguarde...',
        embeds: [],
        components: [],
      });

      let deletedCount = 0;

      // Delete DASHBOARD category and its children
      if (dashboardCategory) {
        const dashboardChildren = Array.from(dashboardCategory.children.cache.values());
        for (const channel of dashboardChildren) {
          try {
            await channel.delete();
            deletedCount++;
            console.log(`🗑️ Deleted channel: ${channel.name}`);
          } catch (error) {
            console.error(`❌ Failed to delete channel ${channel.name}:`, error);
          }
        }

        // Delete the category itself
        try {
          await dashboardCategory.delete();
          deletedCount++;
          console.log('🗑️ Deleted category: 📊 APOLO DASHBOARD');
        } catch (error) {
          console.error('❌ Failed to delete DASHBOARD category:', error);
        }
      }

      // Delete ARENA category and its children
      if (arenaCategory) {
        const arenaChildren = Array.from(arenaCategory.children.cache.values());
        for (const channel of arenaChildren) {
          try {
            await channel.delete();
            deletedCount++;
            console.log(`🗑️ Deleted voice channel: ${channel.name}`);
          } catch (error) {
            console.error(`❌ Failed to delete voice channel ${channel.name}:`, error);
          }
        }

        // Delete the category itself
        try {
          await arenaCategory.delete();
          deletedCount++;
          console.log('🗑️ Deleted category: 🔊 APOLO ARENA');
        } catch (error) {
          console.error('❌ Failed to delete ARENA category:', error);
        }
      }

      // Success message
      const successEmbed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('✅ Estrutura APOLO Removida')
        .setDescription(`**Limpeza completa realizada com sucesso!**\n\n🗑️ **Canais deletados:** ${deletedCount}\n\n${dashboardCategory ? '• 📊 APOLO DASHBOARD (categoria + canais)\n' : ''}${arenaCategory ? '• 🔊 APOLO ARENA (categoria + canais)\n' : ''}\n✨ O servidor está limpo. Você pode reinstalar com \`/setup-apolo-structure\``)
        .setFooter({ text: 'APOLO Structure Cleanup Complete' })
        .setTimestamp();

      await interaction.editReply({
        content: '',
        embeds: [successEmbed],
      });

    } catch {
      // Timeout or error
      await interaction.editReply({
        content: '⏱️ **Tempo esgotado**\n\nOperação cancelada por inatividade.',
        embeds: [],
        components: [],
      });
    }
  },
};
