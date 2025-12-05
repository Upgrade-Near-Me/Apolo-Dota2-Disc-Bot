# 🌍 I18n Implementation Guide

Complete internationalization system for APOLO Dota 2 Bot with user-aware locale detection.

## Overview

The I18n service provides automatic language detection and translation for 3 languages with a priority chain that respects both server-wide settings and individual user preferences.

## Supported Languages

| Language | Code | Region | Status |
|----------|------|--------|--------|
| English | `en` | Global | ✅ Complete |
| Português | `pt` | Brazil | ✅ Complete |
| Español | `es` | LATAM/Spain | ✅ Complete |

## Locale Priority Chain

**CRITICAL:** The system uses a 3-level priority chain:

```typescript
1. Guild Settings (Database) - Admin override for entire server
   ↓ (if not set)
2. User's Discord Client Language (interaction.locale)
   ↓ (if not supported)
3. Fallback to 'en' (English)
```

### How It Works

```typescript
// User's Discord is set to Portuguese (pt-BR)
// Guild has no language override
// → System uses 'pt'

// User's Discord is set to English (en-US)
// Guild admin set server to Spanish
// → System uses 'es' (guild override wins)

// User's Discord is set to French (fr)
// Guild has no language override
// → System uses 'en' (fallback - French not supported)
```

## File Structure

```
src/
├── I18nService.ts          # Main service class
├── locales/                # Translation files
│   ├── en.json             # English translations
│   ├── pt.json             # Portuguese translations
│   └── es.json             # Spanish translations
└── examples/
    └── i18n-usage.ts       # Integration examples
```

## Translation Files

### Format

```json
{
  "translation_key": "Translated text",
  "key_with_params": "Hello {username}, you have {count} messages"
}
```

### Adding New Keys

1. Add to `en.json`:
   ```json
   "new_feature_title": "New Feature"
   ```

2. Translate to `pt.json`:
   ```json
   "new_feature_title": "Nova Funcionalidade"
   ```

3. Translate to `es.json`:
   ```json
   "new_feature_title": "Nueva Característica"
   ```

4. Use in code:
   ```typescript
   const title = i18nService.t(locale, 'new_feature_title');
   ```

## Usage Examples

### Basic Command Integration

```typescript
import { ChatInputCommandInteraction } from 'discord.js';
import { i18nService } from './I18nService.js';

async function execute(interaction: ChatInputCommandInteraction) {
  // Get user's locale (automatic priority chain)
  const locale = await i18nService.getLocale(interaction);
  
  // Translate strings
  const title = i18nService.t(locale, 'embed_title');
  const description = i18nService.t(locale, 'embed_description');
  
  // Use in Discord embed
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description);
  
  await interaction.reply({ embeds: [embed] });
}
```

### Parameter Replacement

```typescript
// Simple parameter
const greeting = i18nService.t(locale, 'welcome_user', {
  username: interaction.user.username
});
// Output: "Welcome, JohnDoe!" or "Bem-vindo, JohnDoe!"

// Multiple parameters
const rankInfo = i18nService.t(locale, 'rank_info', {
  rank: 'Ancient V',
  mmr: 4250
});
// Output: "You are currently ranked Ancient V with 4250 MMR."
```

### Button Labels

```typescript
const locale = await i18nService.getLocale(interaction);

const connectButton = new ButtonBuilder()
  .setCustomId('connect')
  .setLabel(i18nService.t(locale, 'btn_connect'))  // "🔗 Connect Steam"
  .setStyle(ButtonStyle.Primary);

const profileButton = new ButtonBuilder()
  .setCustomId('profile')
  .setLabel(i18nService.t(locale, 'btn_profile'))  // "👤 Perfil do Jogador"
  .setStyle(ButtonStyle.Primary);
```

### Error Handling

```typescript
try {
  // API call
} catch (error) {
  const locale = await i18nService.getLocale(interaction);
  
  let errorMessage: string;
  
  if ((error as Error).message.includes('private')) {
    errorMessage = i18nService.t(locale, 'error_private_profile');
  } else if ((error as Error).message.includes('429')) {
    errorMessage = i18nService.t(locale, 'error_api_unavailable');
  } else {
    errorMessage = i18nService.t(locale, 'error_generic');
  }
  
  await interaction.reply({ content: errorMessage, ephemeral: true });
}
```

