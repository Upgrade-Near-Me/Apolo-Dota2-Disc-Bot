/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Interaction } from 'discord.js';

interface SendPayload {
  content?: string;
  embeds?: any[];
  components?: any[];
  files?: any[];
}

export async function sendPrivate(interaction: Interaction, payload: any): Promise<boolean> {
  try {
    if (!('user' in interaction)) return false;
    const dm = await interaction.user.createDM();
    await dm.send(payload);
    return true;
  } catch {
    // DM may be disabled or blocked
    return false;
  }
}

export async function dmOrEphemeral(
  interaction: Interaction,
  payload: any,
  ack = '📩 Enviado na sua DM.'
): Promise<boolean> {
  const sent = await sendPrivate(interaction, payload);
  
  if (!interaction.isRepliable()) return false;
  
  if (interaction.deferred || interaction.replied) {
    if (sent) {
      const reply = await interaction.editReply({ content: ack, embeds: [], components: [] });
      // Auto-delete confirmation message after 3 seconds
      setTimeout(async () => {
        try {
          if ('delete' in reply && typeof reply.delete === 'function') {
            await reply.delete();
          }
        } catch {
          // Ignore errors (message might be already deleted or interaction expired)
        }
      }, 3000);
    } else {
      await interaction.editReply({ content: '⚠️ Não consegui enviar DM. Exibindo aqui abaixo.', ...payload });
    }
  } else {
    if (sent) {
      const reply = await interaction.reply({ content: ack, ephemeral: true, fetchReply: true });
      // Ephemeral messages can't be deleted, so just leave it
    } else {
      await interaction.reply({ ephemeral: true, ...payload });
    }
  }
  return sent;
}
