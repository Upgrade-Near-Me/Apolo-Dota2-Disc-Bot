# 🚀 Quick Reference: Using I18nService in Commands

## Import & Setup

```typescript
import { ChatInputCommandInteraction, ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import { i18nService } from '../I18nService.js';
import type { Command } from '../types/dota.js';

const myCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('Command description'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    // STEP 1: Get locale at the start
    const locale = await i18nService.getLocale(interaction);
    
    // STEP 2: Use locale for all translations
    const title = i18nService.t(locale, 'my_key');
    
    // Your command logic...
  }
};
```

## Basic Translation

```typescript
// Simple translation
const message = i18nService.t(locale, 'welcome_message');

// With parameters
const greeting = i18nService.t(locale, 'welcome_user', {
  username: interaction.user.username
});

// Multiple parameters
const stats = i18nService.t(locale, 'rank_info', {
  rank: 'Ancient V',
  mmr: 4250
});
```

## In Embeds

```typescript
const embed = new EmbedBuilder()
  .setTitle(i18nService.t(locale, 'embed_title'))
  .setDescription(i18nService.t(locale, 'embed_description'))
  .addFields(
    {
      name: i18nService.t(locale, 'profile_rank'),
      value: playerData.rank,
      inline: true
    },
    {
      name: i18nService.t(locale, 'profile_mmr'),
      value: String(playerData.mmr),
      inline: true
    }
  )
  .setFooter({ text: i18nService.t(locale, 'embed_footer') });
```

## In Buttons

```typescript
const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId('action_button')
    .setLabel(i18nService.t(locale, 'btn_action'))
    .setStyle(ButtonStyle.Primary),
  
  new ButtonBuilder()
    .setCustomId('cancel_button')
    .setLabel(i18nService.t(locale, 'btn_cancel'))
    .setStyle(ButtonStyle.Danger)
);
```

## In Modals

```typescript
const modal = new ModalBuilder()
  .setCustomId('my_modal')
  .setTitle(i18nService.t(locale, 'modal_title'));

const input = new TextInputBuilder()
  .setCustomId('input_field')
  .setLabel(i18nService.t(locale, 'modal_label'))
  .setPlaceholder(i18nService.t(locale, 'modal_placeholder'))
  .setStyle(TextInputStyle.Short);
```

## Error Handling

```typescript
try {
  // API call or operation
  const data = await fetchData();
} catch (error) {
  const locale = await i18nService.getLocale(interaction);
  
  let errorMessage: string;
  
  if ((error as Error).message.includes('404')) {
    errorMessage = i18nService.t(locale, 'error_not_found');
  } else if ((error as Error).message.includes('429')) {
    errorMessage = i18nService.t(locale, 'error_api_unavailable');
  } else {
    errorMessage = i18nService.t(locale, 'error_generic');
  }
  
  await interaction.reply({
    content: errorMessage,
    ephemeral: true
  });
}
```

## Button Handler Pattern

```typescript
async handleButton(interaction: ButtonInteraction) {
  // Get locale at the start
  const locale = await i18nService.getLocale(interaction);
  
  const buttonId = interaction.customId;
  
  if (buttonId === 'my_button') {
    await interaction.deferReply({ ephemeral: true });
    
    const response = i18nService.t(locale, 'button_response');
    await interaction.editReply({ content: response });
  }
}
```

## Modal Handler Pattern

```typescript
async handleModal(interaction: ModalSubmitInteraction) {
  // Get locale at the start
  const locale = await i18nService.getLocale(interaction);
  
  if (interaction.customId === 'my_modal') {
    const userInput = interaction.fields.getTextInputValue('input_field');
    
    await interaction.deferReply({ ephemeral: true });
    
    const confirmation = i18nService.t(locale, 'modal_confirmation', {
      value: userInput
    });
    
    await interaction.editReply({ content: confirmation });
  }
}
```

## Conditional Translations

```typescript
// Translate based on condition
const result = isWin 
  ? i18nService.t(locale, 'match_victory')
  : i18nService.t(locale, 'match_defeat');

// Dynamic field translation
const fields = [
  {
    name: i18nService.t(locale, 'profile_matches'),
    value: String(stats.totalMatches),
    inline: true
  },
  {
    name: i18nService.t(locale, 'profile_winrate'),
    value: `${stats.winRate}%`,
    inline: true
  }
];
```

## AI Coach Locale Injection (TODO)

```typescript
if (buttonId === 'ai_coach') {
  const locale = await i18nService.getLocale(interaction);
  
  // TODO: Build locale-aware system prompt
  const languageName = 
    locale === 'pt' ? 'Portuguese (Brazil)' :
    locale === 'es' ? 'Spanish' :
    'English';
  
  const systemPrompt = `You are a professional Dota 2 coach.