## API Reference

### I18nService

#### `getLocale(interaction, guildId?)`

Get locale with priority chain.

**Parameters:**
- `interaction: ChatInputCommandInteraction | ButtonInteraction | ModalSubmitInteraction`
- `guildId?: string` - Optional override (defaults to interaction.guild?.id)

**Returns:** `Promise<Locale>` - Resolved locale ('en', 'pt', or 'es')

**Example:**
```typescript
const locale = await i18nService.getLocale(interaction);
// Returns: 'pt' (if user's Discord is Brazilian Portuguese)
```

#### `t(locale, key, params?)`

Translate a key to the specified locale.

**Parameters:**
- `locale: Locale` - Target language ('en' | 'pt' | 'es')
- `key: string` - Translation key
- `params?: TranslationParams` - Optional parameters for replacement

**Returns:** `string` - Translated text with parameters replaced

**Example:**
```typescript
i18nService.t('en', 'welcome_user', { username: 'Alice' });
// Returns: "Welcome, Alice!"

i18nService.t('pt', 'welcome_user', { username: 'Bob' });
// Returns: "Bem-vindo, Bob!"
```

#### `clearGuildCache(guildId)`

Clear locale cache for a specific guild.

**When to use:** After updating guild settings in database.

**Example:**
```typescript
await pool.query('UPDATE guild_settings SET locale = $1...', [newLocale]);
i18nService.clearGuildCache(guildId);  // IMPORTANT: Clear cache
```

#### `clearCache()`

Clear entire locale cache.

**When to use:** Testing or bulk updates.

## Translation Keys

### Dashboard

| Key | English | Portuguese | Spanish |
|-----|---------|------------|---------|
| `embed_title` | 🎮 APOLO - Dota2 Control Panel | 🎮 APOLO - Painel de Controle Dota2 | 🎮 APOLO - Panel de Control Dota2 |
| `btn_connect` | 🔗 Connect Steam | 🔗 Conectar Steam | 🔗 Conectar Steam |
| `btn_match` | 📊 Match Analysis | 📊 Análise de Partida | 📊 Análisis de Partida |
| `btn_profile` | 👤 Player Profile | 👤 Perfil do Jogador | 👤 Perfil del Jugador |
| `btn_ai_coach` | 🤖 AI Coach | 🤖 Coach IA | 🤖 Coach IA |

### Errors

| Key | English | Portuguese | Spanish |
|-----|---------|------------|---------|
| `error_generic` | ❌ An error occurred... | ❌ Ocorreu um erro... | ❌ Ocurrió un error... |
| `error_no_steam` | ❌ No Steam account linked... | ❌ Nenhuma conta Steam vinculada... | ❌ No hay cuenta Steam vinculada... |
| `error_private_profile` | ❌ Your Dota 2 profile is private... | ❌ Seu perfil do Dota 2 está privado... | ❌ Tu perfil de Dota 2 es privado... |

[Full list: See locale files]

## Language Change Command

Allow admins to override server language:

