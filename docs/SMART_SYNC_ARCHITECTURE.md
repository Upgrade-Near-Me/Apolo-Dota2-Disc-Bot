# 🔄 Smart Sync Architecture - Technical Documentation

## Overview

The APOLO Dota 2 Bot now features **Idempotent Synchronization** for dashboard management. This eliminates the need to delete and recreate structures when updating the bot interface.

## Problem Statement

### Before (Old System)
```
Admin wants to update button labels:
1. Run /remove-apolo-structure → Deletes all channels + categories
2. Run /setup-apolo-structure → Creates everything from scratch
❌ RESULT: Chat history LOST, Message IDs changed, User disruption
```

### After (Smart Sync System)
```
Admin wants to update button labels:
1. Run /setup-apolo-structure
✅ RESULT: Existing messages EDITED, Chat history PRESERVED, Zero downtime
```

---

## Architecture Components

### 1. Helper Functions (Idempotent Operations)

#### `syncCategory()`
```typescript
/**
 * Find or create a category channel (idempotent)
 */
async function syncCategory(
  guild: any,
  categoryName: string,
  position: number
): Promise<CategoryChannel>
```

**Behavior:**
- Searches for existing category by name
- If found: Returns existing (no changes)
- If missing: Creates new category

**Use Case:** Ensures category exists without duplication

---

#### `syncTextChannel()`
```typescript
/**
 * Sync a text channel (create or update permissions/topic)
 */
async function syncTextChannel(
  guild: any,
  channelName: string,
  parentId: string,
  permissions: OverwriteResolvable[],
  topic?: string
): Promise<TextChannel>
```

**Behavior:**
- Searches for existing text channel by name
- If found:
  - Updates parent category (if changed)
  - Updates permissions (overwrites)
  - Updates topic (if provided)
- If missing: Creates new channel

**Use Case:** Keeps channel configuration in sync with code

---

#### `syncVoiceChannel()`
```typescript
/**
 * Sync a voice channel (create or update permissions/limit)
 */
async function syncVoiceChannel(
  guild: any,
  channelName: string,
  parentId: string,
  permissions: OverwriteResolvable[],
  userLimit: number
): Promise<VoiceChannel>
```

**Behavior:**
- Searches for existing voice channel by name
- If found:
  - Updates parent category
  - Updates permissions
  - Updates user limit
- If missing: Creates new channel

**Use Case:** Maintains voice lobby configuration

---

#### `syncDashboardMessage()` ⭐ CORE FUNCTION
```typescript
/**
 * Smart Dashboard Sync - Create or Edit pinned message with embed/buttons
 * This is the CORE of idempotent updates
 */
async function syncDashboardMessage(
  channel: TextChannel,
  embed: EmbedBuilder,
  components: ActionRowBuilder<ButtonBuilder>[]
): Promise<void>
```

**Behavior (Priority Chain):**

1. **Try to find bot's pinned message:**
   - Fetches pinned messages in channel
   - Finds message authored by bot
   - If found: **EDIT message** (preserves ID + history)

2. **If no pinned message, check last 10 messages:**
   - Fetches recent messages
   - Finds last bot message
   - If found: **EDIT message** + Pin it

3. **If no existing message:**
   - **CREATE new message**
   - Pin it automatically

**Use Case:** The magic function that prevents dashboard duplication

---

### 2. Smart Sync Flow

```
┌─────────────────────────────────────────────┐
│  USER RUNS: /setup-apolo-structure          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
       ┌───────────────────────┐
       │ Check Existing Setup  │
       └───────────┬───────────┘
                   │
          ┌────────┴────────┐
          │                 │
      [NEW INSTALL]    [EXISTING STRUCTURE]
          │                 │
          ▼                 ▼
    Create All        Sync Mode Active
          │                 │
          │                 ▼
          │        ┌────────────────┐
          │        │ For Each Item: │
          │        └────────┬───────┘
          │                 │
          │        ┌────────┴────────────┐
          │        │                     │
          │    [CATEGORY]           [CHANNEL]
          │        │                     │
          │        ▼                     ▼
          │   Find or Create      Find or Create
          │                       + Update Perms
          │                             │
          │                             ▼
          │                   ┌─────────────────┐
          │                   │  DASHBOARD MSG  │
          │                   └────────┬────────┘
          │                            │
          │                   ┌────────┴─────────┐
          │                   │                  │
          │              [PINNED MSG?]     [NO MSG]
          │                   │                  │
          │                   ▼                  ▼
          │               EDIT IT           CREATE NEW
          │                   │                  │
          └───────────────────┴──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  SUCCESS REPORT  │
                    └──────────────────┘
```