CRITICAL: You MUST respond ONLY in ${languageName}.

Analyze the player's performance:
- Rank: ${profile.rank}
- MMR: ${profile.mmr}
- Win Rate: ${profile.winRate}%

Provide advice in ${languageName}.`;
  
  const aiResponse = await geminiService.generateContent(systemPrompt);
}
```

## Adding New Translation Keys

### 1. Add to all locale files

**en.json:**
```json
{
  "new_feature_title": "New Feature",
  "new_feature_desc": "This is a new feature with {count} items"
}
```

**pt.json:**
```json
{
  "new_feature_title": "Nova Funcionalidade",
  "new_feature_desc": "Esta é uma nova funcionalidade com {count} itens"
}
```

**es.json:**
```json
{
  "new_feature_title": "Nueva Característica",
  "new_feature_desc": "Esta es una nueva característica con {count} elementos"
}
```

### 2. Use in code

```typescript
const title = i18nService.t(locale, 'new_feature_title');
const description = i18nService.t(locale, 'new_feature_desc', {
  count: itemCount
});
```

## Common Patterns

### Loading Message
```typescript
await interaction.deferReply({ ephemeral: true });
await interaction.editReply({
  content: i18nService.t(locale, 'loading_message')
});
```

### Success Confirmation
```typescript
await interaction.reply({
  content: i18nService.t(locale, 'success_message'),
  ephemeral: true
});
```

### Empty State
```typescript
if (results.length === 0) {
  await interaction.editReply({
    content: i18nService.t(locale, 'empty_state_message')
  });
  return;
}
```

### Parameter Array
```typescript
const playerNames = ['Alice', 'Bob', 'Charlie'];
const message = i18nService.t(locale, 'team_members', {
  count: playerNames.length,
  names: playerNames.join(', ')
});
```

## Testing Your Translations

### Test All Languages
```typescript
// Manual testing
console.log('EN:', i18nService.t('en', 'test_key', { user: 'Test' }));
console.log('PT:', i18nService.t('pt', 'test_key', { user: 'Teste' }));
console.log('ES:', i18nService.t('es', 'test_key', { user: 'Prueba' }));
```

### Test Locale Detection
```typescript
// Simulate different user locales
const mockInteraction = {
  locale: 'pt-BR',  // Portuguese user
  guild: { id: 'test-guild' }
};

const locale = await i18nService.getLocale(mockInteraction);
console.log('Detected locale:', locale); // Should be 'pt'
```

## Best Practices

### ✅ DO

```typescript
// Get locale once at the start
const locale = await i18nService.getLocale(interaction);

// Use for all strings
const title = i18nService.t(locale, 'title');
const desc = i18nService.t(locale, 'description');

// Pass locale to sub-functions
await this.handleButton(interaction, locale);
```

### ❌ DON'T

```typescript
// Don't hardcode strings
const title = 'Dashboard Title'; // ❌

// Don't skip locale detection
await interaction.reply({ content: 'Error occurred' }); // ❌

// Don't call getLocale() multiple times
const locale1 = await i18nService.getLocale(interaction);
const locale2 = await i18nService.getLocale(interaction); // ❌ Unnecessary
```

## Troubleshooting

### Translation Not Working
1. Check key exists in all 3 locale files
2. Verify no typos in key name
3. Check console for warning: `Missing translation key: xyz`

### Wrong Language Displayed
1. Verify guild settings in database
2. Clear cache: `i18nService.clearGuildCache(guildId)`
3. Check interaction.locale value

### Missing Parameters
```typescript
// If translation has {username} but you forget to provide it:
i18nService.t(locale, 'welcome_user'); // Shows: "Welcome, {username}!"

// Fix: Always provide all parameters
i18nService.t(locale, 'welcome_user', { username: 'Alice' });
```

## Migration Checklist

Converting old command to TypeScript with I18nService:

- [ ] Change file extension: `.js` → `.ts`
- [ ] Import I18nService: `import { i18nService } from '../I18nService.js'`
- [ ] Add type imports: `ChatInputCommandInteraction`, etc.
- [ ] Add locale detection: `const locale = await i18nService.getLocale(interaction)`
- [ ] Replace all `t(interaction, 'key')` with `i18nService.t(locale, 'key')`
- [ ] Update button handlers to get locale
- [ ] Update modal handlers to get locale
- [ ] Test all buttons/modals in all 3 languages
- [ ] Add missing translation keys to locale files

---

**Need More Help?**
- See `docs/I18N_GUIDE.md` for complete documentation
- See `src/examples/i18n-usage.ts` for full examples
- See `src/commands/dashboard.ts` for real-world usage
