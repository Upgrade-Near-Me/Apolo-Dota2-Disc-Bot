# Contributing to APOLO Dota 2 Bot

Thank you for your interest in contributing to APOLO! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to professional standards. We expect all contributors to:

- Be respectful and constructive in all interactions
- Focus on what is best for the project
- Show empathy towards other community members
- Accept constructive criticism gracefully

## Getting Started

### Prerequisites

- Node.js v20.18.1+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (recommended)
- Git

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Apolo-Dota2-Disc-Bot.git
   cd Apolo-Dota2-Disc-Bot
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

6. **Start development environment:**
   ```bash
   docker-compose up -d
   npm run db:migrate
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code (protected)
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
git fetch upstream
git rebase upstream/develop
```

## Coding Standards

### TypeScript

- **Strict mode enabled** - All code must pass TypeScript strict checks
- **No `any` types** - Use proper type definitions
- **Interfaces over types** - Prefer interfaces for object shapes
- **Explicit return types** - All functions must declare return types

**Example:**
```typescript
// ✅ CORRECT
interface PlayerProfile {
  steamId: string;
  mmr: number;
  winRate: number;
}

export async function getPlayerProfile(steamId: string): Promise<PlayerProfile> {
  // Implementation
}

// ❌ WRONG
export async function getPlayerProfile(steamId: any) {
  // No return type, any type used
}
```

### File Organization

```
src/
├── commands/       # Discord slash commands
├── handlers/       # Interaction handlers (buttons, modals)
├── services/       # External API integrations
├── utils/          # Utility functions
├── database/       # Database layer
├── types/          # TypeScript type definitions
└── locales/        # i18n translations
```

### Naming Conventions

- **Files:** `camelCase.ts` (e.g., `teamBalancer.ts`)
- **Classes:** `PascalCase` (e.g., `ShardingManager`)
- **Functions:** `camelCase` (e.g., `getPlayerProfile`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Interfaces:** `PascalCase` with descriptive names (e.g., `PlayerProfile`)

### ESLint Rules

Run linter before committing:
```bash
npm run lint
```

Key rules:
- No unused variables
- No console.log (use structured logger)
- Semicolons required
- Single quotes for strings
- 2-space indentation

### Internationalization (i18n)

**CRITICAL:** All user-facing strings MUST use translation keys.

```typescript
// ❌ WRONG - Hardcoded
await interaction.reply({ content: 'Profile not found' });

// ✅ CORRECT - Translated
const msg = t(interaction, 'profile_not_found');
await interaction.reply({ content: msg });
```

**Adding new translations:**

1. Add key to `src/locales/en.json`
2. Translate to Portuguese (`pt.json`)
3. Translate to Spanish (`es.json`)

### Error Handling

All async operations must have proper error handling:

```typescript
// ✅ CORRECT
try {
  const data = await apiCall();
  return data;
} catch (error) {
  logger.error('API call failed', {
    error: error instanceof Error ? error.message : String(error),
    context: { userId: interaction.user.id }
  });
  
  await interaction.reply({
    content: t(interaction, 'error_generic'),
    ephemeral: true
  });
}
```

### Logging

Use structured logging (Pino):

```typescript
import logger from './utils/logger';

// ✅ CORRECT
logger.info('Player profile fetched', {
  steamId: profile.steamId,
  mmr: profile.mmr,
  duration: Date.now() - startTime
});

// ❌ WRONG
console.log('Profile:', profile);
```

## Testing Requirements

### Unit Tests

**Required for:**
- Utility functions
- Business logic
- Data transformations

**Location:** `tests/unit/`

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateTeams } from '../src/utils/teamBalancer';