---

## Use Cases & Scenarios

### Scenario 1: First-Time Installation
```
Server: NO APOLO STRUCTURE
Admin: /setup-apolo-structure

✅ Result:
- Creates 📊 APOLO DASHBOARD category
- Creates 🔊 APOLO ARENA category
- Creates 8 text channels with dashboards
- Creates 3 voice channels
```

---

### Scenario 2: Update Button Labels (MAIN USE CASE)
```
Developer changes button label in code:
  OLD: "🔗 Connect Steam"
  NEW: "🔗 Link Your Account"

Admin: /setup-apolo-structure

✅ Result:
- Finds existing pinned message in 🏠・início
- EDITS message with new button label
- No new message created
- Chat history preserved
- Message ID unchanged (embeds/replies intact)
```

---

### Scenario 3: Add New Channel
```
Developer adds new channel to code:
  NEW: 🎮・tournaments

Admin: /setup-apolo-structure

✅ Result:
- Existing channels: No changes
- New channel: Created automatically
- Position: Added to category
- Dashboard: Pinned message created
```

---

### Scenario 4: Missing Channel (Auto-Healing)
```
Situation: User accidentally deleted 🧠・ai-coach channel
Admin: /setup-apolo-structure

✅ Result:
- Detects missing channel
- Recreates it with correct permissions
- Creates dashboard message
- Other channels: Untouched
```

---

### Scenario 5: Permission Update
```
Developer changes permission requirements:
  OLD: ViewChannel = Everyone
  NEW: ViewChannel = @Verified Role Only

Admin: /setup-apolo-structure

✅ Result:
- All channels: Permissions overwritten with new config
- Messages: Unchanged (only permissions updated)
- No channel recreation
```

---

## Removal Command

### `/remove-apolo-structure`

**Features:**
- **Confirmation Required:** Shows interactive prompt with button
- **Complete Deletion:** Removes ALL traces (channels + categories)
- **Safe Process:**
  1. Deletes all child channels first
  2. Then deletes parent categories
  3. Shows count of deleted items

**Code Flow:**
```typescript
1. Find categories (DASHBOARD + ARENA)
2. Count total channels to delete
3. Show confirmation embed with buttons
4. If confirmed:
   - Delete all children in DASHBOARD category
   - Delete DASHBOARD category itself
   - Delete all children in ARENA category
   - Delete ARENA category itself
5. Show success embed with deletion count
```

**Timeout:** 30 seconds for user response

---

## Technical Implementation Details

### Channel Identification Strategy
```typescript
// Channels are identified by NAME, not ID
const channel = guild.channels.cache.find(
  (ch: any) => ch.name === '🏠・início' && ch.type === ChannelType.GuildText
);
```

**Why?**
- Channel IDs change if deleted/recreated
- Names remain constant across updates
- Enables idempotent lookups

---

### Message Editing Priority
```typescript
// Priority 1: Pinned bot messages
const pinnedMessages = await channel.messages.fetchPinned();
dashboardMessage = pinnedMessages.find(
  msg => msg.author.id === channel.client.user?.id
);

// Priority 2: Last 10 bot messages
if (!dashboardMessage) {
  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessages = messages.filter(msg => msg.author.bot);
  dashboardMessage = botMessages.first();
}
```

**Why this order?**
- Pinned messages = intentional dashboards
- Last message = likely the dashboard
- Prevents editing user messages or old bot messages

---

### Permission Overwrite Pattern
```typescript
await channel.permissionOverwrites.set(permissions);
```

**Behavior:**
- Removes ALL existing permission overwrites
- Applies new overwrites from code
- Ensures consistency with codebase

---

## Benefits Over Old System

| Feature | Old System | Smart Sync System |
|---------|-----------|-------------------|
| **Update Process** | Delete + Recreate | Edit in place |
| **Chat History** | ❌ Lost | ✅ Preserved |
| **Message IDs** | ❌ Changed | ✅ Unchanged |
| **Downtime** | ❌ Yes | ✅ None |
| **User Disruption** | ❌ High | ✅ Zero |
| **Run Frequency** | Once | Anytime |
| **Auto-Healing** | ❌ No | ✅ Yes |
| **Permission Sync** | ❌ Manual | ✅ Automatic |