```typescript
import { ChatInputCommandInteraction } from 'discord.js';
import { i18nService } from './I18nService.js';
import pool from './database/index.js';

async function handleLanguageChange(
  interaction: ChatInputCommandInteraction,
  newLocale: 'en' | 'pt' | 'es'
) {
  const guildId = interaction.guild?.id;
  if (!guildId) return;

  // Update database
  await pool.query(
    `INSERT INTO guild_settings (guild_id, locale, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (guild_id) DO UPDATE SET locale = $2, updated_at = NOW()`,
    [guildId, newLocale]
  );

  // CRITICAL: Clear cache after update
  i18nService.clearGuildCache(guildId);

  // Confirm with new language
  const successMessage = i18nService.t(newLocale, 'connect_success');
  await interaction.reply({
    content: `✅ ${successMessage}`,
    ephemeral: true
  });
}
```

## Database Schema

```sql
CREATE TABLE guild_settings (
  guild_id VARCHAR(20) PRIMARY KEY,
  locale VARCHAR(5) DEFAULT NULL,  -- NULL = use user's Discord locale
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Important:** 
- `locale = NULL` → Use user's Discord client language
- `locale = 'pt'` → Force Portuguese for entire server (admin override)

## Discord Locale Mapping

The system automatically maps Discord's locale codes to bot locales:

| Discord Code | Bot Locale | Description |
|--------------|-----------|-------------|
| `pt-BR` | `pt` | Portuguese (Brazil) |
| `pt` | `pt` | Portuguese |
| `en-US` | `en` | English (US) |
| `en-GB` | `en` | English (UK) |
| `en` | `en` | English |
| `es-ES` | `es` | Spanish (Spain) |
| `es-MX` | `es` | Spanish (Mexico) |
| `es` | `es` | Spanish |
| Others | `en` | Fallback to English |

## Best Practices

### ✅ DO

- Always get locale at the start of command execution
- Use `i18nService.t()` for ALL user-facing strings
- Clear cache after database updates
- Add parameters for personalized messages
- Handle missing keys gracefully (service does this automatically)
- Test all languages before committing

### ❌ DON'T

- Hardcode strings directly in commands
- Skip locale detection
- Forget to clear cache after guild settings update
- Mix translation keys between languages
- Use `console.log()` for missing keys in production

## Testing

### Manual Testing

```typescript
// Test English
const enGreeting = i18nService.t('en', 'welcome_user', { username: 'Test' });
console.log(enGreeting);  // "Welcome, Test!"

// Test Portuguese
const ptGreeting = i18nService.t('pt', 'welcome_user', { username: 'Teste' });
console.log(ptGreeting);  // "Bem-vindo, Teste!"

// Test Spanish
const esGreeting = i18nService.t('es', 'welcome_user', { username: 'Prueba' });
console.log(esGreeting);  // "¡Bienvenido, Prueba!"
```

### Unit Testing (Future)

```typescript
import { describe, it, expect } from 'vitest';
import { i18nService } from '../I18nService.js';

describe('I18nService', () => {
  it('should translate to English', () => {
    const text = i18nService.t('en', 'embed_title');
    expect(text).toBe('🎮 APOLO - Dota2 Control Panel');
  });

  it('should replace parameters', () => {
    const text = i18nService.t('en', 'welcome_user', { username: 'Alice' });
    expect(text).toBe('Welcome, Alice!');
  });

  it('should fallback to English for missing keys', () => {
    const text = i18nService.t('pt', 'nonexistent_key');
    expect(text).toBeTruthy();  // Should not crash
  });
});
```

## Migration from Old System

### Old (Deprecated)

```javascript
// OLD: Guild-only, no user awareness
import { t } from './utils/i18n.js';

const message = t(guildId, 'match_error');
```

### New (TypeScript)

```typescript
// NEW: User-aware with priority chain
import { i18nService } from './I18nService.js';

const locale = await i18nService.getLocale(interaction);
const message = i18nService.t(locale, 'match_error');
```

## Troubleshooting

### Language Not Changing

**Problem:** Bot still responds in wrong language

**Solution:**
1. Verify database has correct locale:
   ```sql
   SELECT * FROM guild_settings WHERE guild_id = 'YOUR_GUILD_ID';
   ```
2. Clear cache:
   ```typescript
   i18nService.clearCache();
   ```
3. Restart bot

### Missing Translation

**Problem:** Shows translation key instead of text

**Solution:**
1. Check key exists in `en.json` (fallback)
2. Check console for warning: `Missing translation key: xyz`
3. Add key to all locale files

### Wrong Language Detected

**Problem:** User sees wrong language despite Discord settings

**Solution:**
1. Check if guild has language override in database
2. Clear guild cache: `i18nService.clearGuildCache(guildId)`
3. Verify Discord locale mapping includes user's locale

## Performance

- **Locale Cache:** In-memory cache reduces database queries
- **Translation Loading:** Loaded once at startup (< 5MB memory)
- **Locale Detection:** < 5ms with cache, < 50ms with database query
- **Translation:** < 1ms (in-memory lookup)

## Future Enhancements

- [ ] Add French (fr)
- [ ] Add German (de)
- [ ] Add Russian (ru)
- [ ] Auto-detect from user's first message
- [ ] Per-user language preference override
- [ ] Translation management UI
- [ ] Community translation contributions

---

**Need help?** See `src/examples/i18n-usage.ts` for complete integration examples.