describe('Team Balancer', () => {
  it('should distribute players evenly by MMR', () => {
    const players = [
      { id: '1', mmr: 6000 },
      { id: '2', mmr: 5000 },
      { id: '3', mmr: 4000 },
      { id: '4', mmr: 3000 }
    ];
    
    const teams = calculateTeams(players);
    
    expect(teams.team1).toHaveLength(2);
    expect(teams.team2).toHaveLength(2);
  });
});
```

### Integration Tests

**Required for:**
- API integrations
- Database operations
- Redis operations

**Location:** `tests/integration/`

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:e2e

# With coverage
npm run test:coverage

# Watch mode
npm run test:ui
```

### Coverage Requirements

- **Minimum:** 70% overall coverage
- **Critical paths:** 90%+ (authentication, payment, data integrity)
- **New features:** 80%+ coverage required

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, semicolons, etc)
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `perf:` - Performance improvement
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(dashboard): add hero pool statistics panel"

# Bug fix
git commit -m "fix(auth): resolve Steam ID validation edge case"

# Documentation
git commit -m "docs(api): update Stratz integration examples"

# Multiple changes
git commit -m "refactor(services): extract common API error handling

- Create centralized error mapper
- Add retry logic for transient failures
- Update all service calls to use new handler

Closes #123"
```

### Commit Message Rules

- Use imperative mood ("add" not "added")
- First line max 72 characters
- Reference issues in footer (e.g., "Closes #123")
- Breaking changes must include `BREAKING CHANGE:` in footer

## Pull Request Process

### Before Submitting

1. **Update your branch:**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Run all checks:**
   ```bash
   npm run lint
   npm run type-check
   npm run test:coverage
   npm run build
   ```

3. **Update documentation:**
   - Update README.md if adding features
   - Add/update JSDoc comments
   - Update CHANGELOG.md (unreleased section)

### PR Template

When creating a PR, include:

**Title:** Follow commit convention (e.g., `feat: add hero pool analysis`)

**Description:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix/feature causing existing functionality to break)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks** - Must pass CI/CD pipeline
2. **Code review** - Requires approval from maintainer
3. **Testing verification** - Reviewer tests changes locally
4. **Documentation review** - Ensure docs are updated

### After Approval

```bash
# Squash merge is preferred
# Maintainers will merge your PR
```

## Development Tips

### Hot Reload

Development server with auto-reload:
```bash
npm run dev
```

### Database Migrations

Creating a new migration:
```sql
-- migrations/003_add_new_table.sql
CREATE TABLE new_feature (
  id SERIAL PRIMARY KEY,
  data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Apply migrations:
```bash
npm run db:migrate
```

### Debugging

Use VS Code debugger configuration:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Bot",
  "skipFiles": ["<node_internals>/**"],
  "program": "${workspaceFolder}/src/index.ts",
  "runtimeArgs": ["-r", "tsx"],
  "console": "integratedTerminal"
}
```

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f bot

# Restart bot after changes
docker-compose restart bot

# Clean rebuild
docker-compose down -v
docker-compose up -d --build
```

## Performance Guidelines

### Response Time Targets

- Dashboard interactions: < 500ms
- API calls: < 2 seconds
- Image generation: < 3 seconds
- Database queries: < 50ms

### Optimization Tips

1. **Use Redis caching** for expensive API calls
2. **Defer interactions** immediately for long operations
3. **Parallelize independent operations** with Promise.all()
4. **Index database queries** appropriately
5. **Batch operations** when possible

## Security Guidelines

### Sensitive Data

- Never commit `.env` files
- Use environment variables for secrets
- Rotate API keys if exposed
- Sanitize user inputs

### API Keys

Store in environment variables:
```env
DISCORD_TOKEN=your_token_here
STRATZ_API_TOKEN=your_token_here
```

Access via config:
```typescript
import { config } from './config';

const token = config.discordToken; // Never hardcode
```

## Getting Help

- **Documentation:** Check README.md and docs/
- **Issues:** Search existing issues before creating new ones
- **Discussions:** Use GitHub Discussions for questions
- **Discord:** Join our community server (link in README)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to APOLO!** 🎮🚀