---

## Testing Checklist

### ✅ Idempotent Tests
- [ ] Run `/setup-apolo-structure` twice → No duplicates
- [ ] Delete a channel → Run `/setup` → Channel recreated
- [ ] Change button label in code → Run `/setup` → Message edited (not new)
- [ ] Change permissions in code → Run `/setup` → Permissions updated

### ✅ Removal Tests
- [ ] Run `/remove-apolo-structure` → Confirm → All deleted
- [ ] Check category list → No APOLO categories
- [ ] Run `/setup-apolo-structure` → Reinstalls successfully

### ✅ Edge Cases
- [ ] Run `/setup` with missing bot permissions → Error message
- [ ] Run `/remove` on server without APOLO → Warning message
- [ ] Run `/setup` with partial structure → Completes missing parts

---

## Code Locations

### Main Files
- **Setup Command:** `src/commands/setup-dashboard.ts`
- **Remove Command:** `src/commands/remove-apolo-structure.ts`

### Helper Functions (Inside setup-dashboard.ts)
- `syncCategory()` - Line ~48
- `syncTextChannel()` - Line ~71
- `syncVoiceChannel()` - Line ~116
- `syncDashboardMessage()` - Line ~161

### Key Interactions
- **Button Handlers:** `src/handlers/buttonHandler.ts`
- **Modal Handlers:** `src/handlers/modalHandler.ts`
- **Command Loader:** `src/index.ts`

---

## Performance Considerations

### Efficient Operations
```typescript
// ✅ GOOD: Uses cache (instant)
guild.channels.cache.find(...)

// ❌ AVOID: Fetches from API (slow)
await guild.channels.fetch()
```

### Message Fetch Limits
```typescript
// Limited to 10 recent messages
const messages = await channel.messages.fetch({ limit: 10 });
```

**Why 10?**
- Balance between speed and reliability
- Dashboard is typically last/recent message
- Prevents excessive API calls

---

## Deployment Instructions

### 1. Build and Deploy
```bash
# Rebuild bot container
docker-compose up -d --build

# Or without Docker
npm run build
npm start
```

### 2. Register Commands
```bash
# In Docker
docker exec apolo-bot npx tsx src/deploy-commands.ts

# Or locally
npm run deploy:ts
```

### 3. Test in Discord
```
1. Run /setup-apolo-structure (first install)
2. Verify all 8 text + 3 voice channels created
3. Change a button label in code
4. Rebuild bot
5. Run /setup-apolo-structure again
6. Verify message was EDITED (not duplicated)
7. Run /remove-apolo-structure
8. Confirm deletion
9. Verify ALL channels + categories removed
```

---

## Troubleshooting

### Issue: Dashboards Duplicating
**Cause:** Bot can't find previous message  
**Solution:**
- Ensure bot has `Read Message History` permission
- Check if previous dashboard was pinned
- Verify channel name matches code exactly

### Issue: Permissions Not Updating
**Cause:** Bot lacks `Manage Roles` permission  
**Solution:**
- Grant `Manage Roles` to bot role
- Ensure bot role is above affected roles in hierarchy

### Issue: Category Not Deleting
**Cause:** Channels not deleted first  
**Solution:**
- Updated `/remove-apolo-structure` deletes children first
- Run removal command again
- Manually delete orphaned channels if needed

---

## Future Enhancements

### Planned Improvements
- [ ] Backup system before removal
- [ ] Rollback mechanism for failed syncs
- [ ] Diff report (what changed vs. what stayed)
- [ ] Dry-run mode (`/setup --dry-run`)
- [ ] Sync logs to admin channel

### Potential Features
- [ ] Selective sync (only specific channels)
- [ ] Version tracking in channel topics
- [ ] Auto-sync on bot startup
- [ ] Webhook notifications on sync completion

---

## Conclusion

The Smart Sync Architecture transforms the APOLO bot from a "setup-once" system to a **continuously updatable platform**. Admins can now iterate on the interface without disrupting users, making the bot enterprise-ready and production-stable.

**Key Takeaway:** Run `/setup-apolo-structure` anytime you update the bot code. It's safe, fast, and preserves all existing data.

---

**Document Version:** 1.0  
**Last Updated:** December 3, 2025  
**Author:** DevOps & Discord Architecture Team
