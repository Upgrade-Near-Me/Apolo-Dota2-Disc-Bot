/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import type { Interaction } from 'discord.js';

/**
 * Safely handle interaction responses by checking interaction state
 * Prevents "Unknown Message" and "Interaction has already been acknowledged" errors
 */

type ReplyOptions = any;
type FollowUpOptions = any;
type DeferReplyOptions = any;

/**
 * Safely reply to an interaction
 * @param interaction - Discord interaction object
 * @param content - Reply content (string or options object)
 * @returns Promise<Message>
 */
export async function safeReply(
  interaction: Interaction,
  content: string | ReplyOptions
): Promise<any> {
  const options: ReplyOptions = typeof content === 'string' ? { content } : content;
  
  try {
    if (interaction.isRepliable()) {
      if (interaction.deferred || interaction.replied) {
        return await interaction.followUp(options as FollowUpOptions);
      } else {
        return await interaction.reply(options);
      }
    }
    throw new Error('Interaction is not repliable');
  } catch (error) {
    console.error('Error in safeReply:', error);
    // Last resort: try editReply if it was deferred
    if (interaction.isRepliable() && interaction.deferred) {
      try {
        return await interaction.editReply(options);
      } catch (editError) {
        console.error('Error in editReply fallback:', editError);
        throw editError;
      }
    }
    throw error;
  }
}

/**
 * Safely edit an interaction response
 * @param interaction - Discord interaction object
 * @param content - Edit content (string or options object)
 * @returns Promise<Message>
 */
export async function safeEdit(
  interaction: Interaction,
  content: string | ReplyOptions
): Promise<any> {
  const options: ReplyOptions = typeof content === 'string' ? { content } : content;
  
  try {
    if (interaction.isRepliable()) {
      if (interaction.deferred || interaction.replied) {
        return await interaction.editReply(options);
      } else {
        // If not deferred/replied yet, reply instead
        return await interaction.reply(options) as any;
      }
    }
    throw new Error('Interaction is not repliable');
  } catch (error) {
    console.error('Error in safeEdit:', error);
    // Fallback to followUp if edit fails
    if (interaction.isRepliable()) {
      try {
        return await interaction.followUp(options as FollowUpOptions) as any;
      } catch (followUpError) {
        console.error('Error in followUp fallback:', followUpError);
        throw followUpError;
      }
    }
    throw error;
  }
}

/**
 * Safely defer an interaction reply
 * @param interaction - Discord interaction object
 * @param options - Defer options (e.g., {ephemeral: true})
 * @returns Promise<void>
 */
export async function safeDefer(
  interaction: Interaction,
  options: DeferReplyOptions = {}
): Promise<void> {
  try {
    if (interaction.isRepliable() && !interaction.deferred && !interaction.replied) {
      await interaction.deferReply(options);
    }
  } catch (error) {
    // Silently catch if already deferred/replied
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('already') && !errorMessage.includes('acknowledged')) {
      console.error('Error in safeDefer:', error);
      throw error;
    }
  }
}

/**
 * Safely update a button/select menu interaction
 * @param interaction - Discord interaction object
 * @param content - Update content (string or options object)
 * @returns Promise<Message>
 */
export async function safeUpdate(
  interaction: Interaction,
  content: string | ReplyOptions
): Promise<any> {
  const options: ReplyOptions = typeof content === 'string' ? { content } : content;
  
  try {
    if (interaction.isMessageComponent()) {
      if (!interaction.replied && !interaction.deferred) {
        return await interaction.update(options);
      } else {
        // If already replied/deferred, use editReply
        return await interaction.editReply(options);
      }
    } else if (interaction.isRepliable()) {
      return await interaction.editReply(options);
    }
    throw new Error('Interaction cannot be updated');
  } catch (error) {
    console.error('Error in safeUpdate:', error);
    // Fallback to followUp
    if (interaction.isRepliable()) {
      try {
        return await interaction.followUp(options as FollowUpOptions);
      } catch (followUpError) {
        console.error('Error in followUp fallback:', followUpError);
        throw followUpError;
      }
    }
    throw error;
  }
}

/**
 * Check if interaction can be responded to
 * @param interaction - Discord interaction object
 * @returns Boolean
 */
export function canRespond(interaction: Interaction): boolean {
  return interaction.isRepliable() && !interaction.replied && !interaction.deferred;
}

/**
 * Get the appropriate response method for an interaction
 * @param interaction - Discord interaction object
 * @returns 'reply', 'edit', or 'followUp'
 */
export function getResponseMethod(interaction: Interaction): 'reply' | 'edit' | 'followUp' {
  if (interaction.isRepliable()) {
    if (!interaction.replied && !interaction.deferred) {
      return 'reply';
    } else if (interaction.deferred) {
      return 'edit';
    }
  }
  return 'followUp';
}
