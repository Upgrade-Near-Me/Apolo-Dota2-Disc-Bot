# 📦 Project Dependencies

## Runtime Environment

**Platform:** Node.js (NOT Python)

**Version Required:** Node.js >= 20.0.0

**Package Manager:** npm (Node Package Manager)

## Core Dependencies (package.json)

### ✅ Currently Used

| Package | Version | Purpose |
|---------|---------|---------|
| `discord.js` | ^14.14.1 | Discord bot framework |
| `@discordjs/rest` | ^2.2.0 | Discord REST API client |
| `pg` | ^8.11.3 | PostgreSQL database driver |
| `dotenv` | ^16.3.1 | Environment variable loader |
| `graphql` | ^16.8.1 | GraphQL query language |
| `graphql-request` | ^6.1.0 | GraphQL HTTP client (Stratz API) |
| `@napi-rs/canvas` | ^0.1.52 | Native canvas for image generation |

### ⚠️ Unused (Can be Removed)

| Package | Version | Reason |
|---------|---------|--------|
| `axios` | ^1.6.5 | **NOT USED** - Project uses native `fetch()` API |
| `@google/generative-ai` | ^0.21.0 | **NOT IMPLEMENTED YET** - AI Coach feature pending |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | ^8.56.0 | Code linting and quality |

## Why NOT Python?

This is a **Discord.js bot** written in **JavaScript/Node.js**, not Python.

**Reasons:**
- Discord.js is the official Discord library for Node.js
- Native `fetch()` API available in Node.js 20+
- `@napi-rs/canvas` uses native bindings (faster than Python libraries)
- ES Modules (`import`/`export`) used throughout codebase
- `package.json` defines dependencies (not `requirements.txt`)

## Installation

```powershell
# Install Node.js dependencies
npm install

# OR using Docker (recommended)
docker-compose up -d --build
```

## Verification

```powershell
# Check Node.js version
node --version
# Should output: v20.18.1 or higher

# Verify dependencies installed
npm list --depth=0

# Check for unused packages
npm prune
```

## Recommendations

### Remove Unused Dependencies

```powershell
npm uninstall axios @google/generative-ai
```

These packages add **~15MB** to `node_modules` but are not used in the current codebase.

### Keep for Future Features

If you plan to implement:
- **AI Coach feature** - Keep `@google/generative-ai`
- **Alternative HTTP client** - Keep `axios`

Otherwise, remove them to reduce:
- Docker image size (~15MB)
- Installation time
- Potential security vulnerabilities

## Docker Dependencies

Handled automatically by Dockerfile:

```dockerfile
# Base image includes Node.js 20.18.1
FROM node:20.18.1-alpine3.21

# Security updates
RUN apk upgrade --no-cache

# Process manager
RUN apk add --no-cache dumb-init

# Dependencies installed via npm ci
RUN npm ci --omit=dev --ignore-scripts
```

## Database Dependencies

**PostgreSQL 14** required (provided by Docker Compose):

```yaml
postgres:
  image: postgres:14-alpine
```

**Migrations:** Handled by `src/database/migrate.js`

## API Dependencies (External)

No installation required - accessed via HTTP:

| API | Authentication | Purpose |
|-----|----------------|---------|
| Stratz GraphQL | Bearer token | Primary Dota 2 data |
| OpenDota REST | Public | Fallback Dota 2 data |
| Steam Web API | API key | Hero images, profiles |
| Google Gemini AI | API key (optional) | AI coaching (not implemented) |

## System Dependencies (Docker only)

Alpine Linux packages:

- `dumb-init` - Process signal handling
- Security updates via `apk upgrade`

## Development Dependencies (Local)

For local development (not Docker):

```powershell
# Windows: Visual C++ Build Tools (for @napi-rs/canvas)
choco install visualstudio2019buildtools

# Linux: build-essential
sudo apt install build-essential

# macOS: Xcode Command Line Tools
xcode-select --install
```

## Summary

**Total Production Dependencies:** 7 packages
**Unused Dependencies:** 2 packages (axios, @google/generative-ai)
**Recommended Action:** Remove unused packages or keep for future features
**Python Required:** ❌ NO - This is a Node.js project

---

**Last Updated:** December 2025
